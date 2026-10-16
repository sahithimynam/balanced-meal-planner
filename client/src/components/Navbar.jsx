import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ currentTab, setCurrentTab, openAuthModal }) {
    const { user, logout } = useAuth();

    const handleHistoryClick = () => {
        if (!user) {
            openAuthModal('signin');
        } else {
            setCurrentTab('history');
        }
    };

    return (
        <nav className="app-nav">
            <div className="nav-tabs">
                <button
                    id="nav-analyzer-tab"
                    type="button"
                    className={`nav-tab-btn ${currentTab === 'analyzer' ? 'active' : ''}`}
                    onClick={() => setCurrentTab('analyzer')}
                >
                     Analyzer
                </button>
                <button
                    id="nav-history-tab"
                    type="button"
                    className={`nav-tab-btn ${currentTab === 'history' ? 'active' : ''}`}
                    onClick={handleHistoryClick}
                >
                     History {user ? '' : ''}
                </button>
            </div>

            <div className="nav-auth">
                {user ? (
                    <>
                        <span id="nav-user-tag" className="user-tag" title={user.email}>
                             {user.name}
                        </span>
                        <button
                            id="nav-signout-btn"
                            type="button"
                            className="btn-secondary"
                            onClick={() => {
                                logout();
                                setCurrentTab('analyzer');
                            }}
                        >
                            Sign Out
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            id="nav-signin-btn"
                            type="button"
                            className="btn-secondary"
                            onClick={() => openAuthModal('signin')}
                        >
                            Sign In
                        </button>
                        <button
                            id="nav-signup-btn"
                            type="button"
                            className="btn-sm-primary"
                            onClick={() => openAuthModal('signup')}
                        >
                            Sign Up
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
