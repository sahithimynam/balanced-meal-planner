/**
 * NutriPlan - Mock & Fallback Dataset
 * Realistic Spoonacular-format data for offline demo mode, quota fallback, and instant testing.
 */

const MOCK_DATA = {
    // Ingredient categorization and nutritional information
    ingredients: {
        'chicken': { name: 'Chicken Breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, isVegetable: false },
        'chicken breast': { name: 'Chicken Breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, isVegetable: false },
        'eggs': { name: 'Whole Eggs', category: 'protein', calories: 143, protein: 13, carbs: 0.7, fat: 9.5, isVegetable: false },
        'egg': { name: 'Egg', category: 'protein', calories: 72, protein: 6, carbs: 0.4, fat: 5, isVegetable: false },
        'salmon': { name: 'Wild Atlantic Salmon', category: 'protein', calories: 208, protein: 22, carbs: 0, fat: 13, isVegetable: false },
        'tofu': { name: 'Firm Tofu', category: 'protein', calories: 144, protein: 17, carbs: 3, fat: 8, isVegetable: false },
        'turkey': { name: 'Ground Turkey Breast', category: 'protein', calories: 140, protein: 28, carbs: 0, fat: 2.5, isVegetable: false },
        'tuna': { name: 'Canned Tuna in Water', category: 'protein', calories: 132, protein: 29, carbs: 0, fat: 1, isVegetable: false },
        'greek yogurt': { name: 'Plain Greek Yogurt', category: 'protein', calories: 100, protein: 17, carbs: 6, fat: 0.7, isVegetable: false },
        'lentils': { name: 'Cooked Brown Lentils', category: 'protein', calories: 230, protein: 18, carbs: 40, fat: 0.8, isVegetable: false },
        'chickpeas': { name: 'Boiled Chickpeas', category: 'carbohydrate', calories: 269, protein: 14.5, carbs: 45, fat: 4.2, isVegetable: false },
        'beef': { name: 'Lean Ground Beef', category: 'protein', calories: 250, protein: 26, carbs: 0, fat: 15, isVegetable: false },

        'rice': { name: 'Brown Rice', category: 'carbohydrate', calories: 216, protein: 5, carbs: 45, fat: 1.8, isVegetable: false },
        'brown rice': { name: 'Brown Rice', category: 'carbohydrate', calories: 216, protein: 5, carbs: 45, fat: 1.8, isVegetable: false },
        'white rice': { name: 'Jasmine White Rice', category: 'carbohydrate', calories: 205, protein: 4.2, carbs: 45, fat: 0.4, isVegetable: false },
        'oats': { name: 'Rolled Whole Oats', category: 'carbohydrate', calories: 389, protein: 16.9, carbs: 66, fat: 6.9, isVegetable: false },
        'quinoa': { name: 'Cooked Quinoa', category: 'carbohydrate', calories: 222, protein: 8.1, carbs: 39, fat: 3.5, isVegetable: false },
        'sweet potato': { name: 'Baked Sweet Potato', category: 'carbohydrate', calories: 103, protein: 2.3, carbs: 24, fat: 0.2, isVegetable: false },
        'potato': { name: 'Russet Potato', category: 'carbohydrate', calories: 164, protein: 4.3, carbs: 37, fat: 0.2, isVegetable: false },
        'pasta': { name: 'Whole Wheat Pasta', category: 'carbohydrate', calories: 174, protein: 7.5, carbs: 37, fat: 0.8, isVegetable: false },
        'bread': { name: 'Whole Grain Sourdough', category: 'carbohydrate', calories: 160, protein: 8, carbs: 32, fat: 1.5, isVegetable: false },

        'spinach': { name: 'Fresh Baby Spinach', category: 'vegetables', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, isVegetable: true },
        'broccoli': { name: 'Steamed Broccoli Florets', category: 'vegetables', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, isVegetable: true },
        'tomatoes': { name: 'Ripe Vine Tomatoes', category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, isVegetable: true },
        'tomato': { name: 'Ripe Vine Tomato', category: 'vegetables', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, isVegetable: true },
        'bell pepper': { name: 'Red Bell Pepper', category: 'vegetables', calories: 31, protein: 1, carbs: 6, fat: 0.3, isVegetable: true },
        'peppers': { name: 'Mixed Bell Peppers', category: 'vegetables', calories: 31, protein: 1, carbs: 6, fat: 0.3, isVegetable: true },
        'carrots': { name: 'Carrots', category: 'vegetables', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, isVegetable: true },
        'cucumber': { name: 'Crisp Cucumber', category: 'vegetables', calories: 15, protein: 0.7, carbs: 3.6, fat: 0.1, isVegetable: true },
        'kale': { name: 'Tuscan Curly Kale', category: 'vegetables', calories: 49, protein: 4.3, carbs: 8.8, fat: 0.9, isVegetable: true },
        'asparagus': { name: 'Tender Green Asparagus', category: 'vegetables', calories: 20, protein: 2.2, carbs: 3.9, fat: 0.1, isVegetable: true },
        'zucchini': { name: 'Fresh Green Zucchini', category: 'vegetables', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, isVegetable: true },
        'cauliflower': { name: 'Cauliflower Florets', category: 'vegetables', calories: 25, protein: 1.9, carbs: 5, fat: 0.3, isVegetable: true },

        'avocado': { name: 'Hass Avocado', category: 'healthy_fats', calories: 160, protein: 2, carbs: 8.5, fat: 14.7, isVegetable: false },
        'olive oil': { name: 'Extra Virgin Olive Oil', category: 'healthy_fats', calories: 119, protein: 0, carbs: 0, fat: 13.5, isVegetable: false },
        'almonds': { name: 'Raw Almonds', category: 'healthy_fats', calories: 164, protein: 6, carbs: 6, fat: 14, isVegetable: false },
        'chia seeds': { name: 'Organic Chia Seeds', category: 'healthy_fats', calories: 138, protein: 4.7, carbs: 12, fat: 8.7, isVegetable: false },
    },

    // Curated rich recipe database
    recipes: [
        {
            id: 101,
            title: "Herb-Grilled Chicken with Brown Rice & Steamed Broccoli",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 25,
            servings: 2,
            dishTypes: ["lunch", "dinner", "main course"],
            diets: ["high-protein", "balanced", "gluten-free"],
            usedIngredients: ["chicken", "brown rice", "broccoli"],
            missedIngredients: ["olive oil", "garlic", "lemon"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 485, unit: "kcal" },
                    { name: "Protein", amount: 44, unit: "g" },
                    { name: "Carbohydrates", amount: 42, unit: "g" },
                    { name: "Fat", amount: 12, unit: "g" },
                    { name: "Fiber", amount: 6, unit: "g" }
                ]
            },
            summary: "A wholesome, nutrient-dense meal featuring lean chicken breast seasoned with herbs, nutty brown rice, and crisp tender steamed broccoli.",
            instructions: [
                "Season chicken breasts with sea salt, cracked black pepper, dried oregano, and a splash of olive oil.",
                "Grill or pan-sear chicken over medium-high heat for 6-7 minutes per side until internal temperature reaches 165°F (74°C).",
                "Simmer brown rice with a pinch of salt until tender (approx. 25-30 min) or warm pre-cooked rice.",
                "Steam fresh broccoli florets in a basket over boiling water for 4 minutes until vibrant green and tender-crisp.",
                "Plate the sliced grilled chicken alongside warm brown rice and steamed broccoli. Finish with fresh lemon wedges."
            ]
        },
        {
            id: 102,
            title: "Mediterranean Shakshuka with Spinach & Feta Eggs",
            image: "https://images.unsplash.com/photo-1590412200988-a436970781fa?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 20,
            servings: 2,
            dishTypes: ["breakfast", "lunch", "dinner"],
            diets: ["vegetarian", "low-carb", "balanced"],
            usedIngredients: ["eggs", "tomatoes", "spinach"],
            missedIngredients: ["bell pepper", "onion", "feta cheese", "cumin"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 320, unit: "kcal" },
                    { name: "Protein", amount: 21, unit: "g" },
                    { name: "Carbohydrates", amount: 16, unit: "g" },
                    { name: "Fat", amount: 18, unit: "g" },
                    { name: "Fiber", amount: 4.5, unit: "g" }
                ]
            },
            summary: "Poached pasture-raised eggs nestled in a savory tomato and tender spinach sauce seasoned with smoky cumin and topped with crumbled cheese.",
            instructions: [
                "Sauté diced onions, bell pepper, and garlic in olive oil until soft and aromatic.",
                "Add crushed ripe tomatoes, cumin, paprika, and salt. Simmer gently for 8 minutes to thicken.",
                "Fold in fresh baby spinach until wilted into the rich tomato sauce.",
                "Make 4 small wells in the sauce and crack fresh eggs directly into them.",
                "Cover with a lid and cook on low for 5-6 minutes until whites are set and yolks are silky runny.",
                "Garnish with crumbled feta cheese and fresh cilantro or parsley."
            ]
        },
        {
            id: 103,
            title: "Pan-Seared Crispy Salmon with Quinoa & Avocado Bowl",
            image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 22,
            servings: 2,
            dishTypes: ["lunch", "dinner", "salad"],
            diets: ["high-protein", "pescatarian", "gluten-free", "balanced"],
            usedIngredients: ["salmon", "quinoa", "avocado"],
            missedIngredients: ["cucumber", "cherry tomatoes", "olive oil"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 540, unit: "kcal" },
                    { name: "Protein", amount: 38, unit: "g" },
                    { name: "Carbohydrates", amount: 36, unit: "g" },
                    { name: "Fat", amount: 26, unit: "g" },
                    { name: "Fiber", amount: 8, unit: "g" }
                ]
            },
            summary: "Rich in heart-healthy Omega-3 fatty acids, this power bowl pairs crispy skin salmon fillets with fluffy quinoa, creamy avocado, and fresh veggies.",
            instructions: [
                "Rinse quinoa and cook in water or vegetable broth (1:2 ratio) for 15 minutes until light and fluffy.",
                "Pat salmon fillets completely dry with paper towels. Season generously with salt and pepper.",
                "Heat a non-stick skillet over medium-high with a teaspoon of avocado or olive oil.",
                "Place salmon skin-side down and press gently; sear for 4-5 minutes until skin is golden and crispy, then flip for 2-3 minutes.",
                "Arrange warm quinoa, diced ripe avocado, crisp cucumbers, and salmon in shallow bowls.",
                "Drizzle with lemon juice and a light sesame or herb vinaigrette."
            ]
        },
        {
            id: 104,
            title: "Overnight Oats with Chia, Greek Yogurt & Berries",
            image: "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 5,
            servings: 1,
            dishTypes: ["breakfast", "snack"],
            diets: ["vegetarian", "high-protein", "balanced"],
            usedIngredients: ["oats", "greek yogurt"],
            missedIngredients: ["chia seeds", "almond milk", "honey", "berries"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 360, unit: "kcal" },
                    { name: "Protein", amount: 24, unit: "g" },
                    { name: "Carbohydrates", amount: 48, unit: "g" },
                    { name: "Fat", amount: 7, unit: "g" },
                    { name: "Fiber", amount: 9, unit: "g" }
                ]
            },
            summary: "A high-fiber, gut-friendly breakfast combining hearty rolled oats, protein-rich Greek yogurt, chia seeds, and natural berries.",
            instructions: [
                "In a glass mason jar or bowl, combine rolled oats, chia seeds, and a pinch of cinnamon.",
                "Stir in unsweetened almond milk and thick Greek yogurt until thoroughly combined.",
                "Add a teaspoon of pure maple syrup or raw honey for subtle sweetness.",
                "Seal and refrigerate overnight (or at least 4 hours) to allow oats to soak and soften.",
                "Top with fresh blueberries, sliced strawberries, and crushed walnuts before serving."
            ]
        },
        {
            id: 105,
            title: "Crispy Sesame Tofu Stir-Fry with Broccoli & Rice",
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 25,
            servings: 2,
            dishTypes: ["lunch", "dinner", "main course"],
            diets: ["vegan", "vegetarian", "high-protein", "balanced"],
            usedIngredients: ["tofu", "broccoli", "rice"],
            missedIngredients: ["soy sauce", "sesame oil", "ginger", "garlic"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 410, unit: "kcal" },
                    { name: "Protein", amount: 22, unit: "g" },
                    { name: "Carbohydrates", amount: 52, unit: "g" },
                    { name: "Fat", amount: 13, unit: "g" },
                    { name: "Fiber", amount: 7, unit: "g" }
                ]
            },
            summary: "Golden pan-crisped firm tofu tossed with broccoli florets, sweet peppers, and a savory ginger-garlic tamari glaze over steamed rice.",
            instructions: [
                "Press tofu with paper towels to extract excess moisture; cut into 1-inch cubes and toss with cornstarch.",
                "Pan-fry tofu cubes in sesame oil over medium-high heat until golden brown on all sides (approx. 8 minutes).",
                "Remove tofu. In the same wok or skillet, sauté minced ginger, garlic, broccoli florets, and sliced peppers for 4 minutes.",
                "Whisk low-sodium soy sauce, maple syrup, and rice vinegar; pour into skillet.",
                "Toss fried tofu back in to coat evenly with the thickening glaze.",
                "Serve immediately over warm jasmine or brown rice with toasted sesame seeds."
            ]
        },
        {
            id: 106,
            title: "Roasted Sweet Potato & Black Bean Nourish Bowl",
            image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 30,
            servings: 2,
            dishTypes: ["lunch", "dinner", "salad"],
            diets: ["vegan", "vegetarian", "gluten-free", "balanced"],
            usedIngredients: ["sweet potato", "spinach"],
            missedIngredients: ["black beans", "corn", "avocado", "lime"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 430, unit: "kcal" },
                    { name: "Protein", amount: 15, unit: "g" },
                    { name: "Carbohydrates", amount: 68, unit: "g" },
                    { name: "Fat", amount: 11, unit: "g" },
                    { name: "Fiber", amount: 14, unit: "g" }
                ]
            },
            summary: "Caramelized roasted sweet potato cubes paired with fiber-packed black beans, crisp sweet corn, baby spinach, and creamy lime dressing.",
            instructions: [
                "Preheat oven to 400°F (200°C). Dice sweet potatoes, toss with olive oil, smoked paprika, cumin, and salt.",
                "Spread sweet potatoes evenly on a baking tray and roast for 25 minutes until tender and caramelized.",
                "Warm black beans with a pinch of cumin and lime juice.",
                "Assemble bowls with a bed of fresh baby spinach, roasted sweet potato, seasoned black beans, and sweet corn.",
                "Top with sliced avocado, fresh cilantro, and a squeeze of lime."
            ]
        },
        {
            id: 107,
            title: "Grilled Turkey Burger on Sourdough with Avocado",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 20,
            servings: 1,
            dishTypes: ["lunch", "dinner"],
            diets: ["high-protein", "balanced"],
            usedIngredients: ["turkey", "avocado", "tomatoes"],
            missedIngredients: ["sourdough bread", "red onion", "lettuce"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 490, unit: "kcal" },
                    { name: "Protein", amount: 36, unit: "g" },
                    { name: "Carbohydrates", amount: 38, unit: "g" },
                    { name: "Fat", amount: 20, unit: "g" },
                    { name: "Fiber", amount: 6, unit: "g" }
                ]
            },
            summary: "Lean seasoned turkey patty grilled to juicy perfection, layered with sliced avocado, ripe tomato, and crisp greens on toasted whole grain sourdough.",
            instructions: [
                "Season lean ground turkey with garlic powder, onion powder, salt, and smoked paprika; form into a 1/2-inch thick patty.",
                "Grill or sear in a skillet over medium heat for 5-6 minutes per side until fully cooked through.",
                "Lightly toast sourdough bread slices.",
                "Mash half an avocado and spread onto the toasted bottom slice.",
                "Place the grilled turkey burger on top, follow with sliced tomato and fresh greens, then cap with the top bread."
            ]
        },
        {
            id: 108,
            title: "Zesty Chickpea & Cucumber Mediterranean Salad",
            image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
            readyInMinutes: 10,
            servings: 2,
            dishTypes: ["lunch", "salad", "snack"],
            diets: ["vegan", "vegetarian", "gluten-free", "balanced"],
            usedIngredients: ["chickpeas", "cucumber", "tomatoes"],
            missedIngredients: ["red onion", "olive oil", "lemon juice", "parsley"],
            nutrition: {
                nutrients: [
                    { name: "Calories", amount: 290, unit: "kcal" },
                    { name: "Protein", amount: 11, unit: "g" },
                    { name: "Carbohydrates", amount: 38, unit: "g" },
                    { name: "Fat", amount: 10, unit: "g" },
                    { name: "Fiber", amount: 8.5, unit: "g" }
                ]
            },
            summary: "A refreshing no-cook protein-rich Mediterranean salad bursting with crisp cucumbers, ripe cherry tomatoes, and creamy chickpeas.",
            instructions: [
                "Rinse and drain canned chickpeas thoroughly.",
                "Dice crisp cucumbers, halve cherry tomatoes, and finely chop red onion and fresh parsley.",
                "In a large bowl, whisk extra virgin olive oil, fresh lemon juice, dried oregano, salt, and pepper.",
                "Add chickpeas and chopped vegetables into the bowl; toss well to coat in the citrus vinaigrette.",
                "Let sit for 10 minutes to allow flavors to meld, or enjoy chilled immediately."
            ]
        }
    ],

    // Helper to find mock ingredient info
    findIngredient: function(query) {
        if (!query) return null;
        const q = query.toLowerCase().trim();
        if (this.ingredients[q]) return this.ingredients[q];

        for (const [key, val] of Object.entries(this.ingredients)) {
            if (q.includes(key) || key.includes(q)) {
                return val;
            }
        }
        return null;
    },

    // Filter mock recipes by ingredients
    filterByIngredients: function(ingredientsList) {
        if (!ingredientsList || ingredientsList.length === 0) return this.recipes.slice(0, 4);
        
        const terms = ingredientsList.map(i => i.toLowerCase().trim());
        
        const scored = this.recipes.map(recipe => {
            let matches = 0;
            const recipeUsed = [...recipe.usedIngredients];
            const recipeMissed = [...recipe.missedIngredients];
            
            terms.forEach(term => {
                const foundInUsed = recipeUsed.some(u => u.toLowerCase().includes(term) || term.includes(u.toLowerCase()));
                const foundInTitle = recipe.title.toLowerCase().includes(term);
                if (foundInUsed || foundInTitle) matches += 2;
            });
            
            return { recipe, score: matches };
        });
        
        // Sort highest match first
        scored.sort((a, b) => b.score - a.score);
        return scored.map(s => s.recipe);
    },

    // Search mock recipes by query, meal type, diet, maxCalories
    searchRecipes: function({ query = '', type = '', diet = '', maxCalories = null }) {
        return this.recipes.filter(r => {
            const matchesQuery = !query || 
                r.title.toLowerCase().includes(query.toLowerCase()) ||
                r.summary.toLowerCase().includes(query.toLowerCase()) ||
                r.usedIngredients.some(i => i.toLowerCase().includes(query.toLowerCase()));
            
            const matchesType = !type || type === 'all' || 
                r.dishTypes.map(t => t.toLowerCase()).includes(type.toLowerCase());
            
            const matchesDiet = !diet || diet === 'all' || 
                r.diets.map(d => d.toLowerCase()).includes(diet.toLowerCase());
            
            const calObj = r.nutrition?.nutrients?.find(n => n.name.toLowerCase() === 'calories');
            const cals = calObj ? calObj.amount : 0;
            const matchesCalories = !maxCalories || cals <= maxCalories;
            
            return matchesQuery && matchesType && matchesDiet && matchesCalories;
        });
    }
};

window.MOCK_DATA = MOCK_DATA;
