<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String errorMessage = (String) request.getAttribute("errorMessage");
    String successMessage = (String) request.getAttribute("successMessage");
%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quên mật khẩu</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/auth.css" />
</head>
<body>
<div class="page">
    <div class="shell">
        <div class="hero">
            <section class="left">
                <div class="brand"><div class="brand-mark">V</div><div>VNEC</div></div>
                <div>
                    <h1>Quên mật khẩu</h1>
                    <p class="subtitle">Nhập email hoặc số điện thoại để nhận link đặt lại mật khẩu.</p>
                </div>
                <% if (errorMessage != null) { %><div class="alert"><%= errorMessage %></div><% } %>
                <% if (successMessage != null) { %><div class="alert success"><%= successMessage %></div><% } %>
                <form action="<%= request.getContextPath() %>/forgot-password" method="post">
                    <div class="field">
                        <label for="loginId">Email hoặc số điện thoại</label>
                        <input id="loginId" name="loginId" type="text" placeholder="Nhập email hoặc số điện thoại" />
                    </div>
                    <button class="btn-primary" type="submit">Gửi link đặt lại mật khẩu</button>
                </form>
                <div class="center-text"><a href="login.jsp">Quay lại đăng nhập</a></div>
            </section>
            <aside class="right" aria-hidden="true">
                <div class="art">
                    <div class="badge">Reset Password</div>
                </div>
            </aside>
        </div>
    </div>
</div>
</body>
</html>