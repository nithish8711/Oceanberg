import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaCheckCircle } from 'react-icons/fa';
import { registerUser } from '../../services/authService';
import './Register.css';

const Register = () => {
    const [userId, setUserId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Add password validation check
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return; // Stop the form submission
        }

        try {
            const signupData = {
                userId,
                email,
                password,
            };
            const response = await registerUser(signupData);
            
            alert("Registration successful! Please log in.");
            console.log("Registration successful:", response);

        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <form className="register-form" onSubmit={handleSubmit}>
            <div className="form-controls">
                <div className="input-group">
                    <FaUser className="icon" />
                    <input
                        type="text"
                        placeholder="Enter User ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <FaEnvelope className="icon" />
                    <input
                        type="email"
                        placeholder="Enter your Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <FaLock className="icon" />
                    <input
                        type="password"
                        placeholder="Create a Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div className="input-group">
                    <FaCheckCircle className="icon" />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
            </div>
            <button type="submit" className="register-button">Register!</button>
        </form>
    );
};

export default Register;