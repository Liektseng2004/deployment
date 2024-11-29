const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');

const app = express();
const port = 5000;

// Middleware setup
app.use(cors());
app.use(express.json()); // To parse incoming JSON requests

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MySQL connection setup
const db = mysql.createConnection({
  host: 'localhost',      // Change this if needed
  user: 'root',           // Change this if needed
  password: 'L!3k3ts3ng',           // Change this if needed
  database: 'guidance'  // Replace with your database name
});

// Connect to MySQL
db.connect((err) => {
  if (err) {
    console.error('Could not connect to the database:', err);
    process.exit(1);
  }
  console.log('Connected to MySQL database');
});

// Route to handle login
app.post('/login', (req, res) => {
  const { email, password, username, role, institute_name, isRegistering } = req.body;

  if (isRegistering) {
    // Handle registration logic (insert user into DB)
    const query = 'INSERT INTO users (email, password, username, role, institute_name) VALUES (?, ?, ?, ?, ?)';
    db.query(query, [email, password, username, role, institute_name], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to register user' });
      }
      return res.status(200).json({ message: 'Registration successful' });
    });
  } else {
    // Handle login logic (check user credentials)
    const query = 'SELECT * FROM users WHERE email = ? AND password = ? AND role = ?';
    db.query(query, [email, password, role], (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to log in' });
      }
      if (result.length === 0) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      return res.status(200).json({ message: 'Login successful' });
    });
  }
});

// Get all institutions
app.get('/institutes', (req, res) => {
  const sql = 'SELECT * FROM institutions';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching institutions:', err);
      res.status(500).send('Error fetching institutions');
      return;
    }
    res.json(results);
  });
});

// Get faculties by institution ID
app.get('/faculties/:institutionId', (req, res) => {
  const { institutionId } = req.params;
  const sql = 'SELECT * FROM faculties WHERE institution_id = ?';
  db.query(sql, [institutionId], (err, results) => {
    if (err) {
      console.error('Error fetching faculties:', err);
      res.status(500).send('Error fetching faculties');
      return;
    }
    res.json(results);
  });
});

// Fetch courses for a given faculty
app.get('/courses/:facultyId', (req, res) => {
  const facultyId = req.params.facultyId;
  db.query('SELECT * FROM courses WHERE faculty_id = ?', [facultyId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Add a new institution
app.post('/addInstitution', (req, res) => {
  const { name } = req.body;
  const sql = 'INSERT INTO institutions (name) VALUES (?)';
  db.query(sql, [name], (err, results) => {
    if (err) {
      console.error('Error adding institution:', err);
      res.status(500).send('Error adding institution');
      return;
    }
    res.json({ institution: { id: results.insertId, name } });
  });
});

// Add a new faculty
app.post('/addFaculty', (req, res) => {
  const { institutionId, facultyName } = req.body;
  const sql = 'INSERT INTO faculties (institution_id, name) VALUES (?, ?)';
  db.query(sql, [institutionId, facultyName], (err) => {
    if (err) {
      console.error('Error adding faculty:', err);
      res.status(500).send('Error adding faculty');
      return;
    }
    res.json({ message: 'Faculty added successfully' });
  });
});

// Add new course
app.post('/addCourse', (req, res) => {
  const { facultyId, courseName } = req.body;
  db.query('INSERT INTO courses (faculty_id, name) VALUES (?, ?)', [facultyId, courseName], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ course: { id: result.insertId, name: courseName } });
  });
});

// Delete institution
app.delete('/deleteInstitution/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM institutions WHERE id = ?', [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Institution deleted' });
  });
});

// Delete faculty
app.delete('/deleteFaculty/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM faculties WHERE id = ?', [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Faculty deleted' });
  });
});

// Delete course
app.delete('/deleteCourse/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM courses WHERE id = ?', [id], (err, result) => {
    if (err) throw err;
    res.json({ message: 'Course deleted' });
  });
});

// Application submission route
app.post('/apply', upload.single('resultFile'), async (req, res) => {
  const { name, email, phone, institutionId, facultyId, courseId } = req.body;
  const resultFile = req.file ? req.file.path : null;

  // Get the MIME type of the uploaded file
  const fileType = req.file ? req.file.mimetype : null;

  const sql = `
    INSERT INTO applications (name, email, phone, institution_id, faculty_id, course_id, result_file, result_file_type) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    await db.execute(sql, [name, email, phone, institutionId, facultyId, courseId, resultFile, fileType]);
    res.json({ success: true, message: 'Application submitted successfully!' });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Backend endpoint to get all applications for an institution
app.get('/applications/institution/:institutionId', (req, res) => {
  const { institutionId } = req.params;

  const sql = `
    SELECT 
      a.*, 
      i.name AS institution_name, 
      f.name AS faculty_name, 
      c.name AS course_name
    FROM 
      applications a
    JOIN 
      institutions i ON a.institution_id = i.id
    JOIN 
      faculties f ON a.faculty_id = f.id
    JOIN 
      courses c ON a.course_id = c.id
    WHERE 
      a.institution_id = ?`;

  db.query(sql, [institutionId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: 'Error retrieving applications' });
    }

    // Include picture URLs for applications
    const applicationsWithPictures = results.map((app) => ({
      ...app,
      pictureUrl: app.result_file ? `http://localhost:5000/uploads/${app.result_file}` : null,
    }));

    res.json(applicationsWithPictures);
  });
});

// New route to update application status (Accept, Reject, Pending)
app.put('/updateApplicationStatus/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  const { status } = req.body; // The new status ('Accepted', 'Rejected', 'Pending')

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  // Validate status value to prevent invalid entries
  const validStatuses = ['Accepted', 'Rejected', 'Pending'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  // Update the application's status
  const sql = `UPDATE applications SET status = ? WHERE id = ?`;

  db.query(sql, [status, applicationId], (err, result) => {
    if (err) {
      console.error('Error updating application status:', err);
      return res.status(500).json({ error: 'Failed to update application status' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    res.json({ message: `Application status updated to ${status} successfully` });
  });
});
// Release all admissions for an institution
app.post('/releaseAdmissions/:institutionId', (req, res) => {
  const { institutionId } = req.params;

  // Validate the institutionId parameter
  if (!institutionId) {
    return res.status(400).json({ error: 'Institution ID is required' });
  }

  // SQL query to update the application status to 'Released'
  const sql = `UPDATE applications SET status = 'Released' WHERE institution_id = ?`;

  db.query(sql, [institutionId], (err, result) => {
    if (err) {
      console.error('Error releasing admissions:', err);
      return res.status(500).json({ error: 'An internal server error occurred while releasing admissions' });
    }

    // Check if any applications were updated
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'No applications found for this institution' });
    }

    res.json({ message: `Admissions for institution ${institutionId} released successfully`, affectedRows: result.affectedRows });
  });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
