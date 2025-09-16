import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import './App.css';

function App() {
  return (
    <Router>
      <div className="landing-page-background"> {/* ADD THIS CLASS */}
        <Layout>
          <div className="auth-switch-buttons">
            <NavLink
              to="/"
              className={({ isActive }) => `auth-button ${isActive ? 'active' : ''}`}
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              className={({ isActive }) => `auth-button ${isActive ? 'active' : ''}`}
            >
              Register
            </NavLink>
          </div>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;