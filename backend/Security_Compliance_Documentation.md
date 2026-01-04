# Security Compliance Documentation - ITPCMS Backend

This document outlines the security architecture and mechanisms implemented in the ITPCMS backend to ensure compliance with national cybersecurity standards (INSA).

## 1. System Architecture
The system follows a typical 3-tier architecture:
- **Presentation Layer**: React/Next.js Frontend (communicates via REST API).
- **Application Layer**: Node.js/Express.js Backend (implements business logic and security controls).
- **Data Layer**: MySQL/MariaDB Database (persists system data).

## 2. Security Functionalities

### 2.1 Authentication & Authorization
- **JWT Authentication**: All sensitive routes are protected by JSON Web Tokens (JWT). The `verifyToken` middleware extracts and validates tokens from the `Authorization` header.
- **Role-Based Access Control (RBAC)**: A custom `restrictTo` middleware is applied to administrative routes, ensuring that only users with authorized roles (e.g., Admin, System Owner) can perform sensitive operations.
- **Session Management**: Secure sessions are implemented using `express-session` with `HttpOnly` and `SameSite` flags.

### 2.2 Input Validation & SQL Injection Prevention
- **Parameterized Queries**: All database interactions use parameterized queries (via `mysql2`) to prevent SQL injection vulnerabilities.
- **Analytics Refactoring**: Complex filtering logic in the Analytics module was refactored to use safe parameterization, eliminating previous concatenation vulnerabilities.

### 2.3 Hardening & Middleware
- **Helmet**: Configured to set various security-related HTTP headers.
- **Rate Limiting**: Implemented `express-rate-limit` to prevent brute-force attacks on sensitive endpoints.
- **CORS**: Strict CORS policies are enforced, allowing only authorized origins to interact with the API.

### 2.4 Data Protection
- **Password Hashing**: User passwords are securely hashed using `bcrypt` before storage.
- **Environment Variables**: Sensitive configurations (JWT secrets, DB credentials) are managed via `.env` files and are never hardcoded.

## 3. Threat Modeling Summary
| Threat | Mitigation Strategy | Status |
| :--- | :--- | :--- |
| SQL Injection | Use of parameterized queries across all controllers. | **Mitigated** |
| Broken Authentication | JWT verification, strong hashing, and session security. | **Mitigated** |
| Sensitive Data Exposure | HTTPS (prod), Environment Variables, and HttpOnly cookies. | **Mitigated** |
| Brute Force | Rate limiting on API endpoints. | **Mitigated** |
| Unauthorized Access | RBAC (Role-Based Access Control) on all admin routes. | **Mitigated** |

## 4. Entity-Relationship Diagram (ERD) Summary
The database schema (`cms.sql`) includes tables for `users`, `employees`, `roles`, `news`, `events`, `media_gallery`, and more. Relationships are enforced via Foreign Keys, ensuring data integrity and cascading security policies (e.g., deleting a user deletes their specific associations where applicable).

---
*Date of Last Review: December 2025*
*Status: Security Hardening Phase Complete*
