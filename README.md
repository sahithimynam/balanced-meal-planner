# 🥗 Balanced Meal Planner

A clean, beginner-friendly frontend web application built with **HTML5, CSS3, and Vanilla JavaScript**. The application allows users to enter whatever ingredients they have at home, generates practical everyday meal suggestions (Breakfast, Lunch, Dinner, Snack), estimates nutritional values, and educates users on balanced eating by identifying missing nutrient groups with actionable ingredient recommendations.

---

## 🎯 Project Overview & Objective

Many people struggle to figure out what to cook with the ingredients currently sitting in their kitchen, often leading to nutritionally skewed meals.

The **Balanced Meal Planner** solves this by:
1. Turning available kitchen ingredients into realistic meal ideas.
2. Breaking down the four core nutritional pillars (**Protein**, **Carbohydrates**, **Healthy Fats**, and **Vegetables / Fiber**).
3. Educating users on what their meal lacks and suggesting exact grocery items to improve diet quality.

---

## 🔄 Application Architecture (Input ➔ Processing ➔ Output)

The application follows a clean, single-page client-side architecture with zero external dependencies:

```
+------------------------------------------------------------------+
| INPUT                                                            |
| User enters available ingredients (e.g., "chicken, rice, eggs")  |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
| PROCESSING (Client-Side Vanilla JS)                              |
| 1. Tokenizes & cleans ingredient list (commas, spaces, newlines) |
| 2. Maps items against built-in nutritional knowledge base        |
| 3. Categorizes into: Protein, Carbs, Healthy Fats, Veggies/Fiber |
| 4. Calculates estimated macronutrients (Calories, P, C, F)       |
| 5. Identifies which nutrient groups are Present vs. Missing      |
| 6. Generates Breakfast, Lunch, Dinner, and Snack suggestions     |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
| OUTPUT                                                           |
| 1. 🍽️ Practical Meal Suggestions (Breakfast, Lunch, Dinner, Snack)|
| 2. 📊 Estimated Nutrition Summary (Calories, Protein, Carbs, Fat)|
| 3. ⚖️ Nutritional Balance Check (✅ Present vs ⚠️ Missing/Low)   |
| 4. 💡 Ingredient Recommendations for missing nutrient groups    |
| 5. ℹ️ Guidance Note ("This plan can still be followed...")       |
+------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

- **HTML5**: Semantic, accessible markup (`<header>`, `<section>`, `<main>`, `<textarea>`, `<button>`).
- **CSS3**: Clean, responsive styling using modern Flexbox, CSS Grid, and custom variables. Zero bulky CSS frameworks.
- **Vanilla JavaScript (ES6+)**: Modular, readable functions handling DOM events, string parsing, nutritional analysis, and dynamic card generation.
- **Dependencies**: None. 100% self-contained client-side application. No Node.js, Express, React, or external API keys required.

---

## 🚀 Step-by-Step Guide to Run Locally

### Method 1: Using Python Static Server (Recommended)
1. Open PowerShell or Command Prompt.
2. Navigate to the project directory:
   ```bash
   cd "C:\Users\krishna sahithi\.gemini\antigravity\scratch\balanced-meal-planner"
   ```
3. Start the local server:
   ```bash
   python -m http.server 8080
   ```
4. Open your browser and navigate to:
   ```text
   http://localhost:8080
   ```

### Method 2: Direct Browser Launch (No Server Needed)
Simply double-click `index.html` in File Explorer or open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 🌟 Key Features

### 1. Ingredient Input & Quick-Add Chips
- Flexible input accepting comma-separated, space-separated, or newline-separated items.
- 12 quick-add chips for pantry staples (*Chicken, Eggs, Salmon, Tofu, Rice, Oats, Sweet Potato, Broccoli, Spinach, Tomatoes, Avocado, Almonds*).

### 2. Practical Meal Suggestions
- Automatically constructs realistic, everyday meal ideas:
  - 🌅 **Breakfast**: e.g. Scrambled eggs with toast & greens, warm oatmeal bowls.
  - ☀️ **Lunch**: e.g. Balanced protein power bowls with whole grains and veggies.
  - 🌙 **Dinner**: e.g. Hearty roasted protein & caramelized vegetable platters.
  - 🍎 **Snack**: e.g. Wholesome afternoon energy bites, greek yogurt cups, or fresh fruit with nuts.
- **Non-blocking generation**: Generates suggestions even if ingredients are incomplete (e.g. only "bread, eggs").

### 3. Estimated Nutrition Summary
- Displays instant calculations for:
  - 🔥 **Estimated Calories** (kcal)
  - 🥩 **Protein** (g)
  - 🍞 **Carbohydrates** (g)
  - 🥑 **Fat** (g)

### 4. Nutritional Balance Check
- Displays which essential groups are **Present** (✅) and which are **Missing or Low** (⚠️):
  - **Protein**: Chicken, Eggs, Salmon, Tofu, Lentils, Beans, etc.
  - **Carbohydrates**: Rice, Oats, Bread, Sweet Potato, Quinoa, Pasta, etc.
  - **Healthy Fats**: Avocado, Olive Oil, Nuts, Seeds, Peanut Butter, etc.
  - **Vegetables / Fiber**: Spinach, Broccoli, Carrots, Tomatoes, Bell Peppers, etc.

### 5. Educational Recommendations & User Guidance
- When any nutrient group is missing, the app suggests exact ingredients to balance the diet (e.g. adding Avocado or Olive Oil for healthy fats; Broccoli or Carrots for fiber).
- Displays the encouraging guidance banner:
  > *"This meal plan can still be followed, but adding the suggested ingredients would improve nutritional balance."*

### 6. Simple Error Handling
- Only flags an error when the input is empty:
  `"Please enter at least one ingredient."`
- Never shows errors or blocks generation for missing nutrients.

---

## 📁 File Structure

```
balanced-meal-planner/
├── index.html            # Main semantic application page
├── style.css             # Lightweight, clean, responsive stylesheet (~230 lines)
├── app.js                # Core logic: database, analysis, meal generator (~260 lines)
├── index.css             # Alias importing style.css
├── ind.css               # Legacy alias importing style.css
├── ind.html              # Legacy alias redirecting to index.html
├── index.js              # Alias pointing to app.js
├── ind.jsx               # Legacy documentation alias
├── screenshots/          # Feature screenshots for demonstration
└── README.md             # Project documentation & overview
```

---

## 💼 Resume & Interview Talking Points

- **Problem-Solving & User Experience**: Designed an educational tool that guides users toward balanced nutrition without frustrating them with rigid errors or blocking incomplete ingredient lists.
- **Architectural Decision (Self-Contained vs. External API)**: Replaced external API dependencies with a robust, offline culinary knowledge base. This eliminated rate limits, 401 unauthorized errors, and network latency, ensuring instantaneous response times and 100% reliability during live portfolio demonstrations.
- **Clean Code & Modularity**: Structured clean, readable vanilla JavaScript with dedicated functions for input sanitization, nutrition aggregation, DOM rendering, and meal synthesis.
- **Accessibility & Responsiveness**: Mobile-first CSS layout tested across phone (375px), tablet, and desktop viewports with accessible contrast ratios.
