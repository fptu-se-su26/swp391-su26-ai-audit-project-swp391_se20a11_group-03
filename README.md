# SE AI Audit Project Template

## 1. Project Information

| Item       | Description              |
| ---------- | ------------------------ |
| Course     | SWP391                   |
| Class      | SE20A11                  |
| Semester   | SU26                     |
| Group      | 3                        |
| Topic      | Real-time Bidding System |
| Repository |                          |

---

## 2. Team Members

|  No | Student ID | Full Name            | GitHub Username | Role   | Main Responsibility |
| --: | ---------- | -------------------- | --------------- | ------ | ------------------- |
|   1 | DE190344   | Nguyen Ngoc Bao Long | KayT2K          | Leader |                     |
|   2 | DE190062   | Le Phuoc Sang        | lsang9494-lang  | Member |                     |
|   3 | DE190404   | Pham Manh Thang      | ThangManhPham   | Member |                     |
|   4 | DE191098   | Tran Van Duc         | ductran2005     | Member |                     |
|   5 | DE190463   | Hoang Xuan Anh Tuan  | tuan190605      | Member |                     |

---

## 3. Project Structure

```text
src/
docs/
sql/
.github/
README.md
```

---

## 4. Required AI Audit Documents

Each group must maintain the following documents:

```text
docs/AI_AUDIT_LOG.md
docs/PROMPTS.md
docs/REFLECTION.md
docs/CHANGELOG.md
```

---

## 5. Workflow

Students must follow this workflow:

```text
Issue → Branch → Commit → Pull Request → Review → Merge
```

Direct push to the `main` branch should be avoided.

---

## 6. Branch Naming Convention

```text
feature/studentid-task-name
bugfix/studentid-error-name
docs/studentid-update-audit-log
test/studentid-test-case-name
```

Example:

```text
feature/se123456-login-page
bugfix/se123456-login-validation
docs/se123456-update-ai-audit-log
```

---

## 7. Commit Message Convention

```text
[StudentID] type: short description
```

Examples:

```text
[SE123456] feat: add login page
[SE123456] fix: fix login validation
[SE123456] docs: update AI audit log
[SE123456] test: add login test cases
```

Common types:

```text
feat, fix, docs, test, refactor, style, chore
```

---

## 8. SQL Server Setup

The application uses Microsoft SQL Server. For local development, create the database first:

```sql
IF DB_ID(N'SWP_Nhom3') IS NULL
BEGIN
    CREATE DATABASE SWP_Nhom3;
END;
GO
```

The same script is available at:

```text
src/main/resources/db/create-database.sql
```

Default JDBC settings are in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=SWP_Nhom3;encrypt=true;trustServerCertificate=true
spring.datasource.username=sa
spring.datasource.password=123
server.port=8096
app.seed.enabled=true
```

On first backend startup, `DataSeeder` creates the required development tables when they are missing and seeds demo roles, users, wallets, products, auctions, KYC support tables, watchlist, notifications, chat tables, and wallet/payment tables.

### Demo Accounts

```text
Admin: admin@example.com / password
Staff: staff@example.com / password
User:  user@example.com / password
Seller: seller1@example.com / password
```

---

## 9. How to Run

### Backend

From the repository root:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend runs on:

```text
http://localhost:8096
```

### Frontend

From the repository root:

```powershell
cd src/frontend
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:3000
```

### SePay Webhook Development

Expose the backend with ngrok:

```powershell
ngrok http 8096
```

Use this webhook path on the SePay dashboard:

```text
https://<your-ngrok-domain>/api/wallet/sepay-webhook
```

---

## 10. AI Usage Rule

Students are allowed to use AI tools such as ChatGPT, Gemini, Claude, GitHub Copilot, Cursor, Antigravity, or similar tools.

However, all important AI usage must be recorded in:

```text
docs/AI_AUDIT_LOG.md
docs/PROMPTS.md
docs/CHANGELOG.md
docs/REFLECTION.md
```

Students must be able to explain, verify, and defend all submitted work.
