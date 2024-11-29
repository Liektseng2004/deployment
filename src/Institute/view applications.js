import React, { useState, useEffect } from 'react';

const ViewApplications = ({ institutionId }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const styles = {
    container: {
      padding: '20px',
    },
    title: {
      textAlign: 'center',
      marginBottom: '20px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    thTd: {
      padding: '10px',
      borderBottom: '1px solid #ddd',
    },
    th: {
      backgroundColor: '#f4f4f4',
      textAlign: 'left',
    },
    thumbnail: {
      width: '100px',
      height: '100px',
      borderRadius: '50%',
    },
    button: {
      margin: '0 5px',
      padding: '5px 10px',
      color: '#fff',
      backgroundColor: '#1976d2',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
    },
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchApplications = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/applications/institution/${institutionId}`,
          { signal }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch applications');
        }
        const data = await response.json();
        setApplications(data);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Error fetching applications');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();

    return () => {
      controller.abort(); // Cleanup to cancel fetch on component unmount
    };
  }, [institutionId]);

  const handleUpdateStatus = (applicationId, status) => {
    fetch(`http://localhost:5000/updateApplicationStatus/${applicationId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
      .then((response) => response.json())
      .then(() => {
        alert(`Application ${status} successfully.`);
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app.id === applicationId ? { ...app, status } : app
          )
        );
      })
      .catch((error) => console.error('Error updating application status:', error));
  };

  const getImageSrc = (fileData, fileType) => {
    // Check the file type and provide the appropriate base64 string with MIME type
    if (fileData && fileType) {
      return `data:${fileType};base64,${fileData}`;
    }
    return null;
  };

  if (loading) {
    return <div>Loading applications...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Error fetching applications:</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Applications for this Institution</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, ...styles.thTd }}>Picture</th>
            <th style={{ ...styles.th, ...styles.thTd }}>Name</th>
            <th style={{ ...styles.th, ...styles.thTd }}>Email</th>
            <th style={{ ...styles.th, ...styles.thTd }}>Phone</th>
            <th style={{ ...styles.th, ...styles.thTd }}>Faculty</th>
            <th style={{ ...styles.th, ...styles.thTd }}>Course</th>
            <th style={styles.thTd}>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td style={styles.thTd}>
                {app.result_file && app.result_file_type ? (
                  <img
                    src={getImageSrc(app.result_file, app.result_file_type)}
                    alt="Uploaded file"
                    style={styles.thumbnail}
                  />
                ) : (
                  'No picture'
                )}
              </td>
              <td style={styles.thTd}>{app.name}</td>
              <td style={styles.thTd}>{app.email}</td>
              <td style={styles.thTd}>{app.phone}</td>
              <td style={styles.thTd}>{app.faculty_name}</td>
              <td style={styles.thTd}>{app.course_name}</td>
              <td style={styles.thTd}>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'Accepted')}
                  style={styles.button}
                  disabled={app.status === 'Accepted'}
                >
                  Accept
                </button>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                  style={styles.button}
                  disabled={app.status === 'Rejected'}
                >
                  Reject
                </button>
                <button
                  onClick={() => handleUpdateStatus(app.id, 'Pending')}
                  style={styles.button}
                  disabled={app.status === 'Pending'}
                >
                 Pending
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ViewApplications;
