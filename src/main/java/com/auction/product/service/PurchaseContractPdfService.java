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

/**
 * Generates the buyer purchase agreement PDF (admin pre-signed + buyer signature).
 */
@Service
@Slf4j
public class PurchaseContractPdfService {

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

    public record PurchaseContractData(
            Long auctionId,
            String productName,
            Long productId,
            String sellerName,
            String sellerEmail,
            String buyerName,
            String buyerEmail,
            long finalPrice,
            String adminName,
            String adminEmail,
            LocalDateTime buyerSignedAt
    ) {}

    public String generateAndStore(PurchaseContractData data) {
        try {
            Path contractsDir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("contracts");
            Files.createDirectories(contractsDir);

            String fileName = "purchase_agreement_auction_" + data.auctionId() + ".pdf";
            Path target = contractsDir.resolve(fileName);

            ITextRenderer renderer = new ITextRenderer();
            registerUnicodeFont(renderer);
            renderer.setDocumentFromString(buildHtml(data));
            renderer.layout();
            try (OutputStream os = Files.newOutputStream(target)) {
                renderer.createPDF(os);
            }

            log.info("Generated purchase contract PDF for auction {} at {}", data.auctionId(), target);
            return "/uploads/contracts/" + fileName;
        } catch (Exception ex) {
            log.error("Failed to generate purchase contract PDF for auction {}", data.auctionId(), ex);
            return "/uploads/contracts/purchase_agreement_auction_" + data.auctionId() + ".pdf";
        }
    }

    public byte[] renderPdf(PurchaseContractData data) {
        try {
            ITextRenderer renderer = new ITextRenderer();
            registerUnicodeFont(renderer);
            renderer.setDocumentFromString(buildHtml(data));
            renderer.layout();
            java.io.ByteArrayOutputStream bos = new java.io.ByteArrayOutputStream();
            renderer.createPDF(bos);
            return bos.toByteArray();
        } catch (Exception ex) {
            log.error("Failed to render purchase contract PDF for auction {}", data.auctionId(), ex);
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

    private String buildHtml(PurchaseContractData d) {
        String signedAt = d.buyerSignedAt() == null ? "—" : DATE_TIME.format(d.buyerSignedAt());
        String price = String.format("%,d VND", d.finalPrice()).replace(',', '.');

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<html><head><style>"
                + "@page { size: A4; margin: 2cm; }"
                + "body { font-family: 'ContractFont', sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.65; }"
                + "h1 { font-size: 17px; text-align: center; color: #071626; margin-bottom: 4px; }"
                + ".sub { text-align: center; color: #666; font-size: 11px; margin-bottom: 16px; }"
                + ".row { margin: 6px 0; }"
                + ".term { margin-top: 8px; text-align: justify; }"
                + ".sign-block { margin-top: 24px; width: 48%; display: inline-block; vertical-align: top; }"
                + ".sign-title { font-weight: bold; color: #071626; margin-bottom: 8px; }"
                + ".pre-signed { color: #2e7d32; font-weight: bold; }"
                + "table.info { width: 100%; border-collapse: collapse; margin: 12px 0; }"
                + "table.info td { border: 1px solid #ddd; padding: 6px 8px; }"
                + "table.info td.label { background: #f5f5f5; width: 35%; font-weight: bold; }"
                + "</style></head><body>"
                + "<h1>HỢP ĐỒNG MUA BÁN QUA ĐẤU GIÁ</h1>"
                + "<div class=\"sub\">LuxeAuction · Mã hợp đồng: PUR-" + d.auctionId() + " · Ngày ký: " + signedAt + "</div>"

                + "<table class=\"info\">"
                + row("Sản phẩm", escape(d.productName()) + " (Mã #" + d.productId() + ")")
                + row("Giá thanh toán", price)
                + row("Phiên đấu giá", "#" + d.auctionId())
                + "</table>"

                + "<p class=\"term\"><b>ĐIỀU 1. Các bên tham gia</b></p>"
                + "<p class=\"term\"><b>BÊN BÁN:</b> " + escape(d.sellerName()) + " — " + escape(d.sellerEmail()) + "</p>"
                + "<p class=\"term\"><b>BÊN MUA:</b> " + escape(d.buyerName()) + " — " + escape(d.buyerEmail()) + "</p>"
                + "<p class=\"term\"><b>NỀN TẢNG:</b> CÔNG TY LUXEAUCTION (đại diện: " + escape(d.adminName()) + ")</p>"

                + "<p class=\"term\"><b>ĐIỀU 2. Đối tượng hợp đồng</b><br/>"
                + "Bên Mua đồng ý mua và Bên Bán đồng ý bán sản phẩm nêu trên với giá chốt "
                + price + " thông qua nền tảng đấu giá LuxeAuction.</p>"

                + "<p class=\"term\"><b>ĐIỀU 3. Thanh toán</b><br/>"
                + "Bên Mua thanh toán qua ví điện tử trên nền tảng. Sau khi ký hợp đồng này và hoàn tất thanh toán, "
                + "giao dịch được coi là hoàn thành theo quy định của LuxeAuction.</p>"

                + "<p class=\"term\"><b>ĐIỀU 4. Cam kết</b><br/>"
                + "Hai bên cam kết thông tin cung cấp là chính xác và tuân thủ quy tắc đấu giá của nền tảng.</p>"

                + "<div style=\"margin-top: 28px;\">"
                + "<div class=\"sign-block\">"
                + "<div class=\"sign-title\">BÊN BÁN / NỀN TẢNG</div>"
                + "<p>" + escape(d.adminName()) + "</p>"
                + "<p class=\"pre-signed\">✔ Đã ký sẵn (LuxeAuction)</p>"
                + "<p class=\"row\">" + escape(d.adminEmail()) + "</p>"
                + "</div>"
                + "<div class=\"sign-block\" style=\"float: right;\">"
                + "<div class=\"sign-title\">BÊN MUA</div>"
                + "<p>" + escape(d.buyerName()) + "</p>"
                + "<p class=\"pre-signed\">✔ Đã ký điện tử</p>"
                + "<p class=\"row\">Thời điểm: " + signedAt + "</p>"
                + "</div>"
                + "</div>"

                + "<p style=\"margin-top: 48px; font-size: 10px; color: #888;\">"
                + "Tài liệu được tạo tự động trên nền tảng LuxeAuction. Bản PDF này được lưu trữ và gửi về hệ thống quản trị.</p>"
                + "</body></html>";
    }

    private String row(String label, String value) {
        return "<tr><td class=\"label\">" + label + "</td><td>" + value + "</td></tr>";
    }

    private String escape(String value) {
        if (value == null) return "—";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
