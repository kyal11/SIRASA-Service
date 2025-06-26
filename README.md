# 📚 Sirasa-Service (Backend)

**Sirasa-Service** adalah layanan backend untuk aplikasi **Sirasa App** (Android), sebuah sistem peminjaman ruang diskusi di perpustakaan UPN Veteran Jakarta. Backend ini dibangun menggunakan **NestJS**, terintegrasi dengan **PostgreSQL**, **Redis**, **Firebase**, dan menyediakan layanan autentikasi, notifikasi email, pemrosesan QR code, serta sistem rekomendasi berbasis algoritma **Greedy**.

---

## 🚀 Fitur Utama

- 🔐 Autentikasi dan otorisasi berbasis JWT
- 🧠 Rekomendasi peminjaman ruang diskusi menggunakan algoritma **Greedy**
- 🗓️ Booking dan validasi peminjaman ruangan
- ⏱️ Validasi QR Code oleh admin perpustakaan
- 📧 Verifikasi email & reset password melalui MailTrap
- 📦 Manajemen data pengguna, ruangan, slot waktu
- 🔁 Cache dengan Redis
- 🔥 Integrasi dengan Firebase Admin SDK

---

## 🛠️ Teknologi yang Digunakan

- **NestJS** – Backend Framework (TypeScript)
- **Prisma ORM** – Database management
- **PostgreSQL** – Database utama
- **Redis** – Cache dan antrian
- **Firebase Admin SDK** – Notifikasi dan otentikasi
- **Mailtrap SMTP** – Pengujian email
- **Docker** – Containerisasi
- **Docker Compose** – Manajemen layanan lokal

---

## ⚙️ Cara Install

### 1. Clone Repository

```bash
git clone https://github.com/namamu/sirasa-service.git
cd sirasa-service
````

### 2. Salin dan sesuaikan file environment

```bash
cp .env.example .env
```

> Pastikan untuk mengisi nilai `.env` sesuai konfigurasi lokal Anda.

### 3. Build dan jalankan dengan Docker Compose

```bash
docker-compose up --build
```

Layanan backend akan berjalan di `http://localhost:3000`

---

## 📄 Contoh File `.env.example`

```env
DATABASE_URL="postgresql://<username>:<password>@127.0.0.1:5432/sirasa_db_dev?schema=public"

JWT_SECRET="your-jwt-secret"
JWT_SECRET_VALIDATE_EMAIL="your-jwt-secret-validate-email"
JWT_SECRET_RESET_PASS="your-jwt-secret-reset-password"

REDIS_HOST=127.0.0.1
REDIS_PORT=6379

MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=587
MAIL_ENCRYPTION=tls
MAIL_USERNAME=your-mailtrap-username
MAIL_PASSWORD=your-mailtrap-password
MAIL_FROM_ADDRESS="noreply@sirasa.com"
MAIL_FROM_NAME="Sirasa Notification"

APP_URL="http://localhost:3000"

FIREBASE_PROJECT_ID="your-firebase-project-id"
FIREBASE_PRIVATE_KEY="your-firebase-private-key"
FIREBASE_CLIENT_EMAIL="your-firebase-client-email"
```

---

## 🧪 Testing & Dokumentasi

- Gunakan Postman untuk mencoba endpoint yang tersedia

```bash
https://documenter.getpostman.com/view/29947879/2sB2xEBoSG
```
