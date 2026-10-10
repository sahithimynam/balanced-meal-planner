import { LOCAL_NUTRITION_DATABASE } from '../data/nutritionData';

export const GROUP_NAMES = {
    protein: 'Protein',
    carbohydrates: 'Carbohydrates',
    vegetables_fiber: 'Vegetables/Fiber',
    healthy_fats: 'Healthy Fats'
};

export const THRESHOLDS = {
    protein: 5.0,
    carbohydrates: 10.0,
    fat: 4.5,
    fiber: 2.0
};

export const RECOMMENDATIONS = {
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
};

export function parseInput(text) {
    if (!text) return [];
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

export function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

export function classifyNutrientGroups(nutrition) {
    const groups = [];
    if (nutrition.protein >= THRESHOLDS.protein) {
        groups.push('protein');
    }
    if (nutrition.carbohydrates >= THRESHOLDS.carbohydrates) {
        groups.push('carbohydrates');
    }
    if (nutrition.fat >= THRESHOLDS.fat) {
        groups.push('healthy_fats');
    }
    if (nutrition.fiber >= THRESHOLDS.fiber || nutrition.isVegetable) {
        groups.push('vegetables_fiber');
    }
    return groups;
}

export function lookupLocalNutrition(item) {
    const db = LOCAL_NUTRITION_DATABASE || {};
    const lower = item.trim().toLowerCase();

    // 1. Direct match
    if (db[lower]) {
        return db[lower];
    }

    // 2. Singular/plural match
    const singular = lower.endsWith('s') ? lower.slice(0, -1) : lower;
    if (db[singular]) {
        return db[singular];
    }
    const plural = lower + 's';
    if (db[plural]) {
        return db[plural];
    }

    // 3. Substring / partial match (sorted by length descending)
    const keys = Object.keys(db).sort((a, b) => b.length - a.length);
    for (const key of keys) {
        if (lower.includes(key) || key.includes(lower)) {
            return db[key];
        }
    }

    return null;
}

export async function fetchSpoonacularNutrition(ingredientName, apiKey = '') {
    if (!apiKey) {
        throw new Error('No Spoonacular API key provided');
    }

    const baseUrl = 'https://api.spoonacular.com';
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

export async function getNutritionWithFallback(ingredientName, apiKey = '') {
    let nutrition = null;
    if (apiKey) {
        try {
            nutrition = await fetchSpoonacularNutrition(ingredientName, apiKey);
        } catch (e) {
            nutrition = null;
        }
    }
    if (!nutrition) {
        nutrition = lookupLocalNutrition(ingredientName);
    }
    return nutrition;
}

export async function analyzeIngredientsList(rawText, apiKey = '') {
    const trimmed = (rawText || '').trim();
    if (!trimmed) {
        return { error: 'Please enter at least one ingredient.' };
    }

    const items = parseInput(trimmed);
    if (items.length === 0) {
        return { error: 'Please enter at least one ingredient.' };
    }

    const classified = {
        protein: [],
        carbohydrates: [],
        vegetables_fiber: [],
        healthy_fats: []
    };

    const notFoundItems = [];
    let analyzedCount = 0;

    for (const item of items) {
        const nutrition = await getNutritionWithFallback(item, apiKey);
        if (nutrition) {
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

    if (analyzedCount === 0) {
        if (notFoundItems.length > 0) {
            return {
                error: `Ingredient not found: ${notFoundItems.map(i => `"${i}"`).join(', ')}. Unable to analyze ingredient.`
            };
        }
        return { error: 'Unable to analyze ingredient.' };
    }

    const warning = notFoundItems.length > 0
        ? `Ingredient not recognized: ${notFoundItems.map(i => `"${i}"`).join(', ')}. Analyzed available ingredients.`
        : null;

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

    const scorePercentage = Math.round((foundGroups.length / 4) * 100);

    return {
        success: true,
        items,
        rawText: trimmed,
        foundGroups,
        missingGroups,
        scorePercentage,
        classified,
        warning
    };
}
