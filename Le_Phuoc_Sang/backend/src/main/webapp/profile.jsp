<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    com.vnec.model.User currentUser = (com.vnec.model.User) session.getAttribute("currentUser");
    if (currentUser == null) {
        response.sendRedirect(request.getContextPath() + "/login.jsp");
        return;
    }
    boolean justRegistered = "1".equals(request.getParameter("registered"));
    boolean emailVerified = "1".equals(request.getParameter("email_verified")) || currentUser.isEmailVerified();
    boolean identityVerified = "1".equals(request.getParameter("identity_verified")) || currentUser.isIdentityVerified();
    String fullName = currentUser.getFullName() == null ? "" : currentUser.getFullName().trim();
    String displayInitial = fullName.isEmpty() ? "U" : fullName.substring(0, 1).toUpperCase();
    String profileStatus = currentUser.getProfileStatus() == null ? "PENDING_PROFILE" : currentUser.getProfileStatus();
%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Hồ sơ thành viên</title>
    <style>
        :root { --primary:#8f2d2d; --text:#2d2d2d; --muted:#7b7b7b; --shadow:0 18px 50px rgba(67,38,26,.12); }
        *{box-sizing:border-box}
        body{margin:0;font-family:"Segoe UI",Tahoma,Arial,sans-serif;background:linear-gradient(180deg,#f7f3ef 0%,#f1ece7 100%);color:var(--text);min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px}
        .card{width:min(760px,100%);background:rgba(255,255,255,.95);border:1px solid rgba(143,45,45,.16);border-radius:18px;box-shadow:var(--shadow);padding:40px 44px}
        .row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
        .section{background:#faf7f5;border-radius:12px;padding:18px}
        .badge{display:inline-block;background:#fff0f0;color:var(--primary);border:1px solid rgba(143,45,45,.2);border-radius:20px;padding:3px 12px;font-size:13px;font-weight:600;margin-bottom:16px}
        .status{padding:10px 12px;border-radius:10px;margin:10px 0;font-size:14px;font-weight:600}
        .ok{background:#f0fff4;color:#276749;border:1px solid #c6f6d5}.warn{background:#fffaf0;color:#9c4221;border:1px solid #fbd38d}
        .btn{width:100%;height:44px;border:none;border-radius:10px;font-weight:700;cursor:pointer;margin-top:10px}
        .btn-primary{background:var(--primary);color:#fff}.btn-secondary{background:#fff;border:1px solid rgba(143,45,45,.25);color:var(--primary)}
        .input{width:100%;height:44px;border:1px solid #ddd;border-radius:10px;padding:0 12px;margin-top:10px}
        @media (max-width: 820px){.row{grid-template-columns:1fr}}
    </style>
</head>
<body>
<div class="card">
    <div class="badge">Thành viên</div>
    <h1><%= fullName.isEmpty() ? "Tài khoản của bạn" : fullName %></h1>
    <p>Mã trạng thái hồ sơ: <b><%= profileStatus %></b></p>

    <% if (justRegistered) { %>
    <div class="status ok">🎉 Đăng ký thành công! Chào mừng bạn đến với VNEC.</div>
    <% } %>
    <% if ("1".equals(request.getParameter("identity_pending"))) { %>
    <div class="status warn">📋 Ảnh CCCD đã được tải lên và đang chờ xét duyệt. Chúng tôi sẽ thông báo kết quả sớm.</div>
    <% } %>

    <div class="row">
        <div class="section">
            <h3>Xác minh Gmail</h3>
            <div class="status <%= emailVerified ? "ok" : "warn" %>">
                <%= emailVerified ? "✅ Đã xác minh Gmail" : "⚠️ Chưa xác minh Gmail" %>
            </div>
            <p>Email: <b><%= currentUser.getEmail() %></b></p>
            <p>Thời gian xác minh: <%= currentUser.getEmailVerifiedAt() == null ? "Chưa có" : currentUser.getEmailVerifiedAt() %></p>
            <% if (!emailVerified) { %>
            <form action="<%= request.getContextPath() %>/send-email-verification" method="post">
                <button class="btn btn-primary" type="submit">Gửi link xác nhận Gmail</button>
            </form>
            <% if ("1".equals(request.getParameter("email_verification_sent"))) { %>
            <div class="status ok" style="margin-top:8px;">📧 Đã gửi email xác minh. Kiểm tra hộp thư của bạn.</div>
            <% } %>
            <% } %>
        </div>

        <div class="section">
            <h3>Xác minh CCCD</h3>
            <div class="status <%= identityVerified ? "ok" : "warn" %>">
                <%= identityVerified ? "✅ Đã xác minh CCCD" : "⚠️ Chưa xác minh CCCD" %>
            </div>
            <p>CCCD: <b><%= currentUser.getIdentityNumber() %></b></p>
            <p>Thời gian xác minh: <%= currentUser.getIdentityVerifiedAt() == null ? "Chưa có" : currentUser.getIdentityVerifiedAt() %></p>
            <% if (!identityVerified) { %>
            <form action="<%= request.getContextPath() %>/verify-identity" method="post" enctype="multipart/form-data">
                <label style="font-size:13px;font-weight:600;display:block;margin-top:10px;">Mặt trước CCCD</label>
                <input class="input" type="file" name="front_image" accept="image/*" required />
                <label style="font-size:13px;font-weight:600;display:block;margin-top:10px;">Mặt sau CCCD</label>
                <input class="input" type="file" name="back_image" accept="image/*" required />
                <button class="btn btn-primary" type="submit" style="margin-top:14px;">Tải lên & Kiểm tra trạng thái</button>
            </form>
            <% } %>
        </div>
    </div>

    <div class="section" style="margin-top:18px;">
        <p>Độ xác minh hiện tại: <b><%= currentUser.getVerificationLevel() %></b></p>
        <p>Trạng thái hồ sơ: <b><%= profileStatus %></b></p>
    </div>

    <form action="<%= request.getContextPath() %>/logout" method="get">
        <button class="btn btn-secondary" type="submit">Đăng xuất</button>
    </form>
</div>
</body>
</html>
