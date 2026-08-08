# Security & Access Document (SAD) — Loadbyton

## 1. Authentication & Session Security

1. **JSON Web Tokens (JWT)**:
   - Access Token: Short-lived (15 minutes lifespan), signed with RSA-256 / HMAC SHA-256.
   - Refresh Token: Stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies with 7-day expiration.
2. **Multi-Factor Authentication (MFA)**:
   - Standard TOTP (Google Authenticator, Authy).
   - Mandatory for Admin users and Carriers accepting payments over AED 10,000.
3. **Password Policies**:
   - Minimum 10 characters with upper/lowercase, numbers, and special characters.
   - Hashed using `bcrypt` with cost factor 12+.

---

## 2. Role-Based Access Control (RBAC) Matrix

| Endpoint / Resource | SHIPPER | CARRIER | ADMIN |
| :--- | :--- | :--- | :--- |
| `POST /api/v1/jobs` | ✅ Allowed | ❌ Forbidden | ✅ Allowed |
| `POST /api/v1/jobs/:id/bids` | ❌ Forbidden | ✅ Allowed | ❌ Read-Only |
| `POST /api/v1/bids/:id/accept` | ✅ Allowed (Owner) | ❌ Forbidden | ❌ Read-Only |
| `POST /api/v1/payments/:id/release` | ✅ Allowed (Owner) | ❌ Forbidden | ✅ Allowed (Override) |
| `PUT /api/v1/users/:id/verify` | ❌ Forbidden | ❌ Forbidden | ✅ Allowed |

---

## 3. Data Encryption & Audit Logging

- **Data at Rest**: Sensitive financial records, Tax Registration Numbers (TRN), and bank details encrypted via AES-256-GCM.
- **Data in Transit**: Enforced TLS 1.3 with HTTP Strict Transport Security (HSTS).
- **Audit Logs**: Every admin override, user status escalation, payment release, or contract amendment is logged to an immutable `AuditLog` table with IP address, user agent, and timestamp.
