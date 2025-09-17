import React from 'react';
import './UserDashboardPage.css';

const UserDashboard = () => {
    // The main dashboard logic is a separate Python app.
    // This React component will likely serve as a container or iframe for that app.
    return (
        <div className="dashboard-container">
            <h1>🌊 User Dashboard</h1>
            <p>Welcome to the User Dashboard.</p>
            <p>The core dashboard functionality is powered by the Python Streamlit app.</p>
            <div className="dashboard-content">
                {/* You can embed the Streamlit app here with an iframe */}
                {/* <iframe src="http://localhost:8501" title="Streamlit Dashboard" className="dashboard-iframe"></iframe> */}
            </div>
        </div>
    );
};

export default UserDashboard;