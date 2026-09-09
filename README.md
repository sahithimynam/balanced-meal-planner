# 🥗 Balanced Diet Analyzer

A clean, minimalist web application built with **HTML5, CSS3, Vanilla JavaScript**, and **Spoonacular API Integration**. The application evaluates user-entered ingredients dynamically by retrieving nutritional data via Spoonacular API, classifies them into four core nutritional groups using quantitative thresholds, calculates a **Diet Score**, highlights **Nutrient Groups Found** versus **Nutrient Groups Missing**, and provides targeted **Recommendations**.

---

## 🎯 Key Capabilities

1. **Spoonacular API Integration**:
   - Searches each ingredient dynamically (`/food/ingredients/search`).
   - Fetches detailed macronutrients and micronutrients (`/food/ingredients/{id}/information`).
   - Stores the API key in a clean configuration constant (`config.js`).

2. **Threshold-Based Nutrient Classification**:
   - Classifies ingredients into 4 nutritional groups based on nutritional thresholds:
     - **Protein**: $\ge 5.0\text{g}$ protein per serving.
     - **Carbohydrates**: $\ge 10.0\text{g}$ carbohydrates per serving.
     - **Healthy Fats**: $\ge 4.5\text{g}$ fat per serving.
     - **Vegetables / Fiber**: $\ge 2.0\text{g}$ fiber per serving or vegetable category.
   - **Multi-Group Classification**: An ingredient can dynamically belong to multiple nutrient groups:
     - **Fish / Salmon** $\rightarrow$ Protein + Healthy Fats
     - **Eggs** $\rightarrow$ Protein + Healthy Fats
     - **Paneer** $\rightarrow$ Protein + Healthy Fats
     - **Chickpeas** $\rightarrow$ Protein + Carbohydrates
     - **Avocado** $\rightarrow$ Healthy Fats + Vegetables/Fiber

3. **Diet Score Calculation**:
   - 4 groups found = **100% Balanced**
   - 3 groups found = **75% Balanced**
   - 2 groups found = **50% Balanced**
   - 1 group found = **25% Balanced**
   - 0 groups found = **0% Balanced**

4. **100% Balanced Diet Achieved**:
   - When all 4 nutrient groups are present, displays:
     - `✓ Balanced Diet Achieved`
     - `Diet Score: 100%`
     - *"Your ingredient selection contains all major nutrient groups required for a balanced diet."*
   - Displays all 4 found nutrient groups with ingredient breakdowns. Missing groups and recommendations are hidden.

5. **Graceful Error Handling**:
   - Handles Spoonacular 401 Unauthorized or 403 Forbidden $\rightarrow$ `"API unavailable: Invalid or unauthorized Spoonacular API key."`
   - Handles Spoonacular 402 Daily Quota Exceeded $\rightarrow$ `"API unavailable: Spoonacular daily API quota exceeded."`
   - Handles unrecognized food items $\rightarrow$ `"Ingredient not found: ... Unable to analyze ingredient."`
   - Handles empty input validation $\rightarrow$ `"Please enter at least one ingredient."`
   - Never crashes or breaks the layout.

---

## ⚙️ Configuration

The Spoonacular API key and thresholds are managed in [`config.js`](config.js):

```javascript
const CONFIG = {
    // Spoonacular API Key (Get a key at https://spoonacular.com/food-api/console)
    SPOONACULAR_API_KEY: 'YOUR_SPOONACULAR_API_KEY',
    API_BASE_URL: 'https://api.spoonacular.com',

    THRESHOLDS: {
        protein: 5.0,         // grams
        carbohydrates: 10.0,  // grams
        fat: 4.5,             // grams
        fiber: 2.0            // grams
    },

    RECOMMENDATIONS: {
        vegetables_fiber: { label: 'Vegetables/Fiber', items: ['Broccoli', 'Spinach', 'Carrot'] },
        healthy_fats: { label: 'Healthy Fats', items: ['Avocado', 'Almonds', 'Olive Oil'] },
        protein: { label: 'Protein', items: ['Eggs', 'Chicken', 'Paneer'] },
        carbohydrates: { label: 'Carbohydrates', items: ['Rice', 'Oats', 'Sweet Potato'] }
    }
};
```

---

## 🚀 How to Run Locally

### Run with Python HTTP Server:
```bash
# Navigate to the project directory
cd "C:\Users\krishna sahithi\.gemini\antigravity\scratch\balanced-meal-planner"

# Start local server
python -m http.server 8080
```
Open **http://localhost:8080** in your browser.

---

## 📁 Project Structure

```
balanced-meal-planner/
├── index.html            # Main interface (Header, Input Card, Results Card)
├── style.css             # Preserved clean, responsive stylesheet
├── config.js             # Spoonacular API settings, thresholds & recommendations
├── app.js                # Spoonacular fetch, threshold classification, and rendering
└── screenshots/          # End-to-end verification screenshots
```
