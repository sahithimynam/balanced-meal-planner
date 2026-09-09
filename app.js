/**
 * Balanced Meal Planner
 * Clean, student-level educational frontend application.
 * 
 * Flow:
 * - Input: User enters available ingredients
 * - Processing: System analyzes ingredients, estimates nutrition, checks for balance,
 *               identifies missing nutrient groups, and generates meal suggestions
 * - Output: Meal suggestions (Breakfast, Lunch, Dinner, Snack), nutrition summary,
 *           balance check (Present vs Missing), and ingredient recommendations
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const ingredientsInput = document.getElementById('ingredients-input');
    const generateBtn = document.getElementById('generate-btn');
    const clearBtn = document.getElementById('clear-btn');
    const errorMsg = document.getElementById('error-msg');
    const resultsSection = document.getElementById('results-section');
    const quickChips = document.querySelectorAll('.chip-btn');

    // Nutrition Knowledge Base: Common household ingredients
    const INGREDIENT_DATABASE = {
        // Proteins
        'chicken': { name: 'Chicken Breast', group: 'protein', groupLabel: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'chicken breast': { name: 'Chicken Breast', group: 'protein', groupLabel: 'Protein', calories: 165, protein: 31, carbs: 0, fat: 3.6 },
        'eggs': { name: 'Eggs', group: 'protein', groupLabel: 'Protein', calories: 140, protein: 12, carbs: 1, fat: 9.5 },
        'egg': { name: 'Egg', group: 'protein', groupLabel: 'Protein', calories: 70, protein: 6, carbs: 0.5, fat: 5 },
        'salmon': { name: 'Salmon', group: 'protein', groupLabel: 'Protein', calories: 206, protein: 22, carbs: 0, fat: 12 },
        'fish': { name: 'White Fish', group: 'protein', groupLabel: 'Protein', calories: 120, protein: 24, carbs: 0, fat: 2 },
        'tofu': { name: 'Firm Tofu', group: 'protein', groupLabel: 'Protein', calories: 144, protein: 17, carbs: 3, fat: 8 },
        'turkey': { name: 'Ground Turkey', group: 'protein', groupLabel: 'Protein', calories: 150, protein: 26, carbs: 0, fat: 4 },
        'tuna': { name: 'Canned Tuna', group: 'protein', groupLabel: 'Protein', calories: 130, protein: 28, carbs: 0, fat: 1 },
        'greek yogurt': { name: 'Greek Yogurt', group: 'protein', groupLabel: 'Protein', calories: 100, protein: 15, carbs: 6, fat: 1 },
        'yogurt': { name: 'Plain Yogurt', group: 'protein', groupLabel: 'Protein', calories: 110, protein: 10, carbs: 8, fat: 3 },
        'paneer': { name: 'Paneer', group: 'protein', groupLabel: 'Protein', calories: 260, protein: 18, carbs: 3, fat: 20 },
        'lentils': { name: 'Lentils / Dal', group: 'protein', groupLabel: 'Protein', calories: 230, protein: 18, carbs: 40, fat: 1 },
        'chickpeas': { name: 'Chickpeas', group: 'protein', groupLabel: 'Protein', calories: 240, protein: 14, carbs: 40, fat: 4 },
        'beans': { name: 'Black / Kidney Beans', group: 'protein', groupLabel: 'Protein', calories: 220, protein: 15, carbs: 40, fat: 1 },
        'beef': { name: 'Lean Beef', group: 'protein', groupLabel: 'Protein', calories: 250, protein: 26, carbs: 0, fat: 15 },
        'shrimp': { name: 'Shrimp', group: 'protein', groupLabel: 'Protein', calories: 100, protein: 24, carbs: 0, fat: 1 },

        // Carbohydrates
        'rice': { name: 'Rice', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 205, protein: 4, carbs: 45, fat: 0.5 },
        'brown rice': { name: 'Brown Rice', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 215, protein: 5, carbs: 45, fat: 1.8 },
        'white rice': { name: 'White Rice', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 205, protein: 4, carbs: 45, fat: 0.5 },
        'oats': { name: 'Rolled Oats', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 150, protein: 5, carbs: 27, fat: 2.5 },
        'oatmeal': { name: 'Oatmeal', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 150, protein: 5, carbs: 27, fat: 2.5 },
        'sweet potato': { name: 'Sweet Potato', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 110, protein: 2, carbs: 26, fat: 0.1 },
        'potato': { name: 'Potato', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 130, protein: 3, carbs: 30, fat: 0.2 },
        'potatoes': { name: 'Potatoes', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 130, protein: 3, carbs: 30, fat: 0.2 },
        'quinoa': { name: 'Quinoa', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 220, protein: 8, carbs: 39, fat: 3.5 },
        'bread': { name: 'Whole Wheat Bread', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 140, protein: 6, carbs: 26, fat: 1.5 },
        'pasta': { name: 'Pasta', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 200, protein: 7, carbs: 42, fat: 1 },
        'roti': { name: 'Whole Wheat Roti', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 120, protein: 3.5, carbs: 22, fat: 2 },
        'chapati': { name: 'Chapati', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 120, protein: 3.5, carbs: 22, fat: 2 },
        'noodles': { name: 'Noodles', group: 'carbohydrates', groupLabel: 'Carbohydrates', calories: 210, protein: 6, carbs: 44, fat: 1.2 },

        // Healthy Fats
        'avocado': { name: 'Avocado', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 160, protein: 2, carbs: 8, fat: 15 },
        'olive oil': { name: 'Olive Oil', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 120, protein: 0, carbs: 0, fat: 14 },
        'oil': { name: 'Cooking Oil', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 120, protein: 0, carbs: 0, fat: 14 },
        'nuts': { name: 'Mixed Nuts', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 170, protein: 6, carbs: 6, fat: 15 },
        'almonds': { name: 'Almonds', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 160, protein: 6, carbs: 6, fat: 14 },
        'walnuts': { name: 'Walnuts', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 185, protein: 4, carbs: 4, fat: 18 },
        'peanut butter': { name: 'Peanut Butter', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 190, protein: 8, carbs: 7, fat: 16 },
        'peanuts': { name: 'Peanuts', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 160, protein: 7, carbs: 5, fat: 14 },
        'seeds': { name: 'Chia / Flax Seeds', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 140, protein: 5, carbs: 10, fat: 9 },
        'chia seeds': { name: 'Chia Seeds', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 138, protein: 4.7, carbs: 12, fat: 8.7 },
        'cheese': { name: 'Cheddar Cheese', group: 'healthy_fats', groupLabel: 'Healthy Fats', calories: 115, protein: 7, carbs: 0.5, fat: 9 },

        // Vegetables & Fiber
        'spinach': { name: 'Spinach', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
        'broccoli': { name: 'Broccoli', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 35, protein: 2.5, carbs: 7, fat: 0.4 },
        'tomatoes': { name: 'Tomatoes', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 22, protein: 1, carbs: 4.8, fat: 0.2 },
        'tomato': { name: 'Tomato', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 22, protein: 1, carbs: 4.8, fat: 0.2 },
        'carrots': { name: 'Carrots', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 45, protein: 1, carbs: 10, fat: 0.2 },
        'carrot': { name: 'Carrot', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 45, protein: 1, carbs: 10, fat: 0.2 },
        'cucumber': { name: 'Cucumber', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1 },
        'bell pepper': { name: 'Bell Pepper', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 30, protein: 1, carbs: 7, fat: 0.3 },
        'peppers': { name: 'Bell Peppers', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 30, protein: 1, carbs: 7, fat: 0.3 },
        'onion': { name: 'Onion', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 44, protein: 1.1, carbs: 10, fat: 0.1 },
        'onions': { name: 'Onions', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 44, protein: 1.1, carbs: 10, fat: 0.1 },
        'garlic': { name: 'Garlic', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 15, protein: 0.6, carbs: 3.3, fat: 0 },
        'mushrooms': { name: 'Mushrooms', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
        'cabbage': { name: 'Cabbage', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 25, protein: 1.3, carbs: 6, fat: 0.1 },
        'lettuce': { name: 'Crisp Lettuce', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 15, protein: 1.4, carbs: 2.8, fat: 0.2 },
        'cauliflower': { name: 'Cauliflower', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 25, protein: 2, carbs: 5, fat: 0.3 },
        'peas': { name: 'Green Peas', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 81, protein: 5.4, carbs: 14.5, fat: 0.4 },
        'apple': { name: 'Fresh Apple', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 95, protein: 0.5, carbs: 25, fat: 0.3 },
        'banana': { name: 'Banana', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 105, protein: 1.3, carbs: 27, fat: 0.3 },
        'berries': { name: 'Mixed Berries', group: 'vegetables_fiber', groupLabel: 'Vegetables / Fiber', calories: 60, protein: 1, carbs: 14, fat: 0.5 },
    };

    // Recommended items to suggest when a nutrient group is missing or low
    const MISSING_GROUP_RECOMMENDATIONS = {
        protein: {
            title: 'Protein',
            suggestions: ['Chicken Breast', 'Eggs', 'Firm Tofu', 'Lentils / Dal', 'Greek Yogurt', 'Chickpeas'],
            why: 'Protein supports muscle repair, satiety, and energy throughout the day.'
        },
        carbohydrates: {
            title: 'Carbohydrates',
            suggestions: ['Brown Rice', 'Rolled Oats', 'Sweet Potato', 'Whole Wheat Bread', 'Quinoa'],
            why: 'Carbohydrates provide steady, complex energy for daily activities and brain function.'
        },
        healthy_fats: {
            title: 'Healthy Fats',
            suggestions: ['Avocado', 'Nuts (Almonds / Walnuts)', 'Olive Oil', 'Chia Seeds', 'Peanut Butter'],
            why: 'Healthy fats aid in nutrient absorption, hormone regulation, and lasting fullness.'
        },
        vegetables_fiber: {
            title: 'Vegetables / Fiber',
            suggestions: ['Broccoli', 'Fresh Spinach', 'Carrots', 'Tomatoes', 'Bell Peppers', 'Cucumber'],
            why: 'Vegetables and fiber promote optimal gut health, digestion, and provide essential micronutrients.'
        }
    };

    /* ==========================================================================
       1. EVENT HANDLERS: Quick Chips & Buttons
       ========================================================================== */
    quickChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const item = chip.dataset.item;
            const currentVal = ingredientsInput.value.trim();

            if (!currentVal) {
                ingredientsInput.value = item;
            } else {
                const itemsList = currentVal.split(',').map(s => s.trim().toLowerCase());
                if (!itemsList.includes(item.toLowerCase())) {
                    ingredientsInput.value = `${currentVal}, ${item}`;
                }
            }
            ingredientsInput.focus();
            hideError();
        });
    });

    generateBtn.addEventListener('click', handleGenerate);

    clearBtn.addEventListener('click', () => {
        ingredientsInput.value = '';
        resultsSection.classList.add('hidden');
        hideError();
        ingredientsInput.focus();
    });

    ingredientsInput.addEventListener('input', () => {
        if (ingredientsInput.value.trim()) {
            hideError();
        }
    });

    /* ==========================================================================
       2. CORE GENERATION & ANALYSIS FLOW
       ========================================================================== */
    function handleGenerate() {
        const rawText = ingredientsInput.value.trim();

        // 1. Simple Error Handling: ONLY show error if input is empty
        if (!rawText) {
            showError('Please enter at least one ingredient.');
            resultsSection.classList.add('hidden');
            ingredientsInput.focus();
            return;
        }

        hideError();

        // 2. Parse ingredients into clean tokens
        const parsedItems = parseIngredients(rawText);
        if (parsedItems.length === 0) {
            showError('Please enter at least one ingredient.');
            resultsSection.classList.add('hidden');
            return;
        }

        // 3. Analyze nutritional groups and calculate totals
        const analysis = analyzeNutrition(parsedItems);

        // 4. Generate meal suggestions based on ingredients
        const meals = generateMeals(analysis, parsedItems);

        // 5. Render all outputs into the DOM
        renderNutritionSummary(analysis);
        renderBalanceCheck(analysis);
        renderRecommendations(analysis);
        renderMealSuggestions(meals);

        // 6. Reveal results section smoothly
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ==========================================================================
       3. INGREDIENT PARSER & NUTRITION ENGINE
       ========================================================================== */
    function parseIngredients(input) {
        // Split by comma, newline, or multiple spaces
        let rawList = [];
        if (input.includes(',') || input.includes('\n')) {
            rawList = input.split(/[,\n]+/);
        } else {
            rawList = input.split(/\s+/);
        }

        return rawList
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 1);
    }

    function analyzeNutrition(items) {
        const presentGroups = {
            protein: [],
            carbohydrates: [],
            healthy_fats: [],
            vegetables_fiber: []
        };

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        items.forEach(rawItem => {
            let matched = INGREDIENT_DATABASE[rawItem];

            // Substring search in database if direct key fails
            if (!matched) {
                const key = Object.keys(INGREDIENT_DATABASE).find(k => rawItem.includes(k) || k.includes(rawItem));
                if (key) matched = INGREDIENT_DATABASE[key];
            }

            // Fallback heuristic if not in database
            if (!matched) {
                matched = guessNutrientGroup(rawItem);
            }

            // Add to present group
            presentGroups[matched.group].push(matched.name);

            // Accumulate estimated macronutrients
            totalCalories += matched.calories;
            totalProtein += matched.protein;
            totalCarbs += matched.carbs;
            totalFat += matched.fat;
        });

        // Determine which groups are missing
        const missingGroups = [];
        for (const [groupKey, itemsArray] of Object.entries(presentGroups)) {
            if (itemsArray.length === 0) {
                missingGroups.push(groupKey);
            }
        }

        return {
            presentGroups,
            missingGroups,
            totalCalories: Math.round(totalCalories),
            totalProtein: Math.round(totalProtein),
            totalCarbs: Math.round(totalCarbs),
            totalFat: Math.round(totalFat),
            userIngredients: items
        };
    }

    function guessNutrientGroup(item) {
        const lower = item.toLowerCase();
        let group = 'vegetables_fiber';
        let cals = 35, p = 1.5, c = 6, f = 0.2;

        if (lower.match(/chicken|meat|fish|egg|turkey|tofu|paneer|pork|beef|tuna|shrimp|salmon|dal|lentil|bean/)) {
            group = 'protein';
            cals = 160; p = 25; c = 2; f = 5;
        } else if (lower.match(/rice|oat|bread|potato|pasta|roti|chapati|noodle|quinoa|grain|wheat|cereal|corn/)) {
            group = 'carbohydrates';
            cals = 180; p = 4; c = 38; f = 1;
        } else if (lower.match(/avocado|oil|nut|almond|walnut|peanut|seed|butter|cheese|ghee|fat/)) {
            group = 'healthy_fats';
            cals = 150; p = 3; c = 4; f = 14;
        }

        const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
        return { name: capitalized, group, calories: cals, protein: p, carbs: c, fat: f };
    }

    /* ==========================================================================
       4. MEAL SUGGESTIONS BUILDER
       ========================================================================== */
    function generateMeals(analysis, items) {
        const proteins = analysis.presentGroups.protein;
        const carbs = analysis.presentGroups.carbohydrates;
        const fats = analysis.presentGroups.healthy_fats;
        const vegs = analysis.presentGroups.vegetables_fiber;

        const mainProtein = proteins[0] || 'Protein (e.g. Eggs / Chicken)';
        const mainCarb = carbs[0] || 'Whole grain carbohydrate';
        const mainVeg = vegs[0] || 'Fresh vegetables';
        const mainFat = fats[0] || 'Healthy oil or nuts';

        // 1. Breakfast Suggestion
        let breakfastTitle = 'Nutritious Morning Starter';
        let breakfastDesc = '';
        if (proteins.some(p => p.toLowerCase().includes('egg'))) {
            breakfastTitle = `Scrambled / Poached Eggs with ${carbs[0] || 'Toast'} & ${vegs[0] || 'Greens'}`;
            breakfastDesc = `Cook eggs gently. Pair with warm ${carbs[0] || 'whole grains'} and sautéed ${vegs[0] || 'vegetables'}.`;
        } else if (carbs.some(c => c.toLowerCase().includes('oat'))) {
            breakfastTitle = `Warm Oatmeal Bowl with ${fats[0] || 'Nuts'} & Sliced ${vegs.find(v => v.match(/Apple|Banana|Berries/)) || 'Fruit'}`;
            breakfastDesc = `Simmer oats with water or milk. Top with ${fats[0] || 'healthy nuts/seeds'} for lasting energy.`;
        } else {
            breakfastTitle = `Energizing ${mainProtein} & ${mainCarb} Plate`;
            breakfastDesc = `Light morning meal combining ${mainProtein} alongside ${mainCarb} for sustained focus.`;
        }

        // 2. Lunch Suggestion
        const lunchTitle = `Balanced ${mainProtein} Power Bowl`;
        const lunchDesc = `Combine seared or cooked ${mainProtein} over a base of warm ${mainCarb}, loaded with crisp ${mainVeg} and finished with a touch of ${mainFat}.`;

        // 3. Dinner Suggestion
        const dinnerTitle = `Hearty ${mainProtein} & Roasted ${mainVeg} Platter`;
        const dinnerDesc = `Pan-sear or bake ${mainProtein} paired with caramelized ${mainVeg} and a satisfying portion of ${mainCarb}.`;

        // 4. Snack Suggestion
        let snackTitle = 'Wholesome Afternoon Energy Bite';
        let snackDesc = '';
        if (fats.length > 0) {
            snackTitle = `Crunchy ${fats[0]} with Fresh ${vegs[0] || 'Fruit'}`;
            snackDesc = `A handful of ${fats[0]} paired with ${vegs[0] || 'fresh produce'} to prevent evening energy crashes.`;
        } else if (proteins.some(p => p.toLowerCase().includes('yogurt'))) {
            snackTitle = `Greek Yogurt Cup with ${carbs[0] || 'Seeds'}`;
            snackDesc = `Protein-packed yogurt topped with ${carbs[0] || 'nuts'} for a quick boost.`;
        } else {
            snackTitle = `Light ${mainVeg || mainCarb} Snack`;
            snackDesc = `Quick bite using available ${mainVeg || mainCarb} to keep hunger steady between meals.`;
        }

        return [
            { type: 'Breakfast', icon: '🌅', title: breakfastTitle, description: breakfastDesc },
            { type: 'Lunch', icon: '☀️', title: lunchTitle, description: lunchDesc },
            { type: 'Dinner', icon: '🌙', title: dinnerTitle, description: dinnerDesc },
            { type: 'Snack', icon: '🍎', title: snackTitle, description: snackDesc }
        ];
    }

    /* ==========================================================================
       5. DOM RENDERING FUNCTIONS
       ========================================================================== */
    function renderNutritionSummary(analysis) {
        document.getElementById('stat-calories').textContent = `${analysis.totalCalories} kcal`;
        document.getElementById('stat-protein').textContent = `${analysis.totalProtein}g`;
        document.getElementById('stat-carbs').textContent = `${analysis.totalCarbs}g`;
        document.getElementById('stat-fat').textContent = `${analysis.totalFat}g`;
    }

    function renderBalanceCheck(analysis) {
        const presentContainer = document.getElementById('balance-present-list');
        const missingContainer = document.getElementById('balance-missing-list');

        presentContainer.innerHTML = '';
        missingContainer.innerHTML = '';

        const groupDisplayNames = {
            protein: 'Protein',
            carbohydrates: 'Carbohydrates',
            healthy_fats: 'Healthy Fats',
            vegetables_fiber: 'Vegetables / Fiber'
        };

        // Render Present groups (✅)
        let hasPresent = false;
        for (const [key, items] of Object.entries(analysis.presentGroups)) {
            if (items.length > 0) {
                hasPresent = true;
                const li = document.createElement('li');
                li.className = 'balance-item present-item';
                li.innerHTML = `
                    <span class="icon">✅</span>
                    <div class="item-text">
                        <strong>${groupDisplayNames[key]}</strong>
                        <span class="item-ingredients">${items.join(', ')}</span>
                    </div>
                `;
                presentContainer.appendChild(li);
            }
        }

        if (!hasPresent) {
            presentContainer.innerHTML = '<li class="empty-hint">None identified yet.</li>';
        }

        // Render Missing or Low groups (⚠️)
        if (analysis.missingGroups.length === 0) {
            missingContainer.innerHTML = `
                <li class="balance-item all-good-item">
                    <span class="icon">🎉</span>
                    <div class="item-text">
                        <strong>All 4 Essential Groups Present!</strong>
                        <span class="item-ingredients">Your entered ingredients provide a complete nutritional foundation.</span>
                    </div>
                </li>
            `;
        } else {
            analysis.missingGroups.forEach(key => {
                const li = document.createElement('li');
                li.className = 'balance-item missing-item';
                li.innerHTML = `
                    <span class="icon">⚠️</span>
                    <div class="item-text">
                        <strong>${groupDisplayNames[key]}</strong>
                        <span class="item-ingredients">Missing or low in your entered ingredients</span>
                    </div>
                `;
                missingContainer.appendChild(li);
            });
        }
    }

    function renderRecommendations(analysis) {
        const recsBox = document.getElementById('recommendations-box');
        const recsList = document.getElementById('recommendations-list');
        const guidanceMsg = document.getElementById('user-guidance-msg');

        recsList.innerHTML = '';

        if (analysis.missingGroups.length === 0) {
            recsBox.classList.add('hidden');
            return;
        }

        recsBox.classList.remove('hidden');

        // Render recommendations for each missing group
        analysis.missingGroups.forEach(groupKey => {
            const info = MISSING_GROUP_RECOMMENDATIONS[groupKey];
            if (!info) return;

            const card = document.createElement('div');
            card.className = 'rec-card';
            card.innerHTML = `
                <h5 class="rec-title">${info.title}:</h5>
                <ul class="rec-chips">
                    ${info.suggestions.map(s => `<li>+ ${s}</li>`).join('')}
                </ul>
                <p class="rec-why">${info.why}</p>
            `;
            recsList.appendChild(card);
        });

        // Exact User Guidance required
        guidanceMsg.textContent = "This meal plan can still be followed, but adding the suggested ingredients would improve nutritional balance.";
    }

    function renderMealSuggestions(meals) {
        const container = document.getElementById('meals-grid');
        container.innerHTML = '';

        meals.forEach(meal => {
            const card = document.createElement('div');
            card.className = 'meal-card';
            card.innerHTML = `
                <div class="meal-badge">
                    <span>${meal.icon}</span> ${meal.type}
                </div>
                <h4 class="meal-title">${meal.title}</h4>
                <p class="meal-desc">${meal.description}</p>
            `;
            container.appendChild(card);
        });
    }

    /* ==========================================================================
       6. ERROR MESSAGE UTILITIES
       ========================================================================== */
    function showError(message) {
        errorMsg.textContent = message;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.textContent = '';
        errorMsg.classList.add('hidden');
    }

    /* ==========================================================================
       7. DEMO & QUERY PARAMETER SUPPORT
       ========================================================================== */
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '1') {
        ingredientsInput.value = 'chicken, rice';
        handleGenerate();
    } else if (params.get('demo') === 'complete') {
        ingredientsInput.value = 'chicken, brown rice, broccoli, avocado, eggs';
        handleGenerate();
    } else if (params.get('demo') === 'error') {
        ingredientsInput.value = '';
        handleGenerate();
    }
});
