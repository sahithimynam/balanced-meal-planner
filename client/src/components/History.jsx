import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function History({ onReAnalyze, openAuthModal }) {
    const { user, token } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchHistory = async () => {
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setHistory(data.history || []);
            } else {
                const errData = await res.json();
                setError(errData.message || 'Failed to fetch history');
            }
        } catch (err) {
            console.error('History fetch error:', err);
            setError('Network error loading history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const formatDate = (dateString) => {
        try {
            const d = new Date(dateString);
            return d.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    if (!user) {
        return (
            <div className="container">
                <header className="header">
                    <h1 className="title">Diet Analysis History</h1>
                    <p className="subtitle">Sign in to view your saved diet analyses and track your nutrition progress.</p>
                </header>
                <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
                    <p style={{ marginBottom: '1.25rem', color: 'var(--text-muted)' }}>
                        🔒 You need an account to view and save your meal history.
                    </p>
                    <button
                        type="button"
                        className="btn-primary"
                        style={{ maxWidth: '240px', margin: '0 auto' }}
                        onClick={() => openAuthModal('signin')}
                    >
                        Sign In / Sign Up
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <header className="header">
                <h1 className="title">Diet Analysis History</h1>
                <p className="subtitle">
                    Review your previous meal analyses and re-analyze or improve your balanced diet.
                </p>
            </header>

            {error && <div className="error-msg" style={{ marginBottom: '1.25rem' }}>{error}</div>}

            {loading ? (
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Loading your saved meal history...</p>
                </div>
            ) : history.length === 0 ? (
                <div className="card history-empty">
                    <p>No saved diet analyses yet.</p>
                    <p style={{ fontSize: '0.88rem' }}>
                        Go to the <strong>Analyzer</strong>, enter your kitchen ingredients, and click <strong>Analyze</strong> to automatically save your first meal analysis!
                    </p>
                </div>
            ) : (
                <div className="history-section">
                    {history.map((record, index) => {
                        const ingredientsText = record.rawIngredientsText || (record.ingredients || []).join(', ');
                        const missingList = record.missingNutrients || [];

                        return (
                            <div key={record._id || index} className="history-card">
                                <div className="history-card-header">
                                    <span className="history-date">
                                        📅 {formatDate(record.createdAt)}
                                    </span>
                                    <span className={`history-score-tag ${record.dietScore === 100 ? 'score-100' : ''}`}>
                                        {record.dietScore}% Balanced
                                    </span>
                                </div>

                                <div className="history-row">
                                    <span className="history-label">Ingredients:</span>
                                    <span className="history-ingredients-text">
                                        {ingredientsText}
                                    </span>
                                </div>

                                <div className="history-row">
                                    <span className="history-label">Missing Nutrients:</span>
                                    {missingList.length === 0 ? (
                                        <span className="history-missing-text none">
                                            ✓ None (100% Balanced Diet Achieved)
                                        </span>
                                    ) : (
                                        <span className="history-missing-text">
                                            ⚠ {missingList.join(', ')}
                                        </span>
                                    )}
                                </div>

                                <div className="history-actions">
                                    <button
                                        type="button"
                                        className="btn-reanalyze"
                                        onClick={() => onReAnalyze(ingredientsText)}
                                        title="Prefill this meal into the Analyzer to modify or add ingredients"
                                    >
                                        🔄 Re-Analyze
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
