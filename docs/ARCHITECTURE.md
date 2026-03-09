# DrAutoTest Platform - Architecture Document

## Overview
DrAutoTest is a subscription-based learning platform for driving license exam preparation. Users can practice 1000+ questions organized by categories, take simulated exams with timers, and track their progress.

## Tech Stack

### Backend
- **.NET 8 Web API** — Clean Architecture (Domain → Application → Infrastructure → API)
- **PostgreSQL** — Primary database
- **Redis** — Caching, session management, rate limiting
- **Entity Framework Core** — ORM
- **MediatR** — CQRS pattern
- **FluentValidation** — Request validation
- **Serilog** — Structured logging
- **Hangfire** — Background jobs (subscription expiry, notifications)

### Frontend
- **Angular 17+** — SPA with standalone components
- **Angular Material** — UI component library
- **NgRx** — State management
- **Tailwind CSS** — Utility-first styling

### Infrastructure
- **Docker + Docker Swarm** — Container orchestration
- **Nginx** — Reverse proxy, SSL termination
- **MinIO/S3** — Image storage (road signs, diagrams)

---

## Architecture Layers (Backend)

```
┌─────────────────────────────────────┐
│          API Layer (Controllers)     │
│  - REST endpoints                   │
│  - Auth middleware                   │
│  - Rate limiting                    │
│  - Swagger/OpenAPI                  │
├─────────────────────────────────────┤
│       Application Layer             │
│  - CQRS Commands/Queries            │
│  - DTOs                             │
│  - Validators                       │
│  - Service interfaces               │
├─────────────────────────────────────┤
│         Domain Layer                │
│  - Entities                         │
│  - Value Objects                    │
│  - Domain Events                    │
│  - Enums                           │
├─────────────────────────────────────┤
│      Infrastructure Layer           │
│  - EF Core DbContext                │
│  - Repositories                     │
│  - External services (SMS, Email)   │
│  - Payment gateways                 │
│  - File storage                     │
└─────────────────────────────────────┘
```

---

## Domain Model

### Core Entities
- **User** — id, phone, email, name, role, subscription status
- **Category** — id, name, description, icon, order, parent_category_id
- **Question** — id, category_id, text, image_url, explanation, difficulty
- **Answer** — id, question_id, text, image_url, is_correct, order
- **Exam** — id, user_id, type (category/random/full), status, score, started_at, finished_at, time_limit
- **ExamQuestion** — id, exam_id, question_id, selected_answer_id, is_correct, answered_at
- **UserProgress** — id, user_id, question_id, times_seen, times_correct, last_seen
- **Subscription** — id, user_id, plan_id, status, starts_at, expires_at
- **SubscriptionPlan** — id, name, price, duration_days, features
- **Payment** — id, user_id, subscription_id, amount, provider, status, external_id

### Enums
- ExamType: ByCategory, Random, Mock, Custom
- ExamStatus: InProgress, Completed, Expired
- SubscriptionStatus: Active, Expired, Cancelled, Trial
- PaymentStatus: Pending, Completed, Failed, Refunded
- UserRole: User, Admin, SuperAdmin
- Difficulty: Easy, Medium, Hard

---

## Authentication Strategy

### Multi-provider Authentication
1. **SMS OTP** (Primary) — Send 6-digit code via SMS, verify and issue JWT
2. **Email + Password** — Traditional registration with email verification
3. **Google OAuth 2.0** — Social login
4. **Telegram Login** — Popular in CIS region

### Token Strategy
- **JWT Access Token** (15 min expiry)
- **Refresh Token** (30 day expiry, stored in DB, rotated on use)

---

## API Endpoints

### Auth
- `POST /api/auth/send-otp` — Send SMS/Email OTP
- `POST /api/auth/verify-otp` — Verify OTP and get tokens
- `POST /api/auth/register` — Email registration
- `POST /api/auth/login` — Email login
- `POST /api/auth/refresh` — Refresh access token
- `POST /api/auth/google` — Google OAuth callback
- `GET  /api/auth/me` — Current user profile

### Questions & Categories
- `GET  /api/categories` — List all categories
- `GET  /api/categories/{id}/questions` — Questions by category
- `GET  /api/questions/{id}` — Single question with answers
- `POST /api/questions` — Create question (Admin)
- `PUT  /api/questions/{id}` — Update question (Admin)
- `DELETE /api/questions/{id}` — Delete question (Admin)
- `POST /api/questions/bulk-import` — Bulk import (Admin)

### Exams
- `POST /api/exams/start` — Start new exam (type, category, count)
- `GET  /api/exams/{id}` — Get exam details
- `POST /api/exams/{id}/answer` — Submit answer
- `POST /api/exams/{id}/finish` — Finish exam
- `GET  /api/exams/history` — User's exam history

### Progress & Analytics
- `GET  /api/progress/summary` — Overall progress
- `GET  /api/progress/categories` — Progress per category
- `GET  /api/progress/weak-areas` — Questions user gets wrong most
- `GET  /api/progress/streaks` — Learning streaks

### Subscriptions & Payments
- `GET  /api/plans` — Available subscription plans
- `POST /api/subscriptions/subscribe` — Create subscription
- `GET  /api/subscriptions/current` — Current subscription
- `POST /api/payments/payme/callback` — Payme webhook
- `POST /api/payments/click/callback` — Click webhook
- `POST /api/payments/stripe/webhook` — Stripe webhook

### Admin
- `GET  /api/admin/dashboard` — Stats overview
- `GET  /api/admin/users` — User management
- `POST /api/admin/questions/import` — Import questions from CSV/JSON
- `GET  /api/admin/analytics` — Platform analytics

---

## Frontend Module Structure

```
src/
├── app/
│   ├── core/           — Auth guards, interceptors, services
│   ├── shared/         — Shared components, pipes, directives
│   ├── features/
│   │   ├── auth/       — Login, register, OTP verification
│   │   ├── home/       — Landing page, dashboard
│   │   ├── exam/       — Exam taking, results
│   │   ├── practice/   — Category browsing, question practice
│   │   ├── progress/   — Analytics dashboard, charts
│   │   ├── profile/    — User settings, subscription
│   │   ├── payment/    — Plan selection, payment flow
│   │   └── admin/      — Question CRUD, user management, analytics
│   ├── store/          — NgRx state management
│   └── app.routes.ts
├── assets/
├── environments/
└── styles/
```

---

## Exam Modes

1. **Category Practice** — All questions from a chosen category, no timer
2. **Random Quiz** — N random questions, optional timer
3. **Mock Exam** — Full exam simulation (40 questions, 30 min timer, passing score 90%)
4. **Weak Areas** — Questions user has gotten wrong before
5. **Custom** — User picks categories + count + timer

---

## Subscription Plans

| Plan     | Duration | Features                                    |
|----------|----------|---------------------------------------------|
| Free     | ∞        | 10 questions/day, basic categories           |
| Basic    | 30 days  | Unlimited questions, all categories          |
| Premium  | 30 days  | + Mock exams, analytics, weak areas, no ads |
| Yearly   | 365 days | Premium features, discounted                 |

---

## Docker Architecture

```
┌──────────────────────────────────────────────┐
│                  Nginx                        │
│          (Reverse Proxy + SSL)                │
├──────────┬───────────┬───────────┬───────────┤
│ Angular  │  .NET API │  Redis    │ PostgreSQL│
│  (SPA)   │  (x2)     │           │           │
├──────────┴───────────┴───────────┴───────────┤
│           MinIO (Object Storage)              │
│           Hangfire Dashboard                  │
└──────────────────────────────────────────────┘
```

---

## Key Design Decisions

1. **CQRS with MediatR** — Separates read/write for scalability
2. **JWT + Refresh Tokens** — Stateless auth with secure rotation
3. **Image storage via MinIO** — S3-compatible, self-hosted, works with Docker Swarm
4. **Redis caching** — Cache questions/categories, reduces DB load
5. **Hangfire** — Background job processing for subscription expiry checks
6. **Angular standalone components** — Modern Angular, tree-shakeable
7. **NgRx** — Predictable state for exam progress, offline resilience
