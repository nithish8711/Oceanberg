import React, { createContext, useContext, useState, useEffect } from 'react';
// Correct the import path to match the file name on disk
import { loginUser, registerUser } from '../services/AuthService'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Initialize state from localStorage
    const [isAuthenticated, setIsAuthenticated] = useState(
        localStorage.getItem('isAuthenticated') === 'true'
    );
    const [userRole, setUserRole] = useState(
        localStorage.getItem('userRole') || null
    );

    // Use a single useEffect hook to synchronize state with localStorage
    useEffect(() => {
        if (isAuthenticated) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', userRole);
        } else {
            localStorage.removeItem('isAuthenticated');
            localStorage.removeItem('userRole');
        }
    }, [isAuthenticated, userRole]);

    const login = async (credentials) => {
        try {
            const response = await loginUser(credentials); 
            
            setIsAuthenticated(true);
            
            let role = "user"; // Default role
            if (response.roles && response.roles.includes("ROLE_ADMIN")) {
                role = "admin";
            }
            setUserRole(role);
            
            return response;
        } catch (error) {
            setIsAuthenticated(false);
            setUserRole(null);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            await registerUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};