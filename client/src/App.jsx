import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Analyzer from './components/Analyzer';
import History from './components/History';
import AuthModal from './components/AuthModal';

export default function App() {
    const [currentTab, setCurrentTab] = useState('analyzer'); // 'analyzer' or 'history'
    const [activeIngredients, setActiveIngredients] = useState('');
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authModalMode, setAuthModalMode] = useState('signin');

    const handleOpenAuthModal = (mode = 'signin') => {
        setAuthModalMode(mode);
        setAuthModalOpen(true);
    };

    const handleReAnalyze = (ingredientsText) => {
        setActiveIngredients(ingredientsText);
        setCurrentTab('analyzer');
    };

    return (
        <div>
            <div className="container" style={{ paddingBottom: 0 }}>
                <Navbar
                    currentTab={currentTab}
                    setCurrentTab={setCurrentTab}
                    openAuthModal={handleOpenAuthModal}
                />
            </div>

            {currentTab === 'analyzer' ? (
                <Analyzer
                    initialIngredients={activeIngredients}
                    onAnalysisComplete={() => {}}
                />
            ) : (
                <History
                    onReAnalyze={handleReAnalyze}
                    openAuthModal={handleOpenAuthModal}
                />
            )}

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
            />
        </div>
    );
}
