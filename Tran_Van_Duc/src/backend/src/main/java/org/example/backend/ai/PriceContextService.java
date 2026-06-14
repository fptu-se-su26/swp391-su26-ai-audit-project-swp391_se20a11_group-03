package org.example.backend.ai;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Truy vấn dữ liệu sản phẩm / đấu giá tương tự trong DB để làm ngữ cảnh
 * tham khảo giá cho trợ lý AI.
 *
 * Dùng JdbcTemplate (native SQL) để không phụ thuộc vào entity JPA của các
 * module khác. Nếu bảng Products/Auctions chưa tồn tại thì trả về chuỗi rỗng
 * (AI vẫn tư vấn dựa trên kiến thức chung).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PriceContextService {

    private final JdbcTemplate jdbc;

    /**
     * Sinh đoạn văn bản mô tả các sản phẩm tương tự + kết quả đấu giá
     * dựa theo từ khóa trong tin nhắn của người bán.
     *
     * @return đoạn ngữ cảnh (tiếng Việt) hoặc chuỗi rỗng nếu không có dữ liệu.
     */
    public String buildContext(String userMessage) {
        List<String> tokens = extractKeywords(userMessage);
        if (tokens.isEmpty()) {
            return "";
        }

        StringBuilder where = new StringBuilder();
        List<Object> params = new ArrayList<>();
        for (String t : tokens) {
            if (where.length() > 0) where.append(" OR ");
            where.append("(LOWER(p.ProductName) LIKE ? OR LOWER(p.Brand) LIKE ? OR LOWER(c.CategoryName) LIKE ?)");
            String like = "%" + t + "%";
            params.add(like);
            params.add(like);
            params.add(like);
        }

        String sql = "SELECT TOP 8 p.ProductName, p.Brand, p.[Condition] AS Cond, "
                + "c.CategoryName, p.StartingPrice, a.CurrentHighestBid, a.Status AS AuctionStatus "
                + "FROM Products p "
                + "JOIN Categories c ON c.CategoryId = p.CategoryId "
                + "LEFT JOIN Auctions a ON a.ProductId = p.ProductId "
                + "WHERE p.Status = 'APPROVED' AND (" + where + ") "
                + "ORDER BY p.CreatedAt DESC";

        try {
            List<String> lines = jdbc.query(sql, (rs, i) -> {
                String name = rs.getString("ProductName");
                String brand = rs.getString("Brand");
                String cond = rs.getString("Cond");
                String cat = rs.getString("CategoryName");
                long start = rs.getLong("StartingPrice");
                long highest = rs.getLong("CurrentHighestBid");
                String auctionStatus = rs.getString("AuctionStatus");

                StringBuilder line = new StringBuilder("- ").append(name);
                if (cat != null) line.append(" [").append(cat).append("]");
                if (brand != null && !brand.isBlank()) line.append(", hãng ").append(brand);
                if (cond != null && !cond.isBlank()) line.append(", tình trạng ").append(cond);
                line.append(": giá khởi điểm ").append(formatVnd(start));
                if (highest > 0) {
                    line.append(", giá cao nhất hiện tại ").append(formatVnd(highest));
                    if (auctionStatus != null) line.append(" (phiên ").append(auctionStatus).append(")");
                }
                return line.toString();
            }, params.toArray());

            if (lines.isEmpty()) {
                return "";
            }
            return "DỮ LIỆU THAM KHẢO từ các sản phẩm tương tự đã được duyệt trên sàn:\n"
                    + String.join("\n", lines);
        } catch (Exception e) {
            // Bảng chưa tồn tại / lỗi truy vấn -> bỏ qua ngữ cảnh, AI vẫn trả lời chung.
            log.warn("Không lấy được ngữ cảnh giá từ DB: {}", e.getMessage());
            return "";
        }
    }

    private List<String> extractKeywords(String message) {
        if (message == null || message.isBlank()) return List.of();
        return Arrays.stream(message.toLowerCase().split("[^\\p{L}\\p{N}]+"))
                .filter(t -> t.length() >= 3)
                .distinct()
                .limit(6)
                .toList();
    }

    private String formatVnd(long amount) {
        return String.format("%,d", amount).replace(',', '.') + " VNĐ";
    }
}
