// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import AdminDashboard from './Admin/AdminDashboard';
import InstituteDashboard from './Institute/InstituteDashboard';
import ApplyForm  from './Student/StudentDashboard';
import HomePage from './HomePage';  // Import HomePage
import AdminProfile from './Admin/AdminProfile';


function App() {
  
  return (
    <Router>
       
      <Routes>
        <Route path="/" element={<HomePage />} />  {/* Home page route */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/institute/dashboard" element={<InstituteDashboard />} />
        <Route path="/student/dashboard" element={<ApplyForm />} />
        <Route path="/profile" element={<AdminProfile />} />
      </Routes>
    </Router>
  );
}


export default App;
