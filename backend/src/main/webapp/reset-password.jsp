<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String token = request.getParameter("token");
    String errorMessage = (String) request.getAttribute("errorMessage");
    String successMessage = (String) request.getAttribute("successMessage");
%>
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Đặt lại mật khẩu</title>
    <link rel="stylesheet" href="<%= request.getContextPath() %>/assets/css/auth.css" />
</head>
<body>
<div class="page">
    <div class="shell">
        <div class="hero">
            <section class="left">
                <div class="brand"><div class="brand-mark">V</div><div>VNEC</div></div>
                <div>
                    <h1>Đặt lại mật khẩu</h1>
                    <p class="subtitle">Nhập mật khẩu mới cho tài khoản của bạn.</p>
                </div>
                <% if (errorMessage != null) { %><div class="alert"><%= errorMessage %></div><% } %>
                <% if (successMessage != null) { %><div class="alert success"><%= successMessage %></div><% } %>
                <form action="<%= request.getContextPath() %>/reset-password" method="post">
                    <input type="hidden" name="token" value="<%= token != null ? token : "" %>" />
                    <div class="field">
                        <label for="newPassword">Mật khẩu mới</label>
                        <div class="input-wrap">
                            <input id="newPassword" name="newPassword" type="password" placeholder="Nhập mật khẩu mới" />
                            <button class="toggle-eye" type="button" onclick="togglePassword('newPassword', this)">👁</button>
                        </div>
                    </div>
                    <div class="field">
                        <label for="confirmPassword">Xác nhận mật khẩu</label>
                        <div class="input-wrap">
                            <input id="confirmPassword" name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu mới" />
                            <button class="toggle-eye" type="button" onclick="togglePassword('confirmPassword', this)">👁</button>
                        </div>
                    </div>
                    <button class="btn-primary" type="submit">Cập nhật mật khẩu</button>
                </form>
                <div class="center-text"><a href="login.jsp">Quay lại đăng nhập</a></div>
            </section>
            <aside class="right" aria-hidden="true">
                <div class="art"><div class="badge">Reset Password</div></div>
            </aside>
        </div>
    </div>
</div>
<script>
function togglePassword(id, btn){const input=document.getElementById(id);const isPassword=input.type==='password';input.type=isPassword?'text':'password';btn.textContent=isPassword?'🙈':'👁';}
</script>
</body>
</html>