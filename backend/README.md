# ITPCMS Backend Service

A robust and secure Node.js backend for the Ethiopian IT Park Content Management System.

## 🚀 Features

- **Standardized API**: RESTful endpoints for users, employees, analytics, and content modules.
- **Security Hardened**: 
  - JWT Authentication on all administrative routes.
  - SQL Injection protection via parameterized queries.
  - Secure file upload handling with Multer.
- **Real-time Integration**: Socket.io and PeerJS support for live events and signaling.
- **Production Ready**: Optimized project structure, environment-driven configuration, and comprehensive logging.

## 🛠 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (via `mysql2`)
- **Real-time**: Socket.io, PeerJS
- **Security**: jsonwebtoken, bcrypt, helmet, express-rate-limit

## 📋 Prerequisites

- Node.js (v18+ recommended)
- MySQL Server

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   Copy `.env.example` to `.env` and fill in your credentials.
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database**:
   Import `models/cms.sql` into your MySQL database.

## 🏃 Running the Application

- **Development Mode** (with auto-watch):
  ```bash
   npm run dev
  ```

- **Production Mode**:
  ```bash
   npm start
  ```

## 🏥 Testing & Monitoring

For external tools (Lighthouse, OWASP ZAP, etc.) to verify connectivity:
- **Health Check**: `GET /health`
- **API Status**: `GET /`
- **Robots Policy**: `GET /robots.txt`

## 📂 Project Structure

- `/controllers`: Request handling and business logic.
- `/routes`: API endpoint definitions.
- `/models`: Database connection and SQL schemas.
- `/middleware`: Authentication and request processing layers.
- `/uploads`: Storage for user-uploaded media (images, docs, resumes).

## 🔒 Security Note

Administrative endpoints (POST, PUT, DELETE) require a valid JWT passed in the `Authorization` header:
`Authorization: Bearer <your_token>`

---
© 2026 Ethiopian IT Park Management.
