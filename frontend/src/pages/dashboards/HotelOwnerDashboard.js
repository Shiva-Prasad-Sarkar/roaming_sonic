import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import ManageHotels from './ManageHotels';
import axios from 'axios';

const HotelOwnerDashboard = () => {
  const { updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('photo', file);

    try {
      setUploadingPhoto(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/users/upload-photo`,
        formDataUpload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      alert('Photo uploaded successfully!');
      fetchProfile();
      const updatedPhoto = response.data?.data?.photo || response.data?.data?.user?.photo || response.data?.user?.photo;
      if (updatedPhoto) {
        updateUser({ photo: updatedPhoto });
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1>Hotel Owner Dashboard 🏨</h1>
        <p>Manage your hotels</p>
      </div>

      {/* Profile Photo Section */}
      <div className="content-card" style={{marginBottom: '20px', padding: '20px'}}>
        <div style={{textAlign: 'center'}}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            margin: '0 auto 15px',
            overflow: 'hidden',
            border: '3px solid #667eea',
            background: '#f0f0f0'
          }}>
            {profile?.photo && profile.photo !== 'default-avatar.png' ? (
              <img 
                src={`${BASE_URL}${profile.photo}`} 
                alt={profile.name}
                style={{width: '100%', height: '100%', objectFit: 'cover'}}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                {profile?.name?.charAt(0) || 'H'}
              </div>
            )}
          </div>
          <div>
            <input
              type="file"
              id="photoUpload"
              accept="image/*"
              onChange={handlePhotoUpload}
              style={{display: 'none'}}
            />
            <label htmlFor="photoUpload" className="btn-primary" style={{cursor: 'pointer', padding: '8px 16px', fontSize: '14px'}}>
              {uploadingPhoto ? '⏳ Uploading...' : '📷 Upload Photo'}
            </label>
          </div>
        </div>
      </div>

      {/* Hotels Management */}
      <ManageHotels />
    </DashboardLayout>
  );
};

export default HotelOwnerDashboard;
