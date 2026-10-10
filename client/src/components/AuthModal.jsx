import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
    const { login, signup } = useAuth();
    const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMode(initialMode);
        setError('');
    }, [initialMode, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (mode === 'signup') {
            if (!name.trim()) {
                setError('Full Name is required');
                return;
            }
            if (password !== confirmPassword) {
                setError('Passwords do not match');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
        }

        if (!email.trim() || !password) {
            setError('Please enter all required fields');
            return;
        }

        setLoading(true);

        try {
            if (mode === 'signup') {
                await signup(name, email, password, confirmPassword);
            } else {
                await login(email, password);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const switchMode = (newMode) => {
        setMode(newMode);
        setError('');
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">
                        {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
                    </h2>
                    <button type="button" className="modal-close" onClick={onClose} aria-label="Close modal">
                        &times;
                    </button>
                </div>

                {error && <div className="error-msg" style={{ marginBottom: '1rem' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    {mode === 'signup' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="auth-name-input">Full Name</label>
                            <input
                                id="auth-name-input"
                                type="text"
                                className="form-input"
                                placeholder="Enter your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-email-input">Email</label>
                        <input
                            id="auth-email-input"
                            type="email"
                            className="form-input"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoFocus={mode === 'signin'}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label" htmlFor="auth-password-input">Password</label>
                        <input
                            id="auth-password-input"
                            type="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    {mode === 'signup' && (
                        <div className="form-group">
                            <label className="form-label" htmlFor="auth-confirm-password-input">Confirm Password</label>
                            <input
                                id="auth-confirm-password-input"
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        id="auth-submit-btn"
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: '0.75rem' }}
                        disabled={loading}
                    >
                        {loading
                            ? (mode === 'signup' ? 'Creating Account...' : 'Signing In...')
                            : (mode === 'signup' ? 'Sign Up' : 'Sign In')}
                    </button>
                </form>

                <div className="modal-footer-switch">
                    {mode === 'signup' ? (
                        <>
                            Already have an account?
                            <button type="button" onClick={() => switchMode('signin')}>
                                Sign In
                            </button>
                        </>
                    ) : (
                        <>
                            Don't have an account?
                            <button type="button" onClick={() => switchMode('signup')}>
                                Sign Up
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
