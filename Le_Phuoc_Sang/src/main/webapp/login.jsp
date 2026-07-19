<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String success = request.getParameter("success");
    String registered = request.getParameter("registered");
    String errorMessage = (String) request.getAttribute("errorMessage");
    String resetSent = request.getParameter("reset_sent");
    String resetError = request.getParameter("reset_error");
%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đăng nhập</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/auth.css" />
</head>
<body>
<div class="page">
    <div class="shell">
        <div class="hero">
            <section class="left">
                <div class="brand"><div class="brand-mark">V</div><div>VNEC</div></div>
                <div>
                    <h1>Đăng nhập</h1>
                    <p class="subtitle">Đăng nhập để tham gia đấu giá và quản lý tài khoản một cách an toàn, nhanh chóng.</p>
                </div>
                <div class="tabs"><button class="tab" type="button">Đăng nhập</button></div>
                <% if (errorMessage != null) { %><div class="alert"><%= errorMessage %></div><% } %>
                <% if ("1".equals(success)) { %><div class="alert success">Đăng nhập thành công.</div><% } %>
                <% if ("1".equals(registered)) { %><div class="alert success">Đăng ký thành công. Vui lòng đăng nhập.</div><% } %>
                <% if ("1".equals(resetSent)) { %><div class="alert success">Đã gửi hướng dẫn đặt lại mật khẩu qua email.</div><% } %>
                <% if ("1".equals(resetError)) { %><div class="alert">Không tìm thấy tài khoản phù hợp hoặc không thể gửi email.</div><% } %>
                <form action="<%= request.getContextPath() %>/login" method="post">
                    <div class="field">
                        <label for="loginUser">Email/SDT/CCCD</label>
                        <input id="loginUser" name="loginUser" type="text" placeholder="Email/SDT/CCCD" />
                    </div>
                    <div class="field">
                        <label for="loginPass">Mật khẩu</label>
                        <div class="input-wrap">
                            <input id="loginPass" name="loginPass" type="password" placeholder="••••••••••" />
                            <button class="toggle-eye" type="button" onclick="togglePassword('loginPass', this)">👁</button>
                        </div>
                    </div>
                    <div class="row">
                        <label class="remember"><input type="checkbox" /> Ghi nhớ đăng nhập</label>
                        <a class="link" href="<%= request.getContextPath() %>/register.jsp">Đăng ký ngay</a>
                    </div>
                    <button class="btn-primary" type="submit">Đăng nhập</button>
                </form>
                <div class="center-text">Chưa có tài khoản? <a href="<%= request.getContextPath() %>/register.jsp">Đăng ký ngay</a></div>
                <div class="center-text"><a href="<%= request.getContextPath() %>/forgot-password.jsp">Quên mật khẩu?</a></div>
                <div class="divider">Hoặc sử dụng đăng nhập</div>
            </section>
            <aside class="right" aria-hidden="true">
                <div class="art">
                    <img alt="Luxury Watch" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA0_QH_jlR5knRFMIzliDGgOx7IevRtXO86U-bV1eC5yp0vN_mU8rMMBu6rp0xfOvOMnLLTNAmmeyZ-Hgn2KzXRgr32O4Mk6STYqCaN8-GXPmB2YFM1FqTInWHyrJ3IbzP7bPcNb18zk62zl8Mv-CILX_75WIJQRWBTrpVi2nm84LoTk-1sVdi5O6kudZF1oj9AJ83P3zGe8HD97zTlepjT9XoyscVPA6dprYAId1yy95lPDzU_uee4r7_8tW4Umvw-fL7ZI15STdLl" />
                    <div class="gradient-overlay"></div>
                    <div class="art-content">
                        <div class="badge">Online Auction</div>
                        <div>
                            <div class="quote">Access exclusive collections.</div>
                            <div class="foot">Premium login experience for buyers and sellers.</div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>
</div>
<script>
function togglePassword(id, btn){const input=document.getElementById(id);const isPassword=input.type==='password';input.type=isPassword?'text':'password';btn.textContent=isPassword?'🙈':'👁';}
</script>
</body>
</html>
