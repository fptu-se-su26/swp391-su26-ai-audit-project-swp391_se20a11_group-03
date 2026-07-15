package com.auction.common.service;

import com.drew.imaging.ImageMetadataReader;
import com.drew.metadata.Directory;
import com.drew.metadata.Metadata;
import com.drew.metadata.Tag;
import com.drew.metadata.exif.ExifDirectoryBase;
import com.drew.metadata.exif.ExifIFD0Directory;
import com.drew.metadata.exif.ExifSubIFDDirectory;
import com.drew.metadata.exif.GpsDirectory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Set;

/**
 * Image forensics used to flag KYC uploads that may have been edited with
 * Photoshop / generative AI / screenshots. The output is a list of human
 * readable signals plus an overall risk score (0-100) that staff can use
 * alongside the photo itself. It is intentionally heuristic only - it cannot
 * replace an actual liveness check or trained deepfake detector, but it does
 * catch the most common ways people fake CCCD photos:
 *
 *  - Screenshot from the web: PNG with no EXIF, sharp pixel grid, no GPS
 *  - Photoshopped swap of the portrait: ELA shows uneven re-compression
 *    inside the photo region while the rest of the card looks uniform
 *  - AI generated CCCD: missing camera EXIF, ELA is suspiciously uniform,
 *    no camera model metadata
 */
@Service
public class ImageForensicsService {

    private static final Set<String> CAMERA_MAKES = Set.of(
            "Apple", "Samsung", "Xiaomi", "OPPO", "Vivo", "Realme", "Google",
            "Huawei", "HONOR", "Sony", "Canon", "Nikon", "FUJIFILM", "ASUS",
            "OnePlus", "Motorola", "HMD Global"
    );

    /**
     * Analyse a single image. Returns a structured report listing each
     * heuristic and a 0-100 risk score. Higher = more suspicious.
     */
    public ForensicsReport analyse(byte[] imageBytes) {
        List<Signal> signals = new ArrayList<>();
        if (imageBytes == null || imageBytes.length == 0) {
            signals.add(new Signal(Severity.HIGH, "File is empty"));
            return new ForensicsReport(95, signals);
        }

        String header = detectHeader(imageBytes);
        if (header == null) {
            signals.add(new Signal(Severity.HIGH, "Not a recognized image format (expected JPEG/PNG)"));
            return new ForensicsReport(95, signals);
        }
        boolean isJpeg = "JPEG".equals(header);
        boolean isPng = "PNG".equals(header);

        Metadata meta;
        try (ByteArrayInputStream in = new ByteArrayInputStream(imageBytes)) {
            meta = ImageMetadataReader.readMetadata(in);
        } catch (Exception ex) {
            meta = new Metadata();
        }

        // ---- EXIF heuristics ----
        ExifIFD0Directory ifd0 = meta.getFirstDirectoryOfType(ExifIFD0Directory.class);
        ExifSubIFDDirectory subIfd = meta.getFirstDirectoryOfType(ExifSubIFDDirectory.class);
        GpsDirectory gps = meta.getFirstDirectoryOfType(GpsDirectory.class);

        String cameraMake = ifd0 != null ? ifd0.getString(ExifDirectoryBase.TAG_MAKE) : null;
        String cameraModel = ifd0 != null ? ifd0.getString(ExifDirectoryBase.TAG_MODEL) : null;
        Date originalDate = subIfd != null ? subIfd.getDateOriginal() : null;
        Date digitizedDate = subIfd != null ? subIfd.getDateDigitized() : null;

        boolean hasCameraTag = cameraMake != null || cameraModel != null;
        boolean hasGps = gps != null && gps.getGeoLocation() != null;
        boolean hasCaptureDate = originalDate != null || digitizedDate != null;

        if (!hasCameraTag) {
            String reason;
            if (isPng) {
                reason = "PNG without camera metadata - usually a screenshot or a re-saved file";
            } else {
                reason = "No camera make/model metadata - typical of a screenshot, scan, or AI generated image";
            }
            signals.add(new Signal(Severity.MEDIUM, reason));
        } else {
            String make = cameraMake == null ? "" : cameraMake.trim();
            String model = cameraModel == null ? "" : cameraModel.trim();
            String combined = (make + " " + model).toLowerCase(Locale.ROOT);
            boolean knownBrand = CAMERA_MAKES.stream().anyMatch(brand -> combined.contains(brand.toLowerCase(Locale.ROOT)));
            if (!knownBrand) {
                signals.add(new Signal(Severity.LOW,
                        "Camera metadata present but make '" + make + "' / model '" + model
                                + "' is not in the smartphone brand list. Verify with the user."));
            }
        }

        if (!hasGps) {
            signals.add(new Signal(Severity.LOW, "No GPS coordinates - common for re-saved or scanned images"));
        }
        if (!hasCaptureDate) {
            signals.add(new Signal(Severity.LOW, "No original capture date in EXIF - file was re-encoded"));
        } else if (originalDate != null) {
            LocalDateTime captured = LocalDateTime.ofInstant(originalDate.toInstant(), ZoneId.systemDefault());
            LocalDateTime now = LocalDateTime.now();
            if (captured.isAfter(now.plusMinutes(5))) {
                signals.add(new Signal(Severity.MEDIUM,
                        "EXIF date " + captured + " is in the future - clock tampering"));
            }
        }

        // List all metadata tags so the staff can eyeball them
        if (meta.getDirectoryCount() > 0) {
            List<String> tagDump = new ArrayList<>();
            for (Directory dir : meta.getDirectories()) {
                for (Tag tag : dir.getTags()) {
                    String value = tag.getDescription();
                    if (value != null && !value.isBlank() && value.length() < 80) {
                        tagDump.add(dir.getName() + ":" + tag.getTagName() + "=" + value);
                    }
                }
            }
            if (!tagDump.isEmpty()) {
                signals.add(new Signal(Severity.INFO, "Metadata tags: " + String.join("; ", tagDump)));
            }
        }

        // ---- Pixel heuristics (ELA + dimensions) ----
        BufferedImage original;
        try (ByteArrayInputStream in = new ByteArrayInputStream(imageBytes)) {
            original = ImageIO.read(in);
        } catch (IOException ex) {
            signals.add(new Signal(Severity.HIGH, "Image could not be decoded: " + ex.getMessage()));
            return new ForensicsReport(80, signals);
        }
        if (original == null) {
            signals.add(new Signal(Severity.HIGH, "Image decoder returned null"));
            return new ForensicsReport(80, signals);
        }

        int width = original.getWidth();
        int height = original.getHeight();
        if (width < 400 || height < 250) {
            signals.add(new Signal(Severity.MEDIUM,
                    "Resolution too small (" + width + "x" + height + ") - CCCD scans should be at least 800x500"));
        }
        long aspectRatioNumerator = (long) width * 100 / height;
        if (aspectRatioNumerator < 130 || aspectRatioNumerator > 200) {
            signals.add(new Signal(Severity.LOW,
                    "Aspect ratio " + width + ":" + height + " is unusual for an ID card photo"));
        }

        if (isJpeg) {
            ElaResult ela = errorLevelAnalysis(imageBytes);
            signals.add(new Signal(Severity.INFO,
                    "JPEG ELA mean=" + String.format("%.2f", ela.mean())
                            + " std=" + String.format("%.2f", ela.stdDev())
                            + " highRatio=" + String.format("%.3f", ela.highRatio())));
            if (ela.stdDev() > 35.0) {
                signals.add(new Signal(Severity.HIGH,
                        "JPEG error level analysis shows high variance (std=" + String.format("%.2f", ela.stdDev())
                                + ") - some regions have been re-saved, a common sign of Photoshop edits"));
            } else if (ela.stdDev() > 22.0) {
                signals.add(new Signal(Severity.MEDIUM,
                        "JPEG error level analysis shows moderate variance - inspect for edits"));
            }
            if (ela.highRatio() > 0.15) {
                signals.add(new Signal(Severity.HIGH,
                        "More than 15% of pixels look strongly re-compressed - possible face-swap or text tampering"));
            }
        } else {
            signals.add(new Signal(Severity.INFO,
                    "PNG input - JPEG error level analysis skipped. PNGs have lossless re-save which masks edits."));
        }

        int score = computeScore(signals);
        return new ForensicsReport(score, signals);
    }

    private int computeScore(List<Signal> signals) {
        int score = 0;
        for (Signal s : signals) {
            switch (s.severity()) {
                case HIGH -> score += 35;
                case MEDIUM -> score += 15;
                case LOW -> score += 5;
                case INFO -> {
                    /* informational only */
                }
            }
        }
        return Math.min(100, score);
    }

    private String detectHeader(byte[] bytes) {
        if (bytes.length > 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF) {
            return "JPEG";
        }
        if (bytes.length > 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 'P'
                && bytes[2] == 'N'
                && bytes[3] == 'G') {
            return "PNG";
        }
        if (bytes.length > 4
                && bytes[0] == 'G' && bytes[1] == 'I' && bytes[2] == 'F') {
            return "GIF";
        }
        if (bytes.length > 2 && bytes[0] == 'B' && bytes[1] == 'M') {
            return "BMP";
        }
        return null;
    }

    /**
     * JPEG Error Level Analysis: re-save the image at a known quality and
     * measure the per-pixel difference. Regions that were already saved at
     * a different quality stand out as brighter.
     */
    private ElaResult errorLevelAnalysis(byte[] jpegBytes) {
        try (ByteArrayInputStream in = new ByteArrayInputStream(jpegBytes)) {
            BufferedImage original = ImageIO.read(in);
            if (original == null) {
                return new ElaResult(0, 0, 0);
            }
            BufferedImage resized = new BufferedImage(
                    Math.min(640, original.getWidth()),
                    Math.min(640, original.getHeight()),
                    BufferedImage.TYPE_INT_RGB);
            Graphics2D g = resized.createGraphics();
            g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g.drawImage(original, 0, 0, resized.getWidth(), resized.getHeight(), null);
            g.dispose();

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(resized, "jpg", baos);
            byte[] resaved = baos.toByteArray();

            BufferedImage recompressed;
            try (ByteArrayInputStream in2 = new ByteArrayInputStream(resaved)) {
                recompressed = ImageIO.read(in2);
            }
            if (recompressed == null) {
                return new ElaResult(0, 0, 0);
            }

            int w = resized.getWidth();
            int h = resized.getHeight();
            long sum = 0;
            long sumSq = 0;
            int count = 0;
            int high = 0;
            for (int y = 0; y < h; y++) {
                for (int x = 0; x < w; x++) {
                    int rgb1 = resized.getRGB(x, y);
                    int rgb2 = recompressed.getRGB(x, y);
                    int dr = Math.abs(((rgb1 >> 16) & 0xFF) - ((rgb2 >> 16) & 0xFF));
                    int dg = Math.abs(((rgb1 >> 8) & 0xFF) - ((rgb2 >> 8) & 0xFF));
                    int db = Math.abs((rgb1 & 0xFF) - (rgb2 & 0xFF));
                    int diff = (dr + dg + db) / 3;
                    sum += diff;
                    sumSq += (long) diff * diff;
                    count++;
                    if (diff > 25) {
                        high++;
                    }
                }
            }
            if (count == 0) {
                return new ElaResult(0, 0, 0);
            }
            double mean = (double) sum / count;
            double variance = ((double) sumSq / count) - (mean * mean);
            double stdDev = variance > 0 ? Math.sqrt(variance) : 0;
            double highRatio = (double) high / count;
            return new ElaResult(mean, stdDev, highRatio);
        } catch (IOException ex) {
            return new ElaResult(0, 0, 0);
        }
    }

    public enum Severity {
        INFO, LOW, MEDIUM, HIGH
    }

    public record Signal(Severity severity, String message) {}

    public record ElaResult(double mean, double stdDev, double highRatio) {}

    public record ForensicsReport(int riskScore, List<Signal> signals) {
        public String severity() {
            if (riskScore >= 60) return "HIGH";
            if (riskScore >= 30) return "MEDIUM";
            return "LOW";
        }
    }
}
