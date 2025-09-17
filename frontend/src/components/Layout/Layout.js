import React from 'react';
import './Layout.css';
import logo from '../../assets/images/oceanberg-logo.png';

const Layout = ({ children }) => {
    return (
        <div className="landing-page-background">
            <div className="glass-card">
                <div className="logo-section">
                    <img src={logo} alt="Oceanberg Logo" className="logo" />
                    <h1>OCEANBERG</h1>
                    <p>Maritime Emergency Response Portal</p>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Layout;
