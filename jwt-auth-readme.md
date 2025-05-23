# 🔐 JWT-Based Authentication (Access + Refresh Tokens)

This project uses a modern and secure authentication strategy built on **JSON Web Tokens (JWTs)**, following hybrid best practices recommended by OWASP and the broader security community.

## 🎯 Objective

To protect user sessions by combining:
- **Short-lived access tokens** for fast authentication on every request.
- **Long-lived, secure refresh tokens** for session renewal without forcing re-login.

---

## 🧱 Authentication Architecture

### 1. **Login (`/auth/login`)**
- The user logs in with credentials.
- The backend generates:
  - A short-lived `access_token` (e.g., 15 minutes)
  - A long-lived `refresh_token` (e.g., 7 days)
- The `access_token` is returned in the body:
  ```json
  {
    "access_token": "eyJhbGciOi..."
  }
  ```
- The `refresh_token` is stored in a **secure, HttpOnly cookie**:
  ```ts
  response.cookie('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    path: '/auth/refresh',
  });
  ```

### 2. **Using the Access Token**
- Stored in memory by the frontend (not persisted in localStorage).
- Sent on every request via `Authorization` header:
  ```
  Authorization: Bearer <access_token>
  ```

### 3. **Refreshing the Token (`/auth/refresh`)**
- When the access token expires, the frontend sends `POST /auth/refresh`.
- The browser automatically includes the cookie with the `refresh_token`.
- The backend validates the token (via `JwtRefreshGuard`) and returns a new `access_token`.

---

## ✅ Benefits of This Architecture

| Benefit                          | Explanation                                                                 |
|----------------------------------|------------------------------------------------------------------------------|
| 🔐 **XSS Protection**             | `refresh_token` is in an `HttpOnly` cookie — not accessible via JavaScript |
| 🛡️ **CSRF Resistance**            | `SameSite: 'Strict'` + cookie path scoping reduce attack surface           |
| ♻️ **Session Renewal**            | Users remain logged in without frequent logins                              |
| 🚫 **Refresh Token Not Exposed** | Never returned in response body; never stored in frontend storage           |
| 📦 **SPA/SSR Compatibility**     | Works in both browser and server-rendered environments                      |

---

## ⚠️ Disadvantages & Tradeoffs

While secure and widely recommended, this architecture also has limitations you should be aware of:

| Limitation                            | Description                                                                 |
|---------------------------------------|-----------------------------------------------------------------------------|
| 💾 **Stateful token invalidation**     | JWTs are stateless by design — you must store hashed refresh tokens server-side to invalidate them on logout or rotation |
| 🧠 **Implementation complexity**       | Requires careful coordination between access token logic, cookie management, and refresh endpoint |
| 📉 **Refresh token misuse risk**      | If a refresh token is somehow stolen, the attacker could silently renew sessions (mitigated by HttpOnly and Secure flags) |
| 🚫 **Does not support instant revocation** | Access tokens remain valid until expiry — you can’t revoke them mid-lifecycle unless you track them in a DB |
| 📡 **Clock skew issues** (edge case)   | If client and server clocks are far out of sync, token validation might fail |

---

## 🔄 Recommended Token Lifetimes

| Token          | Duration         | Notes                                         |
|----------------|------------------|-----------------------------------------------|
| `access_token` | 10–15 minutes    | Short-lived; refreshable                      |
| `refresh_token`| 7 days (or less) | Should be rotated on each refresh if possible |

---

## 👨‍💻 Developer Notes

- ❗ **Never** store tokens in `localStorage` or `sessionStorage`
- ❗ **Never** expose the `refresh_token` in the response body
- ✅ Use `@UseGuards(JwtAuthGuard)` to protect access-secured routes
- ✅ Use `JwtRefreshGuard` to protect the refresh endpoint
- ✅ Use `cookie-parser` in `main.ts` to read cookies in NestJS