import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthForms.css';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [credential, setCredential] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const loginData = { username: credential, password };
            const response = await login(loginData);

            if (response.roles.includes("ROLE_ADMIN")) {
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        } catch (error) {
            alert(`Login failed: ${error.message}`);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-controls">
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Enter your User ID or Email"
                        value={credential}
                        onChange={(e) => setCredential(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>
            <button type="submit" className="access-button">Access System</button>
            <p className="system-status">System Operational</p>
        </form>
    );
};

export default Login;
