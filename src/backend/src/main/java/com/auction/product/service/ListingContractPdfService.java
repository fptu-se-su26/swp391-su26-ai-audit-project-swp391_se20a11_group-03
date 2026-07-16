package com.auction.product.service;

import com.lowagie.text.pdf.BaseFont;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class ListingContractPdfService {

    private static final DateTimeFormatter DATE_TIME =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private static final String[] FONT_CANDIDATES = {
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/Library/Fonts/Arial.ttf"
    };

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    public String generateAndStore(
            Long productId,
            String productName,
            String sellerName,
            Long startingPrice,
            LocalDateTime approvedAt) {
        try {
            Path contractsDir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("contracts");
            Files.createDirectories(contractsDir);

            String fileName = "listing_product_" + productId + ".pdf";
            Path target = contractsDir.resolve(fileName);

            ITextRenderer renderer = new ITextRenderer();
            registerUnicodeFont(renderer);
            renderer.setDocumentFromString(buildHtml(productId, productName, sellerName, startingPrice, approvedAt));
            renderer.layout();
            try (OutputStream os = Files.newOutputStream(target)) {
                renderer.createPDF(os);
            }

            log.info("Generated listing contract PDF for product {} at {}", productId, target);
            return "/uploads/contracts/" + fileName;
        } catch (Exception ex) {
            log.error("Failed to generate listing contract PDF for product {}", productId, ex);
            return "/uploads/contracts/listing_product_" + productId + ".pdf";
        }
    }

    public byte[] renderPdf(
            Long productId,
            String productName,
            String sellerName,
            Long startingPrice,
            LocalDateTime approvedAt) {
        try {
            ITextRenderer renderer = new ITextRenderer();
            registerUnicodeFont(renderer);
            renderer.setDocumentFromString(buildHtml(productId, productName, sellerName, startingPrice, approvedAt));
            renderer.layout();
            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            renderer.createPDF(bos);
            return bos.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to render listing contract PDF for product {}", productId, ex);
            return new byte[0];
        }
    }

    private void registerUnicodeFont(ITextRenderer renderer) {
        for (String path : FONT_CANDIDATES) {
            try {
                if (Files.exists(Paths.get(path))) {
                    renderer.getFontResolver().addFont(
                            path, "ContractFont", BaseFont.IDENTITY_H, BaseFont.EMBEDDED, null);
                    return;
                }
            } catch (Exception ignored) {
                // try next
            }
        }
    }

    private String buildHtml(
            Long productId,
            String productName,
            String sellerName,
            Long startingPrice,
            LocalDateTime approvedAt) {
        String approvedText = approvedAt == null ? "—" : DATE_TIME.format(approvedAt);
        String price = startingPrice == null ? "—" : String.format("%,d VND", startingPrice);
        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<html><head><style>"
                + "body { font-family: 'ContractFont', sans-serif; font-size: 12px; line-height: 1.6; }"
                + "h1 { text-align: center; font-size: 18px; color: #071626; }"
                + "</style></head><body>"
                + "<h1>HỢP ĐỒNG NIÊM YẾT SẢN PHẨM</h1>"
                + "<p><b>Mã sản phẩm:</b> #" + productId + "</p>"
                + "<p><b>Tên sản phẩm:</b> " + escape(productName) + "</p>"
                + "<p><b>Người bán:</b> " + escape(sellerName) + "</p>"
                + "<p><b>Giá khởi điểm:</b> " + price + "</p>"
                + "<p><b>Ngày phê duyệt niêm yết:</b> " + approvedText + "</p>"
                + "<p>Nền tảng BidZone xác nhận sản phẩm đã được duyệt và được phép đưa lên sàn đấu giá.</p>"
                + "</body></html>";
    }

    private String escape(String value) {
        if (value == null) return "—";
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
