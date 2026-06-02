# Description Mirror Method (DMM) - Navigation Guide

This directory contains the complete specification and design requirements for the **3D Industrial Machines Portfolio** platform using the Description Mirror Method (DMM).

Each markdown file represents a page, feature, or guiding document. The `InspirationAssets` folder contains design reference images.

---

## 📋 Quick Navigation

### Core Project Documents

- **[Constraints.md](./Constraints.md)** – Project rules, MERN stack requirements, security guidelines, and organizational structure
- **[whyThreejs.md](./whyThreejs.md)** – Technical rationale for using Three.js + React Three Fiber, supported 3D formats (GLB, GLTF, STL, OBJ, FBX), and future CAD-oriented goals

---

### Public-Facing Pages (Visitor Experience)

Located in: `PublicSide/`

- **[HomePage.md](./PublicSide/HomePage.md)** – Main landing page with hero section, bio, project grid, skills, contact, and footer
  - Must replicate `InspirationAssets/homePage.png` design
  - Links to: [3DProjectViewerSubpage.md](./PublicSide/3DProjectViewerSubpage.md)
  - References: [Constraints.md](./Constraints.md)

- **[3DProjectViewerSubpage.md](./PublicSide/3DProjectViewerSubpage.md)** – Interactive 3D model viewer using Three.js
  - Must replicate `InspirationAssets/projectPage.png` design
  - Supports GLB primary format + GLTF, STL, OBJ, FBX
  - Features: orbit controls, zoom, fullscreen, orthographic views ("مساقط")
  - References: [whyThreejs.md](./whyThreejs.md)

---

### Admin Dashboard Pages (Administrator Experience)

Located in: `AdminSide/`

- **[AdminHomePage.md](./AdminSide/AdminHomePage.md)** – Main admin dashboard after login
  - Dashboard widgets: module count, visitor count, engagement metrics, recent uploads, contact messages, system status
  - Navigation hub for admin functions
  - Links to: 
    - [New3DmodulesSubpage.md](./AdminSide/New3DmodulesSubpage.md)
    - [SettingsSubpage.md](./AdminSide/SettingsSubpage.md)

- **[New3DmodulesSubpage.md](./AdminSide/New3DmodulesSubpage.md)** – Module upload and management interface
  - File formats: GLB (primary), GLTF, STL, OBJ, FBX
  - Upload workflow with validation, metadata entry, sketch uploads, and approval queue
  - Required fields: title, description, category, designer name, 3D file, optional 2D sketches
  - References: [Constraints.md](./Constraints.md) (Rule #5 – Security)

- **[SettingsSubpage.md](./AdminSide/SettingsSubpage.md)** – Admin account and system settings consolidation
  - **Admin Account Management:** password, 2FA, active sessions, profile info
  - **Portfolio Engineer Public Profile:** contact details (phone, WhatsApp, LinkedIn, email, bio, photo)
  - **Contact Form Management:** view submissions, reply, export, auto-response settings
  - **Security & Compliance:** login history, audit trail, session management

---

## 🎨 Design Reference Assets

Located in: `InspirationAssets/`

- `homePage.png` – Design template for the public home page
- `projectPage.png` – Design template for the 3D viewer page
- `footerCommponent.png` – Design template for footer component

Use these images as the **source of truth** for layout, spacing, typography, colors, and component placement during implementation.

---

## 🔗 Cross-Reference Map

```
Constraints.md (ROOT)
├── Rules for tech stack (MERN, Three.js, Tailwind, security, DMM)
└── Main project context

whyThreejs.md (ROOT)
└── Referenced by:
    ├── Constraints.md (in Main Context)
    ├── PublicSide/3DProjectViewerSubpage.md
    └── AdminSide/New3DmodulesSubpage.md

PublicSide/
├── HomePage.md
│   ├── Links to: 3DProjectViewerSubpage.md
│   └── References: Constraints.md
└── 3DProjectViewerSubpage.md
    └── References: whyThreejs.md

AdminSide/
├── AdminHomePage.md
│   ├── Links to: New3DmodulesSubpage.md
│   └── Links to: SettingsSubpage.md
├── New3DmodulesSubpage.md
│   └── References: Constraints.md
└── SettingsSubpage.md
    └── (Consolidated contact + admin settings)
```

---

## 📱 Implementation Workflow

### For Frontend Developers (Public Side):

1. Read [Constraints.md](./Constraints.md) for project rules and stack requirements
2. Review [HomePage.md](./PublicSide/HomePage.md) with `InspirationAssets/homePage.png`
3. Review [3DProjectViewerSubpage.md](./PublicSide/3DProjectViewerSubpage.md) with `InspirationAssets/projectPage.png`
4. Consult [whyThreejs.md](./whyThreejs.md) for 3D viewer architecture and format support

### For Backend/Admin Developers:

1. Read [Constraints.md](./Constraints.md) for project rules and security guidelines
2. Review [AdminHomePage.md](./AdminSide/AdminHomePage.md) for dashboard structure
3. Review [New3DmodulesSubpage.md](./AdminSide/New3DmodulesSubpage.md) for upload workflows and validation
4. Review [SettingsSubpage.md](./AdminSide/SettingsSubpage.md) for admin, contact, and security features

---

## 📝 Development Guidelines

- **Design Fidelity:** Exact replication of inspiration assets is mandatory unless technical/accessibility constraints require deviation
- **Language:** All UI text and content is Arabic-only (primary language)
- **Typography:** Use modern Arabic fonts (Tajawal or Cairo from Google Fonts)
- **RTL Layout:** Ensure proper right-to-left rendering for Arabic content
- **Accessibility:** Add semantic HTML, ARIA labels, alt text, and meta descriptions
- **Security:** Follow [Constraints.md](./Constraints.md) Rule #5 – validate, sanitize, secure authentication, rate-limit endpoints
- **Directory Structure:** Frontend under `client/`, Backend under `server/`, Shared components under `components/`

---

## 🚀 Technology Stack

- **Frontend:** React, Tailwind CSS, Font Awesome
- **3D Rendering:** Three.js, React Three Fiber
- **Backend:** MERN (MongoDB, Express, React, Node.js)
- **3D Formats:** GLB (primary), GLTF, STL, OBJ, FBX
- **Security:** HTTPS, secure cookies, CORS, input validation, bcrypt hashing, rate limiting

---

## 📌 Key Reminders

- Treat the DMM files as living specifications — they are the source of truth
- Inspiration assets define exact visual requirements — no guessing on design decisions
- All security guidelines in [Constraints.md](./Constraints.md) Rule #5 are mandatory
- Document any deviations from the design with clear rationale and screenshots for approval
- Maintain all code in the specified directory structure (`client/`, `server/`, `components/`)
