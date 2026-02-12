# ITPCMS Security Compliance Documentation
## 🛡️ Security Status: **MAXIMUM HARDENED (Project-Wide)**

### 1. SQL Injection Prevention (SQLi)
- **Methodology**: 100% Parameterized Queries across all controllers.
- **Coverage**:
    - **Menu Management**: Role-based permissions and hierarchical structure.
    - **Media Gallery**: Bulk uploads and dynamic property updates.
    - **Board Management**: Member profiles and 'Who We Are' documentation.
    - **Live Events**: Event configuration and signaling data updates.
    - **Partners/Investors**: Secure management of corporate profiles and gallery assets.
    - **Incubation Programs**: Sanitized program details and success stories.
    - **Investment Resources**: Secure handling of investment steps and downloadable resources.
    - **Training/Workshops**: Secure scheduling and file uploads.
    - **Office Management**: Secured building and office administration.
    - **Leased Land Management**: Secured land parcel and zone administration.
    - **Investment Steps**: Secured investment steps and resources administration.
    - **Who We Are / About Content**: Secured "Who We Are" sections and board members with rich text sanitization.
    - **Contact Us**: Secured contact form with frontend and backend sanitization and honeypot protection.
    - **Careers/Jobs**: Application tracking, resume handling, and job postings.
- **Details**: Raw input is NEVER concatenated. Database drivers handle escaping for all variables. IDs are strictly parsed as integers.

### 2. XSS & HTML Injection Protection
- **Methodology**: Dual-Layer Sanitization (Frontend + Backend).
- **Libraries**: **DOMPurify** (client-side) and **JSDOM + DOMPurify** (server-side).
- **Hardening Details**: 
    - **Titles/Names**: Stripped of ALL HTML tags (`ALLOWED_TAGS: []`).
    - **Bios/Descriptions**: Cleaned of executable scripts while maintaining text integrity.
    - **SVG Icons**: Strictly validated to allow only safe graphical tags (`path`, `circle`, etc.) while stripping `script` and `onclick` attributes.

### 3. Input Validation & Type Safety
- **Methodology**: Strict schema validation using `validator.js`.
- **Implementation**:
    - All IDs (`id`, `parent_id`, `user_id`) are cast to `Integer` via `parseInt` before reaching the DB logic.
    - Status fields (e.g., `live`, `published`, `draft`) are validated against allowed enums.
    - URLs (YouTube, LinkedIn, Twitter) are validated for proper format.

### 4. Route Security & Access Control
- **Core Strategy**: Zero-Trust Authentication.
- **Vulnerability Remediation**: Fixed previously unprotected routes in `aboutRoutes.js`.
- **Middleware**:
    - `verifyToken`: Validates JWT/Session identity.
    - `restrictTo(1)`: Locks administrative functions to SuperAdmins only.
    - `hasMenuPermission`: Dynamic granular access control for standard admins.

### 5. Media & Streaming Security
- **Upload Hardening**: Integrated Multer with file-type filtering (Allowing only `jpeg`, `jpg`, `png`, `gif`, `webp`).
- **P2P Signaling**: Sanity-filtered `eventId` parameters in PeerJS connection strings to prevent signaling channel injection.
- **Secure RNG**: Uses `window.crypto` for cryptographically strong Peer IDs.

### 6. Information Exposure Control (Fingerprinting)
- **Production Error Masking**: In production environments, internal database errors are suppressed and replaced with generic security notices.
- **Internal Logging**: Detailed errors are logged only to the server console for audit review.

---
**Last Updated**: 2026-02-06
**Audit Result**: COMPLIANT
