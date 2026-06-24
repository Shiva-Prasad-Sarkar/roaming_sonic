import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../../services/api';
import axios from 'axios';
import './ManageHotels.css';

const ManageHotels = () => {
  const [hotels, setHotels] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' or 'bookings'
  const [bookings, setBookings] = useState([]);
  const [rejectModal, setRejectModal] = useState({ show: false, bookingId: null, message: '' });
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'hotel',
    address: {
      street: '',
      city: '',
      district: '',
      division: 'Dhaka',
      zipCode: ''
    },
    location: {
      coordinates: [90.4125, 23.8103] // Default to Dhaka
    },
    phone: '',
    email: '',
    website: '',
    photos: [],
    rooms: [],
    amenities: [],
    facilities: {
      parking: false,
      wifi: false,
      restaurant: false,
      swimmingPool: false,
      gym: false,
      spa: false,
      conferenceRoom: false,
      airportShuttle: false,
      petFriendly: false,
      ac: false
    },
    checkInTime: '14:00',
    checkOutTime: '12:00',
    refundPolicy: {
      fullRefundHours: 24,
      partialRefundPercentage: 70,
      noRefundHours: 0
    }
  });
  const [newRoom, setNewRoom] = useState({
    type: 'single',
    name: '',
    description: '',
    pricePerNight: 0,
    maxGuests: 2,
    totalRooms: 1,
    amenities: [],
    photos: []
  });
  const [photoInput, setPhotoInput] = useState({ 
    file: null, 
    caption: '', 
    type: 'hotel',
    preview: null 
  });
  const [photoFiles, setPhotoFiles] = useState([]);

  useEffect(() => {
    fetchHotels();
    if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

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

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/hotel-bookings/owner-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to fetch bookings');
    }
  };

  const handleConfirmBooking = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/hotel-bookings/${bookingId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking confirmed successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Failed to confirm booking');
    }
  };

  const handleRejectBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/hotel-bookings/${rejectModal.bookingId}/reject`,
        { message: rejectModal.message },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking rejected successfully');
      setRejectModal({ show: false, bookingId: null, message: '' });
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    }
  };

  const openRejectModal = (bookingId) => {
    setRejectModal({ show: true, bookingId, message: '' });
  };

  const handleCancelBooking = async (bookingId) => {
    const reason = prompt('Please provide a reason for cancellation:');
    if (!reason) return;

    if (!window.confirm('Are you sure you want to cancel this booking? The customer will receive a full refund.')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/bookings/${bookingId}/hotel-cancel`,
        { cancellationReason: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking cancelled successfully. Customer will be notified.');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFacilityChange = (facility) => {
    setFormData(prev => ({
      ...prev,
      facilities: {
        ...prev.facilities,
        [facility]: !prev.facilities[facility]
      }
    }));
  };

  const handlePhotoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        alert('Only image files are allowed');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoInput(prev => ({
          ...prev,
          file: file,
          preview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddPhoto = () => {
    if (photoInput.file && photoFiles.length < 5) {
      const photoData = {
        file: photoInput.file,
        caption: photoInput.caption,
        type: photoInput.type,
        preview: photoInput.preview
      };
      
      setPhotoFiles(prev => [...prev, photoData]);
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, {
          url: photoInput.preview,
          caption: photoInput.caption,
          type: photoInput.type
        }]
      }));
      
      setPhotoInput({ file: null, caption: '', type: 'hotel', preview: null });
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleAddRoom = () => {
    if (newRoom.name && newRoom.pricePerNight > 0) {
      setFormData(prev => ({
        ...prev,
        rooms: [...prev.rooms, { ...newRoom }]
      }));
      setNewRoom({
        type: 'single',
        name: '',
        description: '',
        pricePerNight: 0,
        maxGuests: 2,
        totalRooms: 1,
        amenities: [],
        photos: []
      });
    }
  };

  const handleRemoveRoom = (index) => {
    setFormData(prev => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingHotel
        ? `${BASE_URL}/api/hotels/${editingHotel._id}`
        : `${BASE_URL}/api/hotels`;
      const method = editingHotel ? 'put' : 'post';

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Add simple fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('website', formData.website || '');
      formDataToSend.append('checkInTime', formData.checkInTime);
      formDataToSend.append('checkOutTime', formData.checkOutTime);
      
      // Add nested objects as JSON strings
      formDataToSend.append('address', JSON.stringify(formData.address));
      formDataToSend.append('location', JSON.stringify(formData.location));
      formDataToSend.append('facilities', JSON.stringify(formData.facilities));
      formDataToSend.append('refundPolicy', JSON.stringify(formData.refundPolicy));
      formDataToSend.append('rooms', JSON.stringify(formData.rooms));
      formDataToSend.append('amenities', JSON.stringify(formData.amenities));

      // Add photo files
      photoFiles.forEach((photoData, index) => {
        formDataToSend.append('hotelPhotos', photoData.file);
        formDataToSend.append(`photoCaption${index}`, photoData.caption);
        formDataToSend.append(`photoType${index}`, photoData.type);
      });

      const response = await axios[method](url, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert(response.data.message);
      setShowModal(false);
      resetForm();
      fetchHotels();
    } catch (error) {
      console.error('Error saving hotel:', error);
      console.error('Error response:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to save hotel';
      const errorDetails = error.response?.data?.details;
      if (errorDetails) {
        alert(errorMsg + '\n\nDetails:\n' + errorDetails.map(d => `- ${d.field}: ${d.message}`).join('\n'));
      } else {
        alert(errorMsg);
      }
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      ...hotel,
      address: hotel.address || formData.address,
      location: hotel.location || formData.location,
      facilities: hotel.facilities || formData.facilities,
      refundPolicy: hotel.refundPolicy || formData.refundPolicy
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/hotels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Hotel deleted successfully');
      fetchHotels();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  const resetForm = () => {
    setEditingHotel(null);
    setFormData({
      name: '',
      description: '',
      category: 'hotel',
      address: {
        street: '',
        city: '',
        district: '',
        division: 'Dhaka',
        zipCode: ''
      },
      location: {
        coordinates: [90.4125, 23.8103]
      },
      phone: '',
      email: '',
      website: '',
      photos: [],
      rooms: [],
      amenities: [],
      facilities: {
        parking: false,
        wifi: false,
        restaurant: false,
        swimmingPool: false,
        gym: false,
        spa: false,
        conferenceRoom: false,
        airportShuttle: false,
        petFriendly: false,
        ac: false
      },
      checkInTime: '14:00',
      checkOutTime: '12:00',
      refundPolicy: {
        fullRefundHours: 24,
        partialRefundPercentage: 70,
        noRefundHours: 0
      }
    });
    setPhotoInput({ file: null, caption: '', type: 'hotel', preview: null });
    setPhotoFiles([]);
  };

  if (loading) return <div className="loading">Loading hotels...</div>;

  return (
    <div className="manage-hotels">
      <div className="hotels-header">
        <h1>My Hotels & Resorts</h1>
        <div className="header-actions">
          <div className="tab-buttons">
            <button 
              className={`tab-btn ${activeTab === 'hotels' ? 'active' : ''}`}
              onClick={() => setActiveTab('hotels')}
            >
              My Hotels
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookings')}
            >
              Bookings
            </button>
          </div>
          {activeTab === 'hotels' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>
              + Add New Property
            </button>
          )}
        </div>
      </div>

      {activeTab === 'hotels' ? (
        <div className="hotels-grid">
          {hotels.map(hotel => (
            <div key={hotel._id} className="hotel-card">
              <div className="hotel-image" style={{
                backgroundImage: `url(${hotel.photos[0]?.url || '/Images/hotel-placeholder.jpg'})`
              }}>
                <span className={`status-badge ${hotel.verificationStatus}`}>
                  {hotel.verificationStatus}
                </span>
              </div>
              <div className="hotel-info">
                <h3>{hotel.name}</h3>
                <p className="category">{hotel.category}</p>
                <p className="location">📍 {hotel.address?.city}, {hotel.address?.division}</p>
                <p className="rooms">🛏️ {hotel.rooms?.length} Room Types</p>
                <div className="rating">
                  ⭐ {hotel.rating?.toFixed(1) || '0.0'} ({hotel.totalReviews || 0} reviews)
                </div>
                <div className="hotel-actions">
                  <button className="btn-edit" onClick={() => handleEdit(hotel)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(hotel._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bookings-section">
          <h2>Hotel Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings yet</p>
          ) : (
            <div className="bookings-table">
              {bookings.map(booking => (
                <div key={booking._id} className="booking-row">
                  <div className="booking-details">
                    <h3>{booking.hotel?.name}</h3>
                    <p><strong>Guest:</strong> {booking.user?.name} ({booking.user?.email})</p>
                    <p><strong>Phone:</strong> {booking.user?.phone}</p>
                    <p><strong>Check-in:</strong> {new Date(booking.checkInDate).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                    <p><strong>Room Type:</strong> {booking.roomType}</p>
                    <p><strong>Guests:</strong> {booking.numberOfGuests}</p>
                    <p><strong>Amount:</strong> ৳{booking.totalAmount}</p>
                    {booking.specialRequests && (
                      <p><strong>Special Requests:</strong> {booking.specialRequests}</p>
                    )}
                    <span className={`booking-status ${booking.status}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="booking-actions">
                    {booking.status === 'pending' && (
                      <>
                        <button 
                          className="btn-success"
                          onClick={() => handleConfirmBooking(booking._id)}
                        >
                          ✓ Confirm
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => openRejectModal(booking._id)}
                        >
                          ✕ Reject
                        </button>
                      </>
                    )}
                    {booking.status === 'confirmed' && (
                      <button 
                        className="btn-danger"
                        onClick={() => handleCancelBooking(booking._id)}
                      >
                        🚫 Cancel Booking
                      </button>
                    )}
                    {booking.status === 'cancelled' && (
                      <div className="cancelled-message" style={{color: '#ef4444', fontSize: '14px', fontStyle: 'italic'}}>
                        ⚠️ This booking was cancelled
                      </div>
                    )}
                    {booking.ownerMessage && (
                      <div className="owner-message">
                        <strong>Message:</strong> {booking.ownerMessage}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                {/* Basic Info */}
                <div className="form-section">
                  <h3>Basic Information</h3>
                  <input
                    type="text"
                    name="name"
                    placeholder="Hotel Name *"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                  <textarea
                    name="description"
                    placeholder="Description *"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="4"
                    required
                  />
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="hotel">Hotel</option>
                    <option value="resort">Resort</option>
                    <option value="guest-house">Guest House</option>
                    <option value="hostel">Hostel</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </div>

                {/* Address */}
                <div className="form-section">
                  <h3>Location</h3>
                  <input
                    type="text"
                    name="address.street"
                    placeholder="Street Address"
                    value={formData.address.street}
                    onChange={handleInputChange}
                  />
                  <input
                    type="text"
                    name="address.city"
                    placeholder="City *"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="text"
                    name="address.district"
                    placeholder="District *"
                    value={formData.address.district}
                    onChange={handleInputChange}
                    required
                  />
                  <select name="address.division" value={formData.address.division} onChange={handleInputChange}>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Rajshahi">Rajshahi</option>
                    <option value="Khulna">Khulna</option>
                    <option value="Barisal">Barisal</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rangpur">Rangpur</option>
                    <option value="Mymensingh">Mymensingh</option>
                  </select>
                  <input
                    type="text"
                    name="address.zipCode"
                    placeholder="Zip Code"
                    value={formData.address.zipCode}
                    onChange={handleInputChange}
                  />
                  <div className="map-coords">
                    <label>Google Maps Coordinates</label>
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Longitude"
                      value={formData.location.coordinates[0]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: {
                          coordinates: [parseFloat(e.target.value), prev.location.coordinates[1]]
                        }
                      }))}
                    />
                    <input
                      type="number"
                      step="0.0001"
                      placeholder="Latitude"
                      value={formData.location.coordinates[1]}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        location: {
                          coordinates: [prev.location.coordinates[0], parseFloat(e.target.value)]
                        }
                      }))}
                    />
                    <small>Get coordinates from Google Maps (Right-click → "What's here?")</small>
                  </div>
                </div>

                {/* Contact */}
                <div className="form-section">
                  <h3>Contact Information</h3>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number *"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                  <input
                    type="url"
                    name="website"
                    placeholder="Website"
                    value={formData.website}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Photos */}
                <div className="form-section">
                  <h3>Photos (Max 5) - Upload images from your device</h3>
                  <div className="photo-input">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoFileChange}
                      style={{ gridColumn: '1 / 2' }}
                    />
                    <input
                      type="text"
                      placeholder="Caption (optional)"
                      value={photoInput.caption}
                      onChange={(e) => setPhotoInput(prev => ({ ...prev, caption: e.target.value }))}
                    />
                    <select
                      value={photoInput.type}
                      onChange={(e) => setPhotoInput(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="hotel">Hotel</option>
                      <option value="room">Room</option>
                      <option value="facility">Facility</option>
                      <option value="restaurant">Restaurant</option>
                      <option value="other">Other</option>
                    </select>
                    <button 
                      type="button" 
                      onClick={handleAddPhoto} 
                      disabled={!photoInput.file || photoFiles.length >= 5}
                    >
                      Add Photo ({photoFiles.length}/5)
                    </button>
                  </div>
                  {photoInput.preview && (
                    <div className="photo-preview">
                      <img src={photoInput.preview} alt="Preview" style={{ maxWidth: '200px', marginTop: '10px' }} />
                    </div>
                  )}
                  <div className="photos-list">
                    {formData.photos.map((photo, index) => (
                      <div key={index} className="photo-item">
                        <img src={photo.url} alt={photo.caption} />
                        <div className="photo-details">
                          <span className="photo-type">{photo.type}</span>
                          <span className="photo-caption">{photo.caption || 'No caption'}</span>
                        </div>
                        <button type="button" onClick={() => handleRemovePhoto(index)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Facilities */}
                <div className="form-section">
                  <h3>Facilities</h3>
                  <div className="facilities-grid">
                    {Object.keys(formData.facilities).map(facility => (
                      <label key={facility} className="facility-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.facilities[facility]}
                          onChange={() => handleFacilityChange(facility)}
                        />
                        <span>{facility.replace(/([A-Z])/g, ' $1').trim()}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rooms */}
                <div className="form-section full-width">
                  <h3>Room Types & Details</h3>
                  <div className="room-input" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '15px'}}>
                    <div>
                      <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666'}}>Room Type</label>
                      <select
                        value={newRoom.type}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, type: e.target.value }))}
                        style={{width: '100%', padding: '8px'}}
                      >
                        <option value="single">Single Room</option>
                        <option value="double">Double Room</option>
                        <option value="deluxe">Deluxe Room</option>
                        <option value="suite">Suite</option>
                        <option value="family">Family Room</option>
                      </select>
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666'}}>Room Name *</label>
                      <input
                        type="text"
                        placeholder="e.g., Standard Single"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, name: e.target.value }))}
                        style={{width: '100%', padding: '8px'}}
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666'}}>Price per Night (৳) *</label>
                      <input
                        type="number"
                        placeholder="2000"
                        value={newRoom.pricePerNight || ''}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, pricePerNight: parseFloat(e.target.value) || 0 }))}
                        style={{width: '100%', padding: '8px'}}
                        min="0"
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666'}}>Number of Rooms *</label>
                      <input
                        type="number"
                        placeholder="10"
                        value={newRoom.totalRooms || ''}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, totalRooms: parseInt(e.target.value) || 1 }))}
                        style={{width: '100%', padding: '8px'}}
                        min="1"
                      />
                    </div>
                    <div>
                      <label style={{display: 'block', fontSize: '12px', marginBottom: '5px', color: '#666'}}>Max Guests</label>
                      <input
                        type="number"
                        placeholder="2"
                        value={newRoom.maxGuests || ''}
                        onChange={(e) => setNewRoom(prev => ({ ...prev, maxGuests: parseInt(e.target.value) || 2 }))}
                        style={{width: '100%', padding: '8px'}}
                        min="1"
                      />
                    </div>
                    <div style={{display: 'flex', alignItems: 'flex-end'}}>
                      <button 
                        type="button" 
                        onClick={handleAddRoom}
                        style={{width: '100%', padding: '8px', backgroundColor: '#14b8a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500'}}
                        disabled={!newRoom.name || !newRoom.pricePerNight || newRoom.pricePerNight <= 0}
                      >
                        + Add Room
                      </button>
                    </div>
                  </div>
                  <div className="rooms-list">
                    {formData.rooms.length === 0 ? (
                      <p style={{color: '#999', fontStyle: 'italic', textAlign: 'center', padding: '20px'}}>No rooms added yet. Add room types above.</p>
                    ) : (
                      formData.rooms.map((room, index) => (
                        <div key={index} className="room-item" style={{padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', marginBottom: '10px'}}>
                          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'start'}}>
                            <div>
                              <h4 style={{margin: '0 0 8px 0', color: '#14b8a6'}}>{room.name}</h4>
                              <p style={{margin: '0', color: '#666', fontSize: '14px'}}>
                                <strong>Type:</strong> {room.type.charAt(0).toUpperCase() + room.type.slice(1)} | 
                                <strong> Price:</strong> ৳{room.pricePerNight}/night | 
                                <strong> Rooms Available:</strong> {room.totalRooms} | 
                                <strong> Max Guests:</strong> {room.maxGuests}
                              </p>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveRoom(index)}
                              style={{padding: '6px 12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'}}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                    ))}
                  </div>
                </div>

                {/* Check-in/out & Refund Policy */}
                <div className="form-section">
                  <h3>Policies</h3>
                  <label>Check-in Time</label>
                  <input
                    type="time"
                    name="checkInTime"
                    value={formData.checkInTime}
                    onChange={handleInputChange}
                  />
                  <label>Check-out Time</label>
                  <input
                    type="time"
                    name="checkOutTime"
                    value={formData.checkOutTime}
                    onChange={handleInputChange}
                  />
                  <label>Full Refund (hours before check-in)</label>
                  <input
                    type="number"
                    value={formData.refundPolicy.fullRefundHours}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      refundPolicy: { ...prev.refundPolicy, fullRefundHours: parseInt(e.target.value) }
                    }))}
                  />
                  <label>Partial Refund Percentage (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.refundPolicy.partialRefundPercentage}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      refundPolicy: { ...prev.refundPolicy, partialRefundPercentage: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">
                  {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); resetForm(); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Booking Modal */}
      {rejectModal.show && (
        <div className="modal-overlay" onClick={() => setRejectModal({ show: false, bookingId: null, message: '' })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <h2>Reject Booking</h2>
            <p>Please provide a reason for rejection:</p>
            <textarea
              value={rejectModal.message}
              onChange={(e) => setRejectModal({ ...rejectModal, message: e.target.value })}
              placeholder="Reason for rejection (optional)"
              rows="4"
              style={{ width: '100%', padding: '10px', marginBottom: '20px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <div className="modal-actions">
              <button 
                className="btn-danger"
                onClick={handleRejectBooking}
              >
                Confirm Rejection
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setRejectModal({ show: false, bookingId: null, message: '' })}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageHotels;
