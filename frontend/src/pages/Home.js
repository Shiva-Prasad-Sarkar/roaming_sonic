import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../services/api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [statsVisible, setStatsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [footerEmail, setFooterEmail] = useState('');
  const [footerMessage, setFooterMessage] = useState('');
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [isMobileQuickNavOpen, setIsMobileQuickNavOpen] = useState(false);
  const [complaintData, setComplaintData] = useState({
    subject: '',
    description: '',
    category: 'other',
    priority: 'medium'
  });

  const destinations = [
    {
      id: 1,
      name: "Cox's Bazar",
      image: "/Images/coxbajar.jpg",
      shortDesc: "World's longest natural sea beach",
      fullDesc: "Cox's Bazar is a town on the southeast coast of Bangladesh, known for its long natural sandy beach. It's the longest unbroken sea beach in the world, stretching over 120 km. The beach offers stunning sunrises and sunsets, water sports, and fresh seafood.",
      highlights: ["120km longest beach", "Marine Drive", "Himchari National Park", "Inani Beach", "Buddhist temples"],
      bestTime: "November to March"
    },
    {
      id: 2,
      name: "Sundarbans",
      image: "/Images/sundarbans.jpg",
      shortDesc: "Largest mangrove forest & Royal Bengal Tiger habitat",
      fullDesc: "The Sundarbans is a UNESCO World Heritage Site and the largest mangrove forest in the world. Home to the majestic Royal Bengal Tiger, it's a unique ecosystem with diverse wildlife including saltwater crocodiles, spotted deer, and various bird species.",
      highlights: ["Royal Bengal Tigers", "Mangrove forests", "Wildlife sanctuary", "River cruises", "Bird watching"],
      bestTime: "October to March"
    },
    {
      id: 3,
      name: "Sajek Valley",
      image: "/Images/sajekvalley.jpg",
      shortDesc: "Queen of hills with breathtaking views",
      fullDesc: "Sajek Valley, known as the 'Queen of Hills', is one of the most popular tourist spots in Bangladesh. Located in the Chittagong Hill Tracts, it offers panoramic views of mountains, valleys, and clouds. The valley is famous for its sunrise and sunset views above the clouds.",
      highlights: ["Cloud watching", "Sunrise views", "Indigenous culture", "Hanging bridge", "Mountain hiking"],
      bestTime: "September to March"
    },
    {
      id: 4,
      name: "Sylhet",
      image: "/Images/sylhet.jpg",
      shortDesc: "Land of tea gardens and natural beauty",
      fullDesc: "Sylhet is known for its tea plantations, lush green hills, and spiritual significance. The region offers beautiful landscapes with rolling tea gardens, crystal clear rivers, and numerous waterfalls. It's also home to the famous Jaflong and Ratargul Swamp Forest.",
      highlights: ["Tea gardens", "Ratargul Swamp Forest", "Jaflong", "Lalakhal", "Spiritual sites"],
      bestTime: "October to March"
    }
  ];

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterMessage('✓ Thank you for subscribing! Check your email for confirmation.');
      setNewsletterEmail('');
      setTimeout(() => setNewsletterMessage(''), 5000);
    }
  };

  const handleFooterNewsletterSubmit = (e) => {
    e.preventDefault();
    if (footerEmail) {
      setFooterMessage('✓ Subscribed successfully!');
      setFooterEmail('');
      setTimeout(() => setFooterMessage(''), 5000);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated || user?.userType !== 'tourist') {
      alert('Only registered tourists can submit complaints');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/complaints`,
        complaintData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert('Complaint submitted successfully! Our team will review it shortly.');
      setShowComplaintModal(false);
      setComplaintData({
        subject: '',
        description: '',
        category: 'other',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error submitting complaint:', error);
      alert(error.response?.data?.message || 'Failed to submit complaint');
    }
  };

  const scrollToSection = (e, sectionClass) => {
    e.preventDefault();
    const element = document.querySelector(`.${sectionClass}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const statsSection = document.querySelector('.stats-banner');
      if (statsSection) {
        const rect = statsSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && !statsVisible) {
          setStatsVisible(true);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsVisible]);

  useEffect(() => {
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(testimonialInterval);
  }, []);

  const testimonials = [
    {
      name: 'Anika Rahman',
      location: 'Dhaka',
      rating: 5,
      text: 'Amazing experience! Roaming Sonic made my Cox\'s Bazar trip absolutely perfect. The hotel booking was seamless and the guide was incredibly knowledgeable.',
      image: '👩'
    },
    {
      name: 'Farhan Ahmed',
      location: 'Chittagong',
      rating: 5,
      text: 'Best travel platform in Bangladesh! I\'ve used it for multiple trips. The bus booking system is so convenient and the prices are very competitive.',
      image: '👨'
    },
    {
      name: 'Tahsin Haque',
      location: 'Sylhet',
      rating: 5,
      text: 'The group tour to Sajek Valley was phenomenal! Well-organized, professional guide, and met amazing people. Highly recommended!',
      image: '🧑'
    }
  ];

  const popularPackages = [
    {
      title: 'Cox\'s Bazar Beach Paradise',
      duration: '3 Days / 2 Nights',
      price: '8,500',
      image: '🏖️',
      rating: 4.8,
      reviews: 342
    },
    {
      title: 'Sundarbans Adventure',
      duration: '2 Days / 1 Night',
      price: '6,200',
      image: '🌳',
      rating: 4.9,
      reviews: 215
    },
    {
      title: 'Sajek Valley Explorer',
      duration: '2 Days / 1 Night',
      price: '5,500',
      image: '⛰️',
      rating: 4.7,
      reviews: 189
    },
    {
      title: 'Sylhet Tea Garden Tour',
      duration: '3 Days / 2 Nights',
      price: '7,000',
      image: '🍃',
      rating: 4.6,
      reviews: 156
    }
  ];

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          backgroundImage: `url('${process.env.PUBLIC_URL}/background.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
          minHeight: '100svh',
          width: '100vw',
          maxWidth: '100%',
        }}
      >
        <div className="hero-overlay"></div>
        <div className="hero-particles">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
        
        {/* Flying Plane Animation */}
        <div className="plane-animation">
          <svg className="plane" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
            <path d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z" fill="#ffffff"/>
          </svg>
          <div className="plane-trail"></div>
        </div>
        
        {/* Quick Navigation Buttons */}
        <div className="quick-nav-mobile">
          <button
            type="button"
            className="quick-nav-hamburger"
            aria-label="Toggle quick navigation menu"
            aria-expanded={isMobileQuickNavOpen}
            onClick={() => setIsMobileQuickNavOpen((prev) => !prev)}
          >
            <span className="hamburger-icon">☰</span>
            <span className="hamburger-label">Menu</span>
          </button>

          <div className={`quick-nav-mobile-menu ${isMobileQuickNavOpen ? 'open' : ''}`}>
            <Link to="/hotels" className="quick-nav-btn" onClick={() => setIsMobileQuickNavOpen(false)}>
              <span className="quick-nav-icon">🏨</span>
              <span className="quick-nav-text">Hotels</span>
            </Link>
            <Link to="/guides" className="quick-nav-btn" onClick={() => setIsMobileQuickNavOpen(false)}>
              <span className="quick-nav-icon">🧭</span>
              <span className="quick-nav-text">Guides</span>
            </Link>
            <Link to="/buses" className="quick-nav-btn" onClick={() => setIsMobileQuickNavOpen(false)}>
              <span className="quick-nav-icon">🚌</span>
              <span className="quick-nav-text">Buses</span>
            </Link>
            <Link to="/tours" className="quick-nav-btn" onClick={() => setIsMobileQuickNavOpen(false)}>
              <span className="quick-nav-icon">🎒</span>
              <span className="quick-nav-text">Tours</span>
            </Link>
            <Link to="/group-tours" className="quick-nav-btn" onClick={() => setIsMobileQuickNavOpen(false)}>
              <span className="quick-nav-icon">👥</span>
              <span className="quick-nav-text">Group Tours</span>
            </Link>
          </div>
        </div>

        <div className="quick-nav-buttons">
          <Link to="/hotels" className="quick-nav-btn">
            <span className="quick-nav-icon">🏨</span>
            <span className="quick-nav-text">Hotels</span>
          </Link>
          <Link to="/guides" className="quick-nav-btn">
            <span className="quick-nav-icon">🧭</span>
            <span className="quick-nav-text">Guides</span>
          </Link>
          <Link to="/buses" className="quick-nav-btn">
            <span className="quick-nav-icon">🚌</span>
            <span className="quick-nav-text">Buses</span>
          </Link>
          <Link to="/tours" className="quick-nav-btn">
            <span className="quick-nav-icon">🎒</span>
            <span className="quick-nav-text">Tours</span>
          </Link>
          <Link to="/group-tours" className="quick-nav-btn">
            <span className="quick-nav-icon">👥</span>
            <span className="quick-nav-text">Group Tours</span>
          </Link>
        </div>
        
        {isAuthenticated && (
          <Link to="/dashboard" className="dashboard-link-header">
            Go to Dashboard
          </Link>
        )}
        
        <button 
          onClick={toggleTheme} 
          className="theme-toggle-btn"
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
        
        <div className="hero-content">
          <div className="brand-title-wrapper">
            <h1 className="brand-main-title animated-title">
              <span className="word">Roaming</span>
              <span className="word">Sonic</span>
            </h1>
          </div>
          <h1 className="hero-title">
            Discover the <span className="brand-name">Extraordinary</span>
            <br/>Adventures of Bangladesh
          </h1>
          <p className="hero-subtitle">
            Your Gateway to Unforgettable Travel Experiences
          </p>
          <p className="hero-description">
            Seamless booking for buses, hotels, tours, and professional guides - All in one powerful platform
          </p>
          <div className="hero-actions">
            {!isAuthenticated && (
              <>
                <Link to="/register" className="btn-primary btn-glow">
                  <span>Start Your Journey</span>
                </Link>
                <Link to="/login" className="btn-secondary btn-glass">Explore Now</Link>
              </>
            )}
          </div>
          
          <div className="hero-features">
            <div className="hero-feature-item">
              <span className="feature-icon-small">✓</span>
              <span>1000+ Destinations</span>
            </div>
            <div className="hero-feature-item">
              <span className="feature-icon-small">✓</span>
              <span>Verified Partners</span>
            </div>
            <div className="hero-feature-item">
              <span className="feature-icon-small">✓</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="stats-banner">
        <div className="stats-container">
          <div className="stat-item">
            <div className="stat-number" data-target="50000">{statsVisible ? '50,000+' : '0'}</div>
            <div className="stat-label">Happy Travelers</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="1000">{statsVisible ? '1,000+' : '0'}</div>
            <div className="stat-label">Hotels & Resorts</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="500">{statsVisible ? '500+' : '0'}</div>
            <div className="stat-label">Expert Guides</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" data-target="200">{statsVisible ? '200+' : '0'}</div>
            <div className="stat-label">Tour Packages</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle">Your journey to amazing experiences starts here</p>
        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-icon">📝</div>
            <h3>Create Account</h3>
            <p>Sign up in seconds and unlock exclusive deals</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-icon">🔍</div>
            <h3>Search & Compare</h3>
            <p>Find the perfect hotels, tours, and guides</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-icon">💳</div>
            <h3>Book Securely</h3>
            <p>Easy payment with instant confirmation</p>
          </div>
          <div className="step-connector">→</div>
          <div className="step-item">
            <div className="step-number">4</div>
            <div className="step-icon">🎉</div>
            <h3>Enjoy Journey</h3>
            <p>Create unforgettable memories</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Choose Roaming Sonic?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🚌</div>
            <h3>Bus Tickets</h3>
            <p>Book bus tickets online with seat selection and instant PDF tickets</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🏨</div>
            <h3>Hotels & Resorts</h3>
            <p>Find and book the best hotels and resorts across Bangladesh</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">👥</div>
            <h3>Group Tours</h3>
            <p>Join exciting group tours or create your own with friends</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🎯</div>
            <h3>Professional Guides</h3>
            <p>Hire experienced tour guides for memorable experiences</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Smart Pricing</h3>
            <p>Get the best deals with coupons, seasonal discounts, and referral rewards</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Foreign Tours</h3>
            <p>Explore international destinations with specialized packages</p>
          </div>
        </div>
      </section>

      {/* Quick Access Services */}
      <section className="services-section">
        <h2 className="section-title">Explore Our Services</h2>
        <p className="section-subtitle">Everything you need for your perfect journey</p>
        <div className="services-grid">
          <Link to="/hotels" className="service-card">
            <div className="service-icon">🏨</div>
            <h3>Find Hotels</h3>
            <p>Browse thousands of hotels, resorts, and guest houses across Bangladesh</p>
            <span className="service-link">Explore Hotels →</span>
          </Link>

          <Link to="/guides" className="service-card">
            <div className="service-icon">🧭</div>
            <h3>Hire a Guide</h3>
            <p>Connect with professional and certified tour guides for your journey</p>
            <span className="service-link">Find Guides →</span>
          </Link>

          <Link to="/buses" className="service-card">
            <div className="service-icon">🚌</div>
            <h3>Book Bus Tickets</h3>
            <p>Travel comfortably across Bangladesh with our bus booking service</p>
            <span className="service-link">Search Buses →</span>
          </Link>

          <Link to="/tours" className="service-card">
            <div className="service-icon">🗺️</div>
            <h3>Tour Packages</h3>
            <p>Discover amazing tour packages to explore the beauty of Bangladesh</p>
            <span className="service-link">View Tours →</span>
          </Link>
        </div>
      </section>

      {/* Popular Destinations */}
      <section className="destinations-section">
        <h2 className="section-title">Explore Bangladesh</h2>
        <p className="section-subtitle">Discover the most beautiful places in our country</p>
        <div className="destinations-grid">
          {destinations.map((destination) => (
            <div 
              key={destination.id} 
              className="destination-card"
              onClick={() => setSelectedDestination(destination)}
              style={{ cursor: 'pointer' }}
            >
              <div 
                className="destination-image" 
                style={{ 
                  backgroundImage: `url(${destination.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              ></div>
              <div className="destination-info">
                <h3>{destination.name}</h3>
                <p>{destination.shortDesc}</p>
                <span className="view-details">Click to view details →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Destination Details Modal */}
      {selectedDestination && (
        <div className="destination-modal" onClick={() => setSelectedDestination(null)}>
          <div className="destination-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedDestination(null)}>×</button>
            <div className="modal-image" style={{ 
              backgroundImage: `url(${selectedDestination.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}></div>
            <div className="modal-body">
              <h2>{selectedDestination.name}</h2>
              <p className="modal-description">{selectedDestination.fullDesc}</p>
              
              <div className="modal-highlights">
                <h3>Highlights</h3>
                <ul>
                  {selectedDestination.highlights.map((highlight, index) => (
                    <li key={index}>✓ {highlight}</li>
                  ))}
                </ul>
              </div>
              
              <div className="modal-best-time">
                <h3>Best Time to Visit</h3>
                <p>{selectedDestination.bestTime}</p>
              </div>
              
              <div className="modal-actions">
                <Link to="/hotels" className="btn-primary">Book Hotels</Link>
                <Link to="/tours" className="btn-outline">View Tour Packages</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Services Section */}
      <section className="services-section">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          <div className="service-item">
            <h4>✓ Online Ticket Booking</h4>
            <p>Instant confirmation with printable PDF tickets</p>
          </div>
          <div className="service-item">
            <h4>✓ Multi-Stop Journeys</h4>
            <p>Plan complex trips with multiple destinations</p>
          </div>
          <div className="service-item">
            <h4>✓ Flexible Payment</h4>
            <p>Pay with cash, bKash, or Nagad</p>
          </div>
          <div className="service-item">
            <h4>✓ Rating & Reviews</h4>
            <p>Make informed decisions with user reviews</p>
          </div>
          <div className="service-item">
            <h4>✓ Budget Estimator</h4>
            <p>Find destinations that fit your budget</p>
          </div>
          <div className="service-item">
            <h4>✓ Lost & Found</h4>
            <p>Report and track lost items during travel</p>
          </div>
          <div className="service-item">
            <h4>✓ Community Forum</h4>
            <p>Connect with fellow travelers</p>
          </div>
          <div className="service-item">
            <h4>✓ 24/7 Support</h4>
            <p>Emergency contact and helpline available</p>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="about-section" id="about">
        <div className="about-content">
          <h2 className="section-title">About Roaming Sonic</h2>
          <div className="about-grid">
            <div className="about-text">
              <h3>Your Trusted Travel Partner in Bangladesh</h3>
              <p>
                Founded with a passion for showcasing the beauty of Bangladesh, Roaming Sonic 
                is your one-stop solution for all travel needs. From the world's longest natural 
                sea beach in Cox's Bazar to the majestic Sundarbans, we help you explore every 
                corner of our beautiful country.
              </p>
              <p>
                We connect travelers with trusted hotels, professional guides, and reliable 
                transportation services. Our mission is to make travel accessible, affordable, 
                and memorable for everyone.
              </p>
              <div className="about-stats">
                <div className="stat">
                  <h4>5000+</h4>
                  <p>Happy Travelers</p>
                </div>
                <div className="stat">
                  <h4>500+</h4>
                  <p>Hotels & Resorts</p>
                </div>
                <div className="stat">
                  <h4>200+</h4>
                  <p>Professional Guides</p>
                </div>
                <div className="stat">
                  <h4>50+</h4>
                  <p>Tour Packages</p>
                </div>
              </div>
            </div>
            <div className="about-features">
              <div className="about-feature">
                <span className="feature-number">01</span>
                <h4>Trusted Platform</h4>
                <p>Verified hotels, guides, and services you can rely on</p>
              </div>
              <div className="about-feature">
                <span className="feature-number">02</span>
                <h4>Best Prices</h4>
                <p>Competitive pricing with exclusive discounts and offers</p>
              </div>
              <div className="about-feature">
                <span className="feature-number">03</span>
                <h4>24/7 Support</h4>
                <p>Round-the-clock customer service for your peace of mind</p>
              </div>
              <div className="about-feature">
                <span className="feature-number">04</span>
                <h4>Local Expertise</h4>
                <p>Deep knowledge of Bangladesh's hidden gems and attractions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <h2 className="section-title">What Our Travelers Say</h2>
        <p className="section-subtitle">Real experiences from real travelers</p>
        <div className="testimonials-container">
          <button className="testimonial-nav prev" onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}>‹</button>
          <div className="testimonial-wrapper">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className={`testimonial-card ${index === currentTestimonial ? 'active' : ''}`}
                style={{ display: index === currentTestimonial ? 'block' : 'none' }}
              >
                <div className="testimonial-quote">"</div>
                <p className="testimonial-text">{testimonial.text}</p>
                <div className="testimonial-rating">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
                <div className="testimonial-author">
                  <div className="author-image">{testimonial.image}</div>
                  <div className="author-info">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="testimonial-nav next" onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}>›</button>
        </div>
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <span 
              key={index} 
              className={`dot ${index === currentTestimonial ? 'active' : ''}`}
              onClick={() => setCurrentTestimonial(index)}
            ></span>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="trust-container">
          <div className="trust-item">
            <div className="trust-icon">🔒</div>
            <h4>Secure Payment</h4>
            <p>Your data is safe with us</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">✓</div>
            <h4>Verified Partners</h4>
            <p>100% authentic services</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">💰</div>
            <h4>Best Price Guarantee</h4>
            <p>Unbeatable deals</p>
          </div>
          <div className="trust-item">
            <div className="trust-icon">🎯</div>
            <h4>Instant Confirmation</h4>
            <p>Book with confidence</p>
          </div>
        </div>
      </section>

      {/* Mobile App Promotion */}
      <section className="app-section">
        <div className="app-container">
          <div className="app-content">
            <h2>Travel On The Go</h2>
            <p>Download our mobile app for exclusive deals and seamless booking experience</p>
            <ul className="app-features">
              <li>✓ Book anywhere, anytime</li>
              <li>✓ Get exclusive mobile-only deals</li>
              <li>✓ Track your bookings in real-time</li>
              <li>✓ Access offline itineraries</li>
            </ul>
            <div className="app-buttons">
              <a href="#" className="app-store-btn">
                <span className="store-icon">🍎</span>
                <div>
                  <small>Download on the</small>
                  <strong>App Store</strong>
                </div>
              </a>
              <a href="#" className="app-store-btn">
                <span className="store-icon">📱</span>
                <div>
                  <small>GET IT ON</small>
                  <strong>Google Play</strong>
                </div>
              </a>
            </div>
          </div>
          <div className="app-image">
            <div className="phone-mockup">📱</div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="faq-section" id="faq">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-container">
          <div className="faq-item">
            <h3>How do I book a bus ticket?</h3>
            <p>
              Simply register or login to your account, search for your desired route, 
              select your preferred bus and seat, then proceed to payment. You'll receive 
              a printable PDF ticket instantly via email.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>Can I cancel my hotel booking?</h3>
            <p>
              Yes, you can cancel your booking from your dashboard. Refund eligibility 
              depends on the hotel's cancellation policy and will be reviewed by our admin 
              team. Most bookings made 48+ hours in advance are eligible for full refunds.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How does the referral program work?</h3>
            <p>
              Share your unique referral code with friends. When 5 people register using 
              your code, you'll receive a 10% discount coupon valid for hotels and bus 
              tickets. Your friends also get special welcome discounts!
            </p>
          </div>
          
          <div className="faq-item">
            <h3>What payment methods are accepted?</h3>
            <p>
              We accept multiple payment methods including bKash, Nagad, and cash payments. 
              Simply select your preferred method during checkout. All transactions are 
              secure and encrypted.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How do I hire a tour guide?</h3>
            <p>
              Browse our verified guides section, filter by language, specialization, or 
              location. View their profiles, ratings, and hourly rates, then send a booking 
              request. The guide will confirm availability and you can proceed with payment.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>Are there group tour discounts?</h3>
            <p>
              Yes! We offer special group rates for parties of 5 or more. You can also join 
              existing group tours for popular destinations at discounted prices. Check our 
              tours section for upcoming group adventures.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>What if I lose something during my trip?</h3>
            <p>
              Use our Lost & Found feature to report lost items. We work with hotels, guides, 
              and transport services to help track and recover your belongings. Report items 
              as soon as possible for better chances of recovery.
            </p>
          </div>
          
          <div className="faq-item">
            <h3>How can I become a registered guide?</h3>
            <p>
              Register as a guide by providing your experience, certifications, languages, 
              and specializations. Our admin team will verify your credentials. Once approved, 
              you can start receiving booking requests from travelers.
            </p>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="newsletter-section">
        <div className="newsletter-container">
          <div className="newsletter-content">
            <h2>Get Exclusive Travel Deals</h2>
            <p>Subscribe to our newsletter and receive special offers, travel tips, and destination guides</p>
            <form className="newsletter-form-main" onSubmit={handleNewsletterSubmit}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required 
              />
              <button type="submit" className="btn-subscribe-main">Subscribe Now</button>
            </form>
            {newsletterMessage && <p className="newsletter-success">{newsletterMessage}</p>}
            <p className="newsletter-note">🔒 We respect your privacy. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section" id="contact">
        <h2 className="section-title">Get In Touch</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div className="contact-details">
                <h3>Email Us</h3>
                <a href="mailto:info@roamingsonic.com">info@roamingsonic.com</a>
                <a href="mailto:support@roamingsonic.com">support@roamingsonic.com</a>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">📞</div>
              <div className="contact-details">
                <h3>Call Us</h3>
                <a href="tel:+8801712345678">+880 1712-345678</a>
                <a href="tel:+8801812345678">+880 1812-345678</a>
                <p className="contact-hours">Available 24/7</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div className="contact-details">
                <h3>Visit Us</h3>
                <p>House 23, Road 12, Dhanmondi</p>
                <p>Dhaka 1209, Bangladesh</p>
              </div>
            </div>
            
            <div className="contact-item">
              <div className="contact-icon">🚨</div>
              <div className="contact-details">
                <h3>Emergency Hotline</h3>
                <a href="tel:999" className="emergency">999 (24/7 Emergency)</a>
              </div>
            </div>
          </div>
          
          <div className="social-links">
            <h3>Connect With Us</h3>
            <div className="social-icons">
              <a href="https://facebook.com/roamingsonic" target="_blank" rel="noopener noreferrer" className="social-link facebook">
                <span>f</span>
                <span className="social-name">Facebook</span>
              </a>
              <a href="https://instagram.com/roamingsonic" target="_blank" rel="noopener noreferrer" className="social-link instagram">
                <span>📷</span>
                <span className="social-name">Instagram</span>
              </a>
              <a href="https://linkedin.com/company/roamingsonic" target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                <span>in</span>
                <span className="social-name">LinkedIn</span>
              </a>
              <a href="https://twitter.com/roamingsonic" target="_blank" rel="noopener noreferrer" className="social-link twitter">
                <span>𝕏</span>
                <span className="social-name">Twitter</span>
              </a>
              <a href="https://youtube.com/@roamingsonic" target="_blank" rel="noopener noreferrer" className="social-link youtube">
                <span>▶</span>
                <span className="social-name">YouTube</span>
              </a>
              <a href="https://wa.me/8801712345678" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">
                <span>💬</span>
                <span className="social-name">WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join thousands of travelers exploring Bangladesh with Roaming Sonic</p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary btn-large">
              Create Account Now
            </Link>
          )}
        </div>
      </section>

      {/* Emergency Contact & Helpline */}
      <section className="emergency-section">
        <div className="container">
          <div className="emergency-header">
            <h2>🚨 Emergency Contact & Helpline</h2>
            <p>We're here to help you 24/7 during your travel in Bangladesh</p>
          </div>
          <div className="emergency-grid">
            <div className="emergency-card">
              <div className="emergency-icon">📞</div>
              <h3>24/7 Helpline</h3>
              <p className="emergency-number">+880 1XXX-XXXXXX</p>
              <p>Call us anytime for travel assistance</p>
            </div>
            <div className="emergency-card">
              <div className="emergency-icon">🚑</div>
              <h3>Medical Emergency</h3>
              <p className="emergency-number">999</p>
              <p>National Emergency Service</p>
            </div>
            <div className="emergency-card">
              <div className="emergency-icon">👮</div>
              <h3>Tourist Police</h3>
              <p className="emergency-number">+880 2-8836333</p>
              <p>Bangladesh Tourist Police</p>
            </div>
            <div className="emergency-card">
              <div className="emergency-icon">📧</div>
              <h3>Email Support</h3>
              <p className="emergency-number">support@roamingsonic.com</p>
              <p>Response within 2 hours</p>
            </div>
          </div>
          
          {/* Complaint Button */}
          {isAuthenticated && user?.userType === 'tourist' && (
            <div className="complaint-button-container">
              <button 
                className="btn-complaint"
                onClick={() => setShowComplaintModal(true)}
              >
                📝 Submit a Complaint
              </button>
              <p className="complaint-note">Have an issue? Let us know and we'll resolve it promptly</p>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Roaming Sonic</h3>
            <p>Your trusted travel companion for exploring the beauty of Bangladesh.</p>
            <p className="footer-tagline">🇧🇩 Proudly Bangladeshi</p>
          </div>
          
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#home" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a></li>
              <li><Link to="/hotels">Hotels</Link></li>
              <li><Link to="/buses">Bus Tickets</Link></li>
              <li><Link to="/tours">Tours</Link></li>
              <li><Link to="/guides">Find Guides</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Support</h4>
            <ul>
              <li><a href="#faq" onClick={(e) => scrollToSection(e, 'faq-section')}>FAQ</a></li>
              <li><a href="#contact" onClick={(e) => scrollToSection(e, 'contact-section')}>Contact Us</a></li>
              <li><a href="#about" onClick={(e) => scrollToSection(e, 'about-section')}>About Us</a></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Subscribe for travel tips and exclusive offers</p>
            <form className="newsletter-form" onSubmit={handleFooterNewsletterSubmit}>
              <input 
                type="email" 
                placeholder="Your email" 
                value={footerEmail}
                onChange={(e) => setFooterEmail(e.target.value)}
                required
              />
              <button type="submit" className="btn-subscribe">Subscribe</button>
            </form>
            {footerMessage && <p className="footer-newsletter-success">{footerMessage}</p>}
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Roaming Sonic. All rights reserved.</p>
        </div>
      </footer>

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="modal-content complaint-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowComplaintModal(false)}>×</button>
            <h2>📝 Submit a Complaint</h2>
            <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>
              We value your feedback and will address your concerns promptly
            </p>
            
            <form onSubmit={handleComplaintSubmit}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                  Subject <span style={{color: 'red'}}>*</span>
                </label>
                <input
                  type="text"
                  value={complaintData.subject}
                  onChange={(e) => setComplaintData({...complaintData, subject: e.target.value})}
                  placeholder="Brief description of your complaint"
                  required
                  maxLength="200"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)'
                  }}
                />
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                  Category <span style={{color: 'red'}}>*</span>
                </label>
                <select
                  value={complaintData.category}
                  onChange={(e) => setComplaintData({...complaintData, category: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)'
                  }}
                >
                  <option value="booking">Booking Issue</option>
                  <option value="hotel">Hotel Related</option>
                  <option value="bus">Bus Service</option>
                  <option value="tour">Tour Package</option>
                  <option value="guide">Guide Service</option>
                  <option value="payment">Payment Issue</option>
                  <option value="service">Customer Service</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                  Priority
                </label>
                <select
                  value={complaintData.priority}
                  onChange={(e) => setComplaintData({...complaintData, priority: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    background: 'var(--bg-primary)'
                  }}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: '600'}}>
                  Description <span style={{color: 'red'}}>*</span>
                </label>
                <textarea
                  value={complaintData.description}
                  onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
                  placeholder="Please provide detailed information about your complaint..."
                  required
                  maxLength="2000"
                  rows="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '15px',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    resize: 'vertical',
                    background: 'var(--bg-primary)',
                    fontFamily: 'inherit'
                  }}
                />
                <small style={{color: 'var(--text-secondary)'}}>
                  {complaintData.description.length}/2000 characters
                </small>
              </div>

              <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                <button
                  type="button"
                  onClick={() => setShowComplaintModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Submit Complaint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
