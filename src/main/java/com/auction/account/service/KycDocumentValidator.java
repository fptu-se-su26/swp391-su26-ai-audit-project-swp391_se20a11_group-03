package com.auction.account.service;

import com.auction.common.service.ImageForensicsService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.Iterator;

/** Centralized validation prevents controller/service rules from drifting apart. */
@Component
public class KycDocumentValidator {

    private final long maxFileBytes;
    private final long maxPixels;
    private final ImageForensicsService forensicsService;

    public KycDocumentValidator(
            @Value("${app.kyc.max-file-bytes:8388608}") long maxFileBytes,
            @Value("${app.kyc.max-pixels:24000000}") long maxPixels,
            ImageForensicsService forensicsService) {
        this.maxFileBytes = maxFileBytes;
        this.maxPixels = maxPixels;
        this.forensicsService = forensicsService;
    }

    public ValidatedImage validate(MultipartFile file, String label) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Missing " + label + " image");
        }
        if (file.getSize() > maxFileBytes) {
            throw new IllegalArgumentException(label + " image exceeds the 8 MB limit");
        }

        byte[] bytes;
        try (var input = file.getInputStream()) {
            bytes = input.readNBytes(Math.toIntExact(maxFileBytes + 1));
        }
        if (bytes.length > maxFileBytes) {
            throw new IllegalArgumentException(label + " image exceeds the 8 MB limit");
        }
        String format = detectFormat(bytes);
        if (format == null) {
            throw new IllegalArgumentException(label + " must be a genuine JPEG or PNG image");
        }
        verifyDimensions(bytes, label);

        ImageForensicsService.ForensicsReport report = forensicsService.analyse(bytes);
        if (report.riskScore() >= 80) {
            throw new IllegalArgumentException(label + " image could not pass integrity validation; upload a clear original photo");
        }
        return new ValidatedImage(bytes, format.equals("JPEG") ? ".jpg" : ".png", report);
    }

    private void verifyDimensions(byte[] bytes, String label) throws IOException {
        try (ImageInputStream stream = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            Iterator<ImageReader> readers = ImageIO.getImageReaders(stream);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException(label + " image cannot be decoded");
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(stream, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width < 400 || height < 250) {
                    throw new IllegalArgumentException(label + " image resolution is too small");
                }
                if ((long) width * height > maxPixels) {
                    throw new IllegalArgumentException(label + " image dimensions are too large");
                }
            } finally {
                reader.dispose();
            }
        }
    }

    private String detectFormat(byte[] bytes) {
        if (bytes.length >= 3 && (bytes[0] & 0xff) == 0xff && (bytes[1] & 0xff) == 0xd8 && (bytes[2] & 0xff) == 0xff) {
            return "JPEG";
        }
        if (bytes.length >= 8 && (bytes[0] & 0xff) == 0x89 && bytes[1] == 'P' && bytes[2] == 'N' && bytes[3] == 'G') {
            return "PNG";
        }
        return null;
    }

    public record ValidatedImage(byte[] bytes, String extension, ImageForensicsService.ForensicsReport report) {}
}
