import React, { useState } from 'react';
import { FaUser, FaLock } from 'react-icons/fa';
import { loginUser } from '../../services/authService';
import './Login.css';

const Login = () => {
    const [credential, setCredential] = useState(''); // Use a general credential state
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(credential);

            const loginData = isEmail
                ? { email: credential, password: password }
                : { username: credential, password: password };

            await loginUser(loginData);
            alert("Logged in successfully!");
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-controls">
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Enter your User ID or Email" // Updated placeholder
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