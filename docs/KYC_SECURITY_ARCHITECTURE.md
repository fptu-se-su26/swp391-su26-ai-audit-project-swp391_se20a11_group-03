# KYC security architecture

## Trust boundary

- Identity documents are stored under `app.kyc.upload-dir`, outside Spring's public static directory.
- The API returns logical document endpoints (`/kyc/{id}/documents/{kind}`), never physical paths.
- A document can be read only by its owner or a user with `Staff`/`Admin` authority.
- `/uploads/kyc/**` is explicitly denied to protect legacy files still awaiting migration.

## Upload policy

- Only JPEG/PNG signatures are accepted; browser MIME type and filename extension are not trusted.
- File size and decoded pixel count are capped by `app.kyc.max-file-bytes` and `app.kyc.max-pixels`.
- Images are written through a temporary file and an atomic move with generated server-side names.
- Replaced documents are deleted only after the database transaction commits.

## Review policy

- Only `PENDING` submissions can transition to a decision, using a conditional update to prevent double review.
- Approval is blocked when a document is missing, unreadable, or has critical forensic warnings.
- The forensic implementation is a screening aid. Production-grade OCR, face matching and liveness should be
  integrated behind a separate provider interface; heuristic analysis alone is not identity proof.

## Operations

- Migrate legacy files from `app.kyc.legacy-upload-dir` into private storage, then remove the legacy directory.
- Keep demo mode disabled in production. The frontend additionally compiles demo login out of production builds.
- Store datasource and JWT secrets in environment variables or a secret manager before deployment.
- Back up private KYC storage encrypted at rest and define a retention/deletion policy with legal/compliance owners.
