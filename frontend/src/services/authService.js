export const registerUser = async (signupData) => {
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const loginUser = async (loginData) => {
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const jwtResponse = await response.json();
        localStorage.setItem('jwtToken', jwtResponse.token);
        return jwtResponse;
    } catch (error) {
        throw error;
    }
};
