/**
 * NutriPlan - Spoonacular API Service
 * Handles live Spoonacular requests, status code verification, graceful error handling,
 * and automatic fallback to mock data when keys are missing or quotas are reached.
 */

const ApiService = {
    // Current connection status
    status: {
        isLive: false,
        lastError: null,
        usingFallback: false
    },

    // Retrieve active API key
    getKey() {
        return StorageService.getApiKey();
    },

    // Check if live API calls should be attempted
    shouldUseLiveApi() {
        const key = this.getKey();
        const demo = StorageService.isDemoMode();
        return Boolean(key && !demo);
    },

    // Helper: Safely handle fetch responses and detect Spoonacular errors
    async handleResponse(res, context = 'API Request') {
        if (!res.ok) {
            let errorMsg = `Request failed with status ${res.status}`;
            let errorDetails = null;
            try {
                errorDetails = await res.json();
                if (errorDetails && errorDetails.message) {
                    errorMsg = errorDetails.message;
                }
            } catch (e) {}

            const err = new Error(errorMsg);
            err.status = res.status;
            err.context = context;
            err.details = errorDetails;

            if (res.status === 401) {
                err.userMessage = "Invalid or unauthorized Spoonacular API Key (HTTP 401). Please update your key in Settings.";
            } else if (res.status === 402) {
                err.userMessage = "Spoonacular daily API quota exceeded (HTTP 402, 150 points reached). Switched to Demo Mode.";
            } else if (res.status === 429) {
                err.userMessage = "Too many requests to Spoonacular (HTTP 429). Rate limit reached; please slow down.";
            } else {
                err.userMessage = `Spoonacular API error (${res.status}): ${errorMsg}`;
            }

            throw err;
        }

        return await res.json();
    },

    // Validate an API Key with a lightweight test call
    async validateApiKey(testKey) {
        if (!testKey || !testKey.trim()) {
            return { valid: false, message: "Please provide an API key." };
        }

        const url = `${CONFIG.API_BASE_URL}/food/ingredients/search?query=apple&number=1&apiKey=${testKey.trim()}`;
        try {
            const res = await fetch(url);
            if (res.status === 200) {
                return { valid: true, message: "API key is valid and active!" };
            } else if (res.status === 401) {
                return { valid: false, message: "Invalid API key (401 Unauthorized)." };
            } else if (res.status === 402) {
                return { valid: false, message: "This API key has exceeded its daily point quota (402 Payment Required)." };
            } else {
                return { valid: false, message: `API responded with error code ${res.status}.` };
            }
        } catch (e) {
            return { valid: false, message: "Network error connecting to Spoonacular servers. Check your internet." };
        }
    },

    // Parse ingredients string into clean items, handling commas and spaces
    parseIngredients(input) {
        if (!input) return [];
        // Split on commas or newlines, or if no commas exist, split by spaces
        let rawList = [];
        if (input.includes(',') || input.includes('\n')) {
            rawList = input.split(/[,\n]+/);
        } else {
            rawList = input.split(/\s+/);
        }

        return rawList
            .map(item => item.trim().toLowerCase())
            .filter(item => item.length > 1);
    },

    // Analyze ingredients nutrition & diet balance
    async analyzeIngredients(inputString) {
        const ingredients = this.parseIngredients(inputString);
        if (ingredients.length === 0) {
            return {
                chart: { protein: [], carbohydrate: [], vegetables: [], healthy_fats: [] },
                totalEstimated: { calories: 0, protein: 0, carbs: 0, fat: 0 },
                ingredients: []
            };
        }

        const chart = {
            protein: [],
            carbohydrate: [],
            vegetables: [],
            healthy_fats: []
        };

        const totalEstimated = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const detailedItems = [];

        for (const item of ingredients) {
            let info = null;

            // Check mock data first for instant matching
            const mockInfo = MOCK_DATA.findIngredient(item);
            if (mockInfo) {
                info = mockInfo;
            } else if (this.shouldUseLiveApi()) {
                try {
                    const searchUrl = `${CONFIG.API_BASE_URL}/food/ingredients/search?query=${encodeURIComponent(item)}&number=1&apiKey=${this.getKey()}`;
                    const searchRes = await fetch(searchUrl);
                    const searchData = await this.handleResponse(searchRes, `Search ingredient: ${item}`);

                    if (searchData.results && searchData.results.length > 0) {
                        const ingId = searchData.results[0].id;
                        const infoUrl = `${CONFIG.API_BASE_URL}/food/ingredients/${ingId}/information?amount=100&unit=grams&apiKey=${this.getKey()}`;
                        const infoRes = await fetch(infoUrl);
                        const data = await this.handleResponse(infoRes, `Ingredient info: ${item}`);

                        const nutrients = data.nutrition?.nutrients || [];
                        const getNut = (name) => {
                            const found = nutrients.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
                            return found ? Math.round(found.amount) : 0;
                        };

                        const isVeg = data.categoryPath && data.categoryPath.some(c => c.toLowerCase().includes('vegetable'));
                        const prot = getNut('protein');
                        const carbs = getNut('carbohydrate');
                        const fat = getNut('fat');
                        const cals = getNut('calories');

                        let cat = 'vegetables';
                        if (prot >= 10 && prot >= carbs) cat = 'protein';
                        else if (carbs >= 15) cat = 'carbohydrate';
                        else if (fat >= 10) cat = 'healthy_fats';
                        else if (isVeg || prot < 5) cat = 'vegetables';

                        info = {
                            name: data.name || item,
                            category: cat,
                            calories: cals,
                            protein: prot,
                            carbs: carbs,
                            fat: fat,
                            isVegetable: isVeg
                        };
                    }
                } catch (err) {
                    console.warn(`Live ingredient lookup failed for "${item}", using heuristic fallback:`, err.message);
                }
            }

            // Fallback heuristic if API failed or no match found
            if (!info) {
                const lower = item.toLowerCase();
                let cat = 'carbohydrate';
                let cals = 120, prot = 4, carbs = 22, fat = 2;

                if (lower.match(/chicken|beef|meat|fish|salmon|egg|turkey|tofu|pork|tuna|shrimp|yogurt/)) {
                    cat = 'protein';
                    prot = 25; carbs = 1; fat = 6; cals = 160;
                } else if (lower.match(/spinach|broccoli|tomato|lettuce|cucumber|carrot|pepper|onion|kale|cabbage|zucchini/)) {
                    cat = 'vegetables';
                    prot = 2; carbs = 6; fat = 0.5; cals = 35;
                } else if (lower.match(/avocado|oil|nut|almond|walnut|seed|butter|cheese/)) {
                    cat = 'healthy_fats';
                    prot = 4; carbs = 6; fat = 15; cals = 175;
                }

                info = {
                    name: item,
                    category: cat,
                    calories: cals,
                    protein: prot,
                    carbs: carbs,
                    fat: fat,
                    isVegetable: cat === 'vegetables'
                };
            }

            chart[info.category].push(info.name);
            totalEstimated.calories += info.calories;
            totalEstimated.protein += info.protein;
            totalEstimated.carbs += info.carbs;
            totalEstimated.fat += info.fat;
            detailedItems.push(info);
        }

        return { chart, totalEstimated, detailedItems, ingredients };
    },

    // Recommend recipes based on ingredients
    async getRecipesByIngredients(ingredientsList) {
        if (!ingredientsList || ingredientsList.length === 0) {
            return MOCK_DATA.recipes.slice(0, 4);
        }

        if (this.shouldUseLiveApi()) {
            try {
                const queryStr = ingredientsList.join(',');
                const findUrl = `${CONFIG.API_BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(queryStr)}&number=6&ranking=1&ignorePantry=true&apiKey=${this.getKey()}`;
                
                const res = await fetch(findUrl);
                const recipesBasic = await this.handleResponse(res, 'Find Recipes by Ingredients');

                if (recipesBasic && recipesBasic.length > 0) {
                    const ids = recipesBasic.map(r => r.id).join(',');
                    const bulkUrl = `${CONFIG.API_BASE_URL}/recipes/informationBulk?ids=${ids}&includeNutrition=true&apiKey=${this.getKey()}`;
                    const bulkRes = await fetch(bulkUrl);
                    const bulkData = await this.handleResponse(bulkRes, 'Bulk Recipe Details');

                    this.status.isLive = true;
                    this.status.usingFallback = false;
                    return bulkData.map(r => this.normalizeRecipe(r));
                }
            } catch (err) {
                console.warn("Live recipe fetch error, falling back to mock data:", err);
                this.status.lastError = err;
                this.status.usingFallback = true;
                if (window.UI) {
                    UI.showToast(err.userMessage || "Switched to sample data.", "warning");
                }
            }
        }

        // Offline / Fallback
        return MOCK_DATA.filterByIngredients(ingredientsList);
    },

    // Search recipes by keyword, diet, meal type, maxCalories
    async searchRecipes({ query = '', type = '', diet = '', maxCalories = null }) {
        if (this.shouldUseLiveApi()) {
            try {
                let url = `${CONFIG.API_BASE_URL}/recipes/complexSearch?query=${encodeURIComponent(query)}&addRecipeInformation=true&addRecipeNutrition=true&number=8&apiKey=${this.getKey()}`;
                
                if (type && type !== 'all') url += `&type=${encodeURIComponent(type)}`;
                if (diet && diet !== 'all') url += `&diet=${encodeURIComponent(diet)}`;
                if (maxCalories) url += `&maxCalories=${maxCalories}`;

                const res = await fetch(url);
                const data = await this.handleResponse(res, 'Complex Recipe Search');

                if (data.results && data.results.length > 0) {
                    this.status.isLive = true;
                    this.status.usingFallback = false;
                    return data.results.map(r => this.normalizeRecipe(r));
                } else {
                    return [];
                }
            } catch (err) {
                console.warn("Live recipe search failed, falling back to mock data:", err);
                this.status.lastError = err;
                this.status.usingFallback = true;
                if (window.UI) {
                    UI.showToast(err.userMessage || "Switched to sample data.", "warning");
                }
            }
        }

        // Fallback to rich mock search
        return MOCK_DATA.searchRecipes({ query, type, diet, maxCalories });
    },

    // Normalize Spoonacular recipe data to consistent internal model
    normalizeRecipe(r) {
        const getNutrient = (name) => {
            const list = r.nutrition?.nutrients || [];
            const found = list.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
            return found ? Math.round(found.amount) : 0;
        };

        const instructionsList = [];
        if (r.analyzedInstructions && r.analyzedInstructions.length > 0) {
            r.analyzedInstructions[0].steps.forEach(s => instructionsList.push(s.step));
        } else if (r.instructions) {
            // Strip HTML tags and split sentences
            const clean = r.instructions.replace(/<\/?[^>]+(>|$)/g, "");
            instructionsList.push(...clean.split('. ').filter(s => s.trim().length > 5));
        }

        const ingredientsList = [];
        if (r.extendedIngredients) {
            r.extendedIngredients.forEach(ing => {
                ingredientsList.push(ing.original || ing.name);
            });
        }

        return {
            id: r.id,
            title: r.title,
            image: r.image || "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: r.readyInMinutes || 25,
            servings: r.servings || 2,
            dishTypes: r.dishTypes || ["main course"],
            diets: r.diets || [],
            sourceUrl: r.sourceUrl || `https://spoonacular.com/recipes/${r.id}`,
            summary: (r.summary || "").replace(/<\/?[^>]+(>|$)/g, "").slice(0, 180) + "...",
            instructions: instructionsList.length > 0 ? instructionsList : ["Follow standard recipe guidelines."],
            extendedIngredients: ingredientsList,
            usedIngredients: r.usedIngredients ? r.usedIngredients.map(i => i.name) : [],
            missedIngredients: r.missedIngredients ? r.missedIngredients.map(i => i.name) : [],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: getNutrient("calories"), unit: "kcal" },
                    { name: "Protein", amount: getNutrient("protein"), unit: "g" },
                    { name: "Carbohydrates", amount: getNutrient("carbohydrate"), unit: "g" },
                    { name: "Fat", amount: getNutrient("fat"), unit: "g" },
                    { name: "Fiber", amount: getNutrient("fiber"), unit: "g" }
                ]
            }
        };
    }
};

window.ApiService = ApiService;
