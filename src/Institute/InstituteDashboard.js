import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import ViewApplications from './view applications'; // Import the component

const InstituteDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newFaculty, setNewFaculty] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const navigate = useNavigate(); // Initialize useNavigate

  const loadInstitutions = () => {
    fetch('http://localhost:5000/institutes')
      .then((response) => response.json())
      .then((data) => setInstitutions(data))
      .catch((error) => console.error('Error fetching institutions:', error));
  };

  const loadFaculties = (institutionId) => {
    fetch(`http://localhost:5000/faculties/${institutionId}`)
      .then((response) => response.json())
      .then((data) => setFaculties(data))
      .catch((error) => console.error('Error fetching faculties:', error));
  };

  const loadCourses = (facultyId) => {
    fetch(`http://localhost:5000/courses/${facultyId}`)
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error('Error fetching courses:', error));
  };

  useEffect(() => {
    loadInstitutions();
  }, []);

  useEffect(() => {
    if (selectedInstitution) {
      loadFaculties(selectedInstitution);
    } else {
      setFaculties([]);
    }
  }, [selectedInstitution]);

  useEffect(() => {
    if (selectedFaculty) {
      loadCourses(selectedFaculty);
    } else {
      setCourses([]);
    }
  }, [selectedFaculty]);

  const handleAddFaculty = () => {
    if (!newFaculty.trim()) return;
    const facultyData = {
      institutionId: parseInt(selectedInstitution),
      facultyName: newFaculty,
    };

    fetch('http://localhost:5000/addFaculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyData),
    })
      .then((response) => response.json())
      .then(() => {
        setNewFaculty('');
        loadFaculties(selectedInstitution); // Reload faculties after addition
      })
      .catch((error) => console.error('Error adding faculty:', error));
  };

  const handleAddCourse = () => {
    if (!newCourse.trim() || !selectedFaculty) return;
    const courseData = {
      facultyId: parseInt(selectedFaculty),
      courseName: newCourse,
    };

    fetch('http://localhost:5000/addCourse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData),
    })
      .then((response) => response.json())
      .then(() => {
        setNewCourse('');
        loadCourses(selectedFaculty); // Reload courses after addition
      })
      .catch((error) => console.error('Error adding course:', error));
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear auth token or session
    navigate('/login'); // Use navigate to redirect to login page
  };

  // Handle releasing all admissions
  const handleReleaseAllAdmissions = () => {
    if (!selectedInstitution) {
      alert("Please select an institution to release admissions.");
      return;
    }
  
    fetch(`http://localhost:5000/publishadmissions/${selectedInstitution}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error('Failed to release admissions.');
        }
      })
      .then(() => {
        alert('All admissions have been successfully released.');
        // Optionally, refresh the state or UI here if necessary
      })
      .catch((error) => {
        console.error('Error releasing admissions:', error);
        alert('An error occurred while releasing admissions.');
      });
  };
  
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Institute Dashboard</h2>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        style={styles.logoutButton}
      >
        Logout
      </button>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Select Institution to Add Faculty or Course</h3>
        <select
          onChange={(e) => setSelectedInstitution(e.target.value)}
          style={styles.select}
        >
          <option value="">Select Institution</option>
          {institutions.map((institution) => (
            <option key={institution.id} value={institution.id}>
              {institution.name}
            </option>
          ))}
        </select>
      </div>

      {/* Add Faculty and Courses Section */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Add Faculty</h3>
        <input
          type="text"
          value={newFaculty}
          onChange={(e) => setNewFaculty(e.target.value)}
          placeholder="Faculty Name"
          style={styles.input}
        />
        <button onClick={handleAddFaculty} style={styles.button}>
          Add Faculty
        </button>
      </div>

      <div style={styles.section}>
        <h3>Select Faculty</h3>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          style={{ padding: '8px', width: '200px' }}
          disabled={!selectedInstitution}
        >
          <option value="">Select Faculty</option>
          {faculties.length > 0 ? (
            faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))
          ) : (
            <option value="" disabled>No faculties available</option>
          )}
        </select>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Add Course</h3>
        <input
          type="text"
          value={newCourse}
          onChange={(e) => setNewCourse(e.target.value)}
          placeholder="Course Name"
          style={styles.input}
        />
        <button onClick={handleAddCourse} style={styles.button}>
          Add Course
        </button>
      </div>

      {/* Releasing All Admissions Button */}
      <div style={styles.section}>
        <button 
          onClick={handleReleaseAllAdmissions} 
          style={{ ...styles.button, backgroundColor: '#e91e63' }}
        >
          Release All Admissions
        </button>
      </div>

      {/* Display Applications if an institution is selected */}
      {selectedInstitution && (
        <ViewApplications institutionId={selectedInstitution} />
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '600px',
    margin: '0 auto',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px',
  },
  section: {
    backgroundColor: '#fff',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    color: '#444',
    fontSize: '16px',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '10px',
    color: '#fff',
    backgroundColor: '#1976d2',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px',
    marginBottom: '10px',
  },
  logoutButton: {
    width: '100%',
    padding: '10px',
    color: '#fff',
    backgroundColor: '#d32f2f', // Red color for logout
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '20px', // Space out the logout button
  },
};

export default InstituteDashboard;
