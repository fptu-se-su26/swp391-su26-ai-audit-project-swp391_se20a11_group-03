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
 * Generates the seller platform agreement as a real, electronically-signed PDF
 * file (rendered from XHTML via Flying Saucer / OpenPDF) and stores it under the
 * upload directory so it can be served at <code>/uploads/contracts/...</code>.
 */
@Service
@Slf4j
public class SellerContractPdfService {

    private static final DateTimeFormatter DATE_TIME =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /** Candidate Unicode TTF fonts so Vietnamese diacritics render correctly. */
    private static final String[] FONT_CANDIDATES = {
            "C:/Windows/Fonts/arial.ttf",
            "C:/Windows/Fonts/segoeui.ttf",
            "C:/Windows/Fonts/times.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            "/Library/Fonts/Arial.ttf",
            "/System/Library/Fonts/Supplemental/Arial.ttf"
    };

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    /**
     * Renders + stores the seller agreement PDF.
     *
     * @return the public URL (e.g. {@code /uploads/contracts/seller_agreement_user_5.pdf})
     */
    public String generateAndStore(Long userId, String fullName, String email, LocalDateTime signedAt) {
        try {
            Path contractsDir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("contracts");
            Files.createDirectories(contractsDir);

            String fileName = "seller_agreement_user_" + userId + ".pdf";
            Path target = contractsDir.resolve(fileName);

            String html = buildHtml(userId, fullName, email, signedAt);

            ITextRenderer renderer = new ITextRenderer();
            registerUnicodeFont(renderer);
            renderer.setDocumentFromString(html);
            renderer.layout();
            try (OutputStream os = Files.newOutputStream(target)) {
                renderer.createPDF(os);
            }

            log.info("Generated seller contract PDF for user {} at {}", userId, target);
            return "/uploads/contracts/" + fileName;
        } catch (Exception ex) {
            // Never block signing because of PDF issues; fall back to a stable URL.
            log.error("Failed to generate seller contract PDF for user {}", userId, ex);
            return "/uploads/contracts/seller_agreement_user_" + userId + ".pdf";
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
                // Try the next candidate.
            }
        }
        log.warn("No Unicode TTF font found; Vietnamese diacritics in the contract PDF may not render.");
    }

    private String buildHtml(Long userId, String fullName, String email, LocalDateTime signedAt) {
        String signedText = signedAt == null ? "—" : DATE_TIME.format(signedAt);
        String safeName = escape(fullName == null ? "—" : fullName);
        String safeEmail = escape(email == null ? "—" : email);

        return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>"
                + "<html><head><style>"
                + "@page { size: A4; margin: 2.2cm; }"
                + "body { font-family: 'ContractFont', sans-serif; font-size: 12px; color: #1a1a1a; line-height: 1.65; }"
                + "h1 { font-size: 18px; text-align: center; color: #071626; margin-bottom: 4px; }"
                + ".sub { text-align: center; color: #6b6b6b; font-size: 11px; margin-bottom: 18px; }"
                + ".party { margin: 4px 0; }"
                + ".term { margin-top: 10px; text-align: justify; }"
                + ".heading { font-weight: bold; margin-top: 16px; color: #071626; }"
                + ".sign { margin-top: 28px; border-top: 1px solid #cccccc; padding-top: 14px; }"
                + ".muted { color: #666666; font-size: 11px; }"
                + ".badge { color: #2e7d32; font-weight: bold; }"
                + "</style></head><body>"
                + "<h1>HỢP ĐỒNG NỀN TẢNG DÀNH CHO NGƯỜI BÁN</h1>"
                + "<div class=\"sub\">LuxeAuction · Mã tham chiếu người dùng #" + userId + " · Ngày ký: " + signedText + "</div>"
                + "<p class=\"party\"><b>BÊN A (Nền tảng):</b> CÔNG TY LUXEAUCTION.</p>"
                + "<p class=\"party\"><b>BÊN B (Người bán):</b> " + safeName + " — " + safeEmail + ".</p>"
                + "<p class=\"heading\">ĐIỀU KHOẢN HỢP ĐỒNG NGƯỜI BÁN</p>"
                + "<p class=\"term\">1. Người bán đồng ý niêm yết và bán sản phẩm qua nền tảng đấu giá LuxeAuction.</p>"
                + "<p class=\"term\">2. Phí dịch vụ nền tảng là <b>20%</b> trên giá chốt (giá thắng) của mỗi phiên đấu giá thành công; 80% còn lại được chuyển cho người bán.</p>"
                + "<p class=\"term\">3. Người bán có trách nhiệm tự kê khai và nộp thuế thu nhập cá nhân (TNCN) theo quy định pháp luật đối với khoản thu nhập nhận được. Nền tảng chỉ thu phí dịch vụ và không khấu trừ thuế thay người bán.</p>"
                + "<p class=\"term\">4. Người bán cam kết thông tin định danh (KYC) là chính xác và sản phẩm được niêm yết là hợp pháp, đúng mô tả.</p>"
                + "<p class=\"term\">5. Hợp đồng có hiệu lực sau khi người bán ký điện tử và được nhân viên (staff) duyệt KYC thành công.</p>"
                + "<div class=\"sign\">"
                + "<p>Người bán đã đọc, hiểu và đồng ý với toàn bộ điều khoản nêu trên.</p>"
                + "<p>Ký điện tử bởi: <b>" + safeName + "</b> (" + safeEmail + ")</p>"
                + "<p>Thời điểm ký: <b>" + signedText + "</b></p>"
                + "<p class=\"badge\">✔ Đã ký điện tử (Electronically signed)</p>"
                + "<p class=\"muted\">Tài liệu này được tạo và ký điện tử trên nền tảng LuxeAuction. Hợp đồng chính thức có hiệu lực sau khi KYC của người bán được duyệt.</p>"
                + "</div>"
                + "</body></html>";
    }

    private String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
