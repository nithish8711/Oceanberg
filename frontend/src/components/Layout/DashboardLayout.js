import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaSearch, FaFileAlt, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import logo from '../../assets/images/oceanberg-logo.png'; // ✅ Imported logo
import './DashboardLayout.css';

const DashboardLayout = ({ children }) => {
    const { logout } = useAuth();

    return (
        <div className="dashboard-layout-container">
            {/* Sidebar */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <img src={logo} alt="Oceanberg Logo" className="logo" />
                    <h2>OCEANBERG</h2>
                    <p>Maritime Emergency Response Portal</p>
                </div>

                <nav className="sidebar-nav">
                    <NavLink to="/admin-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FaTachometerAlt /> Social Media
                    </NavLink>
                   <NavLink to="/early-warning" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FaSearch /> Early Warning System
                    </NavLink>
                    <NavLink to="/reports" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                        <FaFileAlt /> Reports
                    </NavLink>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={logout} className="logout-button">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <main className="main-content">{children}</main>
        </div>
    );
};

export default DashboardLayout;
