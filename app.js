/**
 * Balanced Diet Analyzer
 * Clean, lightweight vanilla JavaScript application.
 * 
 * Analyzes entered ingredients, classifies them into the 4 core nutrient groups,
 * calculates the Diet Score, and provides targeted recommendations.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const ingredientsInput = document.getElementById('ingredients-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const errorMsg = document.getElementById('error-msg');
    const resultsSection = document.getElementById('results-section');

    // Result Containers
    const successBanner = document.getElementById('success-banner');
    const partialScoreBox = document.getElementById('partial-score-box');
    const scoreVal = document.getElementById('score-val');
    const groupsFoundList = document.getElementById('groups-found-list');
    const groupsMissingSection = document.getElementById('groups-missing-section');
    const groupsMissingList = document.getElementById('groups-missing-list');
    const recommendationsSection = document.getElementById('recommendations-section');
    const recommendationsList = document.getElementById('recommendations-list');

    // 4 Core Nutrient Groups Database
    const INGREDIENT_DATABASE = {
        // Protein
        'chicken': { name: 'Chicken', group: 'protein' },
        'chicken breast': { name: 'Chicken Breast', group: 'protein' },
        'eggs': { name: 'Eggs', group: 'protein' },
        'egg': { name: 'Egg', group: 'protein' },
        'salmon': { name: 'Salmon', group: 'protein' },
        'fish': { name: 'Fish', group: 'protein' },
        'tofu': { name: 'Tofu', group: 'protein' },
        'turkey': { name: 'Turkey', group: 'protein' },
        'tuna': { name: 'Tuna', group: 'protein' },
        'paneer': { name: 'Paneer', group: 'protein' },
        'lentils': { name: 'Lentils', group: 'protein' },
        'dal': { name: 'Dal', group: 'protein' },
        'chickpeas': { name: 'Chickpeas', group: 'protein' },
        'beans': { name: 'Beans', group: 'protein' },
        'beef': { name: 'Beef', group: 'protein' },
        'shrimp': { name: 'Shrimp', group: 'protein' },
        'yogurt': { name: 'Yogurt', group: 'protein' },
        'greek yogurt': { name: 'Greek Yogurt', group: 'protein' },

        // Carbohydrates
        'rice': { name: 'Rice', group: 'carbohydrates' },
        'brown rice': { name: 'Brown Rice', group: 'carbohydrates' },
        'white rice': { name: 'White Rice', group: 'carbohydrates' },
        'oats': { name: 'Oats', group: 'carbohydrates' },
        'oatmeal': { name: 'Oatmeal', group: 'carbohydrates' },
        'bread': { name: 'Bread', group: 'carbohydrates' },
        'potato': { name: 'Potato', group: 'carbohydrates' },
        'potatoes': { name: 'Potatoes', group: 'carbohydrates' },
        'sweet potato': { name: 'Sweet Potato', group: 'carbohydrates' },
        'sweet potatoes': { name: 'Sweet Potatoes', group: 'carbohydrates' },
        'pasta': { name: 'Pasta', group: 'carbohydrates' },
        'quinoa': { name: 'Quinoa', group: 'carbohydrates' },
        'roti': { name: 'Roti', group: 'carbohydrates' },
        'chapati': { name: 'Chapati', group: 'carbohydrates' },
        'noodles': { name: 'Noodles', group: 'carbohydrates' },
        'corn': { name: 'Corn', group: 'carbohydrates' },

        // Vegetables / Fiber
        'broccoli': { name: 'Broccoli', group: 'vegetables_fiber' },
        'spinach': { name: 'Spinach', group: 'vegetables_fiber' },
        'carrot': { name: 'Carrot', group: 'vegetables_fiber' },
        'carrots': { name: 'Carrots', group: 'vegetables_fiber' },
        'tomatoes': { name: 'Tomatoes', group: 'vegetables_fiber' },
        'tomato': { name: 'Tomato', group: 'vegetables_fiber' },
        'cucumber': { name: 'Cucumber', group: 'vegetables_fiber' },
        'bell pepper': { name: 'Bell Pepper', group: 'vegetables_fiber' },
        'peppers': { name: 'Peppers', group: 'vegetables_fiber' },
        'onion': { name: 'Onion', group: 'vegetables_fiber' },
        'onions': { name: 'Onions', group: 'vegetables_fiber' },
        'garlic': { name: 'Garlic', group: 'vegetables_fiber' },
        'mushrooms': { name: 'Mushrooms', group: 'vegetables_fiber' },
        'cabbage': { name: 'Cabbage', group: 'vegetables_fiber' },
        'lettuce': { name: 'Lettuce', group: 'vegetables_fiber' },
        'cauliflower': { name: 'Cauliflower', group: 'vegetables_fiber' },
        'peas': { name: 'Peas', group: 'vegetables_fiber' },
        'apple': { name: 'Apple', group: 'vegetables_fiber' },
        'banana': { name: 'Banana', group: 'vegetables_fiber' },
        'berries': { name: 'Berries', group: 'vegetables_fiber' },

        // Healthy Fats
        'avocado': { name: 'Avocado', group: 'healthy_fats' },
        'almonds': { name: 'Almonds', group: 'healthy_fats' },
        'olive oil': { name: 'Olive Oil', group: 'healthy_fats' },
        'oil': { name: 'Oil', group: 'healthy_fats' },
        'nuts': { name: 'Nuts', group: 'healthy_fats' },
        'walnuts': { name: 'Walnuts', group: 'healthy_fats' },
        'chia seeds': { name: 'Chia Seeds', group: 'healthy_fats' },
        'seeds': { name: 'Seeds', group: 'healthy_fats' },
        'peanut butter': { name: 'Peanut Butter', group: 'healthy_fats' },
        'peanuts': { name: 'Peanuts', group: 'healthy_fats' },
        'cheese': { name: 'Cheese', group: 'healthy_fats' }
    };

    // Recommendations for missing groups
    const GROUP_RECOMMENDATIONS = {
        'vegetables_fiber': {
            label: 'Vegetables/Fiber',
            items: ['Broccoli', 'Spinach', 'Carrot']
        },
        'healthy_fats': {
            label: 'Healthy Fats',
            items: ['Avocado', 'Almonds', 'Olive Oil']
        },
        'protein': {
            label: 'Protein',
            items: ['Chicken Breast', 'Eggs', 'Tofu']
        },
        'carbohydrates': {
            label: 'Carbohydrates',
            items: ['Brown Rice', 'Oats', 'Sweet Potato']
        }
    };

    const GROUP_NAMES = {
        'protein': 'Protein',
        'carbohydrates': 'Carbohydrates',
        'vegetables_fiber': 'Vegetables/Fiber',
        'healthy_fats': 'Healthy Fats'
    };

    // Event Listeners
    analyzeBtn.addEventListener('click', () => handleAnalyze(true));

    ingredientsInput.addEventListener('input', () => {
        if (ingredientsInput.value.trim()) {
            hideError();
        }
    });

    /* ==========================================================================
       Main Analysis Function
       ========================================================================== */
    function handleAnalyze(shouldScroll = false) {
        const rawText = ingredientsInput.value.trim();

        // Validate: Error ONLY when no ingredients are entered
        if (!rawText) {
            showError('Please enter at least one ingredient.');
            resultsSection.classList.add('hidden');
            ingredientsInput.focus();
            return;
        }

        hideError();

        // Parse ingredients
        const items = parseInput(rawText);
        if (items.length === 0) {
            showError('Please enter at least one ingredient.');
            resultsSection.classList.add('hidden');
            return;
        }

        // Classify ingredients into groups
        const classified = {
            protein: [],
            carbohydrates: [],
            vegetables_fiber: [],
            healthy_fats: []
        };

        items.forEach(rawItem => {
            const match = findGroup(rawItem);
            classified[match.group].push(match.name);
        });

        // Determine Found vs Missing groups
        const foundGroups = [];
        const missingGroups = [];

        const order = ['protein', 'carbohydrates', 'healthy_fats', 'vegetables_fiber'];
        order.forEach(groupKey => {
            if (classified[groupKey].length > 0) {
                foundGroups.push(groupKey);
            } else {
                missingGroups.push(groupKey);
            }
        });

        // Calculate Diet Score (percentage of the 4 groups present)
        const scorePercentage = Math.round((foundGroups.length / 4) * 100);

        // Render Results
        renderResults(foundGroups, missingGroups, scorePercentage, classified);

        resultsSection.classList.remove('hidden');
        if (shouldScroll) {
            window.scrollTo({ top: resultsSection.offsetTop - 20, behavior: 'smooth' });
        }
    }

    /* ==========================================================================
       Input Parser & Classification
       ========================================================================== */
    function parseInput(text) {
        let list = [];
        if (text.includes(',') || text.includes('\n')) {
            list = text.split(/[,\n]+/);
        } else {
            list = text.split(/\s+/);
        }

        return list
            .map(s => s.trim().toLowerCase())
            .filter(s => s.length > 1);
    }

    function findGroup(item) {
        // Direct database check
        if (INGREDIENT_DATABASE[item]) {
            return INGREDIENT_DATABASE[item];
        }

        // Partial match
        const foundKey = Object.keys(INGREDIENT_DATABASE).find(k => item.includes(k) || k.includes(item));
        if (foundKey) {
            return INGREDIENT_DATABASE[foundKey];
        }

        // Heuristic fallback
        const lower = item.toLowerCase();
        let group = 'vegetables_fiber';
        if (lower.match(/chicken|meat|fish|egg|turkey|tofu|paneer|pork|beef|tuna|shrimp|salmon|dal|lentil|bean/)) {
            group = 'protein';
        } else if (lower.match(/rice|oat|bread|potato|pasta|roti|chapati|noodle|quinoa|grain|wheat|corn/)) {
            group = 'carbohydrates';
        } else if (lower.match(/avocado|oil|nut|almond|walnut|peanut|seed|butter|cheese|fat/)) {
            group = 'healthy_fats';
        }

        const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
        return { name: capitalized, group };
    }

    /* ==========================================================================
       Render Results
       ========================================================================== */
    function renderResults(foundGroups, missingGroups, scorePercentage, classified) {
        // 1. Check if all 4 groups are present (100% Balanced Diet Achieved)
        if (foundGroups.length === 4) {
            successBanner.classList.remove('hidden');
            partialScoreBox.classList.add('hidden');
            groupsMissingSection.classList.add('hidden');
            recommendationsSection.classList.add('hidden');
        } else {
            successBanner.classList.add('hidden');
            partialScoreBox.classList.remove('hidden');
            scoreVal.textContent = `${scorePercentage}% Balanced`;
            groupsMissingSection.classList.remove('hidden');
            recommendationsSection.classList.remove('hidden');
        }

        // 2. Render Present Nutrients (✓)
        groupsFoundList.innerHTML = '';
        foundGroups.forEach(groupKey => {
            const li = document.createElement('li');
            li.className = 'group-item found-item';
            li.innerHTML = `<span class="check-icon">✓</span> <strong>${GROUP_NAMES[groupKey]}</strong> <span class="item-breakdown">(${classified[groupKey].join(', ')})</span>`;
            groupsFoundList.appendChild(li);
        });

        // 3. Render Missing Nutrients (⚠)
        groupsMissingList.innerHTML = '';
        missingGroups.forEach(groupKey => {
            const li = document.createElement('li');
            li.className = 'group-item missing-item';
            li.innerHTML = `<span class="warn-icon">⚠</span> <strong>${GROUP_NAMES[groupKey]}</strong>`;
            groupsMissingList.appendChild(li);
        });

        // 4. Render Recommendations
        recommendationsList.innerHTML = '';
        missingGroups.forEach(groupKey => {
            const rec = GROUP_RECOMMENDATIONS[groupKey];
            if (rec) {
                const block = document.createElement('div');
                block.className = 'rec-group';
                block.innerHTML = `
                    <h4 class="rec-group-title">${rec.label}:</h4>
                    <ul class="rec-items-list">
                        ${rec.items.map(item => `<li>- ${item}</li>`).join('')}
                    </ul>
                `;
                recommendationsList.appendChild(block);
            }
        });
    }

    function showError(msg) {
        errorMsg.textContent = msg;
        errorMsg.classList.remove('hidden');
    }

    function hideError() {
        errorMsg.textContent = '';
        errorMsg.classList.add('hidden');
    }

    /* ==========================================================================
       Visual Test & Demo Parameter Support
       ========================================================================== */
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '50') {
        ingredientsInput.value = 'chicken, rice';
        handleAnalyze();
    } else if (params.get('demo') === '100') {
        ingredientsInput.value = 'chicken, rice, spinach, avocado';
        handleAnalyze();
    } else if (params.get('demo') === 'error') {
        ingredientsInput.value = '';
        handleAnalyze();
    }
});
