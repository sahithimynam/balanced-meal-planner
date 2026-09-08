/**
 * NutriPlan - LocalStorage Management Module
 * Safely persists and restores themes, API credentials, and saved daily meal plans.
 */

const StorageService = {
    // Theme Management
    getTheme() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || 'light';
        } catch (e) {
            console.warn('LocalStorage error reading theme:', e);
            return 'light';
        }
    },

    setTheme(theme) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
            document.documentElement.setAttribute('data-theme', theme);
        } catch (e) {
            console.warn('LocalStorage error setting theme:', e);
        }
    },

    // Spoonacular API Key Management
    getApiKey() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.API_KEY) || CONFIG.DEFAULT_API_KEY || '';
        } catch (e) {
            console.warn('LocalStorage error reading API key:', e);
            return '';
        }
    },

    setApiKey(key) {
        try {
            const cleanKey = (key || '').trim();
            if (cleanKey) {
                localStorage.setItem(CONFIG.STORAGE_KEYS.API_KEY, cleanKey);
            } else {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.API_KEY);
            }
        } catch (e) {
            console.warn('LocalStorage error setting API key:', e);
        }
    },

    // Demo Mode Preference
    isDemoMode() {
        try {
            const val = localStorage.getItem(CONFIG.STORAGE_KEYS.USE_DEMO_MODE);
            // If no API key is present, default to Demo Mode (true)
            if (val === null) {
                return !this.getApiKey();
            }
            return val === 'true';
        } catch (e) {
            return true;
        }
    },

    setDemoMode(isDemo) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.USE_DEMO_MODE, isDemo ? 'true' : 'false');
        } catch (e) {
            console.warn('LocalStorage error setting demo mode:', e);
        }
    },

    // Saved Meal Plan
    getPlan() {
        try {
            const data = localStorage.getItem(CONFIG.STORAGE_KEYS.SAVED_PLAN);
            if (!data) return { breakfast: [], lunch: [], dinner: [], snack: [] };
            const parsed = JSON.parse(data);
            return {
                breakfast: parsed.breakfast || [],
                lunch: parsed.lunch || [],
                dinner: parsed.dinner || [],
                snack: parsed.snack || []
            };
        } catch (e) {
            console.warn('LocalStorage error reading plan:', e);
            return { breakfast: [], lunch: [], dinner: [], snack: [] };
        }
    },

    savePlan(plan) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SAVED_PLAN, JSON.stringify(plan));
        } catch (e) {
            console.warn('LocalStorage error saving plan:', e);
        }
    },

    addRecipeToPlan(recipe, slot = 'lunch') {
        const plan = this.getPlan();
        const validSlot = ['breakfast', 'lunch', 'dinner', 'snack'].includes(slot) ? slot : 'lunch';
        
        // Check if already in this slot
        const exists = plan[validSlot].some(item => item.id === recipe.id);
        if (!exists) {
            plan[validSlot].push(recipe);
            this.savePlan(plan);
            return true;
        }
        return false;
    },

    removeRecipeFromPlan(recipeId, slot) {
        const plan = this.getPlan();
        if (slot && plan[slot]) {
            plan[slot] = plan[slot].filter(item => item.id !== recipeId);
        } else {
            for (const key of ['breakfast', 'lunch', 'dinner', 'snack']) {
                plan[key] = plan[key].filter(item => item.id !== recipeId);
            }
        }
        this.savePlan(plan);
        return plan;
    },

    clearPlan() {
        const emptyPlan = { breakfast: [], lunch: [], dinner: [], snack: [] };
        this.savePlan(emptyPlan);
        return emptyPlan;
    },

    // Saved Ingredients Input
    getSavedIngredients() {
        try {
            return localStorage.getItem(CONFIG.STORAGE_KEYS.SAVED_INGREDIENTS) || '';
        } catch (e) {
            return '';
        }
    },

    saveIngredients(text) {
        try {
            localStorage.setItem(CONFIG.STORAGE_KEYS.SAVED_INGREDIENTS, text);
        } catch (e) {}
    }
};

window.StorageService = StorageService;
