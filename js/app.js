/**
 * NutriPlan - Main Application Controller
 * Orchestrates event listeners, tabs, state management, search, and interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Current in-memory cache of recipes displayed on screen
    let currentRecipes = [...MOCK_DATA.recipes];

    // DOM Elements
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const apiSettingsBtn = document.getElementById('api-settings-btn');
    const apiModal = document.getElementById('api-modal');
    const apiModalClose = document.getElementById('api-modal-close');
    const apiKeyInput = document.getElementById('api-key-input');
    const btnVerifyKey = document.getElementById('btn-verify-key');
    const btnSaveKey = document.getElementById('btn-save-key');
    const btnDemoModeToggle = document.getElementById('btn-demo-mode');
    const keyStatusMessage = document.getElementById('key-status-message');

    // Tabs
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    // Generator Tab Elements
    const ingredientsInput = document.getElementById('ingredients-input');
    const btnProduceDiet = document.getElementById('btn-produce-diet');
    const btnResetGenerator = document.getElementById('btn-reset-generator');
    const quickChipsContainer = document.getElementById('quick-chips-container');
    const generatorResults = document.getElementById('generator-results');

    // Search Tab Elements
    const searchInput = document.getElementById('search-query-input');
    const searchTypeSelect = document.getElementById('search-type-select');
    const searchDietSelect = document.getElementById('search-diet-select');
    const searchCaloriesInput = document.getElementById('search-calories-input');
    const calValueDisplay = document.getElementById('cal-val-display');
    const btnRunSearch = document.getElementById('btn-run-search');
    const btnResetSearch = document.getElementById('btn-reset-search');
    const searchResultsGrid = document.getElementById('search-results-grid');

    // Plan Tab Elements
    const btnClearPlan = document.getElementById('btn-clear-plan');

    /* ==========================================================
       1. THEME INITIALIZATION & TOGGLE
       ========================================================== */
    const initTheme = () => {
        const savedTheme = StorageService.getTheme();
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
        
        StorageService.setTheme(initialTheme);
        updateThemeIcon(initialTheme);
    };

    const updateThemeIcon = (theme) => {
        if (!themeToggleBtn) return;
        themeToggleBtn.innerHTML = theme === 'dark' 
            ? '☀️ <span class="nav-btn-text">Light Mode</span>' 
            : '🌙 <span class="nav-btn-text">Dark Mode</span>';
    };

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = StorageService.getTheme();
            const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
            StorageService.setTheme(nextTheme);
            updateThemeIcon(nextTheme);
            UI.showToast(`Switched to ${nextTheme} mode`, 'info', 2000);
        });
    }

    /* ==========================================================
       2. TAB NAVIGATION
       ========================================================== */
    const switchTab = (targetTabId) => {
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === targetTabId);
        });
        tabPanels.forEach(panel => {
            panel.classList.toggle('active', panel.id === targetTabId);
        });

        if (targetTabId === 'tab-plan') {
            renderPlanView();
        }
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    /* ==========================================================
       3. QUICK INGREDIENT CHIPS
       ========================================================== */
    const renderQuickChips = () => {
        if (!quickChipsContainer) return;
        quickChipsContainer.innerHTML = '';

        CONFIG.POPULAR_INGREDIENTS.forEach(item => {
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'chip';
            chip.innerHTML = `${item.icon} ${item.name}`;
            chip.title = `Add ${item.name} to ingredients`;

            chip.addEventListener('click', () => {
                const current = ingredientsInput.value.trim();
                const cleanName = item.name.toLowerCase();
                
                if (current.toLowerCase().includes(cleanName)) {
                    UI.showToast(`${item.name} is already in the list`, 'info', 1500);
                    return;
                }

                if (current) {
                    ingredientsInput.value = `${current}, ${cleanName}`;
                } else {
                    ingredientsInput.value = cleanName;
                }
                ingredientsInput.focus();
            });

            quickChipsContainer.appendChild(chip);
        });
    };

    /* ==========================================================
       4. INGREDIENT MEAL PLAN GENERATOR
       ========================================================== */
    const handleProduceDiet = async () => {
        const input = ingredientsInput.value.trim();
        if (!input) {
            UI.showToast('Please enter at least one ingredient to produce a plan.', 'warning');
            ingredientsInput.focus();
            return;
        }

        // Persist input to storage
        StorageService.saveIngredients(input);

        // Show loading state
        btnProduceDiet.disabled = true;
        btnProduceDiet.innerHTML = `<span class="spinner"></span> Analyzing & Generating...`;
        generatorResults.classList.remove('hidden');

        UI.renderSkeletons('generator-recipes-grid', 4);

        try {
            // 1. Analyze ingredients nutrition & diet classification
            const analysis = await ApiService.analyzeIngredients(input);
            UI.renderDietClassification('diet-classification-container', analysis.chart);

            // 2. Fetch or match recipes
            const recipes = await ApiService.getRecipesByIngredients(analysis.ingredients);
            
            // Cache recipes for modal lookup
            recipes.forEach(r => {
                if (!currentRecipes.some(existing => existing.id === r.id)) {
                    currentRecipes.push(r);
                }
            });

            // 3. Render recipe recommendations
            UI.renderRecipeGrid('generator-recipes-grid', recipes);

            // 4. Render recommendations macro dashboard
            let estCals = 0, estP = 0, estC = 0, estF = 0;
            recipes.forEach(r => {
                const n = r.nutrition?.nutrients || [];
                const getNut = (name) => {
                    const found = n.find(item => item.name.toLowerCase().includes(name.toLowerCase()));
                    return found ? found.amount : 0;
                };
                estCals += getNut('calories');
                estP += getNut('protein');
                estC += getNut('carbohydrates') || getNut('carbs');
                estF += getNut('fat');
            });

            if (recipes.length > 0) {
                // Average per meal or combined recommendation
                UI.renderMacroDashboard('generator-macro-dashboard', {
                    calories: Math.round(estCals / recipes.length * 3), // 3 meals approx
                    protein: Math.round(estP / recipes.length * 3),
                    carbs: Math.round(estC / recipes.length * 3),
                    fat: Math.round(estF / recipes.length * 3)
                });
            }

            UI.showToast(`Found ${recipes.length} matching balanced meal suggestions!`, 'success');
        } catch (err) {
            console.error('Produce diet error:', err);
            UI.showToast('Error producing diet: ' + (err.userMessage || err.message), 'error');
        } finally {
            btnProduceDiet.disabled = false;
            btnProduceDiet.innerHTML = `✨ Produce Balanced Diet`;
        }
    };

    if (btnProduceDiet) {
        btnProduceDiet.addEventListener('click', handleProduceDiet);
    }

    if (btnResetGenerator) {
        btnResetGenerator.addEventListener('click', () => {
            ingredientsInput.value = '';
            StorageService.saveIngredients('');
            generatorResults.classList.add('hidden');
            document.getElementById('diet-classification-container').innerHTML = '';
            document.getElementById('generator-macro-dashboard').innerHTML = '';
            document.getElementById('generator-recipes-grid').innerHTML = '';
            UI.showToast('Cleared ingredients and recommendations.', 'info', 2000);
        });
    }

    /* ==========================================================
       5. RECIPE SEARCH FEATURE
       ========================================================== */
    const handleSearch = async () => {
        const query = searchInput.value.trim();
        const type = searchTypeSelect.value;
        const diet = searchDietSelect.value;
        const maxCalories = searchCaloriesInput.value ? parseInt(searchCaloriesInput.value, 10) : null;

        btnRunSearch.disabled = true;
        btnRunSearch.innerHTML = `<span class="spinner"></span> Searching...`;
        UI.renderSkeletons('search-results-grid', 6);

        try {
            const results = await ApiService.searchRecipes({ query, type, diet, maxCalories });
            
            results.forEach(r => {
                if (!currentRecipes.some(existing => existing.id === r.id)) {
                    currentRecipes.push(r);
                }
            });

            UI.renderRecipeGrid('search-results-grid', results);
            UI.showToast(`Found ${results.length} recipes.`, 'info', 2000);
        } catch (err) {
            console.error('Search error:', err);
            UI.showToast('Search error: ' + (err.userMessage || err.message), 'error');
        } finally {
            btnRunSearch.disabled = false;
            btnRunSearch.innerHTML = `🔍 Search Recipes`;
        }
    };

    if (btnRunSearch) {
        btnRunSearch.addEventListener('click', handleSearch);
    }

    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }

    if (searchCaloriesInput && calValueDisplay) {
        searchCaloriesInput.addEventListener('input', () => {
            calValueDisplay.textContent = searchCaloriesInput.value ? `${searchCaloriesInput.value} kcal` : 'Any';
        });
    }

    if (btnResetSearch) {
        btnResetSearch.addEventListener('click', () => {
            searchInput.value = '';
            searchTypeSelect.value = 'all';
            searchDietSelect.value = 'all';
            searchCaloriesInput.value = '';
            if (calValueDisplay) calValueDisplay.textContent = 'Any';
            handleSearch();
        });
    }

    /* ==========================================================
       6. DAILY PLAN & LOCAL STORAGE PERSISTENCE
       ========================================================== */
    const renderPlanView = () => {
        const plan = StorageService.getPlan();
        UI.renderSavedPlan(plan);
    };

    if (btnClearPlan) {
        btnClearPlan.addEventListener('click', () => {
            const plan = StorageService.getPlan();
            const totalItems = (plan.breakfast?.length || 0) + (plan.lunch?.length || 0) + (plan.dinner?.length || 0) + (plan.snack?.length || 0);
            
            if (totalItems === 0) {
                UI.showToast('Your plan is already empty.', 'info', 2000);
                return;
            }

            if (confirm('Are you sure you want to clear your daily meal plan? This action cannot be undone.')) {
                StorageService.clearPlan();
                renderPlanView();
                UI.showToast('Daily meal plan cleared successfully.', 'info');
            }
        });
    }

    /* ==========================================================
       7. GLOBAL CLICK EVENT DELEGATION
       (Handles card buttons, add to plan dropdowns, details modal, remove)
       ========================================================== */
    document.addEventListener('click', (e) => {
        // 1. Details button
        const viewBtn = e.target.closest('.btn-view-recipe');
        if (viewBtn) {
            const recipeId = parseInt(viewBtn.dataset.id, 10);
            const recipe = currentRecipes.find(r => r.id === recipeId) || MOCK_DATA.recipes.find(r => r.id === recipeId);
            if (recipe) {
                UI.showRecipeModal(recipe);
            }
            return;
        }

        // 2. Add to plan dropdown item click
        const dropdownItem = e.target.closest('.dropdown-item');
        if (dropdownItem) {
            const recipeId = parseInt(dropdownItem.dataset.id, 10);
            const slot = dropdownItem.dataset.slot || 'lunch';
            const recipe = currentRecipes.find(r => r.id === recipeId) || MOCK_DATA.recipes.find(r => r.id === recipeId);
            
            if (recipe) {
                const added = StorageService.addRecipeToPlan(recipe, slot);
                if (added) {
                    UI.showToast(`Added "${recipe.title}" to ${slot.toUpperCase()}!`, 'success');
                    renderPlanView();
                    
                    // Close recipe modal if open
                    const modal = document.getElementById('recipe-modal');
                    if (modal) modal.classList.remove('modal-visible');
                } else {
                    UI.showToast(`"${recipe.title}" is already in your ${slot} plan.`, 'info');
                }
            }
            return;
        }

        // 3. Remove recipe button in saved plan
        const removeBtn = e.target.closest('.btn-slot-remove') || e.target.closest('.btn-remove-plan');
        if (removeBtn) {
            const recipeId = parseInt(removeBtn.dataset.id, 10);
            const slot = removeBtn.dataset.slot;
            StorageService.removeRecipeFromPlan(recipeId, slot);
            renderPlanView();
            UI.showToast('Recipe removed from plan.', 'info', 2000);
            return;
        }

        // 4. Close any open dropdowns when clicking outside
        if (!e.target.closest('.add-to-plan-dropdown')) {
            document.querySelectorAll('.add-to-plan-dropdown.open').forEach(d => d.classList.remove('open'));
        } else {
            const dropdown = e.target.closest('.add-to-plan-dropdown');
            const toggle = e.target.closest('.btn-add-plan') || e.target.closest('#modal-add-plan');
            if (toggle) {
                dropdown.classList.toggle('open');
            }
        }
    });

    /* ==========================================================
       8. API SETTINGS & KEY VERIFICATION MODAL
       ========================================================== */
    const openApiModal = () => {
        if (!apiModal) return;
        apiKeyInput.value = StorageService.getApiKey();
        keyStatusMessage.textContent = '';
        keyStatusMessage.className = 'key-status';
        updateDemoToggleButton();
        apiModal.classList.add('modal-visible');
    };

    const closeApiModal = () => {
        if (apiModal) apiModal.classList.remove('modal-visible');
    };

    const updateDemoToggleButton = () => {
        if (!btnDemoModeToggle) return;
        const isDemo = StorageService.isDemoMode();
        btnDemoModeToggle.className = isDemo ? 'btn btn-warning' : 'btn btn-outline';
        btnDemoModeToggle.textContent = isDemo ? '🟠 Demo Mode Active (Click to Disable)' : 'Switch to Demo Mode';
    };

    if (apiSettingsBtn) apiSettingsBtn.addEventListener('click', openApiModal);
    if (apiModalClose) apiModalClose.addEventListener('click', closeApiModal);
    if (apiModal) {
        apiModal.addEventListener('click', (e) => {
            if (e.target === apiModal) closeApiModal();
        });
    }

    if (btnVerifyKey) {
        btnVerifyKey.addEventListener('click', async () => {
            const key = apiKeyInput.value.trim();
            btnVerifyKey.disabled = true;
            btnVerifyKey.innerHTML = `<span class="spinner"></span> Testing...`;
            keyStatusMessage.textContent = 'Testing connection with Spoonacular...';
            keyStatusMessage.className = 'key-status';

            const result = await ApiService.validateApiKey(key);
            btnVerifyKey.disabled = false;
            btnVerifyKey.innerHTML = `Verify Connection`;

            keyStatusMessage.textContent = result.message;
            keyStatusMessage.className = result.valid ? 'key-status key-status-success' : 'key-status key-status-error';
        });
    }

    if (btnSaveKey) {
        btnSaveKey.addEventListener('click', async () => {
            const key = apiKeyInput.value.trim();
            StorageService.setApiKey(key);
            if (key) {
                StorageService.setDemoMode(false);
            }
            UI.updateConnectionBadge();
            updateDemoToggleButton();
            UI.showToast('API Key saved successfully!', 'success');
            closeApiModal();
        });
    }

    if (btnDemoModeToggle) {
        btnDemoModeToggle.addEventListener('click', () => {
            const current = StorageService.isDemoMode();
            StorageService.setDemoMode(!current);
            updateDemoToggleButton();
            UI.updateConnectionBadge();
            UI.showToast(!current ? 'Demo Mode enabled (using offline data).' : 'Demo Mode disabled (using live Spoonacular API).', 'info');
        });
    }

    /* ==========================================================
       9. INITIALIZATION ON PAGE LOAD
       ========================================================== */
    initTheme();
    UI.updateConnectionBadge();
    renderQuickChips();

    // Restore saved ingredients if available
    const savedIngredients = StorageService.getSavedIngredients();
    if (savedIngredients && ingredientsInput) {
        ingredientsInput.value = savedIngredients;
    }

    // Initial render of saved daily plan
    renderPlanView();

    // Load initial recommendations or sample search
    handleSearch();

    /* ==========================================================
       10. URL QUERY PARAMETER HANDLING (For Deep Links & Visual Testing)
       ========================================================== */
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('theme')) {
        const queryTheme = urlParams.get('theme');
        StorageService.setTheme(queryTheme);
        updateThemeIcon(queryTheme);
    }

    if (urlParams.has('tab')) {
        const queryTab = urlParams.get('tab');
        switchTab(queryTab);

        if (queryTab === 'tab-plan') {
            const plan = StorageService.getPlan();
            const totalItems = (plan.breakfast?.length || 0) + (plan.lunch?.length || 0) + (plan.dinner?.length || 0) + (plan.snack?.length || 0);
            if (totalItems === 0 && MOCK_DATA.recipes.length >= 4) {
                // Populate sample daily balanced plan if empty for demonstration
                StorageService.addRecipeToPlan(MOCK_DATA.recipes[3], 'breakfast'); // Overnight oats
                StorageService.addRecipeToPlan(MOCK_DATA.recipes[0], 'lunch');     // Grilled chicken
                StorageService.addRecipeToPlan(MOCK_DATA.recipes[2], 'dinner');    // Salmon bowl
                StorageService.addRecipeToPlan(MOCK_DATA.recipes[7], 'snack');     // Chickpea salad
                renderPlanView();
            }
        }
    }

    if (urlParams.get('demo_generate') === '1') {
        if (ingredientsInput) {
            ingredientsInput.value = 'chicken breast, brown rice, broccoli, avocado, eggs';
            handleProduceDiet();
        }
    }

    if (urlParams.get('show_modal') === '1') {
        setTimeout(() => {
            if (MOCK_DATA.recipes.length > 0) {
                UI.showRecipeModal(MOCK_DATA.recipes[0]);
            }
        }, 500);
    }

    if (urlParams.get('show_api_modal') === '1') {
        setTimeout(() => {
            openApiModal();
        }, 300);
    }
});
