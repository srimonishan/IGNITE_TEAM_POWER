# SmartOps AI - Intelligent Multi-Domain Service Platform

AI-powered service request platform that understands, prioritizes, and acts on requests automatically.

## Setup

```bash
npm install
```

Create `.env.local` with your Google Gemini API key:
```
GOOGLE_API_KEY=your_key_here
```

Get a free key at: https://aistudio.google.com/

## Run

```bash
npm run dev
```

Open http://localhost:3000

## Architecture

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
- **Backend:** Next.js API Routes (monolith)
- **AI:** Google Gemini 2.0 Flash + keyword-based fallback
- **Store:** In-memory (production-ready for MongoDB/Firebase migration)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/requests | Create service request (AI auto-analyzes) |
| GET | /api/requests | List requests (with filters) |
| PUT | /api/requests/[id]/status | Update request status |
| PUT | /api/requests/[id]/assign | Assign request |
| POST | /api/ai/analyze | AI analysis endpoint |
| POST | /api/ai/chat | Chat-to-request (NLP) |
| GET | /api/dashboard | Dashboard statistics |
