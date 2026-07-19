# Email and phone verification setup

## 1. Apply the database migration

The active Supabase/PostgreSQL database must run:

```sql
db/migration/V5__email_only_and_phone_verification.sql
db/migration/V6__registration_email_otp.sql
```

SQL Server deployments use:

```text
db/migration/sqlserver/V5__email_only_and_phone_verification.sql
db/migration/sqlserver/V6__registration_email_otp.sql
```

This makes `Users.Phone` nullable and adds `PhoneVerified` and
`PhoneVerifiedAt`.

## 2. Configure verification email

Set these backend environment variables:

```text
APP_FRONTEND_BASE_URL=https://your-frontend.example
MAIL_SMTP_HOST=smtp.gmail.com
MAIL_SMTP_PORT=587
MAIL_SMTP_AUTH=true
MAIL_SMTP_STARTTLS=true
MAIL_USERNAME=your-sender@example.com
MAIL_PASSWORD=your-smtp-app-password
MAIL_FROM=your-sender@example.com
```

For Gmail, use an App Password rather than the account password.

## 3. Configure phone OTP

Create a Verify Service in Twilio, enable the required SMS/WhatsApp channels,
then set:

```text
TWILIO_API_KEY=SK...
TWILIO_API_SECRET=...
TWILIO_VERIFY_SERVICE_SID=VA...
```

For local trials, `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` can be used as
fallback credentials. Trial accounts may only send to numbers approved in the
Twilio console.

SpeedSMS can be configured as the SMS fallback for Vietnamese numbers:

```text
SPEEDSMS_ACCESS_TOKEN=your-access-token
SPEEDSMS_SMS_TYPE=2
SPEEDSMS_SENDER=
```

WhatsApp verification requires Twilio. There is intentionally no development
OTP bypass. If neither provider is configured, the API returns `503` and the
profile page shows the configuration error.

## 4. Expected flow

1. The user enters an email on the registration form and requests a six-digit code.
2. The email code must be verified before the Create account button is enabled.
3. The backend exchanges the code for a short-lived, one-time registration token.
4. Account creation rejects requests without a valid registration token.
5. After login, an unverified phone redirects the user to `/profile`.
6. The user submits a phone number and chooses SMS or WhatsApp.
7. Twilio or SpeedSMS sends and validates the phone OTP.
8. KYC accepts submissions only when the account phone is verified.
