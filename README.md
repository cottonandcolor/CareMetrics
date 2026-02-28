# CareMetrics

AI-powered health monitoring platform that turns complex lab reports into simple, actionable health insights. Designed for elderly users and their caregivers.

## Features

- **AI Blood Work Scanner** — Upload PDF/image lab reports for instant OCR extraction and plain-language explanations
- **Longitudinal Health Monitoring** — Track lab values over time with trend charts and reference ranges
- **Medication & Vitamin Tracking** — Daily dose logging, adherence tracking, and 7-day history
- **Symptom Tracking** — Daily check-ins with pain scale, mood, and preset symptoms
- **AI Insights Engine** — Detects trends, flags concerning changes, suggests doctor questions
- **Caregiver Mode** — Share health data with family members via linked accounts
- **PDF Export** — Generate comprehensive health summaries for doctor visits

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and create an account. Check "Load sample health data" during signup to see the full demo experience.

## Tech Stack

- **Frontend**: React 19, Vite, TailwindCSS v4
- **State**: Zustand (with localStorage persistence)
- **Charts**: Recharts
- **PDF**: jsPDF + jspdf-autotable
- **Icons**: Lucide React
- **Routing**: React Router v7

## Accessibility

Designed with elderly users in mind:
- 18px base font size
- High contrast color palette
- Minimal navigation depth
- Large click targets
- Clear visual hierarchy
