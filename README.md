# ParkConnect

**Privacy-based vehicle owner contact system.** Stick a QR code on your car. Anyone who needs to reach you scans it, taps *Call Owner*, and gets connected by phone — without either of you ever seeing the other's real number.

> Built for the moment your car is blocking someone's driveway, has its lights on, or is part of an accident, and the only way anyone has to reach you today is a phone number scrawled on a sticky note.

---

## Table of Contents

- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Security](#security)
- [Roadmap](#roadmap)
- [Development Status](#development-status)
- [License](#license)

---

## How It Works

1. **Riya** registers, verifies her phone via OTP, adds her car, and generates a QR code.
2. She prints it as a sticker and sticks it on her windshield.
3. **Sam** finds her car blocking his gate. He scans the QR — no app, no login.
4. A public page opens: *"White Hyundai i20 — Car"* and a **Call Owner** button. No name, no number.
5. Sam taps it, enters his number, and Twilio calls him — when he answers, Twilio bridges him straight to Riya's real number.
6. Both phones only ever show a Twilio caller ID. Neither party ever sees the other's real number.
7. Riya gets a notification afterward: *"Your vehicle was scanned and called at 3:42 PM."*

---

## Features

### 🚗 Vehicle Owner
- Email + password registration with mobile OTP verification
- Add/edit/delete vehicles (car or bike), each with its own QR code
- Downloadable/printable QR stickers, deactivated instantly on delete
- Full call & scan history — who scanned, when, call duration, missed calls
- Push/SMS/email notifications on scan, call, or report
- Free (1 vehicle) vs Premium (unlimited) plans

### 📷 Scanner (public, no login required)
- Scan → limited vehicle info only (type/brand/model/color — never a name or number)
- One-tap **Call Owner**, connected via a masked Twilio number
- **Report an issue** — wrong parking, lights on, accident, emergency

### 🛠️ Admin
- User management (view/suspend accounts)
- Vehicle oversight and QR analytics
- Call logs, reports, and a full audit trail
- Subscription and revenue tracking

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | FastAPI (Python), async |
| Database | MongoDB (Beanie ODM) |
| Web frontend | Next.js (React, App Router, TypeScript, Tailwind) |
| Auth | JWT (access + refresh) + Twilio Verify (OTP) |
| Calling | Twilio Voice API (number-masking call bridge) |
| Notifications | Twilio SMS, SendGrid/SMTP email, Firebase Cloud Messaging |
| Payments | Razorpay |
| Image storage | Cloudinary (QR code images) |
| QR generation | `qrcode` (Python) |
| Deployment | Vercel (frontend) + Render/Railway (backend) + MongoDB Atlas |

---

## Architecture

```
[Scanner's phone camera]
        │ scans QR
        ▼
[Next.js public page /vehicle/[token]]
        │ GET /vehicle/{token}            (public, rate-limited)
        ▼
[FastAPI Backend] ───────────────► [MongoDB Atlas]
        │ POST /calls/initiate {token, scanner_phone}
        ▼
[Twilio Voice API] → calls scanner's phone
        │ scanner answers → Twilio requests TwiML
        ▼
[Dial bridge] → connects scanner ↔ owner via a masked Twilio number
        │ status callbacks
        ▼
[Notification service] → SMS / Email / Push → Owner
```

---

## Database Schema

MongoDB collections (Beanie documents):

| Collection | Key Fields |
|---|---|
| `users` | full_name, email, phone_number, hashed_password, is_verified, is_admin, is_premium |
| `vehicles` | owner, vehicle_type, vehicle_number, brand, model, color, emergency_contact, qr_code_id |
| `qr_codes` | token, vehicle, is_active, scan_count, expires_at |
| `calls` | vehicle, owner, twilio_call_sid, status, duration_seconds, scanner_masked_number |
| `reports` | vehicle, report_type, message, reporter_contact, status |
| `notifications` | user, type, title, message, is_read |
| `subscriptions` | user, plan, status, start_date, end_date |
| `payments` | user, subscription, amount, currency, provider, status |
| `audit_logs` | admin_user, action, target_type, target_id, meta |

---

## Project Structure

```
parkconnect/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, router mounting
│   │   ├── config.py        # Settings, reads .env
│   │   ├── database.py      # Motor client + Beanie init
│   │   ├── models/          # Beanie documents
│   │   ├── schemas/         # Pydantic request/response models
│   │   ├── routers/         # auth, vehicles, qr, calls, notifications, reports, admin, subscriptions
│   │   ├── services/        # twilio_service, notification_service, qr_service, razorpay_service
│   │   └── core/             # security (JWT/bcrypt), deps (auth guards), rate limiting
│   ├── tests/
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── (auth)/           # register, verify-otp, login, forgot-password
│   │   ├── (dashboard)/      # owner dashboard, vehicles, subscription
│   │   ├── admin/            # admin panel
│   │   └── vehicle/[token]/  # public scan page
│   ├── components/
│   ├── lib/                  # API client, auth helpers
│   └── .env.local.example
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- A MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- Twilio account (Voice + Verify), Cloudinary account, Razorpay account (test mode is fine)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # fill in your own values
uvicorn app.main:app --reload
```

Backend runs at `http://localhost:8000` — Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in your own values
npm run dev
```

Frontend runs at `http://localhost:3000`.

---

## Environment Variables

**Backend (`backend/.env`)**

```
MONGODB_URI=
JWT_SECRET_KEY=
JWT_REFRESH_SECRET_KEY=
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
TWILIO_PHONE_NUMBER=
CLOUDINARY_URL=
SENDGRID_API_KEY=
FIREBASE_CREDENTIALS_JSON=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

**Frontend (`frontend/.env.local`)**

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

> Never commit real `.env` / `.env.local` files — both are already in `.gitignore`.

---

## API Overview

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/verify-otp`, `/auth/forgot-password`, `/auth/refresh` |
| Vehicles | `POST /vehicles`, `GET /vehicles`, `PUT /vehicles/{id}`, `DELETE /vehicles/{id}` |
| QR | `POST /vehicles/{id}/qr`, `GET /vehicle/{token}` *(public)* |
| Calling | `POST /calls/initiate` *(public)*, `POST /calls/twiml/{id}`, `POST /calls/status/{id}` *(Twilio webhooks)*, `GET /calls` |
| Notifications | `GET /notifications`, `PATCH /notifications/{id}/read` |
| Reports | `POST /reports` *(public)*, `GET /reports`, `PATCH /reports/{id}` *(admin)* |
| Admin | `GET /admin/users`, `/admin/vehicles`, `/admin/analytics`, `/admin/audit-logs`, `PATCH /admin/users/{id}/suspend` |
| Subscriptions | `POST /subscriptions/upgrade`, `GET /subscriptions/me`, `POST /payments/webhook` |

Full interactive docs are auto-generated by FastAPI at `/docs` once the backend is running.

---

## Security

- Passwords hashed with bcrypt — never stored in plaintext
- Short-lived JWT access tokens + longer-lived refresh tokens
- OTP-gated registration/login via Twilio Verify
- Rate limiting on all public/auth/call-initiation endpoints
- QR tokens are random, unguessable, and revocable
- **Real phone numbers never leave the backend** — the public scan page and every scanner-facing response only ever return vehicle type/brand/model/color, never owner identity
- Twilio and Razorpay webhook signatures verified on every incoming callback
- Full audit log of admin actions

---

## Roadmap

**Post-MVP:**
- AI-based wrong-parking detection
- WhatsApp-based calling/messaging
- Asynchronous voice messages
- SOS / emergency mode with faster escalation
- Society & apartment complex management integration
- In-app parking payments
- Vehicle service & insurance renewal reminders
- Automatic accident alert detection

---

## Development Status

| Phase | Deliverable | Status |
|---|---|---|
| 0 | Project skeleton | 🚧 |
| 1 | Database models | 🚧 |
| 2 | Auth (OTP + JWT) | 🚧 |
| 3 | Vehicle CRUD + plan limits | 🚧 |
| 4 | QR generation + public scan page | 🚧 |
| 5 | Twilio call-masking | 🚧 |
| 6 | Notifications | 🚧 |
| 7 | Reports | 🚧 |
| 8 | Admin panel | 🚧 |
| 9 | Subscriptions & payments | 🚧 |
| 10–13 | Frontend (auth, dashboard, public page, admin UI) | 🚧 |
| 14 | Security hardening | 🚧 |
| 15 | Testing | 🚧 |
| 16 | Deployment | 🚧 |

---

## License

*Choose a license before your first public push — e.g. [MIT](https://choosealicense.com/licenses/mit/) if you want it fully open, or leave this section as "All rights reserved" if it's proprietary.*
