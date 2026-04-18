# 🌍 Startup Intelligence Dashboard – Earth Edition

## 🧠 Project Vision

This project is evolving into a **high-end, interactive, visually immersive web application** where users explore global startup funding through a **3D Earth-based interface**.

Instead of a traditional dashboard, the UI should feel like a **modern space-themed product (Apple / NASA style UI)**.

---

## ⚠️ STRICT RULES

- DO NOT rewrite the project from scratch
- ALWAYS build on existing Flask structure
- PRESERVE working routes and features
- DO NOT break backend logic
- UI can be redesigned fully
- Keep code modular and clean

---

## 🎯 CORE EXPERIENCE FLOW

1. User opens website → sees **loading screen**
2. A **3D Earth model rotates (high-quality, smooth animation)**
3. After loading → transitions into main UI
4. User can:
   - Click on countries on Earth 🌍
   - Or select from UI
5. On click → navigates to **Country Intelligence Page**

---

## 🎨 UI/UX DESIGN (TOP PRIORITY)

### Theme:
- Dark theme 🌑
- Blue + Green glowing accents (space + tech feel)
- Smooth gradients
- Glassmorphism cards
- Soft shadows and neon highlights

---

### Layout Changes:

#### ✅ TOP NAVBAR (instead of sidebar)
- Logo (StartupIQ 🚀)
- Pages:
  - Home
  - Explore
  - Countries
  - India Analysis
  - Search

---

### 🌍 HERO SECTION (MAIN ATTRACTION)

- Large **3D Earth model (center/right)**
- Slowly rotating
- Subtle glow effect
- Stars background (parallax effect)

Left side:
- Title: “Explore Global Startup Ecosystem”
- Subtitle
- CTA button: “Start Exploring”

---

## 🌐 INTERACTIVE EARTH FEATURES

- Earth should rotate continuously
- Hover effect on countries
- Click interaction:
  → Redirect to `/country/<country_name>`

---

## 📊 COUNTRY PAGE (VERY IMPORTANT)

When user clicks a country:

Show:
- Total funding
- Number of startups
- Top sectors
- Funding trend chart
- Top startups list

UI:
- Card-based layout
- Smooth scroll animations
- Section reveal animations

---

## ⚙️ BACKEND (FLASK)

- Add dynamic route:
  `/country/<country_name>`

- Use pandas to filter:
  - Funding per country
  - Sector distribution
  - Year trends

- Return JSON or render template

---

## 📊 DATA VISUALIZATION

Use Chart.js:
- Line chart → funding trend
- Bar chart → sector distribution
- Pie chart (optional) → sector share

---

## ✨ ANIMATIONS

- Page load animation
- Scroll reveal animations
- Hover effects on cards
- Smooth transitions between pages

---

## 🔍 SEARCH FEATURE

- Search startup name
- Show details dynamically
- Add live search suggestions

---

## 🇮🇳 INDIA ANALYSIS

- Use indian_startups.csv
- Compare:
  - India vs Global
- Show insights visually

---

## 🧱 TECH ADDITIONS (OPTIONAL BUT RECOMMENDED)

- Use Three.js (for 3D Earth)
- OR use a prebuilt globe library

---

## 🧼 CODE QUALITY

- Clean structure
- Modular JS
- No duplicate logic
- Separate backend & frontend properly

---

## 🚀 FINAL GOAL

This should feel like:
👉 A premium SaaS product  
👉 Not a college project  
👉 Highly interactive + visually stunning  

Focus:
- Experience > Features
- Smoothness > Quantity