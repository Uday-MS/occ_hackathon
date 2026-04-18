# 🚀 Startup Intelligence Dashboard – AI Agent Instructions

## 🧠 Project Overview
This is a professional-level Startup Intelligence Dashboard built using:
- Flask (Python backend)
- HTML, CSS, JavaScript (frontend)
- Chart.js (data visualization)
- Pandas (data processing)

The goal is to transform this into a **modern SaaS-style analytics dashboard** with advanced UI and features.

---

## ⚠️ IMPORTANT RULES (STRICT)

- DO NOT rewrite the project from scratch
- ALWAYS modify existing files
- PRESERVE existing routes and functionality
- DO NOT break working features
- Keep code modular and clean
- Separate backend and frontend logic properly

---

## 📁 Project Structure

- app.py
- templates/
  - base.html
  - index.html
  - trends.html
  - sector.html
  - country.html
  - india.html
  - search.html
- static/
  - style.css
  - script.js
- datasets:
  - cleaned_data.csv
  - indian_startups.csv

---

## 🎨 UI/UX DESIGN REQUIREMENTS

- Dark theme (modern SaaS style)
- Sidebar navigation (left side)
- Glassmorphism cards (blur + shadow)
- Smooth animations and hover effects
- Gradient highlights
- Fully responsive layout

Sidebar Pages:
- Dashboard
- Trends
- Sectors
- Countries
- India Analysis
- Search Startup

---

## 📊 FEATURES TO IMPLEMENT

### 1. Dashboard
- Total funding
- Total startups
- Top country
- Average funding
- Funding trends preview chart
- Top 10 startups table

---

### 2. Trends Page
- Line chart (year vs funding)
- Smooth curve (tension)
- Gradient fill
- Filters:
  - Country
  - Year

---

### 3. Sector Page
- Bar chart (sector vs funding)
- Filter by country

---

### 4. Country Page
- Bar chart (country vs funding)
- Filter by industry

---

### 5. India Analysis Page
- Use indian_startups.csv
- Show:
  - Top sectors in India
  - Year-wise funding
  - Comparison with global data

---

### 6. Search Feature
- Search startup by name
- Show:
  - Industry
  - Country
  - Funding stage
  - Amount raised

---

## ⚙️ BACKEND REQUIREMENTS (Flask)

- Use pandas to process CSV
- Create API routes:
  - /api/trends
  - /api/sectors
  - /api/countries
  - /api/search
- Return JSON data
- Use Jinja for passing initial data

---

## 💻 FRONTEND REQUIREMENTS

- Use Chart.js
- Add:
  - Smooth animations
  - Tooltips
  - Responsive charts
- Use fetch() for dynamic updates

---

## 🧼 CODE QUALITY

- Write clean and readable code
- Add comments
- Avoid duplication
- Follow modular structure

---

## 🎯 FINAL GOAL

This project should look like a **portfolio-level, production-ready dashboard**, not a beginner project.

Focus on:
- UI quality
- Interactivity
- Real-world feel