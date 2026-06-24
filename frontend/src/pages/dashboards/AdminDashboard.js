import React, { useEffect, useState } from 'react';
import { BASE_URL } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import ManageCoupons from './ManageCoupons';

const AdminDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Get active section from URL or default to overview
  const searchParams = new URLSearchParams(location.search);
  const [activeSection, setActiveSection] = useState(searchParams.get('tab') || 'overview');

  // Update active section when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'overview';
    setActiveSection(tab);
  }, [location.search]);
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    tourists: 0,
    guides: 0,
    hotelOwners: 0,
    admins: 0,
    pendingGuides: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  // Data states
  const [hotels, setHotels] = useState([]);
  const [guides, setGuides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tours, setTours] = useState([]);
  const [users, setUsers] = useState([]);
  const [buses, setBuses] = useState([]);
  const [groupTours, setGroupTours] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Tour form state
  const [showTourForm, setShowTourForm] = useState(true);
  const [editingTour, setEditingTour] = useState(null);
  const [tourForm, setTourForm] = useState({
    title: '',
    description: '',
    destination: '',
    duration: { days: 1, nights: 1 },
    price: '',
    category: 'Adventure',
    difficulty: 'Easy',
    includes: '',
    excludes: '',
    images: '',
    imageFiles: [],
    maxGroupSize: 20,
    isForeign: false
  });

  // Bus form state
  const [showBusForm, setShowBusForm] = useState(true);
  const [editingBus, setEditingBus] = useState(null);
  const [busForm, setBusForm] = useState({
    name: '',
    busNumber: '',
    busType: 'AC',
    totalSeats: 40,
    seatLayout: '2-2',
    from: '',
    to: '',
    departureTime: '',
    arrivalTime: '',
    duration: '',
    fare: '',
    amenities: '',
    images: '',
    contactNumber: ''
  });

  // Sync activeSection from URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab') || 'overview';
    setActiveSection(tab);
  }, [location.search]);

  // Fetch data when active section changes
  useEffect(() => {
    fetchData();
  }, [activeSection]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Fetch stats
      const [userStatsRes, bookingStatsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/users/admin/stats`, config),
        axios.get(`${BASE_URL}/api/bookings/stats`, config)
      ]);

      setStats({
        ...userStatsRes.data.data,
        ...bookingStatsRes.data.data
      });

      // Fetch data for active section
      if (activeSection === 'hotels') {
        const hotelsRes = await axios.get(`${BASE_URL}/api/hotels/admin/all`, config);
        setHotels(hotelsRes.data.data || []);
      } else if (activeSection === 'guides') {
        const guidesRes = await axios.get(`${BASE_URL}/api/guides/admin/pending`, config);
        setGuides(guidesRes.data.data);
      } else if (activeSection === 'bookings') {
        const bookingsRes = await axios.get(`${BASE_URL}/api/bookings`, config);
        setBookings(bookingsRes.data.data);
      } else if (activeSection === 'tours') {
        const toursRes = await axios.get(`${BASE_URL}/api/tours`, config);
        setTours(toursRes.data.data);
      } else if (activeSection === 'buses') {
        const busesRes = await axios.get(`${BASE_URL}/api/buses`, config);
        setBuses(busesRes.data.data);
      } else if (activeSection === 'users') {
        const usersRes = await axios.get(`${BASE_URL}/api/users/admin/all`, config);
        setUsers(usersRes.data.data);
      } else if (activeSection === 'group-tours') {
        const groupToursRes = await axios.get(`${BASE_URL}/api/group-tours/admin/pending`, config);
        setGroupTours(groupToursRes.data.data || []);
      } else if (activeSection === 'complaints') {
        const complaintsRes = await axios.get(`${BASE_URL}/api/complaints`, config);
        setComplaints(complaintsRes.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSection !== 'overview') {
      fetchData();
    }
  }, [activeSection]);

  // Hotel actions
  const handleVerifyHotel = async (hotelId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${BASE_URL}/api/hotels/${hotelId}/verify`,
        { verificationStatus: status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Hotel ${status} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error verifying hotel:', error);
      alert('Failed to verify hotel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteHotel = async (hotelId) => {
    if (!window.confirm('Are you sure you want to delete this hotel?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/hotels/${hotelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Hotel deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting hotel:', error);
      alert('Failed to delete hotel');
    }
  };

  // Guide actions
  const handleApproveGuide = async (guideId, approvalStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/guides/${guideId}/approval`,
        { status: approvalStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`Guide ${approvalStatus} successfully`);
      fetchData();
    } catch (error) {
      console.error('Error updating guide:', error);
      alert('Failed to update guide');
    }
  };

  // Group Tour actions
  const handleApproveGroupTour = async (groupTourId, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/group-tours/${groupTourId}/admin-approval`,
        { status: 'approved', adminNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Group tour approved successfully');
      fetchData();
    } catch (error) {
      console.error('Error approving group tour:', error);
      alert('Failed to approve group tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleRejectGroupTour = async (groupTourId, adminNotes = '') => {
    const reason = prompt('Please provide a reason for rejection:', adminNotes);
    if (reason === null) return; // User cancelled
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/group-tours/${groupTourId}/admin-approval`,
        { status: 'rejected', adminNotes: reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Group tour rejected');
      fetchData();
    } catch (error) {
      console.error('Error rejecting group tour:', error);
      alert('Failed to reject group tour: ' + (error.response?.data?.message || error.message));
    }
  };

  // Booking actions
  const handleUpdateBookingStatus = async (bookingId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/bookings/${bookingId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Booking status updated');
      fetchData();
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  // Complaints actions
  const handleUpdateComplaint = async (complaintId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/complaints/${complaintId}`,
        updates,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Complaint updated successfully');
      setSelectedComplaint(null);
      setFeedbackText('');
      fetchData();
    } catch (error) {
      console.error('Error updating complaint:', error);
      alert('Failed to update complaint: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) {
      alert('Please enter feedback');
      return;
    }
    await handleUpdateComplaint(selectedComplaint._id, {
      adminFeedback: feedbackText,
      status: 'in-progress'
    });
  };

  // Tour actions
  const handleTourSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');

      const formData = new FormData();
      formData.append('title', tourForm.title);
      formData.append('description', tourForm.description);
      formData.append('destination', tourForm.destination);
      formData.append('duration', JSON.stringify(tourForm.duration));
      formData.append('price', tourForm.price);
      formData.append('category', tourForm.category);
      formData.append('difficulty', tourForm.difficulty);
      formData.append('maxGroupSize', tourForm.maxGroupSize);
      formData.append('isForeign', tourForm.isForeign);

      // Handle includes and excludes
      const includesArray = tourForm.includes ? tourForm.includes.split(',').map(item => item.trim()) : [];
      const excludesArray = tourForm.excludes ? tourForm.excludes.split(',').map(item => item.trim()) : [];
      formData.append('includes', JSON.stringify(includesArray));
      formData.append('excludes', JSON.stringify(excludesArray));

      // Handle image files
      if (tourForm.imageFiles && tourForm.imageFiles.length > 0) {
        for (let i = 0; i < tourForm.imageFiles.length; i++) {
          formData.append('tourImages', tourForm.imageFiles[i]);
        }
      }

      // Handle image URLs if provided
      if (tourForm.images) {
        const imageUrls = tourForm.images.split(',').map(item => item.trim());
        formData.append('imageUrls', JSON.stringify(imageUrls));
      }

      if (editingTour) {
        await axios.put(`${BASE_URL}/api/tours/${editingTour}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Tour updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/tours`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        alert('Tour created successfully');
      }

      resetTourForm();
      fetchData();
    } catch (error) {
      console.error('Error saving tour:', error);
      alert('Failed to save tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetTourForm = () => {
    setTourForm({
      title: '',
      description: '',
      destination: '',
      duration: { days: 1, nights: 1 },
      price: '',
      category: 'Adventure',
      difficulty: 'Easy',
      includes: '',
      excludes: '',
      images: '',
      imageFiles: [],
      maxGroupSize: 20,
      isForeign: false
    });
    setEditingTour(null);
    setShowTourForm(false);
  };

  const handleEditTour = (tour) => {
    setEditingTour(tour._id);
    setTourForm({
      title: tour.title,
      description: tour.description,
      destination: tour.destination,
      duration: tour.duration,
      price: tour.price,
      category: tour.category,
      difficulty: tour.difficulty,
      includes: tour.includes.join(', '),
      excludes: tour.excludes.join(', '),
      images: tour.images?.join(', ') || '',
      maxGroupSize: tour.maxGroupSize,
      isForeign: tour.isForeign || false
    });
    setShowTourForm(true);
  };

  const handleDeleteTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to delete this tour?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/tours/${tourId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Tour deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting tour:', error);
      alert('Failed to delete tour');
    }
  };

  const handleEndTour = async (tourId) => {
    if (!window.confirm('Are you sure you want to mark this tour as ended? This will reset member count to 0 and mark all bookings as completed.')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/tours/${tourId}/end`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Tour marked as ended successfully. Member count reset to 0.');
      fetchData();
    } catch (error) {
      console.error('Error ending tour:', error);
      alert('❌ Failed to end tour: ' + (error.response?.data?.message || error.message));
    }
  };

  // Bus actions
  const handleBusSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const busData = {
        ...busForm,
        amenities: busForm.amenities ? busForm.amenities.split(',').map(item => item.trim()) : []
      };

      if (editingBus) {
        await axios.put(`${BASE_URL}/api/buses/${editingBus}`, busData, config);
        alert('Bus updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/buses`, busData, config);
        alert('Bus added successfully');
      }

      resetBusForm();
      fetchData();
    } catch (error) {
      console.error('Error saving bus:', error);
      alert('Failed to save bus: ' + (error.response?.data?.message || error.message));
    }
  };

  const resetBusForm = () => {
    setBusForm({
      name: '',
      busNumber: '',
      busType: 'AC',
      totalSeats: 40,
      seatLayout: '2-2',
      from: '',
      to: '',
      departureTime: '',
      arrivalTime: '',
      duration: '',
      fare: '',
      amenities: '',
      contactNumber: ''
    });
    setEditingBus(null);
    setShowBusForm(false);
  };

  const handleEditBus = (bus) => {
    setEditingBus(bus._id);
    setBusForm({
      name: bus.name,
      busNumber: bus.busNumber,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
      seatLayout: bus.seatLayout || '2-2',
      from: bus.from,
      to: bus.to,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      duration: bus.duration,
      fare: bus.fare,
      amenities: bus.amenities?.join(', ') || '',
      contactNumber: bus.contactNumber
    });
    setShowBusForm(true);
  };

  const handleDeleteBus = async (busId) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/buses/${busId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Bus deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting bus:', error);
      alert('Failed to delete bus');
    }
  };

  // User actions
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BASE_URL}/api/users/admin/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/users/admin/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('User role updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error.response?.data?.message || 'Failed to update role');
    }
  };

  if (loading && activeSection === 'overview') {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="dashboard-header">
        <h1>Admin Dashboard 👑</h1>
        <p>Manage all aspects of Roaming Sonic</p>
      </div>

      {/* Navigation Tabs */}
      <div className="section-tabs">
        <button 
          className={activeSection === 'overview' ? 'active' : ''} 
          onClick={() => navigate('/dashboard')}
        >
          📊 Overview
        </button>
        <button 
          className={activeSection === 'hotels' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=hotels')}
        >
          🏨 Hotels
        </button>
        <button 
          className={activeSection === 'guides' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=guides')}
        >
          🎯 Guides {stats.pendingGuides > 0 && <span className="badge">{stats.pendingGuides}</span>}
        </button>
        <button 
          className={activeSection === 'bookings' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=bookings')}
        >
          📋 Bookings
        </button>
        <button 
          className={activeSection === 'tours' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=tours')}
        >
          🗺️ Tours
        </button>
        <button 
          className={activeSection === 'group-tours' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=group-tours')}
        >
          👥 Group Tours
        </button>
        <button 
          className={activeSection === 'buses' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=buses')}
        >
          🚌 Buses
        </button>
        <button 
          className={activeSection === 'users' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=users')}
        >
          👥 Users
        </button>
        <button 
          className={activeSection === 'coupons' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=coupons')}
        >
          🎟️ Coupons
        </button>
        <button 
          className={activeSection === 'complaints' ? 'active' : ''} 
          onClick={() => navigate('/dashboard?tab=complaints')}
        >
          📝 Complaints
        </button>
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <p className="stat-value">{stats.totalUsers}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-details">
              <h3>Tourists</h3>
              <p className="stat-value">{stats.tourists}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-details">
              <h3>Guides</h3>
              <p className="stat-value">{stats.guides}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🏨</div>
            <div className="stat-details">
              <h3>Hotel Owners</h3>
              <p className="stat-value">{stats.hotelOwners}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-details">
              <h3>Pending Guides</h3>
              <p className="stat-value">{stats.pendingGuides}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-details">
              <h3>Total Bookings</h3>
              <p className="stat-value">{stats.totalBookings || 0}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hotels Section */}
      {activeSection === 'hotels' && (
        <div className="content-card">
          <h2>Hotel Management</h2>
          {loading ? (
            <p>Loading hotels...</p>
          ) : hotels.length === 0 ? (
            <p>No hotels found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {hotels.map(hotel => (
                  <tr key={hotel._id}>
                    <td>{hotel.name}</td>
                    <td>{hotel.address?.city || 'N/A'}</td>
                    <td>{hotel.owner?.name || 'N/A'}</td>
                    <td>
                      <span className={`badge badge-${hotel.verificationStatus === 'approved' ? 'success' : hotel.verificationStatus === 'pending' ? 'warning' : 'danger'}`}>
                        {hotel.verificationStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {hotel.verificationStatus === 'pending' && (
                          <>
                            <button 
                              className="btn-sm btn-success"
                              onClick={() => handleVerifyHotel(hotel._id, 'approved')}
                            >
                              ✓ Approve
                            </button>
                            <button 
                              className="btn-sm btn-warning"
                              onClick={() => handleVerifyHotel(hotel._id, 'rejected')}
                            >
                              ✗ Reject
                            </button>
                          </>
                        )}
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleDeleteHotel(hotel._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Guides Section */}
      {activeSection === 'guides' && (
        <div className="content-card">
          <h2>Pending Guide Approvals</h2>
          {loading ? (
            <p>Loading guides...</p>
          ) : guides.length === 0 ? (
            <p>No pending guide approvals.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Experience</th>
                  <th>Languages</th>
                  <th>Specializations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {guides.map(guide => (
                  <tr key={guide._id}>
                    <td>{guide.name}</td>
                    <td>{guide.email}</td>
                    <td>{guide.experience || 0} years</td>
                    <td>{guide.languages?.join(', ') || 'N/A'}</td>
                    <td>{guide.specializations?.join(', ') || 'N/A'}</td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-sm btn-success"
                          onClick={() => handleApproveGuide(guide._id, 'approved')}
                        >
                          ✓ Approve
                        </button>
                        <button 
                          className="btn-sm btn-danger"
                          onClick={() => handleApproveGuide(guide._id, 'rejected')}
                        >
                          ✗ Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Bookings Section */}
      {activeSection === 'bookings' && (
        <div className="content-card">
          <h2>Booking Management</h2>
          {loading ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(booking => (
                  <tr key={booking._id}>
                    <td>{booking.user?.name || 'N/A'}</td>
                    <td>{booking.bookingType}</td>
                    <td>{booking.hotel?.name || booking.bus?.name || booking.tour?.title || 'N/A'}</td>
                    <td>৳{booking.totalAmount}</td>
                    <td>
                      <span className={`badge badge-${booking.status === 'confirmed' ? 'success' : booking.status === 'pending' ? 'warning' : 'danger'}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>{new Date(booking.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {booking.status === 'pending' && (
                          <>
                            <button 
                              className="btn-sm btn-success"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'confirmed')}
                            >
                              Confirm
                            </button>
                            <button 
                              className="btn-sm btn-danger"
                              onClick={() => handleUpdateBookingStatus(booking._id, 'cancelled')}
                            >
                              Cancel
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <button 
                            className="btn-sm btn-success"
                            onClick={() => handleUpdateBookingStatus(booking._id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Tours Section */}
      {activeSection === 'tours' && (
        <>
          <div className="content-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>Tour Packages</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowTourForm(!showTourForm)}
                style={{
                  background: showTourForm ? '#dc3545' : '#28a745',
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {showTourForm ? '✗ Cancel' : '+ Add New Tour Package'}
              </button>
            </div>

            {showTourForm && (
              <form onSubmit={handleTourSubmit} className="tour-form" style={{
                marginBottom: '2rem', 
                padding: '1.5rem', 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                border: '2px solid #667eea',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
              }}>
                <h3 style={{color: 'white', marginBottom: '1.5rem'}}>
                  {editingTour ? '✏️ Edit Tour Package' : '➕ Create New Tour Package'}
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label>Title *</label>
                    <input
                      type="text"
                      value={tourForm.title}
                      onChange={(e) => setTourForm({...tourForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Destination *</label>
                    <input
                      type="text"
                      value={tourForm.destination}
                      onChange={(e) => setTourForm({...tourForm, destination: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label>Description *</label>
                  <textarea
                    value={tourForm.description}
                    onChange={(e) => setTourForm({...tourForm, description: e.target.value})}
                    rows="3"
                    required
                  />
                </div>

                <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem'}}>
                  <div>
                    <label>Days *</label>
                    <input
                      type="number"
                      value={tourForm.duration.days}
                      onChange={(e) => setTourForm({
                        ...tourForm, 
                        duration: {...tourForm.duration, days: parseInt(e.target.value)}
                      })}
                      min="1"
                      required
                    />
                  </div>
                  <div>
                    <label>Nights *</label>
                    <input
                      type="number"
                      value={tourForm.duration.nights}
                      onChange={(e) => setTourForm({
                        ...tourForm, 
                        duration: {...tourForm.duration, nights: parseInt(e.target.value)}
                      })}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label>Price (৳) *</label>
                    <input
                      type="number"
                      value={tourForm.price}
                      onChange={(e) => setTourForm({...tourForm, price: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label>Max Group</label>
                    <input
                      type="number"
                      value={tourForm.maxGroupSize}
                      onChange={(e) => setTourForm({...tourForm, maxGroupSize: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                </div>

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label>Category *</label>
                    <select
                      value={tourForm.category}
                      onChange={(e) => setTourForm({...tourForm, category: e.target.value})}
                      required
                    >
                      <option value="Adventure">Adventure</option>
                      <option value="Cultural">Cultural</option>
                      <option value="Religious">Religious</option>
                      <option value="Beach">Beach</option>
                      <option value="Wildlife">Wildlife</option>
                      <option value="Historical">Historical</option>
                      <option value="Family">Family</option>
                      <option value="Honeymoon">Honeymoon</option>
                    </select>
                  </div>
                  <div>
                    <label>Difficulty *</label>
                    <select
                      value={tourForm.difficulty}
                      onChange={(e) => setTourForm({...tourForm, difficulty: e.target.value})}
                      required
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Challenging">Challenging</option>
                      <option value="Difficult">Difficult</option>
                    </select>
                  </div>
                </div>

                <div style={{marginTop: '1rem'}}>
                  <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer'}}>
                    <input
                      type="checkbox"
                      checked={tourForm.isForeign}
                      onChange={(e) => setTourForm({...tourForm, isForeign: e.target.checked})}
                      style={{width: 'auto', cursor: 'pointer'}}
                    />
                    <span>🌍 Foreign Tour Package</span>
                  </label>
                  <small style={{display: 'block', marginTop: '0.25rem', color: '#666'}}>
                    Check this box if this is an international/foreign tour package
                  </small>
                </div>

                <div>
                  <label>Includes (comma separated)</label>
                  <input
                    type="text"
                    value={tourForm.includes}
                    onChange={(e) => setTourForm({...tourForm, includes: e.target.value})}
                    placeholder="e.g., Accommodation, Meals, Transport"
                  />
                </div>

                <div>
                  <label>Excludes (comma separated)</label>
                  <input
                    type="text"
                    value={tourForm.excludes}
                    onChange={(e) => setTourForm({...tourForm, excludes: e.target.value})}
                    placeholder="e.g., Personal expenses, Tips"
                  />
                </div>

                <div>
                  <label>Upload Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setTourForm({...tourForm, imageFiles: Array.from(e.target.files)})}
                    style={{
                      padding: '10px',
                      background: 'white',
                      borderRadius: '5px',
                      border: '2px dashed #667eea'
                    }}
                  />
                  {tourForm.imageFiles && tourForm.imageFiles.length > 0 && (
                    <small style={{color: 'white', fontSize: '12px', display: 'block', marginTop: '5px'}}>
                      ✓ {tourForm.imageFiles.length} file(s) selected
                    </small>
                  )}
                  <small style={{color: 'white', fontSize: '12px'}}>Upload tour package images (max 5MB each)</small>
                </div>

                <div>
                  <label>Or Image URLs (comma separated)</label>
                  <input
                    type="text"
                    value={tourForm.images}
                    onChange={(e) => setTourForm({...tourForm, images: e.target.value})}
                    placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
                  />
                  <small style={{color: 'white', fontSize: '12px'}}>Alternatively, provide URLs to tour package images</small>
                </div>

                <div style={{display: 'flex', gap: '1rem'}}>
                  <button type="submit" className="btn-primary">
                    {editingTour ? 'Update Tour' : 'Create Tour'}
                  </button>
                  {editingTour && (
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={resetTourForm}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            )}

            {loading ? (
              <p>Loading tours...</p>
            ) : tours.length === 0 ? (
              <p>No tours found.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Destination</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Rating</th>
                    <th>Members</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tours.map(tour => (
                    <tr key={tour._id}>
                      <td>{tour.title}</td>
                      <td>{tour.destination}</td>
                      <td>{tour.duration.days}D/{tour.duration.nights}N</td>
                      <td>৳{tour.price}</td>
                      <td>{tour.category}</td>
                      <td>⭐ {tour.rating.toFixed(1)}</td>
                      <td>{tour.currentMembers || 0}/{tour.maxGroupSize}</td>
                      <td>
                        <span className={`badge ${tour.isEnded ? 'badge-danger' : 'badge-success'}`}>
                          {tour.isEnded ? 'Ended' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-sm btn-primary"
                            onClick={() => handleEditTour(tour)}
                          >
                            ✏️ Edit
                          </button>
                          {!tour.isEnded && (
                            <button 
                              className="btn-sm"
                              style={{background: '#ff9800', color: 'white'}}
                              onClick={() => handleEndTour(tour._id)}
                            >
                              ✅ End Tour
                            </button>
                          )}
                          <button 
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteTour(tour._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Buses Section */}
      {activeSection === 'buses' && (
        <>
          <div className="content-card">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
              <h2>Bus Management</h2>
              <button 
                className="btn-primary"
                onClick={() => setShowBusForm(!showBusForm)}
                style={{
                  background: showBusForm ? '#dc3545' : '#28a745',
                  padding: '10px 20px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                {showBusForm ? '✗ Cancel' : '+ Add New Bus'}
              </button>
            </div>

            {showBusForm && (
              <form onSubmit={handleBusSubmit} className="bus-form" style={{
                marginBottom: '2rem',
                padding: '1.5rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                border: '2px solid #667eea',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.2)'
              }}>
                <h3 style={{color: 'white', marginBottom: '1.5rem'}}>
                  {editingBus ? '✏️ Edit Bus' : '➕ Add New Bus'}
                </h3>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem'}}>
                  <div>
                    <label>Company Name *</label>
                    <input
                      type="text"
                      value={busForm.name}
                      onChange={(e) => setBusForm({...busForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Bus Number *</label>
                    <input
                      type="text"
                      value={busForm.busNumber}
                      onChange={(e) => setBusForm({...busForm, busNumber: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Bus Type *</label>
                    <select
                      value={busForm.busType}
                      onChange={(e) => setBusForm({...busForm, busType: e.target.value})}
                      required
                    >
                      <option value="AC">AC</option>
                      <option value="Non-AC">Non-AC</option>
                      <option value="Sleeper">Sleeper</option>
                      <option value="Semi-Sleeper">Semi-Sleeper</option>
                      <option value="Luxury">Luxury</option>
                    </select>
                  </div>
                  <div>
                    <label>Total Seats *</label>
                    <input
                      type="number"
                      value={busForm.totalSeats}
                      onChange={(e) => setBusForm({...busForm, totalSeats: parseInt(e.target.value)})}
                      min="20"
                      max="60"
                      required
                    />
                  </div>
                  <div>
                    <label>Seat Layout *</label>
                    <select
                      value={busForm.seatLayout}
                      onChange={(e) => setBusForm({...busForm, seatLayout: e.target.value})}
                      required
                    >
                      <option value="2-2">2-2 (Economy)</option>
                      <option value="2-3">2-3 (Standard)</option>
                      <option value="1-2">1-2 (Luxury)</option>
                    </select>
                    <small style={{color: 'white', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                      Defines seats per row (left-aisle-right)
                    </small>
                  </div>
                  <div>
                    <label>From (City) *</label>
                    <input
                      type="text"
                      value={busForm.from}
                      onChange={(e) => setBusForm({...busForm, from: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>To (City) *</label>
                    <input
                      type="text"
                      value={busForm.to}
                      onChange={(e) => setBusForm({...busForm, to: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Departure Time *</label>
                    <input
                      type="time"
                      value={busForm.departureTime}
                      onChange={(e) => setBusForm({...busForm, departureTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Arrival Time *</label>
                    <input
                      type="time"
                      value={busForm.arrivalTime}
                      onChange={(e) => setBusForm({...busForm, arrivalTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label>Duration *</label>
                    <input
                      type="text"
                      value={busForm.duration}
                      onChange={(e) => setBusForm({...busForm, duration: e.target.value})}
                      placeholder="e.g., 6 hours"
                      required
                    />
                  </div>
                  <div>
                    <label>Fare (৳) *</label>
                    <input
                      type="number"
                      value={busForm.fare}
                      onChange={(e) => setBusForm({...busForm, fare: e.target.value})}
                      min="0"
                      required
                    />
                  </div>
                  <div>
                    <label>Contact Number *</label>
                    <input
                      type="text"
                      value={busForm.contactNumber}
                      onChange={(e) => setBusForm({...busForm, contactNumber: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div style={{marginTop: '1rem'}}>
                  <label>Amenities (comma-separated)</label>
                  <input
                    type="text"
                    value={busForm.amenities}
                    onChange={(e) => setBusForm({...busForm, amenities: e.target.value})}
                    placeholder="e.g., WiFi, Charging Port, Reading Light"
                  />
                </div>
                <div style={{marginTop: '1rem'}}>
                  <label>Image URLs (comma-separated)</label>
                  <input
                    type="text"
                    value={busForm.images}
                    onChange={(e) => setBusForm({...busForm, images: e.target.value})}
                    placeholder="https://example.com/bus1.jpg, https://example.com/bus2.jpg"
                  />
                  <small style={{color: 'white', fontSize: '12px'}}>Provide URLs to bus images</small>
                </div>
                <button type="submit" className="btn-primary" style={{marginTop: '1.5rem', background: '#28a745'}}>
                  {editingBus ? 'Update Bus' : 'Add Bus'}
                </button>
              </form>
            )}

            {loading ? (
              <p>Loading buses...</p>
            ) : buses.length === 0 ? (
              <p>No buses found. Add your first bus!</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Bus Number</th>
                    <th>Type</th>
                    <th>Route</th>
                    <th>Time</th>
                    <th>Fare</th>
                    <th>Seats</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {buses.map(bus => (
                    <tr key={bus._id}>
                      <td>{bus.name}</td>
                      <td>{bus.busNumber}</td>
                      <td><span className="badge">{bus.busType}</span></td>
                      <td>{bus.from} → {bus.to}</td>
                      <td>{bus.departureTime} - {bus.arrivalTime}</td>
                      <td>৳{bus.fare}</td>
                      <td>{bus.totalSeats}</td>
                      <td>
                        <div style={{display: 'flex', gap: '0.5rem'}}>
                          <button
                            className="btn-secondary"
                            onClick={() => handleEditBus(bus)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="btn-danger"
                            onClick={() => handleDeleteBus(bus._id)}
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <div className="content-card">
          <h2>User Management</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(singleUser => (
                  <tr key={singleUser._id}>
                    <td>{singleUser.name}</td>
                    <td>{singleUser.email}</td>
                    <td>
                      <select
                        value={singleUser.role || singleUser.userType}
                        onChange={(e) => handleUpdateUserRole(singleUser._id, e.target.value)}
                        className="role-select"
                        disabled={singleUser._id === user._id}
                      >
                        <option value="tourist">Tourist</option>
                        <option value="guide">Guide</option>
                        <option value="hotel_owner">Hotel Owner</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{singleUser.phone || 'N/A'}</td>
                    <td>{new Date(singleUser.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn-sm btn-danger"
                        onClick={() => handleDeleteUser(singleUser._id)}
                        disabled={singleUser._id === user._id}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Group Tours Section */}
      {activeSection === 'group-tours' && (
        <div className="content-card">
          <h2>Pending Group Tour Approvals</h2>
          <p style={{color: '#666', marginBottom: '20px'}}>
            Review and approve or reject group tour requests from users
          </p>
          {loading ? (
            <p>Loading group tours...</p>
          ) : groupTours.length === 0 ? (
            <p style={{textAlign: 'center', padding: '40px', color: '#999'}}>
              No pending group tour requests
            </p>
          ) : (
            <div className="requests-list">
              {groupTours.map(groupTour => (
                <div key={groupTour._id} className="request-card" style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '12px',
                  padding: '25px',
                  marginBottom: '20px',
                  backgroundColor: 'white'
                }}>
                  <div className="request-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '20px',
                    borderBottom: '2px solid #f0f0f0',
                    paddingBottom: '15px'
                  }}>
                    <div>
                      <h3 style={{margin: '0 0 10px 0', color: '#333'}}>
                        {groupTour.title || 'Group Tour'}
                      </h3>
                      <p style={{color: '#666', margin: '5px 0'}}>
                        📍 Destination: <strong>{groupTour.destination}</strong>
                      </p>
                      <p style={{color: '#666', margin: '5px 0'}}>
                        👤 Host: <strong>{groupTour.host?.name || 'Unknown'}</strong> ({groupTour.host?.email || 'N/A'})
                      </p>
                      {groupTour.host?.phone && (
                        <p style={{color: '#666', margin: '5px 0'}}>
                          📞 Contact: {groupTour.host?.phone}
                        </p>
                      )}
                    </div>
                    <span style={{
                      padding: '8px 20px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      backgroundColor: '#ffc107',
                      color: '#000'
                    }}>
                      ⏳ PENDING
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '20px',
                    marginBottom: '20px'
                  }}>
                    <div>
                      <strong style={{color: '#555'}}>📅 Tour Start Date:</strong>
                      <p style={{margin: '5px 0', fontSize: '16px'}}>
                        {new Date(groupTour.tourDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    {groupTour.endDate && (
                      <div>
                        <strong style={{color: '#555'}}>📅 Tour End Date:</strong>
                        <p style={{margin: '5px 0', fontSize: '16px'}}>
                          {new Date(groupTour.endDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <strong style={{color: '#555'}}>💰 Cost per Person:</strong>
                      <p style={{margin: '5px 0', fontSize: '20px', color: '#667eea', fontWeight: 'bold'}}>
                        ৳{groupTour.costPerPerson?.toLocaleString() || 0}
                      </p>
                    </div>
                    
                    <div>
                      <strong style={{color: '#555'}}>👥 Maximum Members:</strong>
                      <p style={{margin: '5px 0', fontSize: '16px'}}>
                        {groupTour.maxMembers} people
                      </p>
                    </div>
                    
                    <div>
                      <strong style={{color: '#555'}}>📅 Requested On:</strong>
                      <p style={{margin: '5px 0', fontSize: '14px', color: '#666'}}>
                        {new Date(groupTour.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {groupTour.notes && (
                    <div style={{
                      marginBottom: '20px',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      borderLeft: '4px solid #667eea'
                    }}>
                      <strong style={{color: '#333'}}>📝 Organizer's Notes:</strong>
                      <p style={{margin: '10px 0 0 0', color: '#555', lineHeight: '1.6'}}>
                        {groupTour.notes}
                      </p>
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    gap: '15px',
                    justifyContent: 'flex-end',
                    paddingTop: '15px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <button 
                      className="btn-primary"
                      onClick={() => handleApproveGroupTour(groupTour._id)}
                      style={{
                        padding: '12px 30px',
                        fontSize: '16px',
                        backgroundColor: '#28a745',
                        border: 'none'
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button 
                      className="btn-secondary"
                      onClick={() => handleRejectGroupTour(groupTour._id)}
                      style={{
                        padding: '12px 30px',
                        fontSize: '16px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none'
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Coupons Section */}
      {activeSection === 'coupons' && (
        <ManageCoupons />
      )}

      {/* Complaints Section */}
      {activeSection === 'complaints' && (
        <div className="content-card">
          <h2>Manage Complaints 📝</h2>
          <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>
            Review and respond to user complaints
          </p>

          {loading ? (
            <p style={{textAlign: 'center', padding: '40px'}}>Loading complaints...</p>
          ) : complaints.length > 0 ? (
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              {complaints.map((complaint) => (
                <div 
                  key={complaint._id}
                  style={{
                    background: 'var(--bg-secondary)',
                    padding: '20px',
                    borderRadius: '12px',
                    border: `2px solid ${complaint.status === 'pending' ? '#ff9800' : 'var(--border-color)'}`
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                    <div style={{flex: 1}}>
                      <h3 style={{margin: '0 0 10px 0', fontSize: '18px', color: 'var(--text-primary)'}}>
                        {complaint.subject}
                      </h3>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px'}}>
                        <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                          👤 {complaint.user?.name || 'Unknown'}
                        </span>
                        <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                          📧 {complaint.user?.email || 'N/A'}
                        </span>
                        <span style={{fontSize: '13px', color: 'var(--text-secondary)'}}>
                          📅 {new Date(complaint.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap', fontSize: '13px'}}>
                        <span style={{
                          background: '#e3f2fd',
                          color: '#1565c0',
                          padding: '4px 12px',
                          borderRadius: '12px'
                        }}>
                          📂 {complaint.category}
                        </span>
                        <span style={{
                          background: 
                            complaint.priority === 'urgent' ? '#fee' :
                            complaint.priority === 'high' ? '#fff3e0' :
                            complaint.priority === 'medium' ? '#e8f5e9' : '#f5f5f5',
                          color:
                            complaint.priority === 'urgent' ? '#c62828' :
                            complaint.priority === 'high' ? '#e65100' :
                            complaint.priority === 'medium' ? '#2e7d32' : '#666',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontWeight: '600'
                        }}>
                          🔥 {complaint.priority}
                        </span>
                      </div>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end'}}>
                      <span style={{
                        background:
                          complaint.status === 'resolved' ? '#e8f5e9' :
                          complaint.status === 'in-progress' ? '#fff3e0' :
                          complaint.status === 'closed' ? '#f5f5f5' : '#e3f2fd',
                        color:
                          complaint.status === 'resolved' ? '#2e7d32' :
                          complaint.status === 'in-progress' ? '#e65100' :
                          complaint.status === 'closed' ? '#666' : '#1565c0',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '13px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {complaint.status}
                      </span>
                      <select
                        value={complaint.status}
                        onChange={(e) => handleUpdateComplaint(complaint._id, { status: e.target.value })}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-color)',
                          fontSize: '13px',
                          background: 'var(--bg-primary)'
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <p style={{margin: '15px 0', color: 'var(--text-primary)', lineHeight: '1.6', padding: '15px', background: 'var(--bg-primary)', borderRadius: '8px'}}>
                    {complaint.description}
                  </p>

                  {complaint.adminFeedback ? (
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      background: 'var(--bg-primary)',
                      borderLeft: '4px solid #4CAF50',
                      borderRadius: '8px'
                    }}>
                      <strong style={{color: '#4CAF50', fontSize: '14px'}}>
                        💬 Your Response
                      </strong>
                      <p style={{margin: '10px 0 0 0', color: 'var(--text-primary)'}}>
                        {complaint.adminFeedback}
                      </p>
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setFeedbackText(complaint.adminFeedback);
                        }}
                        style={{
                          marginTop: '10px',
                          padding: '6px 16px',
                          background: '#2196F3',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '13px'
                        }}
                      >
                        ✏️ Edit Response
                      </button>
                    </div>
                  ) : (
                    <div style={{marginTop: '15px'}}>
                      <button
                        onClick={() => {
                          setSelectedComplaint(complaint);
                          setFeedbackText('');
                        }}
                        style={{
                          padding: '10px 20px',
                          background: '#4CAF50',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        💬 Add Response
                      </button>
                    </div>
                  )}

                  {selectedComplaint?._id === complaint._id && (
                    <form onSubmit={handleSubmitFeedback} style={{marginTop: '15px'}}>
                      <textarea
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        placeholder="Enter your response to the customer..."
                        required
                        rows="4"
                        style={{
                          width: '100%',
                          padding: '12px',
                          fontSize: '14px',
                          border: '1px solid var(--border-color)',
                          borderRadius: '8px',
                          resize: 'vertical',
                          background: 'var(--bg-primary)',
                          fontFamily: 'inherit'
                        }}
                      />
                      <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                        <button
                          type="submit"
                          className="btn-primary"
                          style={{padding: '10px 20px'}}
                        >
                          Submit Response
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedComplaint(null);
                            setFeedbackText('');
                          }}
                          className="btn-secondary"
                          style={{padding: '10px 20px'}}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <div style={{fontSize: '64px', marginBottom: '20px'}}>✅</div>
              <h3 style={{color: 'var(--text-primary)', marginBottom: '10px'}}>No Complaints</h3>
              <p style={{color: 'var(--text-secondary)'}}>
                All complaints have been resolved or there are no pending complaints.
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
