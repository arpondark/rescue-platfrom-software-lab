# Nexora — Disaster Management & Volunteer Recruitment Platform

Spring Boot 4.1 backend + Next.js 14 frontend with full Bangladesh location data.

```
.
├── Nexora/                Spring Boot backend (Java 25, Maven)
├── frontend/              Next.js 14 (App Router, TypeScript, Tailwind)
├── srs.md                 Software Requirements Specification
├── architecture.md        System Architecture
├── use-case.md            Use Case Document
├── .env.example           Environment variable template
├── .env                   Local env (committed for convenience; replace with real secrets before deploy)
└── README.md              This file
```

## Quick Start

### 1. Database
Install PostgreSQL and create a database:
```bash
psql -U postgres -c "CREATE DATABASE nexora;"
```

### 2. Backend
```bash
cd Nexora
./mvnw spring-boot:run
```
Or build a JAR:
```bash
./mvnw -DskipTests package
java -jar target/Nexora-0.0.1-SNAPSHOT.jar
```

Edit `.env` (in repo root) with your DB password, JWT secret, and SMTP credentials. Values are loaded via Spring's `spring.config.import` — no Java dotenv library is required (IntelliJ's EnvFile plugin also reads the same file).

**Default Super Admin is seeded on first boot:**
- Email: `admin@nexora.bd`
- Password: `Admin@12345`

### 3. Frontend
```bash
cd frontend
npm install
npm run dev     # http://localhost:3000
```

`.env.local` already points to `http://localhost:8080`.

## Implemented Features

- **Role-based access** (Super Admin / NGO / Volunteer) with JWT + refresh tokens
- **Super Admin**: approve/reject NGOs, manage volunteers, view all events, manage locations, dashboard stats
- **NGO**: register → `PENDING` → login blocked until approval; add single + bulk volunteers (CSV up to 5,000 rows); filter volunteers by area; create disaster events; invite volunteers; track INVITED/ACCEPTED/DECLINED/DEPLOYED counts
- **Volunteer**: register, receive email when added by NGO, accept/decline event invitations, profile mgmt
- **Bangladesh location**: 8 Divisions, 64 Districts, all major Thanas pre-seeded on first boot
- **Async email** for: registration confirmation, NGO approval/rejection, volunteer added, event invitation, volunteer response
- **OpenAPI / Swagger UI**: `http://localhost:8080/swagger-ui.html`

## How bulk upload works

1. NGO clicks Download Template → CSV with required columns
2. NGO fills the CSV (max 5,000 rows)
3. Upload at `/api/v1/ngo/volunteers/bulk` (multipart)
4. Backend validates, inserts in batch, queues `@Async` emails to each volunteer
5. Response: total/success/failed + per-row errors

## Next Steps (per Feature SEL list)

- Maps (Leaflet) for events
- Rescue requests, shelters, inventory, distribution
- Offline mode (PWA + Service Worker + IndexedDB)
- PDF reports via JasperReports / OpenPDF
- Bengali UI translations
