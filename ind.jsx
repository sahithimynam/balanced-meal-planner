document.getElementById('btn').addEventListener('click', generateDiet);

async function generateDiet() {
    let resultContainer = document.getElementById('dietResult');
    if (!resultContainer) {
        resultContainer = document.createElement('div');
        resultContainer.id = 'dietResult';
        document.querySelector('.button').insertAdjacentElement('afterend', resultContainer);
    }

    const input = document.getElementById('items').value.toLowerCase();
    const ingredients = input.split(' ').map(item => item.trim()).filter(item => item);
    const chart = {
        protein: null,
        carbohydrate: null,
        vegetables: [],
    };

    for (let item of ingredients) {
        try {
            // Search for ingredient
            const searchRes = await fetch(`https://api.spoonacular.com/food/ingredients/search?query=${item}&apiKey=fca38ae0a6fb405980e83815c4b4be93`);
            const searchData = await searchRes.json();
            if (searchData.results.length === 0) continue;

            const id = searchData.results[0].id;

            // Get detailed ingredient info
            const infoRes = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?amount=1&unit=serving&apiKey=fca38ae0a6fb405980e83815c4b4be93`);
            const info = await infoRes.json();

            let nutrients = info.nutrition?.nutrients || [];
            let proteins = getNutrient(nutrients, 'protein');
            let carbs = getNutrient(nutrients, 'carbohydrate');

            // Fallback to guessNutrition if needed
            if (proteins === 0 && carbs === 0) {
                const guessRes = await fetch(`https://api.spoonacular.com/recipes/guessNutrition?title=${item}&apiKey=fca38ae0a6fb405980e83815c4b4be93`);
                const guess = await guessRes.json();
                proteins = guess.protein?.value || 0;
                carbs = guess.carbs?.value || 0;
            }

            const isVegetable = info.categoryPath && info.categoryPath.some(cat => cat.toLowerCase().includes('vegetable'));

            if (!chart.protein && proteins >= 5) {
                chart.protein = item;
            } else if (!chart.carbohydrate && carbs >= 10) {
                chart.carbohydrate = item;
            } else if (
                chart.vegetables.length < 2 &&
                (isVegetable || (proteins < 2 && carbs < 5))
            ) {
                chart.vegetables.push(item);
            }

        } catch (err) {
            console.error(`Error fetching data for ${item}:`, err);
        }
    }

    let result = "<h3>Suggested Meal Plan:</h3>";
    result += chart.protein ? `<p>Protein: ${chart.protein}</p>` : '<p>Protein: Not available</p>';
    result += chart.carbohydrate ? `<p>Carbohydrate: ${chart.carbohydrate}</p>` : '<p>Carbohydrate: Not available</p>';
    result += chart.vegetables.length ? `<p>Vegetables: ${chart.vegetables.join(', ')}</p>` : '<p>Vegetables: Not available</p>';

    resultContainer.innerHTML = result;
}

function getNutrient(nutrients, keyword) {
    const match = nutrients.find(n =>
        n.name.toLowerCase().includes(keyword.toLowerCase())
    );
    return match ? match.amount : 0;
}