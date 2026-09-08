/**
 * NutriPlan - UI Rendering & Presentation Module
 * Handles dynamic DOM generation, recipe cards, macro tracker, modals, and notifications.
 */

const UI = {
    // Show user-friendly toast alert
    showToast(message, type = 'info', duration = 4000) {
        let toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '❌',
            info: 'ℹ️'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close" aria-label="Close">&times;</button>
        `;

        toastContainer.appendChild(toast);

        const removeToast = () => {
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 300);
        };

        toast.querySelector('.toast-close').addEventListener('click', removeToast);
        setTimeout(removeToast, duration);
    },

    // Render Macro Progress Bars against Daily Targets
    renderMacroDashboard(containerId, { calories = 0, protein = 0, carbs = 0, fat = 0 }) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const targets = CONFIG.DAILY_TARGETS;
        const calPercent = Math.min(Math.round((calories / targets.calories) * 100), 100);
        const protPercent = Math.min(Math.round((protein / targets.protein) * 100), 100);
        const carbPercent = Math.min(Math.round((carbs / targets.carbs) * 100), 100);
        const fatPercent = Math.min(Math.round((fat / targets.fat) * 100), 100);

        container.innerHTML = `
            <div class="macro-grid">
                <div class="macro-card macro-calories">
                    <div class="macro-header">
                        <span class="macro-title">🔥 Calories</span>
                        <span class="macro-values">${calories} / ${targets.calories} kcal</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill fill-calories" style="width: ${calPercent}%"></div>
                    </div>
                    <span class="macro-percent">${calPercent}% of daily goal</span>
                </div>

                <div class="macro-card macro-protein">
                    <div class="macro-header">
                        <span class="macro-title">🥩 Protein</span>
                        <span class="macro-values">${protein}g / ${targets.protein}g</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill fill-protein" style="width: ${protPercent}%"></div>
                    </div>
                    <span class="macro-percent">${protPercent}% of daily goal</span>
                </div>

                <div class="macro-card macro-carbs">
                    <div class="macro-header">
                        <span class="macro-title">🍞 Carbohydrates</span>
                        <span class="macro-values">${carbs}g / ${targets.carbs}g</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill fill-carbs" style="width: ${carbPercent}%"></div>
                    </div>
                    <span class="macro-percent">${carbPercent}% of daily goal</span>
                </div>

                <div class="macro-card macro-fat">
                    <div class="macro-header">
                        <span class="macro-title">🥑 Healthy Fats</span>
                        <span class="macro-values">${fat}g / ${targets.fat}g</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill fill-fat" style="width: ${fatPercent}%"></div>
                    </div>
                    <span class="macro-percent">${fatPercent}% of daily goal</span>
                </div>
            </div>
        `;
    },

    // Render Ingredient Dietary Classification Breakdown
    renderDietClassification(containerId, chart) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const hasItems = Object.values(chart).some(arr => arr.length > 0);
        if (!hasItems) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = `
            <div class="diet-breakdown-box">
                <h4 class="breakdown-heading">🥗 Ingredient Nutrition Balance Analysis</h4>
                <div class="breakdown-tags-grid">
                    <div class="breakdown-column">
                        <div class="cat-badge cat-protein">🥩 Protein (${chart.protein.length})</div>
                        <ul class="ingredient-tag-list">
                            ${chart.protein.length ? chart.protein.map(p => `<li>${p}</li>`).join('') : '<li class="empty-tag">None detected</li>'}
                        </ul>
                    </div>
                    <div class="breakdown-column">
                        <div class="cat-badge cat-carbs">🍚 Carbs (${chart.carbohydrate.length})</div>
                        <ul class="ingredient-tag-list">
                            ${chart.carbohydrate.length ? chart.carbohydrate.map(c => `<li>${c}</li>`).join('') : '<li class="empty-tag">None detected</li>'}
                        </ul>
                    </div>
                    <div class="breakdown-column">
                        <div class="cat-badge cat-veg">🥦 Veggies / Fiber (${chart.vegetables.length})</div>
                        <ul class="ingredient-tag-list">
                            ${chart.vegetables.length ? chart.vegetables.map(v => `<li>${v}</li>`).join('') : '<li class="empty-tag">None detected</li>'}
                        </ul>
                    </div>
                    <div class="breakdown-column">
                        <div class="cat-badge cat-fat">🥑 Healthy Fats (${chart.healthy_fats.length})</div>
                        <ul class="ingredient-tag-list">
                            ${chart.healthy_fats.length ? chart.healthy_fats.map(f => `<li>${f}</li>`).join('') : '<li class="empty-tag">None detected</li>'}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    },

    // Render Recipe Card HTML
    createRecipeCard(recipe, isInPlan = false, planSlot = null) {
        const getNut = (name) => {
            const list = recipe.nutrition?.nutrients || [];
            const found = list.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
            return found ? Math.round(found.amount) : 0;
        };

        const calories = getNut('calories');
        const protein = getNut('protein');
        const carbs = getNut('carbohydrates') || getNut('carbs');
        const fat = getNut('fat');

        const card = document.createElement('div');
        card.className = 'recipe-card';
        card.dataset.id = recipe.id;

        card.innerHTML = `
            <div class="card-image-wrap">
                <img 
                    src="${recipe.image}" 
                    alt="${recipe.title}" 
                    class="recipe-img" 
                    loading="lazy"
                    onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'"
                />
                <span class="card-cal-badge">🔥 ${calories} kcal</span>
            </div>
            <div class="card-content">
                <h4 class="recipe-title" title="${recipe.title}">${recipe.title}</h4>
                <div class="recipe-meta-row">
                    <span>⏱️ ${recipe.readyInMinutes || 25} min</span>
                    <span>👥 ${recipe.servings || 2} servings</span>
                </div>
                
                <div class="recipe-macro-pills">
                    <span class="pill pill-protein">🥩 ${protein}g P</span>
                    <span class="pill pill-carbs">🍞 ${carbs}g C</span>
                    <span class="pill pill-fat">🥑 ${fat}g F</span>
                </div>

                ${recipe.usedIngredients && recipe.usedIngredients.length ? `
                    <div class="match-info">
                        <span class="match-badge">✓ Uses: ${recipe.usedIngredients.slice(0, 3).join(', ')}</span>
                    </div>
                ` : ''}

                <div class="card-actions">
                    <button class="btn btn-outline btn-view-recipe" data-id="${recipe.id}">
                        📖 Details
                    </button>
                    
                    ${isInPlan ? `
                        <button class="btn btn-danger btn-remove-plan" data-id="${recipe.id}" data-slot="${planSlot}">
                            🗑️ Remove
                        </button>
                    ` : `
                        <div class="add-to-plan-dropdown">
                            <button class="btn btn-primary btn-add-plan" data-id="${recipe.id}">
                                ➕ Add to Plan
                            </button>
                            <div class="dropdown-menu">
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="breakfast">Breakfast</button>
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="lunch">Lunch</button>
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="dinner">Dinner</button>
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="snack">Snack</button>
                            </div>
                        </div>
                    `}
                </div>
            </div>
        `;

        return card;
    },

    // Render Grid of Recipe Cards
    renderRecipeGrid(containerId, recipes) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!recipes || recipes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🍳</div>
                    <h3>No recipes found</h3>
                    <p>Try adding more ingredients or broadening your search filters.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '';
        recipes.forEach(recipe => {
            const card = this.createRecipeCard(recipe);
            container.appendChild(card);
        });
    },

    // Render Skeleton Loader Cards
    renderSkeletons(containerId, count = 4) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = Array(count).fill(0).map(() => `
            <div class="recipe-card skeleton-card">
                <div class="skeleton skeleton-img"></div>
                <div class="card-content">
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                    <div class="skeleton skeleton-pills"></div>
                    <div class="skeleton skeleton-btn"></div>
                </div>
            </div>
        `).join('');
    },

    // Render the Saved Daily Plan Section
    renderSavedPlan(plan) {
        const container = document.getElementById('saved-plan-container');
        if (!container) return;

        const slots = [
            { key: 'breakfast', title: '🌅 Breakfast', icon: '🍳' },
            { key: 'lunch', title: '☀️ Lunch', icon: '🥗' },
            { key: 'dinner', title: '🌙 Dinner', icon: '🍲' },
            { key: 'snack', title: '🍎 Healthy Snacks', icon: '🥜' }
        ];

        let totalCalories = 0;
        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFat = 0;

        let totalMealsCount = 0;

        let html = '<div class="meal-slots-grid">';

        slots.forEach(slot => {
            const items = plan[slot.key] || [];
            totalMealsCount += items.length;

            html += `
                <div class="meal-slot-column">
                    <div class="slot-header">
                        <h4>${slot.title}</h4>
                        <span class="slot-count">${items.length} item${items.length === 1 ? '' : 's'}</span>
                    </div>
                    <div class="slot-items">
            `;

            if (items.length === 0) {
                html += `
                    <div class="slot-empty">
                        <p>No recipe assigned</p>
                    </div>
                `;
            } else {
                items.forEach(recipe => {
                    const getNut = (name) => {
                        const list = recipe.nutrition?.nutrients || [];
                        const found = list.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
                        return found ? Math.round(found.amount) : 0;
                    };

                    const cal = getNut('calories');
                    const p = getNut('protein');
                    const c = getNut('carbohydrates') || getNut('carbs');
                    const f = getNut('fat');

                    totalCalories += cal;
                    totalProtein += p;
                    totalCarbs += c;
                    totalFat += f;

                    html += `
                        <div class="slot-recipe-row">
                            <img src="${recipe.image}" alt="${recipe.title}" class="slot-thumb" onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'" />
                            <div class="slot-info">
                                <h5 class="slot-recipe-title">${recipe.title}</h5>
                                <div class="slot-macros">
                                    <span>🔥 ${cal} cal</span>
                                    <span>🥩 ${p}g P</span>
                                    <span>🍞 ${c}g C</span>
                                </div>
                            </div>
                            <button class="btn-slot-remove" data-id="${recipe.id}" data-slot="${slot.key}" title="Remove from plan">&times;</button>
                        </div>
                    `;
                });
            }

            html += `
                    </div>
                </div>
            `;
        });

        html += '</div>';

        container.innerHTML = html;

        // Render macro summary in Plan tab
        this.renderMacroDashboard('plan-macro-dashboard', {
            calories: totalCalories,
            protein: totalProtein,
            carbs: totalCarbs,
            fat: totalFat
        });

        // Update badge or count in header
        const planBadge = document.getElementById('plan-count-badge');
        if (planBadge) {
            planBadge.textContent = totalMealsCount;
            planBadge.style.display = totalMealsCount > 0 ? 'inline-flex' : 'none';
        }
    },

    // Show Recipe Details Modal
    showRecipeModal(recipe) {
        let modal = document.getElementById('recipe-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'recipe-modal';
            modal.className = 'modal-backdrop';
            document.body.appendChild(modal);
        }

        const getNut = (name) => {
            const list = recipe.nutrition?.nutrients || [];
            const found = list.find(n => n.name.toLowerCase().includes(name.toLowerCase()));
            return found ? Math.round(found.amount) : 0;
        };

        modal.innerHTML = `
            <div class="modal-dialog">
                <button class="modal-close-btn" id="modal-close">&times;</button>
                <div class="modal-header-img">
                    <img src="${recipe.image}" alt="${recipe.title}" onerror="this.src='https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80'" />
                    <div class="modal-title-overlay">
                        <h3>${recipe.title}</h3>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-quick-stats">
                        <div class="stat-pill">⏱️ <strong>${recipe.readyInMinutes || 25}</strong> mins</div>
                        <div class="stat-pill">👥 <strong>${recipe.servings || 2}</strong> servings</div>
                        <div class="stat-pill">🔥 <strong>${getNut('calories')}</strong> kcal</div>
                        <div class="stat-pill">🥩 <strong>${getNut('protein')}g</strong> Protein</div>
                        <div class="stat-pill">🍞 <strong>${getNut('carbohydrates') || getNut('carbs')}g</strong> Carbs</div>
                        <div class="stat-pill">🥑 <strong>${getNut('fat')}g</strong> Fat</div>
                    </div>

                    ${recipe.summary ? `<p class="recipe-modal-summary">${recipe.summary}</p>` : ''}

                    <div class="recipe-modal-section">
                        <h4>🛒 Ingredients</h4>
                        <ul class="modal-ingredients-list">
                            ${(recipe.extendedIngredients && recipe.extendedIngredients.length > 0) 
                                ? recipe.extendedIngredients.map(ing => `<li><span>✓</span> ${ing}</li>`).join('') 
                                : (recipe.usedIngredients ? recipe.usedIngredients.map(u => `<li><span>✓</span> ${u}</li>`).join('') : '<li>Fresh ingredients</li>')}
                        </ul>
                    </div>

                    <div class="recipe-modal-section">
                        <h4>👩‍🍳 Preparation Steps</h4>
                        <ol class="modal-steps-list">
                            ${recipe.instructions && recipe.instructions.length > 0
                                ? recipe.instructions.map(step => `<li>${step}</li>`).join('')
                                : '<li>Follow standard preparation methods for these ingredients.</li>'}
                        </ol>
                    </div>

                    <div class="modal-footer-actions">
                        <button class="btn btn-outline" id="modal-close-action">Close</button>
                        <div class="add-to-plan-dropdown">
                            <button class="btn btn-primary" id="modal-add-plan" data-id="${recipe.id}">
                                ➕ Add to Daily Plan
                            </button>
                            <div class="dropdown-menu">
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="breakfast">Breakfast</button>
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="lunch">Lunch</button>
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="dinner">Dinner</button>
                                <button class="dropdown-item" data-id="${recipe.id}" data-slot="snack">Snack</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        modal.classList.add('modal-visible');

        const closeModal = () => modal.classList.remove('modal-visible');
        modal.querySelector('#modal-close').addEventListener('click', closeModal);
        modal.querySelector('#modal-close-action').addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    },

    // Update connection status badge in header
    updateConnectionBadge() {
        const badge = document.getElementById('api-status-badge');
        if (!badge) return;

        const isLive = ApiService.shouldUseLiveApi();
        if (isLive) {
            badge.className = 'status-badge status-live';
            badge.innerHTML = `<span class="dot"></span> Live API`;
            badge.title = "Connected to live Spoonacular API";
        } else {
            badge.className = 'status-badge status-demo';
            badge.innerHTML = `<span class="dot"></span> Demo Mode`;
            badge.title = "Using offline sample data (No API key set or quota active)";
        }
    }
};

window.UI = UI;
