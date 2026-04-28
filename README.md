# NeighborAid 2.0

NeighborAid 2.0 is a production-ready prototype for **Google Solutions Challenge 2026** that demonstrates how communities can coordinate local disaster response before formal help arrives. The platform is designed around Kerala flood and emergency scenarios, combining behavioral crisis detection, proximity-aware volunteer matching, automated Twilio WhatsApp dispatch, and a privacy-preserving Break-Glass model that only reveals minimum necessary responder data during officially declared emergencies.

The app is built as a **React + Vite** frontend with a **FastAPI** backend. It features **Firebase Authentication**, **Role-Based Access Control (RBAC)**, **Gemini-assisted** decision support, and real-time **Twilio WhatsApp** notifications.

## Key Features

| Feature | Description |
|---|---|
| **Role-Based Access Control** | Secure login with distinct `admin` and `volunteer` roles. Admins see a dedicated command homepage; volunteers see profiles and alerts. |
| **Admin Command Center** | Live crisis dashboard with map, Break-Glass activation, and volunteer dispatch. |
| **Manage Admins** | Main admin can add local-level administrators with full details (name, age, contact, place, district, address, designation). |
| **Volunteer Profiles & Alerts** | Volunteers manage their skills/assets and receive real-time localized emergency alerts. |
| **Privacy-Preserving Dispatch** | Volunteer data stays encrypted; minimum necessary data is decrypted only during a declared emergency. |
| **WhatsApp Notifications** | Backend Twilio integration instantly notifies matched volunteers via WhatsApp when an emergency is dispatched. |
| **Gemini AI Matching** | Intelligent matching of volunteer skills, proximity, and assets to specific crisis needs. |
| **Mission Tracking** | Real-time status timeline for dispatched missions with full audit logging. |

## Screenshots

Add final product screenshots here:

- Home page hero and feature overview
- Admin homepage with stats and quick actions
- Volunteer registration flow
- Crisis command dashboard with map
- Gemini-powered matching and dispatch
- Mission tracker with live status timeline
- Volunteer Profile and Alerts views

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

| Tool | Version | Purpose |
|---|---|---|
| [Node.js](https://nodejs.org/) | 18+ | Frontend runtime |
| npm | 9+ | Package manager (bundled with Node.js) |
| [Python](https://www.python.org/) | 3.8+ | Backend runtime (for Twilio notifications) |
| [Git](https://git-scm.com/) | Any | Version control |

### External Services (API keys required for full functionality)

| Service | Required? | Purpose |
|---|---|---|
| [Firebase](https://console.firebase.google.com/) | Yes | Authentication (Email/Password) and Firestore Database |
| [Gemini API](https://aistudio.google.com/app/apikey) | Optional | AI-powered volunteer-crisis matching |
| [Twilio](https://www.twilio.com/) | Optional | WhatsApp notification dispatch |
| [Google Maps](https://console.cloud.google.com/) | Optional | Interactive crisis map |

> **Note:** The app runs fully in demo mode without any API keys. See [Demo Mode](#demo-mode) below.

---

## Complete Setup Guide

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/NeighbourAid.git
cd NeighbourAid
```

### Step 2 — Frontend Setup

1. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   ```bash
   cp .env.example .env
   ```

   Open the `.env` file and fill in your credentials:

   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

   > Leave as-is to run in demo mode.

3. **Start the frontend dev server:**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

### Step 3 — Backend Setup (Twilio WhatsApp Notifications)

Open a **separate terminal** for the backend.

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a Python virtual environment:**

   ```bash
   # Create the virtual environment
   python -m venv venv

   # Activate it
   # On Windows:
   venv\Scripts\activate

   # On macOS / Linux:
   source venv/bin/activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

   This installs:
   - `fastapi==0.110.0` — Web framework
   - `uvicorn==0.27.1` — ASGI server
   - `twilio==8.14.0` — Twilio SDK for WhatsApp
   - `python-dotenv==1.0.1` — Environment variable loader

4. **Configure Twilio credentials:**

   ```bash
   cp .env.example .env
   ```

   Open `backend/.env` and fill in:

   ```env
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

5. **Start the backend server:**

   ```bash
   uvicorn main:app --reload
   ```

   The API will be available at `http://localhost:8000`.  
   The WhatsApp dispatch endpoint is `POST http://localhost:8000/api/whatsapp`.

### Step 4 — Initialize the First Admin Account

1. Ensure the **frontend dev server** is running.
2. Open your browser and navigate to:

   ```
   http://localhost:5173/setup-admin
   ```

3. Click the **"Set Up Main Admin"** button. This creates the initial admin account:
   - **Email:** `admin@example.com`
   - **Password:** `password`

4. You will be redirected to the login page. Sign in with the credentials above.

> **⚠️ Important:** Remove or disable the `/setup-admin` route before deploying to production.

### Step 5 — Explore the App

Once logged in as an admin, you'll land on the **Admin Homepage** with:

| Section | What you can do |
|---|---|
| **Command Center** | Monitor live crises, activate Break-Glass, dispatch responders |
| **Manage Admins** | Add local admins with full details (name, age, phone, place, district, address, designation) |
| **Matching Engine** | View Gemini AI-powered volunteer-crisis matching |
| **Mission Tracker** | Track dispatched mission statuses in real time |

To test the **volunteer flow**, register a new volunteer account at `/register`, log out, and log back in with the volunteer credentials. Volunteers see their own Profile and Alerts pages.

---

## API Key Setup (Detailed)

### Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. In **Authentication → Sign-in method**, enable **Email/Password**.
3. In **Firestore Database**, click **Create Database** and start in test mode.
4. Go to **Project Settings → General → Your apps**, add a **Web app**, and copy the config values into your `.env`.

### Gemini API

1. Open [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key** and select your Google Cloud project.
3. Paste the key into `VITE_GEMINI_API_KEY` in your `.env`.

### Twilio API (WhatsApp)

1. Create a free account at [twilio.com](https://www.twilio.com/).
2. Go to **Messaging → Try it Out → Send a WhatsApp Message** and follow the sandbox setup.
3. Note your **Account SID**, **Auth Token** (from the dashboard), and **WhatsApp Sender Number**.
4. Paste them into `backend/.env`.

### Google Maps API

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the **Maps JavaScript API**.
3. Create an API key under **Credentials**, restrict it to your domain.
4. Paste it into `VITE_GOOGLE_MAPS_API_KEY` in your `.env`.

---

## Demo Mode

NeighborAid 2.0 works **without any API keys**. Leave the `.env` files empty or keep the placeholder values and the app will automatically switch to demo mode:

- **Firebase** → Falls back to `localStorage` for data persistence
- **Gemini** → Returns realistic mock coordination and matching output
- **Maps** → Uses a polished SVG Kerala fallback map
- **WhatsApp** → Falls back to opening a `wa.me` deep link if the backend is unavailable

This means you can run the full prototype with just:

```bash
npm install
npm run dev
```

---

## Running Both Servers (Quick Reference)

Open **two terminals** side by side:

**Terminal 1 — Frontend:**
```bash
cd NeighbourAid
npm run dev
```

**Terminal 2 — Backend:**
```bash
cd NeighbourAid/backend
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux
uvicorn main:app --reload
```

| Service | URL | Purpose |
|---|---|---|
| Frontend | `http://localhost:5173` | React app |
| Backend API | `http://localhost:8000` | WhatsApp dispatch |
| API Docs | `http://localhost:8000/docs` | FastAPI auto-generated Swagger UI |

---

## Project Structure

```
NeighbourAid/
├── backend/                  # FastAPI server for Twilio WhatsApp dispatch
│   ├── main.py               # API endpoints and Twilio integration
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Twilio credential template
│   └── .env                  # Your Twilio credentials (git-ignored)
├── src/
│   ├── config/               # Firebase bootstrap and Kerala demo data
│   ├── contexts/             # AuthContext for authentication state & RBAC
│   ├── components/
│   │   ├── Layout/           # Navbar, Sidebar, ProtectedRoute
│   │   ├── Map/              # CrisisMap renderer (Leaflet / SVG fallback)
│   │   └── UI/               # Button, Badge, LoadingSpinner, etc.
│   ├── hooks/                # useToast, useFirebase, useGemini
│   ├── pages/
│   │   ├── Home.jsx          # Public landing (or AdminHome for admins)
│   │   ├── AdminHome.jsx     # Admin dashboard homepage
│   │   ├── Login.jsx         # Authentication page
│   │   ├── Register.jsx      # Volunteer registration (multi-step)
│   │   ├── Dashboard.jsx     # Crisis Command Center (admin only)
│   │   ├── ManageAdmins.jsx  # Add local admins (admin only)
│   │   ├── Matching.jsx      # Gemini-powered volunteer matching
│   │   ├── MissionTracker.jsx# Live mission status tracking
│   │   ├── Profile.jsx       # Volunteer profile (volunteer only)
│   │   ├── Alerts.jsx        # Emergency alerts (volunteer only)
│   │   └── AdminSetup.jsx    # One-time admin initialization
│   ├── services/             # Firebase, encryption, Gemini, WhatsApp
│   └── utils/                # Distance calculation, hashing utilities
├── .env.example              # Frontend credential template
├── .env                      # Your frontend credentials (git-ignored)
├── package.json              # Node.js dependencies and scripts
├── vite.config.js            # Vite configuration
└── tailwind.config.js        # Tailwind CSS configuration
```

---

## Google Solutions Challenge Alignment

NeighborAid 2.0 aligns with multiple **UN Sustainable Development Goals**:

| SDG | Alignment |
|---|---|
| **SDG 3: Good Health and Well-being** | Accelerating emergency medical coordination |
| **SDG 9: Industry, Innovation and Infrastructure** | Resilient local response tooling |
| **SDG 11: Sustainable Cities and Communities** | Strengthening disaster preparedness and recovery |
| **SDG 16: Peace, Justice and Strong Institutions** | Auditable access controls and accountable crisis operations |

The prototype uses technology to solve a locally rooted, high-impact problem. Kerala flood response is the primary design context, showing how digital infrastructure can improve resilience in vulnerable communities.

---

## Team Credits

- **Team Name:** Add your team name here
- **Team Members:** Add member names here
- **Institution:** Add college or organization here
