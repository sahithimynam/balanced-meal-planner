/**
 * Balanced Diet Analyzer - Configuration
 * Spoonacular API Settings and Nutrition Thresholds
 */

const CONFIG = {
    // Spoonacular API Key
    // Configure your API key here (https://spoonacular.com/food-api/console)
    SPOONACULAR_API_KEY: 'fca38ae0a6fb405980e83815c4b4be93',

    // Spoonacular API Base URL
    API_BASE_URL: 'https://api.spoonacular.com',

    // Nutrition Thresholds (in grams per 100g / serving)
    // Used to classify ingredients dynamically based on nutrition data
    THRESHOLDS: {
        protein: 5.0,         // >= 5.0g => Protein
        carbohydrates: 10.0,  // >= 10.0g => Carbohydrates
        fat: 4.5,             // >= 4.5g => Healthy Fats
        fiber: 2.0            // >= 2.0g => Vegetables/Fiber
    },

    // Standard Recommendations for missing nutrient groups
    RECOMMENDATIONS: {
        vegetables_fiber: {
            label: 'Vegetables/Fiber',
            items: ['Broccoli', 'Spinach', 'Carrot']
        },
        healthy_fats: {
            label: 'Healthy Fats',
            items: ['Avocado', 'Almonds', 'Olive Oil']
        },
        protein: {
            label: 'Protein',
            items: ['Eggs', 'Chicken', 'Paneer']
        },
        carbohydrates: {
            label: 'Carbohydrates',
            items: ['Rice', 'Oats', 'Sweet Potato']
        }
    }
};

window.CONFIG = CONFIG;
