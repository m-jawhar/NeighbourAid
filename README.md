# NeighborAid 2.0

NeighborAid 2.0 is a production-ready prototype for Google Solutions Challenge 2026 that demonstrates how communities can coordinate local disaster response before formal help arrives. The platform is designed around Kerala flood and emergency scenarios, combining behavioral crisis detection, proximity-aware volunteer matching, WhatsApp dispatch, and a privacy-preserving Break-Glass model that only reveals minimum necessary responder data during officially declared emergencies.

The app is built as a React + Vite single-page experience with Firebase-ready data services, Gemini-assisted decision support, and a complete zero-config demo path. Judges can run the project without any API keys and still explore registration, live crisis dashboards, AI-style matching, mission dispatch, mission tracking, and audit logging through realistic local demo data.

## Screenshots

Add final product screenshots here:

- Home page hero and feature overview
- Volunteer registration flow
- Crisis command dashboard with map
- Gemini-powered matching and dispatch
- Mission tracker with live status timeline

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer
- A Firebase project for Firestore and Realtime Database
- A Gemini API key from Google AI Studio
- Optional Google Maps API key for an interactive map experience

## Setup

1. Clone or download this repository.
2. Open the project folder in your terminal.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Copy `.env.example` to `.env`.
5. Fill in your Firebase, Gemini, and optional Google Maps credentials.
6. Start the development server:

   ```bash
   npm run dev
   ```

7. Open the local URL printed by Vite in your browser.

## API Key Setup

### Firebase

1. Create a project in the [Firebase Console](https://console.firebase.google.com/).
2. Add a web app to the project.
3. Enable Firestore Database.
4. Enable Realtime Database.
5. Copy the Firebase config values into your `.env`.

### Gemini API

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create an API key.
3. Paste it into `VITE_GEMINI_API_KEY`.

### Google Maps API

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable Maps JavaScript API for your project.
3. Create an API key with browser restrictions.
4. Paste it into `VITE_GOOGLE_MAPS_API_KEY`.

## Demo Mode

NeighborAid 2.0 works without any API keys. Leave the `.env` file empty or keep the placeholder values and the app will automatically switch to demo mode:

- Firebase services use `localStorage`
- Gemini services return realistic mock coordination output
- The dashboard uses a polished SVG Kerala fallback map
- WhatsApp dispatch opens a `wa.me` link with the mission message prefilled

This makes the full prototype runnable with:

```bash
npm install
npm run dev
```

## Project Structure

- `src/config`: Firebase bootstrap and realistic Kerala demo data
- `src/services`: Encryption, Gemini orchestration, Firebase persistence, and WhatsApp dispatch
- `src/hooks`: Shared app hooks for toast state, Firebase state, and Gemini calls
- `src/components`: Layout, UI primitives, and the crisis map renderer
- `src/pages`: End-to-end flows for home, registration, dashboard, matching, and mission tracking
- `src/utils`: Distance and hashing utilities used across the app

## Google Solutions Challenge Alignment

NeighborAid 2.0 aligns with multiple Sustainable Development Goals:

- `SDG 3: Good Health and Well-being` by accelerating emergency medical coordination
- `SDG 9: Industry, Innovation and Infrastructure` through resilient local response tooling
- `SDG 11: Sustainable Cities and Communities` by strengthening disaster preparedness and recovery
- `SDG 16: Peace, Justice and Strong Institutions` through auditable access controls and accountable crisis operations

The prototype also reflects the challenge spirit by using technology to solve a locally rooted, high-impact problem. Kerala flood response is used as the primary design context to show how digital infrastructure can improve resilience in vulnerable communities.

## Team Credits

- Team Name: Add your team name here
- Team Members: Add member names here
- Institution: Add college or organization here
