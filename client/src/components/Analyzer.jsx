import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyzeIngredientsList, GROUP_NAMES, RECOMMENDATIONS } from '../services/dietService';

export default function Analyzer({ initialIngredients = '', onAnalysisComplete }) {
    const { user, token } = useAuth();
    const [ingredientsText, setIngredientsText] = useState(initialIngredients);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [warning, setWarning] = useState('');
    const [results, setResults] = useState(null);
    const [savedNotice, setSavedNotice] = useState(false);

    const textareaRef = useRef(null);
    const resultsRef = useRef(null);

    // Update input if initialIngredients changes (e.g. from Re-Analyze)
    useEffect(() => {
        if (initialIngredients) {
            setIngredientsText(initialIngredients);
            setError('');
            setWarning('');
            // Focus textarea for user to modify/add/remove ingredients
            if (textareaRef.current) {
                textareaRef.current.focus();
            }
        }
    }, [initialIngredients]);

    const handleAnalyze = async () => {
        const text = ingredientsText.trim();
        if (!text) {
            setError('Please enter at least one ingredient.');
            setResults(null);
            if (textareaRef.current) textareaRef.current.focus();
            return;
        }

        setError('');
        setWarning('');
        setSavedNotice(false);
        setLoading(true);

        try {
            const analysis = await analyzeIngredientsList(text);

            if (analysis.error) {
                setError(analysis.error);
                setResults(null);
                return;
            }

            if (analysis.warning) {
                setWarning(analysis.warning);
            }

            setResults(analysis);

            // Automatic Save to MongoDB if authenticated
            if (token && user) {
                try {
                    const presentNutrients = analysis.foundGroups.map(g => GROUP_NAMES[g]);
                    const missingNutrients = analysis.missingGroups.map(g => GROUP_NAMES[g]);
                    const recommendationsData = analysis.missingGroups.map(g => RECOMMENDATIONS[g]).filter(Boolean);

                    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            ingredients: analysis.items,
                            rawIngredientsText: text,
                            dietScore: analysis.scorePercentage,
                            presentNutrients,
                            missingNutrients,
                            presentNutrientsDetails: analysis.classified,
                            recommendations: recommendationsData
                        })
                    });

                    if (res.ok) {
                        setSavedNotice(true);
                        if (onAnalysisComplete) onAnalysisComplete();
                    }
                } catch (saveErr) {
                    console.error('Failed to automatically save analysis to history:', saveErr);
                }
            }

            // Smooth scroll to results
            setTimeout(() => {
                if (resultsRef.current) {
                    resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);

        } catch (err) {
            console.error('Analysis error:', err);
            setError('Unable to analyze ingredient.');
            setResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAnalyze();
        }
    };

    return (
        <div className="container">
            {/* Header */}
            <header className="header">
                <h1 className="title">Balanced Diet Analyzer</h1>
                <p className="subtitle">
                    Enter ingredients to evaluate nutritional balance and identify missing nutrient groups.
                </p>
            </header>

            {/* Input Card */}
            <section className="card">
                <label htmlFor="ingredients-input" className="input-label">
                    Enter available ingredients:
                </label>
                <textarea
                    id="ingredients-input"
                    ref={textareaRef}
                    className="textarea"
                    placeholder="e.g., chicken, rice, eggs, spinach, tomatoes"
                    value={ingredientsText}
                    onChange={(e) => {
                        setIngredientsText(e.target.value);
                        if (e.target.value.trim()) setError('');
                    }}
                    onKeyDown={handleKeyDown}
                />
                <button
                    type="button"
                    id="analyze-btn"
                    className="btn-primary"
                    disabled={loading}
                    onClick={handleAnalyze}
                >
                    {loading ? 'Analyzing...' : 'Analyze'}
                </button>

                {error && (
                    <div id="error-msg" className="error-msg" role="alert">
                        {error}
                    </div>
                )}

                {warning && (
                    <div className="error-msg" style={{ backgroundColor: 'var(--warning-bg)', borderColor: 'var(--warning-border)', color: 'var(--warning-text)' }}>
                        {warning}
                    </div>
                )}
            </section>

            {/* Results Section */}
            {results && (
                <main id="results-section" ref={resultsRef} className="card">
                    {/* Auto-saved badge */}
                    {savedNotice && (
                        <div style={{ marginBottom: '1rem', padding: '0.45rem 0.75rem', background: '#f1f5f9', borderRadius: '6px', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            💾 <span>Saved to your Diet History</span>
                        </div>
                    )}

                    {/* 100% Balanced Diet Achieved Banner */}
                    {results.foundGroups.length === 4 ? (
                        <div id="success-banner" className="success-banner">
                            <div className="success-badge">✓ Balanced Diet Achieved</div>
                            <div className="success-score">Diet Score: 100%</div>
                            <p className="success-message">
                                Your ingredient selection contains all major nutrient groups required for a balanced diet.
                            </p>
                        </div>
                    ) : (
                        <div id="partial-score-box" className="score-box">
                            <span className="score-title">Diet Score:</span>
                            <span id="score-val" className="score-badge">
                                {results.scorePercentage}% Balanced
                            </span>
                        </div>
                    )}

                    {/* Nutrient Groups Found */}
                    <section style={{ marginBottom: '1.25rem' }}>
                        <h3 className="section-title found-title">Nutrient Groups Found:</h3>
                        <ul id="groups-found-list" className="group-list">
                            {results.foundGroups.map((groupKey) => (
                                <li key={groupKey} className="group-item found-item">
                                    <span className="check-icon">✓</span>{' '}
                                    <strong>{GROUP_NAMES[groupKey]}</strong>{' '}
                                    <span className="item-breakdown">
                                        ({results.classified[groupKey].join(', ')})
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {/* Nutrient Groups Missing */}
                    {results.missingGroups.length > 0 && (
                        <section id="groups-missing-section" style={{ marginBottom: '1.25rem' }}>
                            <h3 className="section-title missing-title">Nutrient Groups Missing:</h3>
                            <ul id="groups-missing-list" className="group-list">
                                {results.missingGroups.map((groupKey) => (
                                    <li key={groupKey} className="group-item missing-item">
                                        <span className="warn-icon">⚠</span>{' '}
                                        <strong>{GROUP_NAMES[groupKey]}</strong>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Recommendations */}
                    {results.missingGroups.length > 0 && (
                        <section id="recommendations-section">
                            <div id="recommendations-box" className="recommendations-box">
                                <h3 className="section-title recs-title" style={{ marginTop: 0, marginBottom: '0.65rem' }}>
                                    Recommendations:
                                </h3>
                                <div id="recommendations-list">
                                    {results.missingGroups.map((groupKey) => {
                                        const rec = RECOMMENDATIONS[groupKey];
                                        if (!rec) return null;
                                        return (
                                            <div key={groupKey} className="rec-group">
                                                <h4 className="rec-group-title">{rec.label}:</h4>
                                                <ul className="rec-items-list">
                                                    {rec.items.map((item) => (
                                                        <li key={item}>- {item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}
                </main>
            )}
        </div>
    );
}
