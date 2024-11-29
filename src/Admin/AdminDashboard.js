import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Correct import for navigation in React Router v6

const AdminDashboard = () => {
  const [institutions, setInstitutions] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [courses, setCourses] = useState([]);
  const [newInstitution, setNewInstitution] = useState('');
  const [newFaculty, setNewFaculty] = useState('');
  const [newCourse, setNewCourse] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');

  const navigate = useNavigate(); // Correct hook for navigation in React Router v6

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

  const handleAddInstitution = () => {
    if (!newInstitution.trim()) return;
    const institutionData = { name: newInstitution };

    fetch('http://localhost:5000/addInstitution', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(institutionData),
    })
      .then((response) => response.json())
      .then((data) => {
        setInstitutions([...institutions, data.institution]);
        setNewInstitution('');
      })
      .catch((error) => console.error('Error adding institution:', error));
  };

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

  const handleDeleteInstitution = (institutionId) => {
    fetch(`http://localhost:5000/deleteInstitution/${institutionId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setInstitutions(institutions.filter((inst) => inst.id !== institutionId));
      })
      .catch((error) => console.error('Error deleting institution:', error));
  };

  const handleDeleteCourse = (courseId) => {
    fetch(`http://localhost:5000/deleteCourse/${courseId}`, {
      method: 'DELETE',
    })
      .then(() => {
        setCourses(courses.filter((course) => course.id !== courseId));
      })
      .catch((error) => console.error('Error deleting course:', error));
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear auth token or session
    navigate('/login'); // Use navigate to redirect to login page
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Admin Dashboard</h2>

      {/* Logout Button */}
      <button 
        onClick={handleLogout} 
        style={styles.logoutButton}
      >
        Logout
      </button>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Add Institution</h3>
        <input
          type="text"
          value={newInstitution}
          onChange={(e) => setNewInstitution(e.target.value)}
          placeholder="Institution Name"
          style={styles.input}
        />
        <button onClick={handleAddInstitution} style={styles.button}>
          Add Institution
        </button>
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Institutions</h3>
        <div style={styles.list}>
          {institutions.map((institution) => (
            <div key={institution.id} style={styles.listItem}>
              <span>{institution.name}</span>
              <button
                onClick={() => handleDeleteInstitution(institution.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

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
        <h3 style={styles.sectionTitle}>Faculties</h3>
        <div style={styles.list}>
          {faculties.map((faculty) => (
            <div key={faculty.id} style={styles.listItem}>
              <span>{faculty.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.section}>
        <h3>Select Faculty</h3>
        <select
          value={selectedFaculty}
          onChange={(e) => setSelectedFaculty(e.target.value)}
          style={styles.select}
          disabled={!selectedInstitution} // Disable if no institute is selected
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

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Courses</h3>
        <div style={styles.list}>
          {courses.map((course) => (
            <div key={course.id} style={styles.listItem}>
              <span>{course.name}</span>
              <button
                onClick={() => handleDeleteCourse(course.id)}
                style={styles.deleteButton}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
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
    fontSize: '18px',
    marginBottom: '10px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '10px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
  },
  list: {
    marginTop: '10px',
  },
  listItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
  },
  deleteButton: {
    backgroundColor: '#f44336',
    color: '#fff',
    padding: '5px 10px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default AdminDashboard;
