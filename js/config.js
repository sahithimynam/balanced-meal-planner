/**
 * NutriPlan - Configuration & Constants
 */

const CONFIG = {
    // Spoonacular API Base URL
    API_BASE_URL: 'https://api.spoonacular.com',
    
    // Default API key (Can be customized by user in settings modal)
    DEFAULT_API_KEY: '',
    
    // LocalStorage Keys
    STORAGE_KEYS: {
        THEME: 'nutriplan_theme',
        API_KEY: 'spoonacular_api_key',
        USE_DEMO_MODE: 'nutriplan_use_demo_mode',
        SAVED_PLAN: 'nutriplan_saved_plan',
        SAVED_INGREDIENTS: 'nutriplan_saved_ingredients',
    },
    
    // Recommended Daily Nutritional Targets (General Adult 2000 kcal reference)
    DAILY_TARGETS: {
        calories: 2000,
        protein: 100, // in grams
        carbs: 225,   // in grams
        fat: 65,      // in grams
    },
    
    // Quick Ingredient Suggestions for quick-add chips
    POPULAR_INGREDIENTS: [
        { name: 'Chicken Breast', category: 'protein', icon: '🍗' },
        { name: 'Eggs', category: 'protein', icon: '🥚' },
        { name: 'Salmon', category: 'protein', icon: '🐟' },
        { name: 'Tofu', category: 'protein', icon: '🧈' },
        { name: 'Brown Rice', category: 'carbohydrate', icon: '🍚' },
        { name: 'Oats', category: 'carbohydrate', icon: '🌾' },
        { name: 'Sweet Potato', category: 'carbohydrate', icon: '🍠' },
        { name: 'Quinoa', category: 'carbohydrate', icon: '🥣' },
        { name: 'Broccoli', category: 'vegetables', icon: '🥦' },
        { name: 'Spinach', category: 'vegetables', icon: '🥬' },
        { name: 'Tomatoes', category: 'vegetables', icon: '🍅' },
        { name: 'Avocado', category: 'healthy_fats', icon: '🥑' },
    ],
};

window.CONFIG = CONFIG;
