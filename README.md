# 🥗 Balanced Diet Analyzer

A clean, minimalist frontend web application built with **HTML5, CSS3, and Vanilla JavaScript**. The application evaluates user-entered ingredients, categorizes them into the four essential nutritional pillars, calculates a **Diet Score**, highlights **Nutrient Groups Found** versus **Nutrient Groups Missing**, and provides actionable **Recommendations** to balance the diet.

---

## 🎯 Purpose & Functionality

The purpose of this project is to analyze nutritional balance and educate users on balanced eating without confusing them with complex recipe generation or overwhelming dashboards.

### Core Nutritional Pillars Analyzed:
1. **Protein**: e.g., Chicken, Eggs, Salmon, Tofu, Paneer, Lentils, Chickpeas.
2. **Carbohydrates**: e.g., Rice, Oats, Bread, Sweet Potato, Quinoa, Pasta.
3. **Vegetables / Fiber**: e.g., Broccoli, Spinach, Carrot, Tomatoes, Bell Pepper.
4. **Healthy Fats**: e.g., Avocado, Almonds, Olive Oil, Walnuts, Chia Seeds.

---

## 🔄 Application Logic (Input ➔ Processing ➔ Output)

### 1. Input:
The user enters available kitchen ingredients (separated by commas, spaces, or newlines) into a single input box.

### 2. Processing:
- Vanilla JavaScript normalizes and tokenizes the entered ingredients.
- Cross-references each ingredient against a built-in culinary classification dictionary.
- Identifies which of the 4 groups are present and which are missing.
- Calculates the **Diet Score**:
  - 1 group = **25% Balanced**
  - 2 groups = **50% Balanced**
  - 3 groups = **75% Balanced**
  - 4 groups = **100% Balanced**

### 3. Output:

#### Scenario A: When Nutrient Groups Are Missing (< 100%)
- **Diet Score**: `${score}% Balanced` (e.g. `50% Balanced`)
- **Nutrient Groups Found**:
  - ✓ Protein
  - ✓ Carbohydrates
- **Nutrient Groups Missing**:
  - ⚠ Healthy Fats
  - ⚠ Vegetables/Fiber
- **Recommendations**:
  - **Vegetables/Fiber**: Broccoli, Spinach, Carrot
  - **Healthy Fats**: Avocado, Almonds, Olive Oil

#### Scenario B: When All 4 Nutrient Groups Are Present (100%)
- **Success Banner**:
  - `✓ Balanced Diet Achieved`
  - `Diet Score: 100%`
- **Message**:
  > *"Your ingredient selection contains all major nutrient groups required for a balanced diet."*
- **Nutrient Groups Found**:
  - ✓ Protein
  - ✓ Carbohydrates
  - ✓ Vegetables/Fiber
  - ✓ Healthy Fats

#### Scenario C: Empty Input Validation
- Only triggers an error when no ingredients are entered:
  `"Please enter at least one ingredient."`

---

## 🛠️ Technology Stack

- **HTML5**: Semantic and accessible markup.
- **CSS3**: Lightweight, modern responsive stylesheet with flexbox and card styling.
- **Vanilla JavaScript**: Pure ES6+ client-side logic.
- **Zero Dependencies**: No React, Node.js, Express, build tools, or external API keys.

---

## 🚀 How to Run Locally

### Option 1: Python Static Server (Recommended)
```bash
# Navigate to the project folder
cd "C:\Users\krishna sahithi\.gemini\antigravity\scratch\balanced-meal-planner"

# Start local server
python -m http.server 8080
```
Open **http://localhost:8080** in your web browser.

### Option 2: Direct File Launch
Double-click `index.html` in Windows File Explorer to open directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 📁 File Structure

```
balanced-meal-planner/
├── index.html            # Main interface (Title, 1 Input, 1 Button, 1 Results area)
├── style.css             # Clean modern stylesheet (~180 lines)
├── app.js                # Food classification & scoring engine (~220 lines)
├── ind.html              # Legacy alias redirecting to index.html
├── index.css / ind.css   # Aliases importing style.css
├── index.js / ind.jsx    # Aliases loading app.js
├── screenshots/          # Visual proof screenshots
└── README.md             # Project documentation
```

---

## 💼 Resume & Interview Talking Points

- **Focused Problem Definition**: Solves a specific problem (evaluating diet balance) with a minimalist, distraction-free UI.
- **Clear Architectural Pipeline**: Demonstrates an Input ➔ Processing ➔ Output workflow implemented in pure vanilla JavaScript.
- **Zero Latency / 100% Reliability**: Completely self-contained client-side logic ensures immediate execution with no external API rate limits or network failures.
- **User-Centric Feedback**: Provides positive reinforcement when all 4 groups are met, and actionable, specific grocery recommendations when nutrients are missing.
