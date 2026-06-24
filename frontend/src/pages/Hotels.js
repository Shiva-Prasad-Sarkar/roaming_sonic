import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Hotels.css';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from '../components/Navbar';
import PaymentForm from '../components/PaymentForm';

const Hotels = () => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [bookingData, setBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    roomType: 'standard'
  });
  const [wishlist, setWishlist] = useState([]);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [galleryHotel, setGalleryHotel] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapHotel, setMapHotel] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewHotel, setReviewHotel] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [filters, setFilters] = useState({
    city: '',
    division: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });

  const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barisal', 'Sylhet', 'Rangpur', 'Mymensingh'];
  const categories = ['hotel', 'resort', 'guest-house', 'hostel', 'apartment'];

  useEffect(() => {
    fetchHotels();
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  // Fetch hotels when filters reset to empty
  useEffect(() => {
    const allEmpty = Object.entries(filters).every(([key, val]) => {
      if (typeof val === 'boolean') return !val;
      return !val;
    });
    if (allEmpty && !loading) {
      fetchHotels();
    }
  }, [filters]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/users/wishlist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWishlist(response.data.data.map(item => item._id));
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.division) queryParams.append('division', filters.division);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.minRating) queryParams.append('minRating', filters.minRating);

      const response = await axios.get(`${BASE_URL}/api/hotels?${queryParams.toString()}`);
      setHotels(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching hotels:', error);
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
    fetchHotels();
  };

  const resetFilters = () => {
    setFilters({
      city: '',
      division: '',
      category: '',
      minPrice: '',
      maxPrice: '',
      minRating: ''
    });
  };

  const getMinPrice = (hotel) => {
    if (hotel.rooms && hotel.rooms.length > 0) {
      return Math.min(...hotel.rooms.map(room => room.pricePerNight));
    }
    return 0;
  };

  const handleBookNow = (hotel) => {
    if (!user) {
      alert('Please login to book a hotel');
      return;
    }
    setSelectedHotel(hotel);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!bookingData.checkInDate || !bookingData.checkOutDate) {
      alert('Please select check-in and check-out dates');
      return;
    }
    
    // Move to payment step
    setShowBookingModal(false);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/bookings`,
        {
          bookingType: 'hotel',
          hotel: selectedHotel._id,
          checkInDate: bookingData.checkInDate,
          checkOutDate: bookingData.checkOutDate,
          guests: bookingData.guests,
          roomType: bookingData.roomType,
          totalAmount: calculateTotalAmount(),
          status: 'confirmed',
          ...paymentData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Remove from wishlist after successful booking
      if (wishlist.includes(selectedHotel._id)) {
        try {
          await axios.delete(
            `${BASE_URL}/api/users/wishlist/${selectedHotel._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setWishlist(wishlist.filter(id => id !== selectedHotel._id));
        } catch (err) {
          console.error('Error removing from wishlist:', err);
        }
      }
      
      alert('✅ Hotel booked successfully! Check your dashboard for booking details.');
      setShowPaymentModal(false);
      setSelectedHotel(null);
      setBookingData({ checkInDate: '', checkOutDate: '', guests: 1, roomType: 'standard' });
    } catch (error) {
      console.error('Error booking hotel:', error);
      alert('Failed to book hotel: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateTotalAmount = () => {
    if (!selectedHotel || !bookingData.checkInDate || !bookingData.checkOutDate) return 0;
    const checkIn = new Date(bookingData.checkInDate);
    const checkOut = new Date(bookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const roomPrice = getMinPrice(selectedHotel);
    return nights * roomPrice * bookingData.guests;
  };

  const toggleWishlist = async (hotelId) => {
    if (!user) {
      alert('Please login to add to wishlist');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const isInWishlist = wishlist.includes(hotelId);
      
      if (isInWishlist) {
        await axios.delete(
          `${BASE_URL}/api/users/wishlist/${hotelId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist(wishlist.filter(id => id !== hotelId));
        alert('Removed from wishlist');
      } else {
        await axios.post(
          `${BASE_URL}/api/users/wishlist/${hotelId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setWishlist([...wishlist, hotelId]);
        alert('Added to wishlist');
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Failed to update wishlist');
    }
  };

  const openPhotoGallery = (hotel) => {
    setGalleryHotel(hotel);
    setShowPhotoGallery(true);
  };

  const openMapModal = (hotel) => {
    setMapHotel(hotel);
    setShowMapModal(true);
  };

  const openReviewModal = (hotel) => {
    if (!user) {
      alert('Please login to leave a review');
      return;
    }
    setReviewHotel(hotel);
    setReviewData({ rating: 5, comment: '' });
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/hotels/${reviewHotel._id}/reviews`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Review submitted successfully!');
      setShowReviewModal(false);
      setReviewHotel(null);
      setReviewData({ rating: 5, comment: '' });
      fetchHotels(); // Refresh to show updated rating
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  return (
    <div className="hotels-page">
      <Navbar />
      <div className="hotels-header" style={{marginTop: '80px'}}>
        <div className="container">
          <h1>🏨 Find Your Perfect Stay in Bangladesh</h1>
          <p>Discover the best hotels, resorts, and guest houses across the country</p>
        </div>
      </div>

      <div className="hotels-content container">
        <aside className="filters-sidebar">
          <div className="filters-header">
            <h3>🔍 Filter Hotels</h3>
          </div>

          <form onSubmit={handleSearch} className="filters-form">
            <div className="filter-group">
              <label>City</label>
              <input
                type="text"
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Enter city name"
              />
            </div>

            <div className="filter-group">
              <label>Division</label>
              <select name="division" value={filters.division} onChange={handleFilterChange}>
                <option value="">All Divisions</option>
                {divisions.map(div => (
                  <option key={div} value={div}>{div}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Category</label>
              <select name="category" value={filters.category} onChange={handleFilterChange}>
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat.replace('-', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range (BDT/night)</label>
              <div className="price-range">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  placeholder="Min"
                />
                <span>-</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
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

            <button type="submit" className="search-btn">Search Hotels</button>
            <button type="button" onClick={resetFilters} className="reset-btn-small">Reset Filters</button>
          </form>
        </aside>

        <main className="hotels-list">
          {loading ? (
            <div className="loading">Loading hotels...</div>
          ) : hotels.length === 0 ? (
            <div className="no-results">
              <h3>No hotels found</h3>
              <p>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="hotels-grid">
              {hotels.map(hotel => (
                <div key={hotel._id} className="hotel-card">
                  <div className="hotel-image" onClick={() => hotel.photos && hotel.photos.length > 0 && openPhotoGallery(hotel)} style={{cursor: hotel.photos && hotel.photos.length > 0 ? 'pointer' : 'default'}}>
                    <img 
                      src={
                        hotel.photos && hotel.photos.length > 0 
                          ? `${BASE_URL}${hotel.photos[0].url}` 
                          : 'https://via.placeholder.com/400x250?text=No+Image'
                      } 
                      alt={hotel.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/400x250?text=Hotel+Image';
                      }}
                    />
                    <span className="hotel-category">{hotel.category.replace('-', ' ')}</span>
                    {hotel.rating > 0 && (
                      <span className="hotel-rating">⭐ {hotel.rating.toFixed(1)}</span>
                    )}
                    {hotel.photos && hotel.photos.length > 1 && (
                      <span className="photo-count">📷 {hotel.photos.length} photos - Click to view</span>
                    )}
                  </div>
                  
                  <div className="hotel-info">
                    <h3>{hotel.name}</h3>
                    <p className="hotel-location">📍 {hotel.address?.city || 'N/A'}, {hotel.address?.division || 'N/A'}</p>
                    <p className="hotel-description">
                      {hotel.description 
                        ? (hotel.description.length > 120 ? hotel.description.substring(0, 120) + '...' : hotel.description)
                        : 'No description available'
                      }
                    </p>
                    
                    {hotel.rooms && hotel.rooms.length > 0 && (
                      <div className="hotel-rooms-summary">
                        <span className="rooms-count">🛏️ {hotel.rooms.length} room type{hotel.rooms.length > 1 ? 's' : ''} available</span>
                      </div>
                    )}
                    
                    <div className="hotel-facilities">
                      {hotel.facilities?.wifi && <span>📶 WiFi</span>}
                      {hotel.facilities?.parking && <span>🅿️ Parking</span>}
                      {hotel.facilities?.restaurant && <span>🍴 Restaurant</span>}
                      {hotel.facilities?.swimmingPool && <span>🏊 Pool</span>}
                      {hotel.facilities?.gym && <span>💪 Gym</span>}
                      {hotel.facilities?.spa && <span>🧖 Spa</span>}
                    </div>

                    {/* Display Reviews */}
                    {hotel.reviews && hotel.reviews.length > 0 && (
                      <div style={{marginTop: '15px', padding: '10px', background: '#f9fafb', borderRadius: '8px'}}>
                        <h4 style={{margin: '0 0 10px 0', fontSize: '14px', color: '#333'}}>Recent Reviews ({hotel.totalReviews})</h4>
                        {hotel.reviews.slice(0, 2).map((review, idx) => (
                          <div key={idx} style={{marginBottom: '8px', padding: '8px', background: 'white', borderRadius: '4px'}}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
                              <strong style={{fontSize: '13px'}}>{review.user?.name || 'Anonymous'}</strong>
                              <span style={{color: '#f59e0b'}}>{'⭐'.repeat(review.rating)}</span>
                            </div>
                            {review.comment && (
                              <p style={{margin: 0, fontSize: '12px', color: '#666'}}>{review.comment.substring(0, 100)}{review.comment.length > 100 ? '...' : ''}</p>
                            )}
                          </div>
                        ))}
                        {hotel.totalReviews > 2 && (
                          <p style={{margin: '5px 0 0 0', fontSize: '12px', color: '#3b82f6'}}>+{hotel.totalReviews - 2} more reviews</p>
                        )}
                      </div>
                    )}

                    <div className="hotel-footer">
                      <div className="hotel-price">
                        <span className="price-label">Starting from</span>
                        <span className="price-value">৳{getMinPrice(hotel).toLocaleString()}</span>
                        <span className="price-unit">/night</span>
                      </div>
                      
                      <div className="hotel-actions">
                        <button 
                          className="wishlist-btn"
                          onClick={() => toggleWishlist(hotel._id)}
                          title={wishlist.includes(hotel._id) ? "Remove from wishlist" : "Add to wishlist"}
                          style={{marginRight: '10px'}}
                        >
                          {wishlist.includes(hotel._id) ? '❤️' : '🤍'}
                        </button>
                        <button 
                          className="map-btn"
                          onClick={() => openMapModal(hotel)}
                          title="View on map"
                          style={{marginRight: '10px', padding: '8px 12px', background: '#4ecdc4', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'}}
                        >
                          🗺️ Map
                        </button>
                        <button 
                          className="review-btn"
                          onClick={() => openReviewModal(hotel)}
                          title="Write a review"
                          style={{marginRight: '10px', padding: '8px 12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'}}
                        >
                          ⭐ Review
                        </button>
                        {user ? (
                          user.userType === 'tourist' ? (
                            <button className="view-btn" onClick={() => handleBookNow(hotel)}>Book Now</button>
                          ) : (
                            <button className="view-btn" disabled style={{opacity: 0.5, cursor: 'not-allowed'}} title="Only tourists can book hotels">
                              Tourist Only
                            </button>
                          )
                        ) : (
                          <Link to="/login" className="view-btn">Login to Book</Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => setShowBookingModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <button className="modal-close" onClick={() => setShowBookingModal(false)}>×</button>
            <h2>Book {selectedHotel.name}</h2>
            
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>Check-in Date *</label>
                <input
                  type="date"
                  value={bookingData.checkInDate}
                  onChange={(e) => setBookingData({...bookingData, checkInDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Check-out Date *</label>
                <input
                  type="date"
                  value={bookingData.checkOutDate}
                  onChange={(e) => setBookingData({...bookingData, checkOutDate: e.target.value})}
                  min={bookingData.checkInDate || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label>Number of Guests *</label>
                <input
                  type="number"
                  value={bookingData.guests}
                  onChange={(e) => setBookingData({...bookingData, guests: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  required
                />
              </div>

              <div className="form-group">
                <label>Room Type *</label>
                <select
                  value={bookingData.roomType}
                  onChange={(e) => setBookingData({...bookingData, roomType: e.target.value})}
                  required
                >
                  {selectedHotel.rooms?.map(room => (
                    <option key={room.type} value={room.type}>
                      {room.name} - ৳{room.pricePerNight}/night
                    </option>
                  ))}
                </select>
              </div>

              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <p>Price per night: ৳{getMinPrice(selectedHotel)}</p>
                {bookingData.checkInDate && bookingData.checkOutDate && (
                  <>
                    <p>Number of nights: {Math.ceil((new Date(bookingData.checkOutDate) - new Date(bookingData.checkInDate)) / (1000 * 60 * 60 * 24))}</p>
                    <p><strong>Total Amount: ৳{calculateTotalAmount().toLocaleString()}</strong></p>
                  </>
                )}
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn-primary">Proceed to Payment</button>
                <button type="button" className="btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content payment-modal-large" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <button className="modal-close" onClick={() => setShowPaymentModal(false)}>×</button>
            <h2>Complete Payment</h2>
            <PaymentForm
              totalAmount={calculateTotalAmount()}
              onPaymentSubmit={handlePaymentSubmit}
              onCancel={() => setShowPaymentModal(false)}
            />
          </div>
        </div>
      )}

      {/* Photo Gallery Modal */}
      {showPhotoGallery && galleryHotel && (
        <div className="modal-overlay" onClick={() => setShowPhotoGallery(false)}>
          <div className="modal-content photo-gallery-modal" onClick={(e) => e.stopPropagation()} style={{maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto'}}>
            <button className="modal-close" onClick={() => setShowPhotoGallery(false)}>×</button>
            <h2>{galleryHotel.name} - Photo Gallery</h2>
            
            <div className="photo-gallery-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '15px',
              marginTop: '20px'
            }}>
              {galleryHotel.photos.map((photo, index) => (
                <div key={index} className="gallery-photo-item" style={{
                  position: 'relative',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s ease'
                }}>
                  <img 
                    src={`${BASE_URL}${photo.url}`}
                    alt={photo.caption || `Photo ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '250px',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/400x250?text=Image+Not+Found';
                    }}
                  />
                  {photo.caption && (
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '10px',
                      fontSize: '14px'
                    }}>
                      {photo.caption}
                    </div>
                  )}
                  <div style={{
                    position: 'absolute',
                    top: 10,
                    right: 10,
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    padding: '5px 10px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {photo.type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {showMapModal && mapHotel && (
        <div className="modal-overlay" onClick={() => setShowMapModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '800px'}}>
            <button className="modal-close" onClick={() => setShowMapModal(false)}>×</button>
            <h2>📍 {mapHotel.name} - Location</h2>
            
            <div style={{marginTop: '20px'}}>
              <div style={{marginBottom: '15px', padding: '15px', background: 'var(--bg-secondary)', borderRadius: '8px'}}>
                <p style={{margin: '5px 0'}}><strong>Address:</strong></p>
                <p style={{margin: '5px 0'}}>
                  {mapHotel.address?.street && `${mapHotel.address.street}, `}
                  {mapHotel.address?.city}, {mapHotel.address?.district}
                </p>
                <p style={{margin: '5px 0'}}>{mapHotel.address?.division}, Bangladesh</p>
                {mapHotel.address?.zipCode && <p style={{margin: '5px 0'}}>Zip: {mapHotel.address.zipCode}</p>}
              </div>

              {mapHotel.location?.coordinates && mapHotel.location.coordinates[0] !== 0 && mapHotel.location.coordinates[1] !== 0 ? (
                <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px'}}>
                  <iframe
                    title="Hotel Location"
                    src={`https://www.google.com/maps?q=${mapHotel.location.coordinates[1]},${mapHotel.location.coordinates[0]}&output=embed`}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 0,
                      borderRadius: '12px'
                    }}
                    allowFullScreen
                    loading="lazy"
                  ></iframe>
                </div>
              ) : (
                <div style={{
                  padding: '40px',
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  borderRadius: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  <p>📍 Map coordinates not available for this hotel</p>
                  <p style={{fontSize: '14px', marginTop: '10px'}}>
                    Please contact the hotel directly for exact location details
                  </p>
                </div>
              )}

              <div style={{marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center'}}>
                {mapHotel.location?.coordinates && mapHotel.location.coordinates[0] !== 0 && (
                  <>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${mapHotel.location.coordinates[1]},${mapHotel.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{textDecoration: 'none', padding: '10px 20px'}}
                    >
                      Open in Google Maps
                    </a>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${mapHotel.location.coordinates[1]},${mapHotel.location.coordinates[0]}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{textDecoration: 'none', padding: '10px 20px'}}
                    >
                      Get Directions
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && reviewHotel && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
            <h2>⭐ Review {reviewHotel.name}</h2>
            
            <form onSubmit={handleReviewSubmit} style={{marginTop: '20px'}}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                  Rating <span style={{color: 'red'}}>*</span>
                </label>
                <select
                  value={reviewData.rating}
                  onChange={(e) => setReviewData({...reviewData, rating: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '16px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                >
                  <option value="">Select Rating</option>
                  <option value="5">⭐⭐⭐⭐⭐ Excellent</option>
                  <option value="4">⭐⭐⭐⭐ Very Good</option>
                  <option value="3">⭐⭐⭐ Good</option>
                  <option value="2">⭐⭐ Fair</option>
                  <option value="1">⭐ Poor</option>
                </select>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                  Comment (Optional)
                </label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  placeholder="Share your experience at this hotel..."
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '10px',
                    fontSize: '14px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!reviewData.rating}
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Hotels;
