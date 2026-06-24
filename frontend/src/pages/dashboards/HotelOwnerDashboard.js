import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../services/api';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import ManageHotels from './ManageHotels';
import axios from 'axios';

const HotelOwnerDashboard = () => {
  const { user, updateUser } = useAuth();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [profile, setProfile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hotel',
    phone: '',
    email: '',
    'address.city': '',
    'address.district': '',
    'address.division': 'Dhaka',
    'facilities.wifi': false,
    'facilities.parking': false,
    'facilities.restaurant': false,
    'facilities.swimmingPool': false,
    'facilities.gym': false
  });

  useEffect(() => {
    fetchHotels();
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
    }
  };

  const fetchHotels = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/hotels/my/hotels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHotels(response.data.data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const hotelData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        phone: formData.phone,
        email: formData.email,
        address: {
          city: formData['address.city'],
          district: formData['address.district'],
          division: formData['address.division']
        },
        facilities: {
          wifi: formData['facilities.wifi'],
          parking: formData['facilities.parking'],
          restaurant: formData['facilities.restaurant'],
          swimmingPool: formData['facilities.swimmingPool'],
          gym: formData['facilities.gym']
        }
      };

      await axios.post(`${BASE_URL}/api/hotels`, hotelData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Hotel added successfully! Pending admin approval.');
      setShowAddForm(false);
      fetchHotels();
      setFormData({
        name: '',
        description: '',
        category: 'hotel',
        phone: '',
        email: '',
        'address.city': '',
        'address.district': '',
        'address.division': 'Dhaka',
        'facilities.wifi': false,
        'facilities.parking': false,
        'facilities.restaurant': false,
        'facilities.swimmingPool': false,
        'facilities.gym': false
      });
    } catch (error) {
      console.error('Error adding hotel:', error);
      alert('Failed to add hotel');
    }
  };

  const handleDelete = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/hotels/${hotelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
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
