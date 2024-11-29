import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState(''); // State for username in registration mode
    const [role, setRole] = useState('');
    const [selectedInstitution, setSelectedInstitution] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const [institutions, setInstitutions] = useState([]); // State for institutions
    const [error, setError] = useState(''); // State for handling errors during fetch
    const navigate = useNavigate();

    const handleSubmit = () => {
      // Validate form input
      if (email && password && role && (!isRegistering || username)) {
          const requestBody = {
              email,
              password,
              username,
              role,
              institute_name: selectedInstitution,
              isRegistering
          };
  
          fetch('http://localhost:5000/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify(requestBody),
          })
              .then((response) => response.json())
              .then((data) => {
                  if (data.message) {
                      alert(data.message);
                      if (data.message === 'Login successful') {
                          // Redirect based on user role
                          if (role === 'admin') {
                              navigate('/admin/dashboard');
                          } else if (role === 'institute') {
                              navigate('/institute/dashboard');
                          } else if (role === 'student') {
                              navigate('/student/dashboard');
                          }
                      }
                  } else if (data.error) {
                      alert(data.error);
                  }
              })
              .catch((err) => {
                  console.error('Error during fetch:', err);
                  alert('An error occurred during the request');
              });
          // Clear form fields
          resetForm();
      } else {
          alert('Please fill in all fields!');
      }
  };
  

    // Function to reset form fields
    const resetForm = () => {
        setEmail('');
        setPassword('');
        setUsername('');
        setRole('');
        setSelectedInstitution('');
    };

    return (
        <div style={styles.container}>
            <h2 style={styles.title}>{isRegistering ? 'Register' : 'Login'}</h2>
            {isRegistering && (
                <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                />
            )}
            <input
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
            />
            <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
            />
            <select
                value={role}
                onChange={(e) => {
                    setRole(e.target.value);
                    setSelectedInstitution(''); // Reset institute when role changes
                }}
                style={styles.input}
            >
                <option value="" disabled>Select your role</option>
                <option value="admin">Admin</option>
                <option value="institute">Institute</option>
                <option value="student">Student</option> {/* Added student role */}
            </select>


            <button onClick={handleSubmit} style={styles.button}>
                {isRegistering ? 'Register' : 'Login'}
            </button>
            <button
                onClick={() => setIsRegistering(!isRegistering)}
                style={styles.toggleButton}
            >
                {isRegistering ? 'Already have an account? Login' : 'New here? Register'}
            </button>
        </div>
    );
};

// Styles for the Login component
const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px',
        maxWidth: '400px',
        margin: '0 auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#f9f9f9',
    },
    title: {
        marginBottom: '20px',
        color: '#333',
        fontSize: '24px',
    },
    input: {
        padding: '10px',
        marginBottom: '10px',
        width: '100%',
        border: '1px solid #ccc',
        borderRadius: '4px',
        boxSizing: 'border-box',
        fontSize: '16px',
    },
    button: {
        padding: '10px',
        color: 'white',
        backgroundColor: '#4CAF50',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px',
        width: '100%',
        marginBottom: '10px',
    },
    toggleButton: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#4CAF50',
        cursor: 'pointer',
        fontSize: '16px',
    },
    error: {
        color: 'red',
        fontSize: '14px',
        marginTop: '10px',
    },
};

export default Login;
