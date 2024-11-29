// src/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="home-page">
      <h1>Welcome to the Career Guidance Platform</h1>
      <p>Explore higher learning institutions, available courses, and apply online!</p>
      
      <div className="buttons">
        <Link to="/login">
          <button>Login</button>
        </Link>

      </div>
    </div>
  );
};

export default HomePage;
