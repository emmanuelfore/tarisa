# TARISA - Civic Reporting Platform

## Overview

TARISA ("Look" in Shona) is an AI-powered civic reporting platform for Zimbabwe that enables citizens to report municipal issues like potholes, burst pipes, broken streetlights, and emergencies. Citizens can submit reports with photos and GPS locations, track resolution progress, and earn CivicCredits as rewards. The platform includes a mobile-first citizen app and an administrative dashboard for municipal authorities to manage, assign, and resolve reported issues.

**Tagline:** "See It. Snap It. Solve It. Get Rewarded."

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework:** React with TypeScript using Vite as the build tool
- **Routing:** Wouter for lightweight client-side routing
- **State Management:** TanStack React Query for server state and data fetching
- **UI Components:** shadcn/ui component library with Radix UI primitives
- **Styling:** Tailwind CSS with CSS variables for theming
- **Mobile Experience:** Mobile-first design with a phone frame wrapper for desktop preview
- **Maps:** Leaflet for interactive map displays

The frontend has two distinct interfaces:
1. **Citizen App** - Mobile-optimized with bottom navigation, splash screen, and native-like UX
2. **Admin Dashboard** - Desktop sidebar layout for municipal staff to manage reports

### Backend Architecture
- **Runtime:** Node.js with Express
- **API Pattern:** RESTful endpoints under `/api` prefix
- **Session Management:** Express-session with connect-pg-simple for PostgreSQL session storage
- **File Uploads:** Multer for handling photo uploads stored locally in `/uploads`
- **Authentication:** Session-based auth with bcrypt for password hashing
- **Build System:** Custom build script using esbuild for server bundling and Vite for client

### Database Design
- **ORM:** Drizzle ORM with PostgreSQL dialect
- **Schema Location:** `shared/schema.ts` (shared between client and server)
- **Key Entities:**
  - `citizens` - Platform users who submit reports
  - `users` - Admin/staff accounts with role-based access
  - `departments` - Municipal departments (Water, Roads, ZESA, etc.)
  - `issues` - Reported problems with tracking IDs, status, location, photos
  - `comments` - Discussion threads on issues
  - `timeline` - Audit trail for issue status changes
  - `broadcasts` - Public announcements
  - `credits` - CivicCredits reward tracking

### Role-Based Access Control
The system implements a hierarchical escalation structure:
- **L1:** Ward Officers - Handle ward-level issues
- **L2:** District Managers - Manage department-level concerns
- **L3:** Town House Administrators - Cross-department oversight
- **L4:** Super Administrators - Full system access

### Project Structure
```
├── client/src/          # React frontend
│   ├── components/      # UI components (shadcn/ui based)
│   ├── pages/           # Route pages (citizen/, admin/, auth/)
│   ├── hooks/           # Custom React hooks
│   └── lib/             # Utilities and query client
├── server/              # Express backend
│   ├── routes.ts        # API endpoint definitions
│   ├── storage.ts       # Database operations layer
│   └── db.ts            # Database connection
├── shared/              # Shared code between client/server
│   └── schema.ts        # Drizzle database schema
└── migrations/          # Drizzle database migrations
```

## External Dependencies

### Database
- **PostgreSQL** with PostGIS extension for geospatial data
- Connection via `DATABASE_URL` environment variable
- Session storage using `connect-pg-simple`

### Third-Party Services
- **Maps:** Leaflet.js for map rendering (OpenStreetMap tiles)
- **Email:** Nodemailer configured for email verification and notifications

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit` - Database ORM and migrations
- `@tanstack/react-query` - Data fetching and caching
- `express-session` - Session management
- `bcrypt` - Password hashing
- `multer` - File upload handling
- `wouter` - Client-side routing
- `zod` - Schema validation (shared between client/server via drizzle-zod)

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string (required)
- Session secret configured in server routes