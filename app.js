/**
 * Balanced Diet Analyzer
 * Pure Spoonacular API Integration & Dynamic Nutrient Analysis
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

    // Standard fallback recommendations from config or defaults
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
       Main Analysis Handler (Spoonacular-Powered)
       ========================================================================== */
    async function handleAnalyze(shouldScroll = false) {
        const rawText = ingredientsInput.value.trim();

        // Validation: User entered nothing
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

        // Set Loading State
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

            // Check if visual demo mode is triggered via URL parameter for testing
            const urlParams = new URLSearchParams(window.location.search);
            const isDemo = urlParams.has('demo');

            for (const item of items) {
                try {
                    let nutrition;
                    if (isDemo) {
                        nutrition = getDemoNutrition(item);
                    } else {
                        nutrition = await fetchSpoonacularNutrition(item);
                    }

                    if (!nutrition) {
                        notFoundItems.push(item);
                        continue;
                    }

                    // Dynamically classify into groups using nutrient thresholds
                    const groups = classifyNutrientGroups(nutrition);
                    groups.forEach(groupKey => {
                        if (!classified[groupKey].includes(nutrition.name)) {
                            classified[groupKey].push(nutrition.name);
                        }
                    });

                    analyzedCount++;
                } catch (itemErr) {
                    if (itemErr.type === 'API_UNAVAILABLE') {
                        // Critical API failure (e.g. 401 unauthorized, 402 quota exceeded)
                        throw itemErr;
                    } else if (itemErr.type === 'NOT_FOUND') {
                        notFoundItems.push(item);
                    } else {
                        notFoundItems.push(item);
                    }
                }
            }

            // Handle ingredient not found errors
            if (analyzedCount === 0) {
                if (notFoundItems.length > 0) {
                    showError(`Ingredient not found: ${notFoundItems.map(i => `"${i}"`).join(', ')}. Unable to analyze ingredient.`);
                } else {
                    showError('Unable to analyze ingredient.');
                }
                resultsSection.classList.add('hidden');
                return;
            } else if (notFoundItems.length > 0) {
                showError(`Ingredient not found: ${notFoundItems.map(i => `"${i}"`).join(', ')}. Analyzed available ingredients.`);
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
            console.error('Analysis error:', err);
            if (err.type === 'API_UNAVAILABLE') {
                showError(err.message);
            } else {
                showError(err.message || 'API unavailable. Unable to analyze ingredient.');
            }
            resultsSection.classList.add('hidden');
        } finally {
            setLoading(false);
        }
    }

    /* ==========================================================================
       Spoonacular API Fetching
       ========================================================================== */
    async function fetchSpoonacularNutrition(ingredientName) {
        const apiKey = (window.CONFIG && window.CONFIG.SPOONACULAR_API_KEY) || '';
        const baseUrl = (window.CONFIG && window.CONFIG.API_BASE_URL) || 'https://api.spoonacular.com';

        if (!apiKey) {
            const err = new Error('API unavailable: Spoonacular API key is missing.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        // 1. Search for ingredient ID
        const searchUrl = `${baseUrl}/food/ingredients/search?query=${encodeURIComponent(ingredientName)}&number=1&apiKey=${apiKey}`;
        let searchRes;
        try {
            searchRes = await fetch(searchUrl);
        } catch (netErr) {
            const err = new Error('API unavailable: Network connection to Spoonacular failed.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        if (searchRes.status === 401 || searchRes.status === 403) {
            const err = new Error('API unavailable: Invalid or unauthorized Spoonacular API key.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        if (searchRes.status === 402) {
            const err = new Error('API unavailable: Spoonacular daily API quota exceeded.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        if (!searchRes.ok) {
            const err = new Error(`API unavailable: Spoonacular returned status ${searchRes.status}.`);
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        const searchData = await searchRes.json();
        if (!searchData.results || searchData.results.length === 0) {
            const err = new Error(`Ingredient not found: "${ingredientName}"`);
            err.type = 'NOT_FOUND';
            throw err;
        }

        const ingId = searchData.results[0].id;
        const matchedName = searchData.results[0].name || ingredientName;

        // 2. Fetch Detailed Nutrition Information for 100g / standard serving
        const infoUrl = `${baseUrl}/food/ingredients/${ingId}/information?amount=100&unit=grams&apiKey=${apiKey}`;
        let infoRes;
        try {
            infoRes = await fetch(infoUrl);
        } catch (netErr) {
            const err = new Error('API unavailable: Network connection to Spoonacular failed.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        if (infoRes.status === 401 || infoRes.status === 403) {
            const err = new Error('API unavailable: Invalid or unauthorized Spoonacular API key.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        if (infoRes.status === 402) {
            const err = new Error('API unavailable: Spoonacular daily API quota exceeded.');
            err.type = 'API_UNAVAILABLE';
            throw err;
        }

        if (!infoRes.ok) {
            const err = new Error(`Unable to analyze ingredient: "${ingredientName}".`);
            err.type = 'UNABLE_TO_ANALYZE';
            throw err;
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

        // An ingredient may qualify for multiple groups based on thresholds:
        // Fish -> Protein (>= 5g) + Healthy Fats (>= 4.5g)
        // Eggs -> Protein (>= 5g) + Healthy Fats (>= 4.5g)
        // Paneer -> Protein (>= 5g) + Healthy Fats (>= 4.5g)
        // Chickpeas -> Protein (>= 5g) + Carbohydrates (>= 10g)
        // Avocado -> Healthy Fats (>= 4.5g) + Fiber/Vegetables (>= 2g)
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
       Demo Nutrition Data (For automated headless verification & unit testing)
       ========================================================================== */
    function getDemoNutrition(item) {
        const lower = item.toLowerCase();
        // Dynamic nutritional values per 100g serving
        if (lower.includes('fish') || lower.includes('salmon')) {
            return { name: 'Fish', protein: 20.0, carbohydrates: 0.0, fat: 12.0, fiber: 0.0, isVegetable: false };
        }
        if (lower.includes('egg')) {
            return { name: 'Eggs', protein: 12.6, carbohydrates: 1.1, fat: 9.5, fiber: 0.0, isVegetable: false };
        }
        if (lower.includes('paneer')) {
            return { name: 'Paneer', protein: 18.0, carbohydrates: 3.5, fat: 20.0, fiber: 0.0, isVegetable: false };
        }
        if (lower.includes('chickpea') || lower.includes('chana') || lower.includes('garbanzo')) {
            return { name: 'Chickpeas', protein: 8.9, carbohydrates: 27.4, fat: 2.6, fiber: 7.6, isVegetable: false };
        }
        if (lower.includes('avocado')) {
            return { name: 'Avocado', protein: 2.0, carbohydrates: 8.5, fat: 14.7, fiber: 6.7, isVegetable: true };
        }
        if (lower.includes('chicken')) {
            return { name: 'Chicken', protein: 27.0, carbohydrates: 0.0, fat: 3.6, fiber: 0.0, isVegetable: false };
        }
        if (lower.includes('rice')) {
            return { name: 'Rice', protein: 2.7, carbohydrates: 28.2, fat: 0.3, fiber: 0.4, isVegetable: false };
        }
        if (lower.includes('spinach')) {
            return { name: 'Spinach', protein: 2.9, carbohydrates: 3.6, fat: 0.4, fiber: 2.4, isVegetable: true };
        }
        if (lower.includes('broccoli')) {
            return { name: 'Broccoli', protein: 2.8, carbohydrates: 6.6, fat: 0.4, fiber: 2.6, isVegetable: true };
        }
        if (lower.includes('carrot')) {
            return { name: 'Carrot', protein: 0.9, carbohydrates: 9.6, fat: 0.2, fiber: 2.8, isVegetable: true };
        }
        if (lower.includes('almond') || lower.includes('nut')) {
            return { name: 'Almonds', protein: 21.2, carbohydrates: 21.6, fat: 49.9, fiber: 12.5, isVegetable: false };
        }
        if (lower.includes('olive oil') || lower.includes('oil')) {
            return { name: 'Olive Oil', protein: 0.0, carbohydrates: 0.0, fat: 100.0, fiber: 0.0, isVegetable: false };
        }
        if (lower.includes('oat')) {
            return { name: 'Oats', protein: 16.9, carbohydrates: 66.3, fat: 6.9, fiber: 10.6, isVegetable: false };
        }
        if (lower.includes('unknown') || lower.includes('xyz')) {
            return null; // Triggers Ingredient not found
        }

        return { name: capitalize(item), protein: 0, carbohydrates: 0, fat: 0, fiber: 0, isVegetable: false };
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
       Visual Test & Demo Parameter Support
       ========================================================================== */
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === '50') {
        ingredientsInput.value = 'chicken, rice';
        handleAnalyze(false);
    } else if (params.get('demo') === '100') {
        ingredientsInput.value = 'chicken, rice, spinach, avocado';
        handleAnalyze(false);
    } else if (params.get('demo') === 'multi') {
        // Tests multi-group ingredients (fish, chickpeas)
        ingredientsInput.value = 'fish, chickpeas';
        handleAnalyze(false);
    } else if (params.get('demo') === 'error') {
        ingredientsInput.value = '';
        handleAnalyze(false);
    } else if (params.get('live') === 'chicken') {
        ingredientsInput.value = 'chicken';
        handleAnalyze(false);
    }
});
