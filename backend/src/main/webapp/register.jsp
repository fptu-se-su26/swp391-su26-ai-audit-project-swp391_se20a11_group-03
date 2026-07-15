<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String errorMessage = (String) request.getAttribute("errorMessage");
%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đăng ký cá nhân</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/auth.css" />
</head>
<body>
<div class="page">
    <div class="shell">
        <div class="hero">
            <section class="left">
                <div class="brand"><div class="brand-mark">V</div><div>VNEC</div></div>
                <div>
                    <h1>Đăng ký cá nhân</h1>
                    <p class="subtitle">Tạo tài khoản để tham gia đấu giá và quản lý thông tin một cách an toàn, dễ dàng bảo trì về sau.</p>
                </div>
                <div class="tabs"><button class="tab" type="button">Đăng ký</button></div>
                <% if (errorMessage != null) { %><div class="alert"><%= errorMessage %></div><% } %>
                <form action="<%= request.getContextPath() %>/register" method="post">
                    <div class="field"><label for="fullName">Họ và tên</label><input id="fullName" name="fullName" type="text" placeholder="Nhập họ và tên" /></div>
                    <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" placeholder="Nhập email" /></div>
                    <div class="field"><label for="phone">Số điện thoại</label><input id="phone" name="phone" type="tel" placeholder="Nhập số điện thoại" /></div>
                    <div class="field"><label for="identity">Số CCCD/CC/Hộ chiếu</label><input id="identity" name="identity" type="text" placeholder="Nhập số CCCD/CC/Hộ chiếu" /></div>
                    <div class="field"><label for="password">Mật khẩu</label><div class="input-wrap"><input id="password" name="password" type="password" placeholder="Ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số" /><button class="toggle-eye" type="button" onclick="togglePassword('password', this)">👁</button></div></div>
                    <div class="field"><label for="confirmPassword">Xác nhận mật khẩu</label><div class="input-wrap"><input id="confirmPassword" name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" /><button class="toggle-eye" type="button" onclick="togglePassword('confirmPassword', this)">👁</button></div></div>
                    <button class="btn-primary" type="submit">Tạo tài khoản cá nhân</button>
                </form>
                <div class="center-text">Đã có tài khoản? <a href="<%= request.getContextPath() %>/login.jsp">Đăng nhập</a></div>
                <div class="note">
                    <h3>Đối với cá nhân</h3>
                    <ul>
                        <li>Họ và tên</li>
                        <li>Email</li>
                        <li>Số điện thoại</li>
                        <li>Số CCCD/CC/Hộ chiếu</li>
                        <li>Mật khẩu (ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số)</li>
                    </ul>
                </div>
            </section>
            <aside class="right" aria-hidden="true">
                <div class="art">
                    <div class="badge">Secure Sign-up</div>
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