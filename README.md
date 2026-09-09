# Balanced Diet Analyzer

## Overview
Balanced Diet Analyzer is a web-based application that evaluates user-entered ingredients and determines whether they form a balanced diet.

## Features
- Enter ingredients manually
- Identify nutrient groups:
  - Protein
  - Carbohydrates
  - Healthy Fats
  - Vegetables/Fiber
- Calculate Diet Score
- Show missing nutrient groups
- Recommend ingredients to improve diet balance

## Technologies Used
- HTML
- CSS
- JavaScript
- Spoonacular API (for nutrition analysis)

## How It Works
1. User enters ingredients.
2. Application analyzes nutritional information.
3. Nutrient groups are identified.
4. Diet score is calculated.
5. Missing nutrients and recommendations are displayed.

## Future Enhancements
- More nutrition APIs
- Personalized diet recommendations
- Meal tracking
```
balanced-meal-planner/
├── index.html            # Main interface (Header, Input Card, Results Card)
├── style.css             # Preserved clean, responsive stylesheet
├── config.js             # Spoonacular API settings, thresholds & recommendations
├── app.js                # Spoonacular fetch, threshold classification, and rendering
└── screenshots/          # End-to-end verification screenshots
```
## Live Demo
https://balanced-diet-analyzer.onrender.com
