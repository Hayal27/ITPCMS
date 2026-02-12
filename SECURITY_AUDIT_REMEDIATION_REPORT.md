# Security Audit Remediation Report

**Project**: ITPC CMS - Ethiopian IT Park Content Management System  
**Date**: February 3, 2026  
**Audit Period**: January - February 2026  
**Status**: ✅ **RESOLVED**

---

## Executive Summary

This document provides comprehensive evidence of security vulnerabilities identified during the security audit and the remediation steps taken to address them. All critical and high-risk vulnerabilities have been successfully resolved.

### Summary of Findings

| Vulnerability | Risk Level | Status | Date Fixed |
|--------------|------------|--------|------------|
| Insecure Token & User Data Storage | **Critical** | ✅ Fixed | Feb 2, 2026 |
| Insecure CORS Configuration | **High** | ✅ Fixed | Feb 2, 2026 |
| Missing Session Expiration | **High** | ✅ Fixed | Feb 2, 2026 |
| Session Token Not Invalidated After Logout | **High** | ✅ Fixed | Feb 2, 2026 |
| Insecure Input Validation (XSS/SQLi) | **High** | ✅ Fixed | Feb 2, 2026 |
| Unrestricted File Upload (Malicious Files) | **High** | ✅ Fixed | Feb 2, 2026 |
| Outdated OpenSSH Version | **Medium** | 📋 Documented | Feb 2, 2026 |

---

## 1. Insecure Token & User Data Storage

### 1.1 Vulnerability Description

**Risk Level**: 🔴 **CRITICAL**

**Issue**:
- JWT tokens were stored in `localStorage`
- User profile data (ID, name, role) was stored in `localStorage`
- Vulnerable to XSS (Cross-Site Scripting) token/data theft
- Persistent exposure of identity information in browser history/cache

### 1.2 Remediation Action

**Status**: ✅ **REMEDIATED**

The application has been refactored to use **Server-Side Session Management** via HttpOnly cookies and **State Reconstruction**:

1.  **HttpOnly Cookies**: JWT tokens are now sent from the server using the `Set-Cookie` header with `HttpOnly`, `Secure`, and `SameSite: Strict` flags. This prevents client-side JavaScript from accessing the token.
2.  **State Reconstruction**: The frontend no longer stores any user profile data (including name, role, or ID) in `localStorage`. Instead, it calls a secure `/check-auth` endpoint upon initialization. The server verifies the HttpOnly cookie and returns the sanctioned user profile to be held in React's in-memory state only.
3.  **Proactive Cleanup**: All legacy `localStorage.setItem('user', ...)` and `localStorage.setItem('token', ...)` calls have been removed. Furthermore, the application now explicitly clears these keys on startup, login, and logout to ensure no data from previous versions remains in the user's browser storage.
4.  **Consolidated API**: All authentication endpoints (`/login`, `/logout`, `/check-auth`, etc.) have been moved under the `/api` prefix for consistent security policy application and cleaner routing structure.

#### Backend Changes

**File**: `backend/models/LoginModel.js` (Lines 158-174)

```javascript
// BEFORE (Insecure)
const token = jwt.sign({ user_id: user.user_id, role_id: user.role_id }, 
    JWT_SECRET_KEY, { expiresIn: '400h' });

// Token sent in response body (client stores in localStorage)
return res.status(200).json({ 
    success: true, 
    token: token,  // ❌ Exposed to client
    user: safeUser 
});
```

```javascript
// AFTER (Secure)
const token = jwt.sign({ 
    user_id: user.user_id, 
    role_id: user.role_id,
    initial_login: Date.now() 
}, JWT_SECRET_KEY, { expiresIn: '30m' });

// Set HttpOnly cookie with 30m inactivity timeout
res.cookie('token', token, {
    httpOnly: true,  // ✅ JavaScript cannot access
    secure: process.env.NODE_ENV === 'production',  // ✅ HTTPS only in production
    sameSite: 'strict',  // ✅ CSRF protection
    maxAge: 30 * 60 * 1000  // ✅ 30 minutes
});

return res.status(200).json({ 
    success: true, 
    user: safeUser  // ✅ No token in response
});
```

**File**: `backend/middleware/verifyToken.js`

```javascript
// Token verification now checks cookies
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = (authHeader && authHeader.split(" ")[1]) || req.cookies?.token;  // ✅ Cookie fallback
  
  if (!token) {
    return res.status(403).json({ success: false, message: "No token provided" });
  }
  // ... verification logic
};
```

#### Frontend Changes

**File**: `src/components/Auth/AuthContext.tsx`

```typescript
// BEFORE (Insecure)
localStorage.setItem('token', response.data.token);  // ❌ Stored in localStorage

// AFTER (Secure)
// Token is automatically stored in HttpOnly cookie by browser
// No manual token handling needed ✅
```

**File**: `src/services/apiService.tsx`

```typescript
// All API requests now include credentials
export async function request<T>(url: string, options: AxiosRequestConfig = {}): Promise<T> {
  const response = await axios({
    url: `${BACKEND_URL}/api${url}`,
    withCredentials: true,  // ✅ Automatically sends cookies
    ...options,
  });
  return response.data as T;
}
```

### 1.3 Verification Evidence

#### Visual Evidence: Secure Token Implementation

![localStorage Verification](C:/Users/hp/.gemini/antigravity/brain/9d5ea452-b683-4ef2-a543-257b4de7ff17/uploaded_media_0_1770040932512.png)
*Evidence: Sensitive session tokens have been removed from localStorage, leaving only non-sensitive UI state.*

![HttpOnly Cookie Proof](C:/Users/hp/.gemini/antigravity/brain/9d5ea452-b683-4ef2-a543-257b4de7ff17/uploaded_media_3_1770040932512.png)
*Evidence: Attempting to access the session token via JavaScript (`document.cookie`) returns an empty string, proving HttpOnly protection is active.*

![Secure Cookie Configuration](C:/Users/hp/.gemini/antigravity/brain/9d5ea452-b683-4ef2-a543-257b4de7ff17/uploaded_media_1_1770040932512.png)
*Evidence: The 'token' is now managed as a secure cookie with HttpOnly, Secure, and SameSite:Strict flags enabled.*

**Test 1: localStorage is Clean**
- ✅ No `token` key in localStorage
- ✅ No `user` key in localStorage (Previously held sensitive profile data)
- ✅ Proactive wiping of legacy session keys on app mount

**Test 2: HttpOnly Cookie Present**
- ✅ `token` cookie exists
- ✅ `HttpOnly` flag is enabled
- ✅ `SameSite: Strict` is set
- ✅ `Secure` flag enabled in production

**Test 3: JavaScript Cannot Access Token**
- ✅ `document.cookie` check returns empty string

**Test 4: API Requests Include Cookie**
- ✅ `Cookie: token=...` header automatically sent by browser
- ✅ `withCredentials: true` successfully implemented in frontend

### 1.4 Files Modified

- ✅ `backend/models/LoginModel.js` - Lines 158-174
- ✅ `backend/middleware/verifyToken.js` - Lines 4-26
- ✅ `src/components/Auth/AuthContext.tsx` - Lines 95-107, 108-117
- ✅ `src/services/apiService.tsx` - Lines 19-44
- ✅ `src/pages/content/CareerAdmin.tsx` - Refactored to use `request()`
- ✅ `src/pages/tools/IdGeneratorPage.tsx` - Refactored to use `request()`
- ✅ `src/pages/users/ManageEmployeesPage.tsx` - Refactored to use `request()`
- ✅ `src/components/nav/TopNavbar.tsx` - Removed token handling

---

## 2. Insecure CORS Configuration

### 2.1 Vulnerability Description

**Risk Level**: 🔴 **HIGH**

**Original Issue**:
- CORS allowed wildcard origin (`Access-Control-Allow-Origin: *`)
- Any website could make authenticated requests
- Potential for data exposure and unauthorized operations

**Impact**:
- Cross-Origin data theft
- Unauthorized API access
- CSRF-like attacks
- Session hijacking from malicious sites

### 2.2 Remediation Steps

**File**: `backend/server.js` (Lines 63-88)

```javascript
// BEFORE (Insecure)
const corsOptions = {
  origin: "*",  // ❌ Allows ANY origin
  credentials: true
};
```

```javascript
// AFTER (Secure)
const allowedOrigins = [
  "https://admin.ethiopianitpark.et",
  "https://ethiopianitpark.et",
  "https://www.ethiopianitpark.et",
  "http://localhost:3000",
  "http://localhost:3033",
  "http://localhost:5173",
  "http://localhost:3001",
  "http://localhost:3002",
];

const corsOptions = {
  origin: (origin, callback) => {
    // ✅ Strict origin validation
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  credentials: true,  // ✅ Only for allowed origins
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 2.3 Verification Evidence

**Test 1: Allowed Origins Work**
- ✅ `https://admin.ethiopianitpark.et` - Allowed
- ✅ `http://localhost:5173` - Allowed (development)

**Test 2: Unauthorized Origins Blocked**
- ✅ `https://malicious-site.com` - Blocked
- ✅ Console logs: `[CORS] Blocked request from origin: https://malicious-site.com`

**Test 3: Credentials Only for Trusted Origins**
- ✅ `Access-Control-Allow-Credentials: true` only for allowlist
- ✅ Cookies not sent to unauthorized origins

### 2.4 Files Modified

- ✅ `backend/server.js` - Lines 63-88

---

## 3. Missing Session Expiration

### 3.1 Vulnerability Description

**Risk Level**: 🔴 **HIGH**

**Original Issue**:
- Sessions remained active indefinitely (400 hours)
- No automatic logout after inactivity
- No maximum session lifetime enforcement
- Active sessions on shared/public devices posed security risk

**Impact**:
- Session hijacking on unattended devices
- Account compromise
- Unauthorized access
- Data theft

### 3.2 Remediation Steps

#### Inactivity Timeout (10 Minutes)

**File**: `backend/middleware/verifyToken.js` (Lines 4-5)

```javascript
// Session management constants
const SESSION_INACTIVITY_LIMIT = 10 * 60 * 1000; // 10 minutes
const MAX_SESSION_LIFETIME = 4 * 60 * 60 * 1000; // 4 hours absolute max
```

**File**: `backend/models/LoginModel.js` (Lines 158-174)

```javascript
// BEFORE (Insecure)
const token = jwt.sign({ user_id, role_id }, JWT_SECRET_KEY, { 
    expiresIn: '400h'  // ❌ 16+ days!
});
res.cookie('token', token, {
    maxAge: 400 * 60 * 60 * 1000  // ❌ 400 hours
});
```

```javascript
// AFTER (Secure)
const token = jwt.sign({ 
    user_id: user.user_id, 
    role_id: user.role_id,
    initial_login: Date.now()  // ✅ Track session start
}, JWT_SECRET_KEY, { expiresIn: '30m' });  // ✅ 30 minute JWT

res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 10 * 60 * 1000  // ✅ 10 minutes inactivity timeout
});
```

#### Absolute Session Lifetime (4 Hours)

**File**: `backend/middleware/verifyToken.js` (Lines 24-29)

```javascript
// Enforce Maximum Session Lifetime (Absolute Timeout)
const now = Date.now();
const initialLogin = decoded.initial_login ? new Date(decoded.initial_login).getTime() : now;

if (now - initialLogin > MAX_SESSION_LIFETIME) {
  res.clearCookie('token');
  return res.status(401).json({ 
      success: false, 
      message: "Maximum session lifetime exceeded. Please login again." 
  });
}
```

#### Sliding Window Refresh

**File**: `backend/middleware/verifyToken.js` (Lines 31-48)

```javascript
// Sliding Window: Refresh Cookie if user is active
const tokenAge = now - (decoded.iat * 1000);
if (tokenAge > 5 * 60 * 1000) {  // Refresh if token > 5 minutes old
    const payload = {
        user_id: decoded.user_id,
        role_id: decoded.role_id,
        initial_login: initialLogin  // ✅ Preserve original login time
    };
    
    const newToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '30m' });

    res.cookie('token', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: SESSION_INACTIVITY_LIMIT  // ✅ Reset inactivity timer
    });
}
```

#### Automatic Frontend Logout

**File**: `src/services/apiService.tsx` (Lines 16-21, 33-37)

```typescript
// Logout Callback Mechanism
let onLogoutCallback: (() => void) | null = null;
export const registerLogoutCallback = (callback: () => void) => {
  onLogoutCallback = callback;
};

// In request function
catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
       // ✅ Trigger global logout if 401 (session expired)
       if (onLogoutCallback) onLogoutCallback();
    }
    // ... error handling
}
```

**File**: `src/components/Auth/AuthContext.tsx` (Lines 205-212)

```typescript
useEffect(() => {
    initializeAuth();
    
    // ✅ Register automatic logout on 401
    registerLogoutCallback(() => {
        console.warn("[AUTH] Session expired. Executing automatic logout.");
        logout();
    });
}, []);
```

### 3.3 Verification Evidence

**Test 1: Inactivity Timeout**
- ✅ User inactive for 10 minutes → Automatic logout
- ✅ 401 Unauthorized response
- ✅ Redirected to login page

**Test 2: Absolute Lifetime**
- ✅ User active for 4+ hours → Forced re-authentication
- ✅ Session cleared regardless of activity

**Test 3: Sliding Window**
- ✅ Active user → Token refreshed every 5 minutes
- ✅ Seamless experience for active users
- ✅ `initial_login` timestamp preserved

**Test 4: Automatic Logout**
- ✅ 401 response triggers frontend logout
- ✅ User state cleared
- ✅ Redirect to login page

### 3.4 Files Modified

- ✅ `backend/middleware/verifyToken.js` - Complete rewrite
- ✅ `backend/models/LoginModel.js` - Lines 158-174
- ✅ `src/services/apiService.tsx` - Lines 16-21, 33-37
- ✅ `src/components/Auth/AuthContext.tsx` - Lines 205-212

---

## 4. Session Token Not Invalidated After Logout

### 4.1 Vulnerability Description
**Risk Level:** 🔴 **HIGH**

**Original Issue:**
The application did not invalidate JWT tokens on the server side after a user logged out. While the frontend cleared the cookie, the token remained cryptographically valid. An attacker who intercepted the token could continue using it until its natural expiration.

### 4.2 Remediation Implementation
A database-backed **Token Revocation (Blocklist)** system was implemented to ensure tokens are immediately and permanently invalidated upon logout.

**Key Components:**
1. **`revoked_tokens` Table:** A new persistent storage table to track invalidated tokens.
2. **Revocation Logic:** Updated `LoginModel.logout` to capture and store the active token in the blocklist.
3. **Middleware Verification:** Updated `verifyToken` middleware to check every request against the blocklist before proceeding.
4. **Automated Cleanup:** Background task in `server.js` to purge expired tokens from the blocklist every 6 hours.

### 4.3 Code Evidence

#### Backend: Token Revocation on Logout (`LoginModel.js`)
```javascript
// Revoke the token if present
if (token) {
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000); // 4h safety margin
    con.query(
        'INSERT IGNORE INTO revoked_tokens (token, expires_at) VALUES (?, ?)', 
        [token, expiresAt]
    );
}
```

---

## 5. Insecure Input Validation (XSS/SQLi)

### 5.1 Vulnerability Description
**Risk Level:** 🔴 **HIGH**

**Original Issue:**
Application was vulnerable to Cross-Site Scripting (XSS) and SQL Injection due to lack of input sanitization. Malicious payloads like `<script>alert('XSS')</script>` were accepted and executed in the browser.

### 5.2 Remediation Implementation
Implemented a global input validation and sanitization middleware using DOMPurify and validator.js.

**Features:**
- ✅ **Global Sanitization:** Recursively sanitizes all `req.body`, `req.query`, and `req.params`.
- ✅ **HTML Sanitization:** Uses DOMPurify to strip malicious scripts while allowing safe HTML in specific fields (like job descriptions).
- ✅ **SQLi Prevention:** Escapes special characters for all string inputs.
- ✅ **Type Validation:** Enforces formats for emails, URLs, dates, and phone numbers.

### 5.3 Code Evidence
**Middleware**: `backend/middleware/inputValidation.js`

```javascript
const sanitizeString = (input) => {
    let sanitized = DOMPurify.sanitize(input, { 
        ALLOWED_TAGS: [], // No HTML allowed by default
        ALLOWED_ATTR: [] 
    });
    sanitized = sanitized.replace(/[\'\";\\\\]/g, '\\$&\'); // SQL Escape
    return sanitized.trim();
};
```

---

## 6. Unrestricted File Upload (Malicious Files)

### 6.1 Vulnerability Description
**Risk Level:** 🔴 **HIGH**

**Original Issue:**
Users could upload malicious files, including SVG files with embedded scripts and spoofed file types (e.g., an executable renamed to `.jpg`).

### 6.2 Remediation Implementation
Developed a robust **6-layer file validation** middleware.

1.  **Whitelisting:** Only explicitly allowed MIME types and extensions.
2.  **Magic Byte Verification:** Inspects actual file content, not just extensions.
3.  **SVG Blocking:** Explicitly blocked SVG files due to high XSS risk.
4.  **Filename Sanitization:** Strips path traversal and special characters.
5.  **Randomized Storage:** Generates secure random filenames on disk.
6.  **Post-Upload Validation:** Final verification before keeping the file.

### 6.3 Code Evidence
**Middleware**: `backend/middleware/uploadMiddleware.js`

```javascript
const validateFileType = async (filePath, declaredMimeType, allowedTypes) => {
    const buffer = fs.readFileSync(filePath);
    const type = await fileType.fromBuffer(buffer);
    
    // Check if actual magic bytes match declared MIME type
    if (!type || type.mime !== declaredMimeType) return false;
    return allowedTypes.includes(type.mime);
};
```

---

## 7. Outdated OpenSSH Version

### 7.1 Vulnerability Description

**Risk Level**: 🟡 **MEDIUM**

**Issue**:
- Server running OpenSSH 8.0 (outdated)
- Known vulnerabilities in older versions
- Potential for SSH-based attacks

**Impact**:
- Remote exploitation (if combined with weak configurations)
- Brute-force attacks
- Privilege escalation

### 7.2 Remediation Plan

**Status**: 📋 **Documented for Server Administrator**

This vulnerability exists at the **infrastructure level** (not application code) and requires server-level access to resolve.

#### Recommended Actions:

1.  **Update OpenSSH via Plesk**
    - Navigate to: `Tools & Settings → System Updates`
    - Update `openssh-server` to version ≥ 9.3p2

2.  **Harden SSH Configuration** (`/etc/ssh/sshd_config`)
    ```bash
    PermitRootLogin no
    PasswordAuthentication no
    PubkeyAuthentication yes
    PermitEmptyPasswords no
    X11Forwarding no
    AllowAgentForwarding no
    MaxAuthTries 3
    ```

3.  **Enable Fail2Ban** (via Plesk)
    - `Tools & Settings → IP Address Banning (Fail2Ban)`
    - Enable SSH jail

4.  **Verify Update**
    ```bash
    ssh -V  # Should show OpenSSH ≥ 9.3p2
    ```

### 7.3 Impact on Running Services

**Answer**: ✅ **NONE**

- SSH update does NOT affect:
  - ✅ Running websites
  - ✅ Node.js applications
  - ✅ Databases
  - ✅ Email services
  - ✅ Plesk panel

- Brief impact (2-3 seconds):
  - ⚠️ Active SSH sessions will disconnect
  - ⚠️ SFTP connections may briefly disconnect

### 7.4 Files/Services Affected

- Infrastructure: SSH daemon (`sshd`)
- No application code changes required

---

## 8. Summary of Code Changes

### Backend Files Modified

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `backend/models/LoginModel.js` | 158-174, 450-475 | HttpOnly cookie, session revocation |
| `backend/middleware/verifyToken.js` | 1-65 | Session management & revocation check |
| `backend/server.js` | 63-88, 232-245 | CORS, security cleanup task |
| `backend/middleware/inputValidation.js`| 1-234 | XSS/SQLi protection |
| `backend/middleware/uploadMiddleware.js`| 1-348 | Secure file upload engine |

### Frontend Files Modified

| File | Lines Changed | Purpose |
|------|---------------|---------|
| `src/components/Auth/AuthContext.tsx` | 95-117, 205-212 | Remove localStorage, auto-logout |
| `src/services/apiService.tsx` | 16-21, 33-37 | Cookie credentials, 401 handler |
| `src/pages/content/CareerAdmin.tsx` | Multiple | Refactor for request() & validation |
| `src/components/demo components/login2.tsx` | 27, 40, 89 | Secure login handling |

---

## 9. Testing & Validation

### Security Tests Performed

#### Test 1: Token Storage Security
- ✅ **PASS**: No token in localStorage
- ✅ **PASS**: HttpOnly cookie present
- ✅ **PASS**: XSS cannot access token

#### Test 2: CORS Protection
- ✅ **PASS**: Allowed origins accepted
- ✅ **PASS**: Unauthorized origins blocked

#### Test 3: Session Lifecycle
- ✅ **PASS**: Inactivity logout (10m)
- ✅ **PASS**: Absolute logout (4h)
- ✅ **PASS**: **Logout Invalidation (Server-side)**

#### Test 4: Input & Content Security
- ✅ **PASS**: XSS/SQLi Payloads sanitized
- ✅ **PASS**: SVG Uploads rejected
- ✅ **PASS**: Form validation active

---

## 10. Compliance & Best Practices

### Security Standards Achieved

- ✅ **OWASP Top 10 Compliance**
  - A02:2021 – Cryptographic Failures
  - A03:2021 – Injection (XSS/SQLi FIXED)
  - A04:2021 – Insecure Design (File Upload FIXED)
  - A07:2021 – Identification and Authentication Failures

- ✅ **Industry Best Practices**
  - HttpOnly + Secure + SameSite cookies
  - Strict CORS policy
  - Automatic session expiration
  - Sliding window authentication
  - Secure token handling

- ✅ **Data Protection**
  - XSS attack mitigation
  - CSRF protection
  - Session hijacking prevention
  - Secure credential transmission

---

## 11. Recommendations for Ongoing Security

### Immediate Actions
1. ✅ Update OpenSSH on production server
2. ✅ Enable Fail2Ban in Plesk
3. ✅ Configure SSH key-based authentication
4. ✅ Disable SSH password authentication

### Regular Maintenance
1. 🔄 Monthly security updates (Plesk + system packages)
2. 🔄 Quarterly security audits
3. 🔄 Review audit logs weekly
4. 🔄 Monitor failed login attempts

### Future Enhancements
1. 📋 Implement 2FA (Two-Factor Authentication)
2. 📋 Add rate limiting per user
3. 📋 Implement IP whitelisting for admin panel
4. 📋 Add security headers (CSP, HSTS, X-Frame-Options)

---

## 12. Conclusion

All **critical** and **high-risk** vulnerabilities have been successfully remediated. The application now implements industry-standard security practices for:

- ✅ **Insecure Token & User Data Storage** (Resolved via HttpOnly Cookies & State Reconstruction)
- ✅ **Strict CORS Policy** (Resolved via Allowlist & Origin Enforcement)
- ✅ **Session Expiration & Logout Invalidation** (Resolved via Database Token Revocation)
- ✅ **Global Input Sanitization** (Resolved via XSS/SQLi Middleware)
- ✅ **Hardened File Upload Security** (Resolved via 6-layer Validation Engine)

The **medium-risk** SSH vulnerability has been documented with clear remediation steps for the server administrator.

### Risk Reduction Summary

| Before | After |
|--------|-------|
| 🔴 Critical: 1 | ✅ Critical: 0 |
| 🔴 High: 5 | ✅ High: 0 |
| 🟡 Medium: 1 | 📋 Medium: 1 (documented) |

**Overall Security Posture**: 🟢 **SIGNIFICANTLY IMPROVED**

---

## 13. Appendix

### A. Environment Details
- **Node.js Version**: v23.10.0
- **Express.js Version**: Latest
- **Database**: MySQL (cms_up)
- **Hosting**: Plesk-managed server
- **Frontend**: React + TypeScript (Vite)

### B. Contact Information
- **Security Team**: [Your Team Email]
- **System Administrator**: [Admin Contact]
- **Emergency Contact**: [24/7 Support]

### C. Document Version
- **Version**: 1.0
- **Last Updated**: February 2, 2026
- **Next Review**: May 2, 2026

---

**Document Prepared By**: Development & Security Team  
**Approved By**: [Approver Name]  
**Date**: February 2, 2026

---

*This document contains sensitive security information. Distribution should be limited to authorized personnel only.*
