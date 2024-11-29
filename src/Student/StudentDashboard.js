import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Updated import for navigation

const ApplyForm = () => {
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [resultFile, setResultFile] = useState(null);

  const navigate = useNavigate(); // Updated hook for redirecting

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Clear auth token or session
    alert('Logged out successfully!');
    navigate('/login'); // Redirect to login page
  };

  // Fetch institutions from the backend
  useEffect(() => {
    fetch('http://localhost:5000/institutes')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => setInstitutions(data))
      .catch((error) => {
        console.error('Failed to fetch institutions:', error);
        alert('Could not load institutions. Please try again later.');
      });
  }, []);

  // Fetch faculties based on the selected institution
  const handleInstitutionChange = (e) => {
    const institutionId = e.target.value;
    setSelectedInstitution(institutionId);
    fetch(`http://localhost:5000/faculties/${institutionId}`)
      .then((res) => res.json())
      .then((data) => setFaculties(data));
  };

  // Fetch courses based on the selected faculty
  const handleFacultyChange = (e) => {
    const facultyId = e.target.value;
    setSelectedFaculty(facultyId);
    fetch(`http://localhost:5000/courses/${facultyId}`)
      .then((res) => res.json())
      .then((data) => setCourses(data));
  };
  const [requirements, setRequirements] = useState([]);

useEffect(() => {
  if (selectedCourse) {
    fetch(`http://localhost:5000/requirements/${selectedCourse}`)
      .then((res) => res.json())
      .then((data) => setRequirements(data))
      .catch((error) => console.error('Error fetching requirements:', error));
  } else {
    setRequirements([]);
  }
}, [selectedCourse]);


  // Handle file input change
  const handleFileChange = (e) => {
    setResultFile(e.target.files[0]);
  };

  // Submit the application form data
  const handleSubmit = () => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('phone', phone);
    formData.append('institutionId', selectedInstitution);
    formData.append('facultyId', selectedFaculty);
    formData.append('courseId', selectedCourse);
    if (resultFile) formData.append('resultFile', resultFile);

    fetch('http://localhost:5000/apply', {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          alert('Application submitted!');
          setName('');
          setEmail('');
          setPhone('');
          setSelectedInstitution('');
          setSelectedFaculty('');
          setSelectedCourse('');
          setFaculties([]);
          setCourses([]);
          setResultFile(null); // Clear file input
        } else {
          alert(data.message);
        }
      });
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
      <h2 style={{ textAlign: 'center', color: '#444' }}>Course Application</h2>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#d9534f',
          color: '#fff',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      {/* Input for Name */}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      />

      {/* Input for Email */}
      <input
        type="email"
        placeholder="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      />

      {/* Input for Phone */}
      <input
        type="text"
        placeholder="Phone Number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      />

      {/* Select for Institution */}
      <select
        onChange={handleInstitutionChange}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      >
        <option value="">Choose Institution</option>
        {institutions.map((institution) => (
          <option key={institution.id} value={institution.id}>
            {institution.name}
          </option>
        ))}
      </select>

      {/* Select for Faculty */}
      <select
        onChange={handleFacultyChange}
        disabled={!selectedInstitution}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      >
        <option value="">Choose Faculty</option>
        {faculties.map((faculty) => (
          <option key={faculty.id} value={faculty.id}>
            {faculty.name}
          </option>
        ))}
      </select>

      {/* Select for Course */}
      <select
        onChange={(e) => setSelectedCourse(e.target.value)}
        disabled={!selectedFaculty}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      >
        <option value="">Choose Course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.name}
          </option>
        ))}
      </select>

      {/* File Input for Results */}
      <input
        type="file"
        placeholder="upload results"
        onChange={handleFileChange}
        style={{ width: '100%', padding: '12px', marginBottom: '10px', fontSize: '1em', borderRadius: '5px' }}
      />

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#5cb85c',
          color: '#fff',
          fontSize: '1em',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Submit Application
      </button>
    </div>
  );
};

export default ApplyForm;
