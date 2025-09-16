// src/services/authService.js

export const registerUser = async (signupData) => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(signupData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        const registeredUser = await response.json();
        console.log('Registration successful:', registeredUser);
        return registeredUser;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

export const loginUser = async (loginData) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const jwtResponse = await response.json();
        console.log('Login successful:', jwtResponse);
        
        // Store the JWT token for future authenticated requests
        localStorage.setItem('jwtToken', jwtResponse.token);
        
        return jwtResponse;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};