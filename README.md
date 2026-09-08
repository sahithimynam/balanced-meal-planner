# 🥗 NutriPlan - Balanced Meal Planner & Diet Generator

A modern, responsive, 100% frontend web application built with **HTML5, CSS3, and ES6+ JavaScript**, featuring integration with the **Spoonacular Food API**. NutriPlan empowers users to generate balanced diet recommendations from available kitchen ingredients, explore healthy recipes with advanced dietary filters, and manage daily macronutrient goals (Calories, Protein, Carbs, Fats) with automatic browser persistence.

---

## 🚀 Live Preview & Quick Start

NutriPlan is completely **client-side** (no Node.js, Express, MongoDB, or backend servers required).

### Option 1: Direct Browser Launch
Simply open `index.html` in any modern web browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local Static Server
If you prefer running via a local static web server:
```bash
# Python 3
python -m http.server 8000

# Open http://localhost:8000 in your browser
```

---

## 📋 Analysis of Issues Found & Fixes Implemented

During the project audit, multiple critical bugs, syntax errors, and architectural limitations were identified in the original repository. Below is a comprehensive breakdown:

| # | Component | Original Issue | Severity | Fix Implemented |
|---|---|---|---|---|
| 1 | `ind.html` | Referenced non-existent files: `<link rel="stylesheet" href="index.css">` and `<script src="./index.js"></script>`, while files were named `ind.css` and `ind.jsx`. | **Critical** | Restructured project to standard `index.html`, `css/style.css`, and modular JS in `js/`. Created backward-compatible aliases for legacy files. |
| 2 | `ind.html` | Default file name `ind.html` prevented standard static hosting index resolution. Generic `<title>Document</title>`. | **High** | Renamed primary entry to `index.html`, added semantic metadata, viewport settings, and branding. |
| 3 | `ind.jsx` | Named `.jsx` despite containing plain vanilla DOM JavaScript. | **Medium** | Migrated to standard ES6+ modular architecture (`app.js`, `api.js`, `ui.js`, `storage.js`, `mock-data.js`, `config.js`). |
| 4 | Spoonacular API Key | Hardcoded API key `fca38ae0a6fb405980e83815c4b4be93` returned **HTTP 401 Unauthorized** (invalid/expired). | **Critical** | Created an **in-app API Key Configuration Modal** where users can input, test, and save their own Spoonacular key to `localStorage`. |
| 5 | Error Handling | Unchecked API responses accessed `searchData.results.length` on 401 errors, throwing uncaught `TypeError` crashes. | **Critical** | Implemented robust HTTP status handling for `200`, `401`, `402` (quota reached), and `429` (rate limit), backed by a graceful **Demo Mode fallback**. |
| 6 | Quota & Performance | **N+1 API Problem**: Made 3 sequential API calls (`search`, `information`, `guessNutrition`) per ingredient, burning 15+ calls for 5 items. | **High** | Replaced with bulk recipe queries (`/recipes/findByIngredients` and `/recipes/complexSearch`), caching, and client-side macronutrient heuristics. |
| 7 | Ingredient Parsing | `split(' ')` broke multi-word ingredients (e.g. "sweet potato" was searched as "sweet" and "potato" separately). | **Medium** | Implemented intelligent delimiter parsing supporting commas, spaces, and newlines for complex ingredients. |
| 8 | `ind.css` Responsiveness | `.text { width: 80rem; }` forced a 1280px fixed width, breaking completely on mobile/tablet viewports. | **Critical** | Replaced with fluid responsive CSS grid and flexbox (`minmax(280px, 1fr)`). Works from 320px mobile to 4K displays. |
| 9 | `ind.css` Syntax | `.btn { border: 2 widthrem; }` was invalid CSS syntax. | **Medium** | Replaced with clean, modern CSS button styles with subtle hover elevations. |
| 10 | `ind.css` Aesthetics | Low-contrast brown/beige color palette (`#dbd2c3`, `#887d69`, `#4b3b42`) failed WCAG AA accessibility standards. | **High** | Designed a modern emerald design system with accessible contrast ratios, glassmorphism, and smooth CSS transitions. |
| 11 | Theme Support | No dark mode available. | **Feature Gap** | Added a full **Dark / Light Mode toggle** with CSS variables and `localStorage` persistence. |
| 12 | Plan Persistence | Generated meals vanished on page refresh. | **Feature Gap** | Added full `localStorage` synchronization for daily meal plans (Breakfast, Lunch, Dinner, Snacks) and active ingredients. |
| 13 | Recipe Search | Missing dedicated recipe search engine. | **Feature Gap** | Built a multi-filter recipe search tab querying Spoonacular by name, meal category, dietary preferences, and max calories. |

---

## 🔑 Spoonacular API Configuration Guide

NutriPlan supports both **Live Spoonacular API** calls and an **Offline Demo Mode**.

### 1. Getting a Free Spoonacular API Key
1. Visit [Spoonacular Food API](https://spoonacular.com/food-api) and sign up for a free developer account.
2. Navigate to your **Dashboard** -> **Profile** -> **API Keys**.
3. Copy your 32-character API key.

### 2. Configuring the Key in NutriPlan
1. Click the **🔑 API Settings** button in the top navigation bar.
2. Paste your API key into the input field.
3. Click **Verify Connection** to test the key against Spoonacular servers.
4. Click **Save API Key**. The status indicator in the top header will display **🟢 Live API**.

### 3. Graceful Quota & Offline Handling (Demo Mode)
* Spoonacular's free tier provides **150 points per day**.
* When your key reaches its quota (HTTP 402) or if no key is entered, NutriPlan seamlessly switches to **🟠 Demo Mode**.
* Demo Mode utilizes a rich, pre-packaged dataset of balanced recipes with realistic nutritional breakdowns, ingredient lists, and cooking instructions, ensuring the app remains 100% interactive without crashing.
* You can toggle Demo Mode on or off at any time in the API Settings modal.

---

## ✨ Features Overview

### 1. 🥗 Smart Ingredient Meal Planner
* **Input Flexibility**: Enter available items as comma-separated or space-separated lists (e.g. `chicken breast, brown rice, broccoli, avocado, eggs`).
* **Quick-Add Ingredient Chips**: One-click tags for common essentials (Chicken, Salmon, Eggs, Tofu, Brown Rice, Oats, Quinoa, Sweet Potato, Broccoli, Spinach, Tomatoes, Avocado).
* **Macronutrient Classification**: Automatically groups ingredients into **Protein**, **Carbohydrates**, **Vegetables / Fiber**, and **Healthy Fats**.
* **Dietary Recommendations**: Generates wholesome recipes using the detected ingredients.
* **Macro Goal Dashboard**: Computes estimated daily calories and macronutrient progress against reference daily targets (2000 kcal, 100g Protein, 225g Carbs, 65g Fat).

### 2. 🔍 Recipe Search Engine
* **Keyword Search**: Search thousands of dishes by ingredient or recipe title.
* **Meal Category Filters**: Filter by Breakfast, Main Course, Salad, Soup, Snack, or Healthy Dessert.
* **Dietary Filters**: High-Protein, Low-Carb, Vegetarian, Vegan, Gluten-Free, Ketogenic.
* **Calorie Capping**: Slider/input to specify maximum calories per serving.
* **Rich Recipe Cards**: Displays preparation time, serving count, calorie count, and macro badges.
* **Recipe Details Modal**: Full ingredients checklist and step-by-step preparation directions.

### 3. 📋 My Daily Meal Plan & LocalStorage
* **Slot Organization**: Organize your day into **Breakfast**, **Lunch**, **Dinner**, and **Healthy Snacks**.
* **One-Click Slot Assignment**: Add any recipe to a specific meal slot directly from recipe cards or details modals.
* **Dynamic Daily Macro Tracker**: Aggregates total calories, protein, carbs, and fat across all planned meals, updating animated progress bars in real time.
* **Full Persistence**: All planned meals and user preferences persist in `localStorage` and automatically restore on browser refresh.
* **Reset / Clear Plan**: Clear your active inputs or wipe the entire daily plan with confirmation dialogs and instant toast alerts.

### 4. 🌙 Dark / Light Mode
* Seamless toggle in the header with Sun/Moon iconography.
* Carefully balanced color palettes for both modes meeting WCAG AA contrast standards.
* Automatically remembers your selected theme in `localStorage`.
* Respects OS `prefers-color-scheme` on first visit.

---

## 📁 File Structure

```
balanced-meal-planner/
├── index.html            # Main semantic single-page application
├── ind.html              # Backwards-compatible alias redirecting to index.html
├── index.css             # Root CSS alias importing style.css
├── ind.css               # Legacy CSS alias importing style.css
├── index.js              # Root JS compatibility alias
├── ind.jsx               # Legacy script documenting modular architecture
├── css/
│   └── style.css         # Complete responsive design system & themes
├── js/
│   ├── config.js         # API endpoints, storage keys, daily macro targets
│   ├── mock-data.js      # Rich sample recipes & offline nutritional data
│   ├── storage.js        # LocalStorage wrapper (theme, plan, API key)
│   ├── api.js            # Live Spoonacular client, error handler & fallback
│   ├── ui.js             # UI rendering (cards, macro bars, modals, toasts)
│   └── app.js            # Controller, tabs, search, event delegation
└── README.md             # Documentation & setup instructions
```

---

## 🧪 Testing & Verification

1. **API Integration Verification**:
   - Tested invalid/expired key handling -> triggers clear user-facing error message without console crashes.
   - Tested valid key verification flow in API Settings modal.
   - Verified seamless automatic fallback to Demo Mode when quota is depleted or key is missing.
2. **Form Controls & Buttons**:
   - Verified ingredient submission, quick-add chips, reset generator button, search filters, modal triggers, and "Add to Plan" dropdowns.
3. **Storage Persistence**:
   - Added recipes to Breakfast, Lunch, and Dinner; reloaded the browser; verified all meals and macro totals remained intact.
   - Toggled between Light and Dark mode; reloaded the browser; verified theme persisted.
4. **Console Hygiene**:
   - Zero console errors or uncaught promise rejections during operations.
5. **Responsiveness**:
   - Tested across Mobile (375px), Tablet (768px), and Desktop (1280px+). No horizontal overflow.
