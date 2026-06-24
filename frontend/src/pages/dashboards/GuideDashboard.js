import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { userService , BASE_URL } from '../../services/api';
import axios from 'axios';

const GuideDashboard = () => {
  const { updateUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [requests, setRequests] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    experience: '',
    hourlyRate: '',
    languages: [],
    specializations: [],
    divisions: [],
    availability: true,
    nidNumber: '',
    passportNumber: ''
  });

  const availableLanguages = [
    'Bengali',
    'English',
    'Hindi',
    'Urdu',
    'Arabic',
    'Chinese',
    'Japanese',
    'French'
  ];

  const availableDivisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh'
  ];

  const availableSpecializations = [
    'Historical Tours',
    'Adventure Tours',
    'Religious Sites',
    'Beach Tours',
    'Hill Tracts',
    'Wildlife',
    'Cultural Tours',
    'Food Tours'
  ];

  // Handle URL section parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('tab') || params.get('section') || 'overview';
    setActiveSection(section);
  }, [location.search]);

  useEffect(() => {
    fetchProfile();
    if (activeSection === 'bookings') {
      fetchRequests();
    }
  }, [activeSection]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        phone: response.data.user.phone || '',
        bio: response.data.user.bio || '',
        experience: response.data.user.experience || '',
        hourlyRate: response.data.user.hourlyRate || '',
        languages: response.data.user.languages || [],
        specializations: response.data.user.specializations || [],
        divisions: response.data.user.divisions || [],
        availability: response.data.user.availability !== false,
        nidNumber: response.data.user.nidNumber || '',
        passportNumber: response.data.user.passportNumber || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/guide-requests/guide`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const toggleSpecialization = (spec) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter(l => l !== lang)
        : [...prev.languages, lang]
    }));
  };

  const togglePlace = (division) => {
    setFormData(prev => ({
      ...prev,
      divisions: prev.divisions.includes(division)
        ? prev.divisions.filter(d => d !== division)
        : [...prev.divisions, division]
    }));
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
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        experience: formData.experience,
        hourlyRate: formData.hourlyRate,
        nidNumber: formData.nidNumber,
        passportNumber: formData.passportNumber,
        availability: formData.availability,
        languages: formData.languages,
        specializations: formData.specializations,
        divisions: formData.divisions
      };
      
      await userService.updateProfile(updateData);
      alert('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleRequestAction = async (requestId, status, responseMessage = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/guide-requests/${requestId}`,
        { status, responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Request ${status} successfully!`);
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Failed to update request');
    }
  };

  const handleReapply = async () => {
    if (!window.confirm('Are you sure you want to reapply for guide approval? Your profile will be reviewed by admin again.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/guides/reapply`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message);
      fetchProfile(); // Refresh profile to show updated status
    } catch (error) {
      console.error('Error reapplying:', error);
      alert(error.response?.data?.message || 'Failed to reapply. Please try again.');
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
        <h1>Guide Dashboard 🎯</h1>
        <p>Manage your guide profile and bookings</p>
      </div>

      {/* Approval Status Alert */}
      {profile?.userType === 'guide' && profile?.approvalStatus === 'rejected' && (
        <div className="alert alert-danger" style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '15px 20px',
          marginBottom: '20px'
        }}>
          <div style={{display: 'flex', alignItems: 'flex-start', gap: '10px'}}>
            <span style={{fontSize: '24px'}}>❌</span>
            <div style={{flex: 1}}>
              <strong>Guide Request Denied</strong>
              <p style={{margin: '5px 0 10px 0', color: '#c33'}}>
                Your guide registration request has been rejected by the administrator. 
                You can update your profile and reapply for approval.
              </p>
              <button 
                onClick={handleReapply}
                className="btn-primary"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  backgroundColor: '#ff6b6b',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                🔄 Reapply for Approval
              </button>
            </div>
          </div>
        </div>
      )}

      {profile?.userType === 'guide' && profile?.approvalStatus === 'pending' && (
        <div className="alert alert-warning" style={{
          backgroundColor: '#fff8e1',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          padding: '15px 20px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{fontSize: '24px'}}>⏳</span>
          <div>
            <strong>Approval Pending</strong>
            <p style={{margin: '5px 0 0 0', color: '#f57c00'}}>
              Your guide registration is pending admin approval. You will be notified once your request is reviewed.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="section-tabs">
        <button 
          className={activeSection === 'overview' ? 'active' : ''}
          onClick={() => { setActiveSection('overview'); window.history.pushState({}, '', '/dashboard'); }}
        >
          📊 Overview
        </button>
        <button 
          className={activeSection === 'bookings' ? 'active' : ''}
          onClick={() => { setActiveSection('bookings'); window.history.pushState({}, '', '/dashboard?tab=bookings'); }}
        >
          📋 Bookings
        </button>
        <button 
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => { setActiveSection('profile'); window.history.pushState({}, '', '/dashboard?tab=profile'); }}
        >
          👤 Edit Profile
        </button>
      </div>

      {activeSection === 'overview' && (
        <>
      <div className="dashboard-header">
        <h1>Welcome, {profile?.name}! 🎯</h1>
        <p>Your guide statistics and information</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-details">
            <h3>Approval Status</h3>
            <p className="stat-value" style={{fontSize: '16px'}}>
              <span className={`badge ${
                profile?.approvalStatus === 'approved' ? 'badge-success' : 
                profile?.approvalStatus === 'rejected' ? 'badge-danger' : 
                'badge-warning'
              }`}>
                {profile?.approvalStatus === 'approved' ? '✓ Approved' : 
                 profile?.approvalStatus === 'rejected' ? '✗ Rejected' : 
                 '⏳ Pending'}
              </span>
            </p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-details">
            <h3>Rating</h3>
            <p className="stat-value">{profile?.rating?.toFixed(1) || '0.0'}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-details">
            <h3>Total Reviews</h3>
            <p className="stat-value">{profile?.totalReviews || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-details">
            <h3>Hourly Rate</h3>
            <p className="stat-value">৳{profile?.hourlyRate || 0}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-details">
            <h3>Availability</h3>
            <p className="stat-value" style={{fontSize: '16px'}}>
              <span className={`badge ${profile?.availability ? 'badge-success' : 'badge-danger'}`}>
                {profile?.availability ? 'Available' : 'Unavailable'}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="content-card">
        {/* Profile Photo Section */}
        <div style={{textAlign: 'center', marginBottom: '30px'}}>
          <div style={{
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            margin: '0 auto 20px',
            overflow: 'hidden',
            border: '4px solid #667eea',
            background: '#f0f0f0'
          }}>
            {profile?.photo && profile.photo !== 'default-avatar.png' ? (
              <img
                src={profile.photo?.startsWith('http') ? profile.photo : `${BASE_URL}${profile.photo}`}
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
                fontSize: '60px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}>
                {profile?.name?.charAt(0) || 'G'}
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
            <label htmlFor="photoUpload" className="btn-outline" style={{cursor: 'pointer'}}>
              {uploadingPhoto ? 'Uploading...' : '📷 Change Photo'}
            </label>
          </div>
        </div>

        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2>Guide Profile</h2>
          <button 
            className="btn-primary" 
            onClick={() => setEditing(!editing)}
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Tell tourists about yourself..."
                maxLength="500"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Hourly Rate (৳)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Languages (Select multiple) 🌍</label>
              <div className="language-grid">
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    className={`lang-toggle-btn ${formData.languages.includes(lang) ? 'selected' : ''}`}
                    onClick={() => toggleLanguage(lang)}
                  >
                    {formData.languages.includes(lang) ? '✓ ' : ''}{lang}
                  </button>
                ))}
              </div>
              {formData.languages.length > 0 && (
                <p className="selection-summary">
                  ✓ Selected: {formData.languages.join(', ')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Specializations (Select multiple) 🎯</label>
              <div className="specialization-grid">
                {availableSpecializations.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    className={`spec-toggle-btn ${formData.specializations.includes(spec) ? 'selected' : ''}`}
                    onClick={() => toggleSpecialization(spec)}
                  >
                    {formData.specializations.includes(spec) ? '✓ ' : ''}{spec}
                  </button>
                ))}
              </div>
              {formData.specializations.length > 0 && (
                <p className="selection-summary">
                  ✓ Selected: {formData.specializations.join(', ')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Divisions You Cover (Select multiple) 📍</label>
              <div className="places-grid">
                {availableDivisions.map(division => (
                  <button
                    key={division}
                    type="button"
                    className={`place-toggle-btn ${formData.divisions.includes(division) ? 'selected' : ''}`}
                    onClick={() => togglePlace(division)}
                  >
                    {formData.divisions.includes(division) ? '✓ ' : ''}{division}
                  </button>
                ))}
              </div>
              {formData.divisions.length > 0 && (
                <p className="selection-summary">
                  ✓ Selected: {formData.divisions.join(', ')}
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>NID Number</label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                  style={{width: 'auto', marginRight: '10px'}}
                />
                Available for bookings
              </label>
            </div>

            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        ) : (
          <div className="profile-info">
            <div className="info-row">
              <strong>Name:</strong> {profile?.name}
            </div>
            <div className="info-row">
              <strong>Email:</strong> {profile?.email}
            </div>
            <div className="info-row">
              <strong>Phone:</strong> {profile?.phone}
            </div>
            {profile?.bio && (
              <div className="info-row">
                <strong>Bio:</strong> {profile.bio}
              </div>
            )}
            <div className="info-row">
              <strong>Experience:</strong> {profile?.experience || 0} years
            </div>
            <div className="info-row">
              <strong>Hourly Rate:</strong> ৳{profile?.hourlyRate || 0}
            </div>
            <div className="info-row">
              <strong>Languages:</strong> {profile?.languages?.join(', ') || 'Not specified'}
            </div>
            <div className="info-row">
              <strong>Specializations:</strong> {profile?.specializations?.join(', ') || 'Not specified'}
            </div>
            <div className="info-row">
              <strong>Divisions:</strong> {profile?.divisions?.join(', ') || 'Not specified'}
            </div>
            <div className="info-row">
              <strong>NID Number:</strong> {profile?.nidNumber || 'Not provided'}
            </div>
            <div className="info-row">
              <strong>Passport Number:</strong> {profile?.passportNumber || 'Not provided'}
            </div>
          </div>
        )}
      </div>
      </>
      )}

      {/* Connection Requests Section */}
      {activeSection === 'bookings' && (
        <div className="content-card">
          <h2>Connection Requests 📅</h2>
          {requests.length === 0 ? (
            <p>No connection requests yet.</p>
          ) : (
            <div className="requests-list">
              {requests.map(request => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <div>
                      <h3>{request.tourist?.name || 'Unknown Tourist'}</h3>
                      <p style={{color: '#666', fontSize: '14px'}}>{request.tourist?.email || 'No email'}</p>
                    </div>
                    <span className={`badge badge-${request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : 'danger'}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-details">
                    <p><strong>Destination:</strong> {request.destination}</p>
                    <p><strong>Tour Date:</strong> {new Date(request.tourDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> {request.duration} hours</p>
                    <p><strong>People:</strong> {request.numberOfPeople}</p>
                    <p><strong>Total Cost:</strong> ৳{request.totalCost}</p>
                    {request.message && <p><strong>Message:</strong> {request.message}</p>}
                  </div>
                  {request.status === 'pending' && (
                    <div className="request-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => handleRequestAction(request._id, 'approved', 'Looking forward to guiding you!')}
                      >
                        ✓ Approve
                      </button>
                      <button 
                        className="btn-danger"
                        onClick={() => handleRequestAction(request._id, 'rejected', 'Sorry, not available on this date.')}
                      >
                        ✗ Reject
                      </button>
                    </div>
                  )}
                  {request.status === 'approved' && (
                    <div className="request-actions">
                      <button 
                        className="btn-success"
                        onClick={() => handleRequestAction(request._id, 'completed', 'Tour completed successfully!')}
                      >
                        ✓ Mark as Completed
                      </button>
                    </div>
                  )}
                  {request.responseMessage && (
                    <div className="response-message">
                      <strong>Your Response:</strong> {request.responseMessage}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Section */}
      {activeSection === 'reviews' && (
        <div className="content-card">
          <h2>Reviews & Ratings ⭐</h2>
          {profile?.reviews && profile.reviews.length > 0 ? (
            <div className="reviews-list">
              {profile.reviews.map((review, index) => (
                <div key={index} className="review-item">
                  <div className="review-header">
                    <div className="review-rating">
                      {'⭐'.repeat(review.rating)}
                    </div>
                    <span className="review-date">
                      {new Date(review.date).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && <p className="review-comment">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <p>No reviews yet.</p>
          )}
        </div>
      )}

      {/* Profile Edit Section */}
      {activeSection === 'profile' && (
        <div className="content-card">
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2>Edit Profile</h2>
          </div>

          <form onSubmit={handleSubmit} className="dashboard-form">
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Bio</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows="3"
                placeholder="Tell tourists about yourself..."
                maxLength="500"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Experience (Years)</label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Hourly Rate (৳)</label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Languages (Select multiple) 🌍</label>
              <div className="language-grid">
                {availableLanguages.map(lang => (
                  <button
                    key={lang}
                    type="button"
                    className={`lang-toggle-btn ${formData.languages.includes(lang) ? 'selected' : ''}`}
                    onClick={() => toggleLanguage(lang)}
                  >
                    {formData.languages.includes(lang) ? '✓ ' : ''}{lang}
                  </button>
                ))}
              </div>
              {formData.languages.length > 0 && (
                <p className="selection-summary">
                  ✓ Selected: {formData.languages.join(', ')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Specializations (Select multiple) 🎯</label>
              <div className="specialization-grid">
                {availableSpecializations.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    className={`spec-toggle-btn ${formData.specializations.includes(spec) ? 'selected' : ''}`}
                    onClick={() => toggleSpecialization(spec)}
                  >
                    {formData.specializations.includes(spec) ? '✓ ' : ''}{spec}
                  </button>
                ))}
              </div>
              {formData.specializations.length > 0 && (
                <p className="selection-summary">
                  ✓ Selected: {formData.specializations.join(', ')}
                </p>
              )}
            </div>

            <div className="form-group">
              <label>Divisions You Cover (Select multiple) 📍</label>
              <div className="places-grid">
                {availableDivisions.map(division => (
                  <button
                    key={division}
                    type="button"
                    className={`place-toggle-btn ${formData.divisions.includes(division) ? 'selected' : ''}`}
                    onClick={() => togglePlace(division)}
                  >
                    {formData.divisions.includes(division) ? '✓ ' : ''}{division}
                  </button>
                ))}
              </div>
              {formData.divisions.length > 0 && (
                <p className="selection-summary">
                  ✓ Selected: {formData.divisions.join(', ')}
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>NID Number</label>
                <input
                  type="text"
                  name="nidNumber"
                  value={formData.nidNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Passport Number</label>
                <input
                  type="text"
                  name="passportNumber"
                  value={formData.passportNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                  style={{width: 'auto', marginRight: '10px'}}
                />
                Available for bookings
              </label>
            </div>

            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
};

export default GuideDashboard;
