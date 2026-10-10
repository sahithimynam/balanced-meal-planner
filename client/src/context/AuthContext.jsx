import React, { createContext, useContext, useState, useEffect } from 'react';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://balanced-meal-planner.onrender.com';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(() => localStorage.getItem('diet_auth_token') || null);
    const [loading, setLoading] = useState(true);

    // Check token on initial mount
    useEffect(() => {
        const verifyToken = async () => {
            const savedToken = localStorage.getItem('diet_auth_token');
            if (!savedToken) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${savedToken}`
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                    setToken(savedToken);
                } else {
                    // Invalid/expired token
                    localStorage.removeItem('diet_auth_token');
                    setUser(null);
                    setToken(null);
                }
            } catch (err) {
                console.error('Auth verification error:', err);
            } finally {
                setLoading(false);
            }
        };

        verifyToken();
    }, []);

    const login = async (email, password) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to sign in');
        }

        localStorage.setItem('diet_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const signup = async (name, email, password, confirmPassword) => {
        const res = await fetch(`${API_BASE_URL}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, confirmPassword })
        });

        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || 'Failed to register');
        }

        // Automatic login
        localStorage.setItem('diet_auth_token', data.token);
        setToken(data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('diet_auth_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
