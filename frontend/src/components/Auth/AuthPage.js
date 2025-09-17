import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import oceanbergLogo from '../../assets/images/oceanberg-logo.png';
import './AuthPage.css';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div className="auth-page-background">
            <div className="auth-card">
                <div className="logo-container">
                    <img src={oceanbergLogo} alt="Oceanberg Logo" />
                    <h1 className="logo-text">OCEANBERG</h1>
                    <p className="logo-subtitle">Maritime Emergency Response Portal</p>
                </div>

                <div className="toggle-container">
                    <button
                        className={`tab-button ${isLogin ? 'active-tab' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Sign In
                    </button>
                    <button
                        className={`tab-button ${!isLogin ? 'active-tab' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </button>
                </div>

                {isLogin ? <Login /> : <Register />}
            </div>
        </div>
    );
};

export default AuthPage;
