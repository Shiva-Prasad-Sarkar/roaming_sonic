import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Guides.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PaymentForm from '../components/PaymentForm';

const Guides = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [expandedGuideId, setExpandedGuideId] = useState(null);
  const [requestData, setRequestData] = useState({
    destination: '',
    tourDate: '',
    duration: 4,
    numberOfPeople: 1,
    message: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    language: '',
    specialization: '',
    division: '',
    minRate: '',
    maxRate: '',
    minRating: '',
    availability: false
  });

  const languages = ['Bengali', 'English', 'Hindi', 'Arabic', 'Urdu'];
  const divisions = [
    'Dhaka',
    'Chittagong',
    'Rajshahi',
    'Khulna',
    'Barisal',
    'Sylhet',
    'Rangpur',
    'Mymensingh'
  ];
  const specializations = [
    'Historical Tours',
    'Adventure Tours',
    'Religious Sites',
    'Beach Tours',
    'Hill Tracts',
    'Wildlife',
    'Cultural Tours',
    'Food Tours'
  ];

  useEffect(() => {
    fetchGuides();
  }, [filters.language, filters.specialization, filters.division, filters.minRate, filters.maxRate, filters.minRating, filters.availability]);

  const fetchGuides = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.language) queryParams.append('language', filters.language);
      if (filters.specialization) queryParams.append('specialization', filters.specialization);
      if (filters.division) queryParams.append('division', filters.division);
      if (filters.minRate) queryParams.append('minRate', filters.minRate);
      if (filters.maxRate) queryParams.append('maxRate', filters.maxRate);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);
      if (filters.availability) queryParams.append('availability', 'true');

      console.log('Fetching guides with params:', queryParams.toString());

      const response = await axios.get(`${BASE_URL}/api/guides?${queryParams.toString()}`);
      setGuides(response.data.data.guides || response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching guides:', error);
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGuides();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      language: '',
      specialization: '',
      division: '',
      minRate: '',
      maxRate: '',
      minRating: '',
      availability: false
    });
  };

  const toggleReviews = (guideId) => {
    setExpandedGuideId(expandedGuideId === guideId ? null : guideId);
  };

  const openRequestModal = (guide) => {
    if (!user || user.userType !== 'tourist') {
      alert('Only tourists can send connection requests');
      return;
    }
    setSelectedGuide(guide);
    setShowRequestModal(true);
  };

  const closeRequestModal = () => {
    setShowRequestModal(false);
    setSelectedGuide(null);
    setRequestData({
      destination: '',
      tourDate: '',
      duration: 4,
      numberOfPeople: 1,
      message: ''
    });
  };

  const handleRequestChange = (e) => {
    setRequestData({
      ...requestData,
      [e.target.name]: e.target.value
    });
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    
    if (!requestData.destination || !requestData.tourDate) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Move to payment step
    setShowRequestModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const totalCost = selectedGuide.hourlyRate * requestData.duration;
      
      await axios.post(
        `${BASE_URL}/api/guide-requests`,
        {
          guideId: selectedGuide._id,
          ...requestData,
          totalCost,
          ...paymentData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Connection request sent successfully with payment!');
      setShowPaymentModal(false);
      setSelectedGuide(null);
      setRequestData({
        destination: '',
        tourDate: '',
        duration: 4,
        numberOfPeople: 1,
        message: ''
      });
    } catch (error) {
      console.error('Error sending request:', error);
      alert(error.response?.data?.message || 'Failed to send request');
    }
  };

  return (
    <div className="guides-page">
      <Navbar />
      <div className="guides-header" style={{marginTop: '80px'}}>
        <div className="container">
          <h1>🧭 Find Your Perfect Tour Guide</h1>
          <p>Explore Bangladesh with experienced and certified local guides</p>
        </div>
      </div>

      <div className="guides-content container">
        <button className="mobile-filter-toggle" onClick={() => setShowFilters(f => !f)}>
          {showFilters ? '✕ Close Filters' : '🔍 Filter Guides'}
        </button>

        <aside className={`filters-sidebar${showFilters ? ' filters-open' : ''}`}>
          <div className="filters-header">
            <h3>🔍 Filter Guides</h3>
          </div>

          <form onSubmit={handleSearch} className="filters-form">
            <div className="filter-group">
              <label>Language</label>
              <select name="language" value={filters.language} onChange={handleFilterChange}>
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Specialization</label>
              <div className="specialization-buttons">
                <button
                  type="button"
                  className={`spec-btn ${filters.specialization === '' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, specialization: ''})}
                >
                  All
                </button>
                {specializations.map(spec => (
                  <button
                    key={spec}
                    type="button"
                    className={`spec-btn ${filters.specialization === spec ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, specialization: spec})}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>📍 Divisions</label>
              <div className="specialization-buttons">
                <button
                  type="button"
                  className={`spec-btn ${filters.division === '' ? 'active' : ''}`}
                  onClick={() => setFilters({...filters, division: ''})}
                >
                  All Divisions
                </button>
                {divisions.map(division => (
                  <button
                    key={division}
                    type="button"
                    className={`spec-btn ${filters.division === division ? 'active' : ''}`}
                    onClick={() => setFilters({...filters, division: division})}
                  >
                    {division}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Hourly Rate (BDT)</label>
              <div className="price-range">
                <input
                  type="number"
                  name="minRate"
                  value={filters.minRate}
                  onChange={handleFilterChange}
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxRate"
                  value={filters.maxRate}
                  onChange={handleFilterChange}
                  placeholder="Max"
                />
              </div>
            </div>

            <div className="filter-group">
              <label>Minimum Rating</label>
              <select name="minRating" value={filters.minRating} onChange={handleFilterChange}>
                <option value="">Any Rating</option>
                <option value="3">3+ ⭐</option>
                <option value="4">4+ ⭐</option>
                <option value="4.5">4.5+ ⭐</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="availability"
                  checked={filters.availability}
                  onChange={handleFilterChange}
                />
                Available Only
              </label>
            </div>

            <button type="submit" className="search-btn">Search Guides</button>
            <button type="button" onClick={resetFilters} className="reset-btn-small">Reset Filters</button>
          </form>
        </aside>

        <main className="guides-list">
          {loading ? (
            <div className="loading">Loading guides...</div>
          ) : guides.length === 0 ? (
            <div className="no-results">
              <h3>No guides found</h3>
              <p>Try adjusting your filters or check back later</p>
            </div>
          ) : (
            <div className="guides-grid">
              {guides.map(guide => (
                <div key={guide._id} className="guide-card">
                  <div className="guide-header">
                    <div className="guide-avatar">
                      {guide.photo && guide.photo !== 'default-avatar.png' ? (
                        <img src={guide.photo?.startsWith('http') ? guide.photo : `${BASE_URL}${guide.photo}`} alt={guide.name} className="avatar-image" />
                      ) : (
                        <div className="avatar-circle">{guide.name?.charAt(0) || 'G'}</div>
                      )}
                      {guide.availability && <span className="availability-badge">✓ Available</span>}
                    </div>
                    <div className="guide-basic-info">
                      <h3>{guide.name || 'Guide'}</h3>
                      {guide.rating > 0 && (
                        <div className="guide-rating">
                          ⭐ {guide.rating?.toFixed(1) || '0.0'} ({guide.totalReviews || 0} reviews)
                        </div>
                      )}
                    </div>
                  </div>

                  {guide.bio && (
                    <div className="guide-bio">
                      <p>{guide.bio}</p>
                    </div>
                  )}

                  <div className="guide-details">
                    <div className="detail-item">
                      <span className="icon">💼</span>
                      <span>{guide.experience || 0} years experience</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">🌐</span>
                      <span>{guide.languages?.join(', ') || 'Bengali'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="icon">🎯</span>
                      <span>{guide.specializations?.[0] || 'General Tours'}</span>
                    </div>
                  </div>

                  {guide.specializations && guide.specializations.length > 0 && (
                    <div className="guide-specializations">
                      {guide.specializations.slice(0, 3).map((spec, idx) => (
                        <span key={idx} className="specialization-tag">{spec}</span>
                      ))}
                    </div>
                  )}

                  {guide.divisions && guide.divisions.length > 0 && (
                    <div className="guide-places">
                      <strong style={{fontSize: '13px', color: '#666'}}>📍 Divisions:</strong>
                      <div style={{display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '5px'}}>
                        {guide.divisions.slice(0, 5).map((division, idx) => (
                          <span key={idx} style={{
                            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                            color: 'white',
                            padding: '3px 10px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {division}
                          </span>
                        ))}
                        {guide.divisions.length > 5 && (
                          <span style={{fontSize: '12px', color: '#666'}}>
                            +{guide.divisions.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {guide.reviews && guide.reviews.length > 0 && (
                    <div className="guide-reviews-section">
                      <button 
                        className="show-reviews-btn"
                        onClick={() => toggleReviews(guide._id)}
                      >
                        {expandedGuideId === guide._id ? '▼' : '▶'} View Reviews ({guide.totalReviews})
                      </button>
                      
                      {expandedGuideId === guide._id && (
                        <div className="reviews-list-compact">
                          {guide.reviews.slice(0, 3).map((review, idx) => (
                            <div key={idx} className="review-item-compact">
                              <div className="review-header-compact">
                                <strong>{review.user?.name || 'Tourist'}</strong>
                                <span className="review-rating">{'⭐'.repeat(review.rating)}</span>
                              </div>
                              {review.comment && (
                                <p className="review-comment-compact">{review.comment}</p>
                              )}
                              <span className="review-date-compact">
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                          {guide.totalReviews > 3 && (
                            <p className="more-reviews-text">+ {guide.totalReviews - 3} more reviews</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="guide-footer">
                    <div className="guide-rate">
                      <span className="rate-value">৳{guide.hourlyRate || 500}</span>
                      <span className="rate-unit">/hour</span>
                    </div>
                    
                    {user && user.userType === 'tourist' ? (
                      guide.availability ? (
                        <button className="contact-btn" onClick={() => openRequestModal(guide)}>
                          📩 Send Request
                        </button>
                      ) : (
                        <button className="contact-btn unavailable" disabled>
                          ❌ Unavailable
                        </button>
                      )
                    ) : user ? (
                      <button className="contact-btn" disabled style={{opacity: 0.5, cursor: 'not-allowed'}}>
                        Tourist Only
                      </button>
                    ) : (
                      <Link to="/login" className="contact-btn">Login to Contact</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Connection Request Modal */}
      {showRequestModal && selectedGuide && (
        <div className="modal-overlay" onClick={closeRequestModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeRequestModal}>×</button>
            <h2>Send Connection Request</h2>
            <div className="modal-guide-info">
              <h3>{selectedGuide.name}</h3>
              <p>৳{selectedGuide.hourlyRate}/hour</p>
            </div>
            <form onSubmit={submitRequest} className="request-form">
              <div className="form-group">
                <label>Destination *</label>
                <input
                  type="text"
                  name="destination"
                  value={requestData.destination}
                  onChange={handleRequestChange}
                  placeholder="Where do you want to go?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Tour Date *</label>
                <input
                  type="date"
                  name="tourDate"
                  value={requestData.tourDate}
                  onChange={handleRequestChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Duration (hours) *</label>
                  <input
                    type="number"
                    name="duration"
                    value={requestData.duration}
                    onChange={handleRequestChange}
                    min="1"
                    max="24"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Number of People *</label>
                  <input
                    type="number"
                    name="numberOfPeople"
                    value={requestData.numberOfPeople}
                    onChange={handleRequestChange}
                    min="1"
                    max="50"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={requestData.message}
                  onChange={handleRequestChange}
                  rows="3"
                  placeholder="Tell the guide about your tour requirements..."
                  maxLength="500"
                />
              </div>

              <div className="total-cost">
                <strong>Estimated Cost:</strong> ৳{selectedGuide.hourlyRate * requestData.duration}
              </div>

              <button type="submit" className="btn-primary">Proceed to Payment</button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedGuide && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content payment-modal-large" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            <h2>Complete Payment - Guide Service</h2>
            <div className="modal-guide-info" style={{
              background: '#f8f9fa',
              padding: '16px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3>{selectedGuide.name}</h3>
              <p><strong>Destination:</strong> {requestData.destination}</p>
              <p><strong>Date:</strong> {new Date(requestData.tourDate).toLocaleDateString()}</p>
              <p><strong>Duration:</strong> {requestData.duration} hours</p>
              <p><strong>Rate:</strong> ৳{selectedGuide.hourlyRate}/hour</p>
            </div>
            <PaymentForm
              totalAmount={selectedGuide.hourlyRate * requestData.duration}
              onPaymentSubmit={handlePaymentSubmit}
              onCancel={() => setShowPaymentModal(false)}
              bookingType="guide"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Guides;
