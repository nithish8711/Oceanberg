import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout/Layout';
import DashboardLayout from './components/Layout/DashboardLayout';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminDashboardPage from './Pages/AdminDashboardPage'; // Social Media Map
import UserDashboardPage from './Pages/UserDashboardPage';
import EarlyWarningPage from './Pages/EarlyWarningPage'; // ✅ Import Early Warning Page

// Protected route for dashboards
const PrivateRoute = ({ children, role }) => {
    const { isAuthenticated, userRole } = useAuth();
    if (!isAuthenticated) return <Navigate to="/" />;
    if (role && userRole !== role) return <Navigate to="/" />;
    return <DashboardLayout>{children}</DashboardLayout>;
};

// Public auth pages
const PublicRoutes = () => (
    <Layout>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    </Layout>
);

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Admin Dashboard showing Social Media map */}
                    <Route 
                        path="/admin-dashboard" 
                        element={<PrivateRoute role="admin"><AdminDashboardPage /></PrivateRoute>} 
                    />

                    {/* Early Warning System Page (only for admins) */}
                    <Route 
                        path="/early-warning" 
                        element={<PrivateRoute role="admin"><EarlyWarningPage /></PrivateRoute>} 
                    />

                    {/* User Dashboard */}
                    <Route 
                        path="/user-dashboard" 
                        element={<PrivateRoute role="user"><UserDashboardPage /></PrivateRoute>} 
                    />

                    {/* Public auth pages */}
                    <Route path="/*" element={<PublicRoutes />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
