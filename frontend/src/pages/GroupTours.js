import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PaymentForm from '../components/PaymentForm';
import './GroupTours.css';

const GroupTours = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [groupTours, setGroupTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);

  useEffect(() => {
    fetchGroupTours();
  }, []);

  const fetchGroupTours = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/group-tours`);
      console.log('Group tours response:', response.data);
      setGroupTours(response.data.data || []);
    } catch (error) {
      console.error('Error fetching group tours:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (tour) => {
    if (!isAuthenticated) {
      alert('Please login to join a group tour');
      navigate('/login');
      return;
    }

    if (user.userType !== 'tourist') {
      alert('Only tourists can join group tours');
      return;
    }

    // Show payment modal
    setSelectedTour(tour);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/group-tours/${selectedTour._id}/join`,
        { ...paymentData },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Join request sent successfully with payment! Awaiting host approval.');
      setShowPaymentModal(false);
      setSelectedTour(null);
      fetchGroupTours();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error sending join request';
      alert('❌ ' + errorMsg);
    }
  };

  const isUserInTour = (tour) => {
    if (!user) return false;
    if (tour.host && tour.host._id === user._id) return 'host';
    const member = tour.members?.find(m => m.user && m.user._id === user._id);
    return member ? member.status : false;
  };

  return (
    <div className="group-tours-page">
      <Navbar />
      <div className="group-tours-header" style={{marginTop: '80px'}}>
        <div className="container">
          <h1>👥 Join Group Tours</h1>
          <p>Join fellow travelers and explore Bangladesh together</p>
        </div>
      </div>

      <div className="group-tours-content container">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>🔍 Filter Tours</h3>
          </div>
          <div className="filter-info">
            <div className="info-card">
              <div className="info-icon">👥</div>
              <h4>Group Travel</h4>
              <p>Join organized group tours and make new friends while exploring</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h4>Verified Hosts</h4>
              <p>All tour hosts are verified members of our community</p>
            </div>
            <div className="info-card">
              <div className="info-icon">💰</div>
              <h4>Split Costs</h4>
              <p>Share expenses with fellow travelers and save money</p>
            </div>
            {user && user.userType === 'tourist' && (
              <Link to="/dashboard?tab=group-tours" className="create-tour-btn">
                + Create New Tour
              </Link>
            )}
          </div>
        </aside>

        <div className="tours-main-content">
          {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>Loading group tours...</p>
            </div>
          ) : groupTours.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">📭</div>
              <h3>No Group Tours Available</h3>
              <p>No group tours available at the moment</p>
              {user && user.userType === 'tourist' && (
                <Link to="/dashboard?tab=group-tours" className="btn-primary">
                  Create Your Own Group Tour
                </Link>
              )}
            </div>
          ) : (
            <div className="group-tours-grid">
              {groupTours.map((tour) => {
              const userStatus = isUserInTour(tour);
              
              return (
                <div key={tour._id} className="group-tour-card">
                  {tour.isFull && <div className="full-badge">Full</div>}
                  {tour.status === 'completed' && <div className="completed-badge">Completed</div>}
                  {tour.status === 'cancelled' && <div className="cancelled-badge">Cancelled</div>}
                  
                  <div className="tour-header">
                    <h3>{tour.title}</h3>
                    <div className="host-info">
                      <span className="host-label">Hosted by:</span>
                      <span className="host-name">{tour.host?.name || 'Unknown'}</span>
                    </div>
                  </div>

                  <div className="tour-details">
                    <div className="detail-item">
                      <span className="icon">📍</span>
                      <span>{tour.destination}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">📅</span>
                      <span>{new Date(tour.tourDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">⏰</span>
                      <span>{tour.meetingTime} at {tour.meetingPoint}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">💰</span>
                      <span>৳{tour.costPerPerson?.toLocaleString() || 0} per person</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">👥</span>
                      <span>{tour.currentMembers || 0}/{tour.maxMembers || 0} members</span>
                    </div>
                  </div>

                  <p className="tour-description">{tour.description}</p>

                  {tour.includes && (
                    <div className="tour-includes">
                      <strong>What's Included:</strong>
                      <p>{tour.includes}</p>
                    </div>
                  )}

                  <div className="tour-footer">
                    {userStatus === 'host' ? (
                      <span className="host-badge">You are the host</span>
                    ) : userStatus === 'pending' ? (
                      <span className="pending-badge">Request Pending</span>
                    ) : userStatus === 'approved' ? (
                      <span className="approved-badge">You're Joined ✅</span>
                    ) : userStatus === 'rejected' ? (
                      <span className="rejected-badge">Request Rejected</span>
                    ) : (
                      <button 
                        className="join-btn"
                        onClick={() => handleJoinRequest(tour)}
                        disabled={tour.isFull || tour.status !== 'active' || (user && user.userType !== 'tourist')}
                      >
                        {tour.isFull ? 'Full' : tour.status === 'completed' ? 'Completed' : tour.status === 'cancelled' ? 'Cancelled' : (user && user.userType !== 'tourist') ? 'Tourist Only' : 'Request to Join'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedTour && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content payment-modal-large" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            <h2>Join Group Tour - Payment</h2>
            <div className="tour-summary" style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3>{selectedTour.title}</h3>
              <p><strong>Destination:</strong> {selectedTour.destination}</p>
              <p><strong>Date:</strong> {new Date(selectedTour.tourDate).toLocaleDateString()}</p>
              <p><strong>Cost per person:</strong> ৳{selectedTour.costPerPerson?.toLocaleString()}</p>
            </div>
            <PaymentForm
              totalAmount={selectedTour.costPerPerson}
              onPaymentSubmit={handlePaymentSubmit}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default GroupTours;
