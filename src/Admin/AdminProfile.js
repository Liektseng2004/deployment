import React, { useEffect, useState } from 'react';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/1');
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/api/profile/upload/1', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setProfile((prevProfile) => ({
        ...prevProfile,
        profile_pic: data.profilePicUrl,
      }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#111', color: '#fff', fontFamily: 'Arial' }}>
      <div>
        <img
          src={`http://localhost:5000${profile.profile_pic || '/uploads'}`}
          alt="Profile Icon"
          style={{ borderRadius: '50%', width: '100px', height: '100px' }}
        />
      </div>
      <h2>{profile.username}</h2>
      <p>Email: {profile.email}</p>
     
      
      <div>
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload Profile Picture</button>
      </div>
    </div>
  );
};

export default Profile;
