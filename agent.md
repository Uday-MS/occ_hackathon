# 🌍 Startup Intelligence Platform – Full Stack 3D Edition

## 🧠 PROJECT VISION

This project is a **full-stack, AI-powered startup intelligence platform** with a **3D interactive Earth interface**.

The goal is to build a **production-level SaaS product** where users:
- Explore global startup ecosystems
- Interact with a real-time 3D globe
- Analyze country-wise funding
- Perform advanced search
- Use AI-based prediction tools
- Manage personalized accounts

This is NOT a basic dashboard.  
This is a **premium, interactive analytics product**.

---

## ⚠️ STRICT ENGINEERING RULES

- DO NOT rewrite the project from scratch
- ALWAYS extend existing Flask structure
- PRESERVE all working UI and routes
- DO NOT break existing features
- Implement changes incrementally
- Keep backend, frontend, and 3D logic modular
- Avoid large, uncontrolled changes

---

## 🧱 CURRENT STACK

Frontend:
- HTML, CSS, JavaScript
- Chart.js

Backend:
- Flask (Python)

Data:
- CSV (temporary → will migrate to PostgreSQL)

---

## 🚀 TARGET STACK (FINAL)

Frontend:
- HTML, CSS, JS
- Three.js (3D Earth)

Backend:
- Flask (REST APIs)
- PostgreSQL (database)
- psycopg2 / SQLAlchemy

Auth:
- Flask-Login
- Bcrypt
- Google OAuth

ML:
- Scikit-learn (prediction engine)

---

## 🎯 CORE PRODUCT EXPERIENCE

### 🧭 Landing Flow (UPDATED)

1. First Section:
   - Half Earth (bottom visible)
   - Text: Startup exploration content
   - Dark space theme

2. Scroll Transition:
   - Smooth zoom-out animation

3. Second Section:
   - Full 3D Earth (right side)
   - Text on left
   - Premium transition

---

## 🧭 NAVBAR STRUCTURE (UPDATED)

Navbar:

- Home
- India Analysis
- ML Prediction
- Search

Right side:
- Login
- Get Started (Signup)

REMOVED:
- Explore
- Sector
- Countries

---

## 📜 HOME PAGE STRUCTURE (SCROLL-BASED)

Single-page experience:

1. Hero (Half Earth)
2. Full Earth Section
3. Top Startups
4. Explore Section
5. Sector Analysis
6. Country Analysis

All sections scroll-based (no separate pages)

---

## 🌍 3D EARTH SYSTEM (CRITICAL FEATURE)

Use Three.js to implement:

### Behavior:

- Earth rotates continuously by default
- On selecting a country:
  → Smooth camera transition
  → Zoom into selected country

Examples:
- India → camera focuses on India
- USA → focus USA
- Default → slow rotation

### Requirements:

- High-resolution Earth texture
- Smooth lighting and glow
- Realistic rotation
- Maintain performance

---

## 📊 COUNTRY ANALYTICS SYSTEM

When a country is selected:

Display:
- Total funding
- Average funding
- Top sector
- Funding trends
- Top startups

UI:
- Glassmorphism cards
- Smooth transitions
- Dynamic update (no reload)

---

## 🔐 AUTHENTICATION SYSTEM

Features:
- Signup (Get Started)
- Login
- Logout
- Google OAuth login

Requirements:
- Store users in PostgreSQL
- Hash passwords using Bcrypt
- Use Flask-Login for session management

---

## 🗄️ DATABASE (POSTGRESQL)

Goal:
- Replace CSV with PostgreSQL

Tables:
- users
- startups
- user_preferences (optional)

Requirements:
- Use SQL queries (no pandas for runtime)
- Optimize queries for filtering

---

## 🔎 ADVANCED SEARCH SYSTEM

Features:
- Filter by:
  - Country
  - Sector
  - Funding range

API:
/api/search?country=India&sector=Fintech 
Requirements:
- Dynamic query building
- Fast response
- Update UI dynamically using fetch()

---

## 🤖 ML PREDICTION SYSTEM

Page: ML Prediction

Input:
- Country
- Sector
- Funding stage

Output:
- Predicted funding OR success probability

Requirements:
- Use simple ML model (Linear / Logistic Regression)
- API: 
/api/predict
- Return prediction result dynamically

---

## 📡 API ARCHITECTURE

Standard APIs:

- /api/countries
- /api/sectors
- /api/trends
- /api/country-details
- /api/search
- /api/predict
- /api/auth (login/signup)

---

## 🔄 FRONTEND ↔ BACKEND FLOW

- Use fetch() for API calls
- Avoid full page reloads
- Update UI dynamically

---

## 🎨 UI/UX DESIGN RULES

- Dark theme
- Blue + Green glow accents
- Glassmorphism UI
- Smooth animations
- Clean spacing
- Premium SaaS look

---

## ✨ ANIMATION SYSTEM

- Scroll-based transitions
- Earth zoom animations
- Hover effects
- Smooth page transitions

---

## 🧼 CODE QUALITY

- Modular code structure
- Separate concerns:
  - UI
  - Backend
  - 3D logic
- Avoid duplication
- Add comments for clarity

---

## 🚀 FINAL PRODUCT GOAL

This project should feel like:

👉 A real startup intelligence SaaS platform  
👉 Full-stack + AI-powered system  
👉 Interactive + immersive experience  

Focus on:
- Performance
- Interactivity
- Real backend logic
- Clean architecture