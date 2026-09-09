/**
 * Balanced Diet Analyzer
 * Spoonacular API with Automatic Local Nutrition Fallback
 * 
 * Workflow:
 * 1. First attempts Spoonacular API to retrieve dynamic ingredient nutrition.
 * 2. If Spoonacular returns 401, 402, network error, or ingredient not found:
 *    Automatically falls back to local nutrition dataset (250+ ingredients).
 * 3. Never shows API errors unless both Spoonacular and local lookup fail.
 * 4. Always generates a diet analysis whenever at least one ingredient can be evaluated.
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

    // Display names for the 4 core nutrient groups
    const GROUP_NAMES = {
        'protein': 'Protein',
        'carbohydrates': 'Carbohydrates',
        'vegetables_fiber': 'Vegetables/Fiber',
        'healthy_fats': 'Healthy Fats'
    };

    // Standard recommendations for missing nutrient groups
    const RECOMMENDATIONS = (window.CONFIG && window.CONFIG.RECOMMENDATIONS) || {
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
            items: ['Eggs', 'Chicken', 'Paneer']
        },
        'carbohydrates': {
            label: 'Carbohydrates',
            items: ['Rice', 'Oats', 'Sweet Potato']
        }
    };

    // Event Listeners
    analyzeBtn.addEventListener('click', () => handleAnalyze(true));

    ingredientsInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAnalyze(true);
        }
    });

    ingredientsInput.addEventListener('input', () => {
        if (ingredientsInput.value.trim()) {
            hideError();
        }
    });

    /* ==========================================================================
       Main Analysis Function
       ========================================================================== */
    async function handleAnalyze(shouldScroll = false) {
        const rawText = ingredientsInput.value.trim();

        // Validation: Empty input check
        if (!rawText) {
            showError('Please enter at least one ingredient.');
            resultsSection.classList.add('hidden');
            ingredientsInput.focus();
            return;
        }

        hideError();

        // Parse ingredients list
        const items = parseInput(rawText);
        if (items.length === 0) {
            showError('Please enter at least one ingredient.');
            resultsSection.classList.add('hidden');
            return;
        }

        setLoading(true);

        try {
            const classified = {
                protein: [],
                carbohydrates: [],
                vegetables_fiber: [],
                healthy_fats: []
            };

            const notFoundItems = [];
            let analyzedCount = 0;

            // Analyze each ingredient with Spoonacular -> Local Fallback
            for (const item of items) {
                const nutrition = await getNutritionWithFallback(item);

                if (nutrition) {
                    // Dynamically classify into groups using nutrient thresholds
                    const groups = classifyNutrientGroups(nutrition);
                    groups.forEach(groupKey => {
                        if (!classified[groupKey].includes(nutrition.name)) {
                            classified[groupKey].push(nutrition.name);
                        }
                    });
                    analyzedCount++;
                } else {
                    notFoundItems.push(item);
                }
            }

            // Error & Status Handling:
            // "Do not show API errors to the user unless both API and local analysis fail."
            if (analyzedCount === 0) {
                if (notFoundItems.length > 0) {
                    showError(`Ingredient not found: ${notFoundItems.map(i => `"${i}"`).join(', ')}. Unable to analyze ingredient.`);
                } else {
                    showError('Unable to analyze ingredient.');
                }
                resultsSection.classList.add('hidden');
                return;
            } else if (notFoundItems.length > 0) {
                // If some items succeeded and some failed, notify gently without breaking analysis
                showError(`Ingredient not recognized: ${notFoundItems.map(i => `"${i}"`).join(', ')}. Analyzed available ingredients.`);
            } else {
                hideError();
            }

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

            // Diet Score Logic:
            // 4 groups = 100%, 3 groups = 75%, 2 groups = 50%, 1 group = 25%, 0 groups = 0%
            const scorePercentage = Math.round((foundGroups.length / 4) * 100);

            // Render Results
            renderResults(foundGroups, missingGroups, scorePercentage, classified);

            resultsSection.classList.remove('hidden');
            if (shouldScroll) {
                window.scrollTo({ top: resultsSection.offsetTop - 20, behavior: 'smooth' });
            }

        } catch (err) {
            console.error('Unexpected analysis failure:', err);
            showError('Unable to analyze ingredient.');
            resultsSection.classList.add('hidden');
        } finally {
            setLoading(false);
        }
    }

    /* ==========================================================================
       Nutrition Fetching with Seamless Automatic Local Fallback
       ========================================================================== */
    async function getNutritionWithFallback(ingredientName) {
        let nutrition = null;

        // 1. First attempt Spoonacular API
        try {
            nutrition = await fetchSpoonacularNutrition(ingredientName);
        } catch (apiErr) {
            // Spoonacular failed (401 unauthorized, 402 quota exceeded, network error, or ingredient not found)
            // Log for diagnostics, but do not show error to user — seamlessly fall back
            // console.warn(`Spoonacular unavailable for "${ingredientName}":`, apiErr.message);
            nutrition = null;
        }

        // 2. If Spoonacular was unavailable, failed, or returned nothing, look up in local dataset
        if (!nutrition) {
            nutrition = lookupLocalNutrition(ingredientName);
        }

        return nutrition;
    }

    /* ==========================================================================
       Spoonacular API Fetching
       ========================================================================== */
    async function fetchSpoonacularNutrition(ingredientName) {
        const apiKey = (window.CONFIG && window.CONFIG.SPOONACULAR_API_KEY) || '';
        const baseUrl = (window.CONFIG && window.CONFIG.API_BASE_URL) || 'https://api.spoonacular.com';

        if (!apiKey || apiKey === 'YOUR_SPOONACULAR_API_KEY') {
            throw new Error('API unavailable: No Spoonacular API key provided.');
        }

        // 1. Search for ingredient
        const searchUrl = `${baseUrl}/food/ingredients/search?query=${encodeURIComponent(ingredientName)}&number=1&apiKey=${apiKey}`;
        const searchRes = await fetch(searchUrl);

        if (searchRes.status === 401 || searchRes.status === 403) {
            throw new Error('API unavailable: Invalid or unauthorized Spoonacular API key.');
        }
        if (searchRes.status === 402) {
            throw new Error('API unavailable: Spoonacular daily API quota exceeded.');
        }
        if (!searchRes.ok) {
            throw new Error(`API unavailable: HTTP ${searchRes.status}`);
        }

        const searchData = await searchRes.json();
        if (!searchData.results || searchData.results.length === 0) {
            throw new Error(`Ingredient not found: "${ingredientName}"`);
        }

        const ingId = searchData.results[0].id;
        const matchedName = searchData.results[0].name || ingredientName;

        // 2. Fetch detailed nutrition (100g basis)
        const infoUrl = `${baseUrl}/food/ingredients/${ingId}/information?amount=100&unit=grams&apiKey=${apiKey}`;
        const infoRes = await fetch(infoUrl);

        if (infoRes.status === 401 || infoRes.status === 403) {
            throw new Error('API unavailable: Invalid or unauthorized Spoonacular API key.');
        }
        if (infoRes.status === 402) {
            throw new Error('API unavailable: Spoonacular daily API quota exceeded.');
        }
        if (!infoRes.ok) {
            throw new Error(`Unable to analyze ingredient: "${ingredientName}".`);
        }

        const infoData = await infoRes.json();
        const nutrients = infoData.nutrition?.nutrients || [];

        const getNutrientVal = (prop) => {
            const match = nutrients.find(n => n.name.toLowerCase().includes(prop.toLowerCase()));
            return match ? match.amount : 0;
        };

        const protein = getNutrientVal('protein');
        const carbohydrates = getNutrientVal('carbohydrate');
        const fat = getNutrientVal('fat');
        const fiber = getNutrientVal('fiber');

        const categoryPath = (infoData.categoryPath || []).map(c => c.toLowerCase());
        const isVegetable = categoryPath.some(c => 
            c.includes('vegetable') || c.includes('green') || c.includes('produce') || c.includes('fruit')
        );

        return {
            name: capitalize(matchedName),
            protein,
            carbohydrates,
            fat,
            fiber,
            isVegetable
        };
    }

    /* ==========================================================================
       Local Nutrition Lookup (250+ Ingredients)
       ========================================================================== */
    function lookupLocalNutrition(item) {
        const db = window.LOCAL_NUTRITION_DATABASE || {};
        const lower = item.trim().toLowerCase();

        // 1. Direct match
        if (db[lower]) {
            return db[lower];
        }

        // 2. Singular/plural match (e.g. "eggs" -> "egg", "carrots" -> "carrot")
        const singular = lower.endsWith('s') ? lower.slice(0, -1) : lower;
        if (db[singular]) {
            return db[singular];
        }
        const plural = lower + 's';
        if (db[plural]) {
            return db[plural];
        }

        // 3. Substring / partial match (sorted by length descending for specificity)
        const keys = Object.keys(db).sort((a, b) => b.length - a.length);
        for (const key of keys) {
            if (lower.includes(key) || key.includes(lower)) {
                return db[key];
            }
        }

        return null;
    }

    /* ==========================================================================
       Threshold-Based Dynamic Classification
       ========================================================================== */
    function classifyNutrientGroups(nutrition) {
        const thresholds = (window.CONFIG && window.CONFIG.THRESHOLDS) || {
            protein: 5.0,
            carbohydrates: 10.0,
            fat: 4.5,
            fiber: 2.0
        };

        const groups = [];

        // Dynamic threshold evaluation:
        // An ingredient may belong to multiple groups (e.g., Fish -> Protein + Fats, Chickpeas -> Protein + Carbs + Fiber)
        if (nutrition.protein >= thresholds.protein) {
            groups.push('protein');
        }

        if (nutrition.carbohydrates >= thresholds.carbohydrates) {
            groups.push('carbohydrates');
        }

        if (nutrition.fat >= thresholds.fat) {
            groups.push('healthy_fats');
        }

        if (nutrition.fiber >= thresholds.fiber || nutrition.isVegetable) {
            groups.push('vegetables_fiber');
        }

        return groups;
    }

    /* ==========================================================================
       Render Results
       ========================================================================== */
    function renderResults(foundGroups, missingGroups, scorePercentage, classified) {
        // 1. 100% Balanced Diet Achieved vs Partial
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

        // 2. Render Nutrient Groups Found (✓)
        groupsFoundList.innerHTML = '';
        foundGroups.forEach(groupKey => {
            const li = document.createElement('li');
            li.className = 'group-item found-item';
            const itemsText = classified[groupKey].join(', ');
            li.innerHTML = `<span class="check-icon">✓</span> <strong>${GROUP_NAMES[groupKey]}</strong> <span class="item-breakdown">(${itemsText})</span>`;
            groupsFoundList.appendChild(li);
        });

        // 3. Render Nutrient Groups Missing (⚠)
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
            const rec = RECOMMENDATIONS[groupKey];
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

    /* ==========================================================================
       Helpers & Utility Functions
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

    function capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    function setLoading(isLoading) {
        if (isLoading) {
            analyzeBtn.disabled = true;
            analyzeBtn.textContent = 'Analyzing...';
            analyzeBtn.style.opacity = '0.75';
            analyzeBtn.style.cursor = 'wait';
        } else {
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze';
            analyzeBtn.style.opacity = '1';
            analyzeBtn.style.cursor = 'pointer';
        }
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
       Deep Link & Automated Test URL Parameter Support
       ========================================================================== */
    const params = new URLSearchParams(window.location.search);
    if (params.get('input')) {
        ingredientsInput.value = params.get('input');
        handleAnalyze(false);
    }
});
