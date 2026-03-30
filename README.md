<div align="center">

# ResolveHQ

### AI-Powered Smart Apartment Service Management

AI-powered maintenance tracking with automated priority detection, GenAI resolution plans, and a real-time Kanban dashboard for residential properties.

Built for **IGNITE Hackathon 2026** by **Team POWER**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.0_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%2B_Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Features

| Category | Feature | Details |
| --- | --- | --- |
| **AI** | Priority Prediction Engine | NLP keyword extraction + LLM analysis to auto-classify urgency |
| **AI** | GenAI Resolution Generator | Step-by-step maintenance plans powered by Gemini 2.0 |
| **AI** | Agentic AI Workflow | Autonomous pipeline: analyze → classify → prioritize → alert → resolve |
| **AI** | Chat Assistant | Natural language to structured service request |
| **AI** | Admin Chatbot | Operational insights and analytics for property managers |
| **Dashboard** | Real-time Kanban | `NEW` → `ASSIGNED` → `IN_PROGRESS` → `COMPLETED` |
| **Access** | Role-Based Views | Admin, Tenant, and Staff dashboards |
| **Ops** | Staff Assignment & Tracking | Assign maintenance personnel and monitor progress |
| **Ops** | Critical Alert System | Instant notifications for high-severity issues |
| **Ops** | PDF Report Export | Download request summaries and analytics |
| **UX** | Dark / Light Theme | User-selectable appearance |
| **Auth** | Firebase Authentication | Google OAuth + Email/Password sign-in |
| **Multi-building** | Building & Block Selector | Multi-building support for large properties |
| **Safety** | Emergency Hotline Contacts | Quick access to essential emergency numbers |

---

## Tech Stack

| Technology | Purpose |
| --- | --- |
| **Next.js 14** | Full-stack framework (App Router + API Routes) |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first responsive styling |
| **Google Gemini 2.0 Flash** | AI / LLM for analysis and generation |
| **Firebase Firestore** | NoSQL real-time database |
| **Firebase Auth** | Authentication (Google OAuth + Email/Password) |

---

## Architecture

Monolith with clean separation of concerns:

```
Client (React)
  │
  ▼
REST API Routes ──────┬──▶ AI Engine (Gemini 2.0 Flash)
                      │
                      ├──▶ Firestore (data)
                      │
                      └──▶ Firebase Auth (identity)
```

---

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/requests` | Create a service request |
| `GET` | `/api/requests` | List / filter requests |
| `PUT` | `/api/requests/[id]/status` | Update request status |
| `PUT` | `/api/requests/[id]/assign` | Assign request to staff |
| `GET` | `/api/dashboard` | Dashboard statistics |
| `POST` | `/api/ai/analyze` | AI priority & category analysis |
| `POST` | `/api/ai/chat` | Chat-to-request conversion |
| `POST` | `/api/ai/admin-chat` | Admin AI chatbot |
| `GET/POST/PUT/DELETE` | `/api/users` | User management |

---

## Getting Started

### Prerequisites

- **Node.js 18+**
- A **Firebase** project with Firestore and Authentication enabled
- **Google Gemini API** key(s)

### Installation

```bash
git clone https://github.com/srimonishan/IGNITE_TEAM_POWER.git
cd IGNITE_TEAM_POWER
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
GOOGLE_API_KEY_1=your_gemini_key_1
GOOGLE_API_KEY_2=your_gemini_key_2
GOOGLE_API_KEY_3=your_gemini_key_3

NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## User Roles

| Role | Access |
| --- | --- |
| **Admin** | Kanban dashboard, user management, staff assignment, AI chatbot, analytics, PDF export |
| **Tenant** | Submit requests (form / AI chat), track status, building selector, hotline contacts, PDF export |
| **Staff** | Personal Kanban board, status updates, AI-generated resolution steps |

---

## AI Workflow

```
┌─────────────────────────────────────────────────────────┐
│  1. Tenant submits request (form or natural language)   │
│                        ▼                                │
│  2. AI extracts features via NLP                        │
│                        ▼                                │
│  3. AI classifies into 13 apartment categories          │
│                        ▼                                │
│  4. AI predicts priority — CRITICAL / HIGH / MEDIUM / LOW│
│                        ▼                                │
│  5. GenAI generates step-by-step resolution plan        │
│                        ▼                                │
│  6. If CRITICAL → instant alert triggered               │
│                        ▼                                │
│  7. Admin assigns to maintenance staff                  │
│                        ▼                                │
│  8. Staff follows AI resolution steps                   │
│                        ▼                                │
│  9. Request marked complete                             │
└─────────────────────────────────────────────────────────┘
```

---

## Team

**Team POWER** — IGNITE Hackathon 2026

---

## License

This project is licensed under the [MIT License](LICENSE).
