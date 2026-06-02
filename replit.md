# 3D Industrial Machines Portfolio

A full-stack web application for showcasing 3D industrial machine parts and components with an interactive 3D viewer.

## Overview

Built for Ahmed Al-jassem (أحمد الجاسم), a Mechatronic Engineer, to showcase industrial 3D models and projects. The platform features a public-facing portfolio and an admin dashboard.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Font Awesome, React Three Fiber / Three.js
- **Backend**: Node.js (ESM), Express.js
- **Database**: PostgreSQL (Replit managed)
- **Languages**: Arabic (RTL) primary UI

## Project Structure

```
/client/          - React frontend (Vite)
/server/          - Express backend (ESM modules)
/uploads/         - User uploaded 3D models and sketches
  /models/        - GLB, GLTF, STL, OBJ, FBX files
  /sketches/      - Technical drawing images
/Description_Mirror_Method/  - Project specifications (DMM)
```

## Running the App

A single `start.sh` script runs both services:
- Backend: `http://localhost:3001` (Express API)
- Frontend: `http://localhost:5000` (Vite dev server, proxies /api to 3001)

```bash
bash start.sh
```

## Admin Panel

Access at `/admin/login`. On first login with any username/password, an admin account is automatically created.

## Key Features

### Public Site
- Hero section with 3D model preview area
- Project cards with 3D viewer CTAs
- About/Bio section with engineer info
- Skills showcase
- Contact form
- Footer with newsletter signup

### 3D Viewer Page (`/project/:id`)
- Interactive Three.js Canvas with OrbitControls
- Display modes: Shaded, Wireframe, X-Ray
- Like/Dislike counters
- Multiple tabs: 3D View, Exploded View, Technical Drawings, Description
- Project metadata sidebar

### Admin Dashboard
- Stats overview (modules, views, likes, messages)
- Module management (upload, edit, delete, preview)
- Contact message management
- Settings: public profile, admin account, security logs

## API Endpoints

- `GET /api/modules` - List published modules
- `GET /api/modules/:id` - Get module (increments views)
- `POST /api/modules` - Upload module (admin only)
- `POST /api/modules/:id/like` - Like a module
- `POST /api/modules/:id/dislike` - Dislike a module
- `GET /api/profile` - Get public profile
- `PUT /api/profile` - Update profile (admin)
- `POST /api/contact` - Submit contact form (rate limited)
- `POST /api/auth/login` - Admin login
- `GET /api/stats` - Dashboard stats (admin)

## Database

Uses Replit's managed PostgreSQL. Tables: `modules`, `admins`, `contacts`, `profiles`.

## User Preferences

- Arabic-only RTL UI using Tajawal/Cairo fonts
- Dark theme (#0a0a0f background)
- Spec-compliant with Description Mirror Method files
