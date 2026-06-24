import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PaymentForm from '../components/PaymentForm';
import './Tours.css';

const Tours = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [tours, setTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    minPrice: '',
    maxPrice: '',
    featured: false,
    isForeign: false
  });
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [bookingData, setBookingData] = useState({
    numberOfMembers: 1,
    travelDate: '',
    specialRequests: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    fetchTours();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [filters, tours]);

  const fetchTours = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tours`);
      setTours(response.data.data);
      setFilteredTours(response.data.data);
    } catch (error) {
      console.error('Error fetching tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/tours/wishlist/my-wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.data.map(tour => tour._id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const toggleWishlist = async (tourId, e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add tours to wishlist');
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const isInWishlist = wishlist.includes(tourId);

      if (isInWishlist) {
        await axios.delete(`${BASE_URL}/api/tours/${tourId}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(wishlist.filter(id => id !== tourId));
        alert('Tour removed from wishlist');
      } else {
        await axios.post(`${BASE_URL}/api/tours/${tourId}/wishlist`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist([...wishlist, tourId]);
        alert('Tour added to wishlist');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error updating wishlist';
      alert(errorMsg);
    }
  };

  const handleAddReview = (tour, e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Please login to add a review');
      navigate('/login');
      return;
    }

    setSelectedTour(tour);
    setReviewData({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/tours/${selectedTour._id}/review`,
        reviewData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert('✅ ' + response.data.message);
      setShowReviewModal(false);
      setSelectedTour(null);
      fetchTours(); // Refresh tours to show new review
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error submitting review';
      alert('❌ ' + errorMsg);
    }
  };

  const applyFilters = () => {
    let filtered = [...tours];

    if (filters.category) {
      filtered = filtered.filter(tour => tour.category === filters.category);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(tour => tour.difficulty === filters.difficulty);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(tour => tour.price >= Number(filters.minPrice));
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(tour => tour.price <= Number(filters.maxPrice));
    }

    if (filters.featured) {
      filtered = filtered.filter(tour => tour.featured);
    }

    if (filters.isForeign) {
      filtered = filtered.filter(tour => tour.isForeign);
    }

    setFilteredTours(filtered);
  };

  const handleBookTour = (tour) => {
    if (!isAuthenticated) {
      alert('Please login to book a tour package');
      navigate('/login');
      return;
    }

    // Check if user is admin or guide
    if (user.userType === 'admin' || user.userType === 'guide') {
      alert('Admins and Guides cannot make bookings. Only tourists and hotel owners can book tours.');
      return;
    }

    setSelectedTour(tour);
    setBookingData({
      numberOfMembers: 1,
      travelDate: '',
      specialRequests: ''
    });
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.travelDate) {
      alert('Please select a travel date');
      return;
    }

    if (bookingData.numberOfMembers < 1) {
      alert('Number of members must be at least 1');
      return;
    }
// Move to payment step
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    setBookingLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const totalAmount = selectedTour.price * bookingData.numberOfMembers;
      
      const response = await axios.post(
        `${BASE_URL}/api/bookings`,
        {
          bookingType: 'tour',
          tour: selectedTour._id,
          numberOfMembers: parseInt(bookingData.numberOfMembers),
          travelDate: bookingData.travelDate,
          totalAmount: totalAmount,
          specialRequests: bookingData.specialRequests,
          ...paymentData
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert('✅ ' + response.data.message);
      setShowPaymentModal(false);
      setSelectedTour(null);
      
      // Refresh tours to get updated member count
      fetchTours();
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error creating booking';
      alert('❌ ' + errorMsg);
    } finally {
      setBookingLoading(false);
    }
  };

  const closeModal = () => {
    setShowBookingModal(false);
    setSelectedTour(null);
  };

  const resetFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      minPrice: '',
      maxPrice: '',
      featured: false,
      isForeign: false
    });
  };

  return (
    <div className="tours-page">
      <Navbar />
      <div className="tours-header" style={{marginTop: '80px'}}>
        <h1>Explore Tour Packages</h1>
        <p>Discover amazing destinations across Bangladesh</p>
      </div>

      <div className="tours-container">
        <div className="tours-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            
            <div className="filter-group">
              <label>Category</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
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

            <div className="filter-group">
              <label>Difficulty</label>
              <select
                value={filters.difficulty}
                onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
              >
                <option value="">All Levels</option>
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Challenging">Challenging</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (৳)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                />
              </div>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters({...filters, featured: e.target.checked})}
                />
                Featured Tours Only
              </label>
            </div>

            <div className="filter-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={filters.isForeign}
                  onChange={(e) => setFilters({...filters, isForeign: e.target.checked})}
                />
                🌍 Foreign Tours Only
              </label>
            </div>

            <button type="button" className="reset-btn-small" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>
        </div>

        <div className="tours-content">
          {loading ? (
            <div className="loading">Loading tours...</div>
          ) : filteredTours.length === 0 ? (
            <div className="no-results">
              <p>No tours found matching your criteria</p>
              <button onClick={resetFilters}>Clear Filters</button>
            </div>
          ) : (
            <div className="tours-grid">
              {filteredTours.map((tour) => (
                <div key={tour._id} className="tour-card" style={{cursor: 'default'}}>
                  {tour.featured && <div className="featured-badge">Featured</div>}
                  {tour.isForeign && <div className="foreign-badge">🌍 Foreign Tour</div>}
                  {tour.isEnded && <div className="ended-badge">Ended</div>}
                  {!tour.isEnded && tour.currentMembers >= tour.maxGroupSize && (
                    <div className="full-badge">Full</div>
                  )}
                  
                  {isAuthenticated && (
                    <button 
                      className={`wishlist-btn ${wishlist.includes(tour._id) ? 'in-wishlist' : ''}`}
                      onClick={(e) => toggleWishlist(tour._id, e)}
                      title={wishlist.includes(tour._id) ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                      {wishlist.includes(tour._id) ? '❤️' : '🤍'}
                    </button>
                  )}
                  
                  <div className="tour-image">
                    {tour.images && tour.images[0] ? (
                      <img src={tour.images[0].url} alt={tour.title} />
                    ) : (
                      <div className="placeholder-image">
                        <span>📸</span>
                      </div>
                    )}
                  </div>

                  <div className="tour-details">
                    <div className="tour-category">{tour.category}</div>
                    <h3>{tour.title}</h3>
                    <p className="tour-destination">📍 {tour.destination}</p>
                    
                    <p className="tour-description">
                      {tour.description?.substring(0, 100) || 'No description'}...
                    </p>

                    <div className="tour-info">
                      <div className="info-item">
                        <span className="icon">⏱️</span>
                        <span>{tour.duration?.days || 1}D/{tour.duration?.nights || 0}N</span>
                      </div>
                      <div className="info-item">
                        <span className="icon">👥</span>
                        <span>{tour.currentMembers || 0}/{tour.maxGroupSize || 20}</span>
                      </div>
                      <div className="info-item">
                        <span className="icon">⭐</span>
                        <span>{tour.rating?.toFixed(1) || '0.0'} ({tour.totalReviews || 0})</span>
                      </div>
                    </div>

                    <div className="tour-difficulty">
                      <span className={`difficulty-badge ${tour.difficulty?.toLowerCase() || 'easy'}`}>
                        {tour.difficulty || 'Easy'}
                      </span>
                    </div>

                    {tour.includes && tour.includes.length > 0 && (
                      <div className="tour-includes">
                        <strong>Includes:</strong>
                        <ul>
                          {tour.includes.slice(0, 3).map((item, index) => (
                            <li key={index}>✓ {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {tour.reviews && tour.reviews.length > 0 && (
                      <div className="tour-reviews-preview">
                        <strong>Recent Reviews:</strong>
                        {tour.reviews.slice(0, 2).map((review, index) => (
                          <div key={index} className="review-item">
                            <div className="review-header">
                              <span className="reviewer-name">{review.user?.name || 'Anonymous'}</span>
                              <span className="review-rating">{'⭐'.repeat(review.rating || 5)}</span>
                            </div>
                            <p className="review-comment">{review.comment?.substring(0, 80) || 'No comment'}{review.comment?.length > 80 ? '...' : ''}</p>
                          </div>
                        ))}
                        {tour.reviews.length > 2 && (
                          <p className="more-reviews">+{tour.reviews.length - 2} more reviews</p>
                        )}
                      </div>
                    )}

                    <div className="tour-footer">
                      <div className="tour-price">
                        <span className="price-label">From</span>
                        <span className="price-amount">৳{tour.price.toLocaleString()}</span>
                      </div>
                      <div className="tour-actions">
                        <button 
                          className="review-btn-small"
                          onClick={(e) => handleAddReview(tour, e)}
                          title="Add Review"
                        >
                          ⭐ Review
                        </button>
                        <button 
                          className="book-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookTour(tour);
                          }}
                          disabled={
                            tour.isEnded || 
                            tour.currentMembers >= tour.maxGroupSize ||
                            !user ||
                            user.userType !== 'tourist'
                          }
                        >
                          {!user ? 'Login to Book' :
                           user.userType !== 'tourist' ? 'Tourist Only' :
                           tour.isEnded ? 'Ended' : 
                           tour.currentMembers >= tour.maxGroupSize ? 'Full' :
                           'Book Now'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedTour && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Book Tour: {selectedTour.title}</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              <div className="tour-summary">
                <p><strong>Destination:</strong> {selectedTour.destination}</p>
                <p><strong>Duration:</strong> {selectedTour.duration?.days || 1} Days / {selectedTour.duration?.nights || 0} Nights</p>
                <p><strong>Price per person:</strong> ৳{selectedTour.price?.toLocaleString() || '0'}</p>
                <p><strong>Available Slots:</strong> {selectedTour.maxGroupSize - (selectedTour.currentMembers || 0)}</p>
              </div>

              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label>Number of Members *</label>
                  <input
                    type="number"
                    min="1"
                    max={selectedTour.maxGroupSize - (selectedTour.currentMembers || 0)}
                    value={bookingData.numberOfMembers}
                    onChange={(e) => setBookingData({...bookingData, numberOfMembers: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Travel Date *</label>
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={bookingData.travelDate}
                    onChange={(e) => setBookingData({...bookingData, travelDate: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Special Requests (Optional)</label>
                  <textarea
                    rows="3"
                    value={bookingData.specialRequests}
                    onChange={(e) => setBookingData({...bookingData, specialRequests: e.target.value})}
                    placeholder="Any special requirements or requests..."
                  />
                </div>

                <div className="total-amount">
                  <strong>Total Amount:</strong> ৳{(selectedTour.price * bookingData.numberOfMembers).toLocaleString()}
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={closeModal}>
                    Cancel
                  </button>
                  <button type="submit" className="confirm-btn">
                    Proceed to Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedTour && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="booking-modal payment-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Complete Payment</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              {bookingLoading ? (
                <div className="loading">Processing payment...</div>
              ) : (
                <PaymentForm
                  totalAmount={selectedTour.price * bookingData.numberOfMembers}
                  bookingType="tour"
                  onPaymentSubmit={handlePaymentSubmit}
                  onCancel={closeModal}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedTour && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review: {selectedTour.title}</h2>
              <button className="close-btn" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label>Rating *</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={`star ${reviewData.rating >= star ? 'filled' : ''}`}
                        onClick={() => setReviewData({...reviewData, rating: star})}
                        style={{ cursor: 'pointer', fontSize: '2rem' }}
                      >
                        {reviewData.rating >= star ? '⭐' : '☆'}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label>Your Review *</label>
                  <textarea
                    rows="5"
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Share your experience with this tour..."
                    required
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowReviewModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="confirm-btn">
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tours;
