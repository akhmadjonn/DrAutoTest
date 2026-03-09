# DrAutoTest - Driving License Exam Preparation Platform

A subscription-based learning platform for driving license exam preparation with 1000+ questions, exam simulations, progress tracking, and admin management.

## Tech Stack

| Layer          | Technology                              |
|----------------|----------------------------------------|
| Backend        | .NET 8, EF Core, MediatR, PostgreSQL  |
| Frontend       | Angular 17, Angular Material, NgRx     |
| Cache          | Redis                                  |
| File Storage   | MinIO (S3-compatible)                  |
| Background Jobs| Hangfire                               |
| Deployment     | Docker Swarm                           |
| Reverse Proxy  | Nginx                                  |

## Features

- **Multi-auth**: SMS OTP, Email/Password, Google OAuth
- **Exam Modes**: Category practice, Random quiz, Mock exam (timed), Weak areas, Custom
- **Progress Tracking**: Per-category analytics, learning streaks, weak area identification
- **Subscriptions**: Free/Basic/Premium/Yearly plans with Payme, Click, and Stripe payments
- **Admin Panel**: Question CRUD, bulk import, user management, platform analytics
- **Image Support**: Road signs, traffic diagrams via MinIO storage

## Project Structure

```
DrAutoTest/
├── backend/                    # .NET 8 Clean Architecture
│   └── src/
│       ├── DrAutoTest.Domain/          # Entities, Enums, Interfaces
│       ├── DrAutoTest.Application/     # DTOs, Services, Validators
│       ├── DrAutoTest.Infrastructure/  # EF Core, Redis, MinIO, Payments
│       └── DrAutoTest.API/             # Controllers, Middleware, Config
├── frontend/                   # Angular 17 SPA
│   └── src/app/
│       ├── core/               # Services, Guards, Interceptors
│       ├── shared/             # Reusable Components, Pipes
│       ├── features/           # Auth, Exam, Practice, Progress, Admin
│       └── store/              # NgRx State Management
├── nginx/                      # Reverse proxy config
├── scripts/                    # DB init scripts
├── docs/                       # Architecture docs
├── docker-compose.yml          # Development compose
├── docker-compose.dev.yml      # Dev overrides
└── docker-stack.yml            # Docker Swarm deployment
```

## Quick Start

### Prerequisites
- Docker & Docker Compose
- .NET 8 SDK (for local backend development)
- Node.js 20+ (for local frontend development)

### Development Setup

1. **Clone and configure:**
   ```bash
   git clone <repo-url> DrAutoTest
   cd DrAutoTest
   cp .env.example .env
   # Edit .env with your values
   ```

2. **Start infrastructure (DB, Redis, MinIO):**
   ```bash
   docker compose up postgres redis minio -d
   ```

3. **Run backend:**
   ```bash
   cd backend
   dotnet restore
   dotnet ef database update --project src/DrAutoTest.Infrastructure --startup-project src/DrAutoTest.API
   dotnet run --project src/DrAutoTest.API
   ```
   API available at: `http://localhost:5000`
   Swagger UI at: `http://localhost:5000/swagger`

4. **Run frontend:**
   ```bash
   cd frontend
   npm install
   npx ng serve
   ```
   App available at: `http://localhost:4200`

### Docker Compose (Full Stack)

```bash
docker compose up --build
```

### Docker Swarm Deployment

```bash
# Create secrets
echo "StrongPassword123!" | docker secret create db_password -
echo "RedisPassword123!" | docker secret create redis_password -
echo "YourJWTSecretKey" | docker secret create jwt_secret -

# Build and push images
docker build -t drautotest/api:latest ./backend -f ./backend/src/DrAutoTest.API/Dockerfile
docker build -t drautotest/frontend:latest ./frontend

# Deploy stack
docker stack deploy -c docker-stack.yml drautotest
```

## API Documentation

Swagger UI is available at `/swagger` when running in Development mode.

Key endpoints:
- `POST /api/auth/send-otp` — Send SMS/Email OTP
- `POST /api/auth/verify-otp` — Verify OTP
- `POST /api/exams/start` — Start an exam
- `GET /api/progress/summary` — Get learning progress
- `GET /api/categories` — List question categories

See [Architecture Documentation](docs/ARCHITECTURE.md) for full API reference.

## Environment Variables

See [.env.example](.env.example) for all required configuration variables.

## License

Proprietary - All rights reserved.
