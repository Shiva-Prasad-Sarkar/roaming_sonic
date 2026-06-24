import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { userService , BASE_URL } from '../../services/api';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import PaymentForm from '../../components/PaymentForm';

const TouristDashboard = () => {
  const { user, updateUser } = useAuth();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [guideRequests, setGuideRequests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showTourReviewModal, setShowTourReviewModal] = useState(false);
  const [showHotelReviewModal, setShowHotelReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showHotelBookModal, setShowHotelBookModal] = useState(false);
  const [selectedWishlistHotel, setSelectedWishlistHotel] = useState(null);
  const [showTourBookModal, setShowTourBookModal] = useState(false);
  const [selectedWishlistTour, setSelectedWishlistTour] = useState(null);
  const [showHotelPaymentModal, setShowHotelPaymentModal] = useState(false);
  const [showTourPaymentModal, setShowTourPaymentModal] = useState(false);
  const [hotelBookingData, setHotelBookingData] = useState({
    checkInDate: '',
    checkOutDate: '',
    guests: 1,
    roomType: '',
    paymentMethod: 'bkash',
    transactionId: ''
  });
  const [tourBookingData, setTourBookingData] = useState({
    numberOfMembers: 1,
    travelDate: '',
    specialRequests: '',
    paymentMethod: 'bkash',
    transactionId: ''
  });
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [tourReviewData, setTourReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [hotelReviewData, setHotelReviewData] = useState({
    rating: 5,
    comment: ''
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Group Tour State
  const [myGroupTours, setMyGroupTours] = useState([]);
  const [joinedGroupTours, setJoinedGroupTours] = useState([]);
  const [showGroupTourModal, setShowGroupTourModal] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [tourPackages, setTourPackages] = useState([]);
  
  // Complaints State
  const [complaints, setComplaints] = useState([]);
  const [complaintsLoading, setComplaintsLoading] = useState(false);
  const [groupTourForm, setGroupTourForm] = useState({
    title: '',
    description: '',
    tourDate: '',
    endDate: '',
    destination: '',
    meetingPoint: '',
    meetingTime: '',
    maxMembers: 5,
    costPerPerson: '',
    includes: '',
    notes: ''
  });
  const [selectedGroupTour, setSelectedGroupTour] = useState(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  // Referral Coupon State
  const [claimingCoupon, setClaimingCoupon] = useState(false);
  const [showCouponsModal, setShowCouponsModal] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const section = params.get('tab') || params.get('section') || 'overview';
    setActiveSection(section);
  }, [location.search]);

  useEffect(() => {
    fetchProfile();
    fetchBookings(); // Fetch bookings on mount for stats
    if (activeSection === 'guides') {
      fetchGuideRequests();
    }
    if (activeSection === 'bookings') {
      fetchBookings();
    }
    if (activeSection === 'group-tours') {
      fetchMyGroupTours();
      fetchJoinedGroupTours();
    }
    if (activeSection === 'complaints') {
      fetchComplaints();
    }
  }, [activeSection]);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGuideRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/guide-requests/tourist`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuideRequests(response.data.data);
    } catch (error) {
      console.error('Error fetching guide requests:', error);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/bookings/my-bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchComplaints = async () => {
    setComplaintsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/complaints/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(response.data.data);
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setComplaintsLoading(false);
    }
  };

  const handleClaimCoupon = async () => {
    if (claimingCoupon) return;
    
    setClaimingCoupon(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${BASE_URL}/api/users/claim-coupon`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert(response.data.message);
      fetchProfile(); // Refresh profile to show updated data
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to claim coupon';
      alert('❌ ' + errorMsg);
    } finally {
      setClaimingCoupon(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Refund will be processed as per cancellation policy.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `${BASE_URL}/api/bookings/${bookingId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(response.data.message || 'Booking cancelled successfully!');
      fetchBookings(); // Refresh the list
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error cancelling booking';
      alert('❌ ' + errorMsg);
    }
  };

  const handleDownloadTicket = async (bookingId, downloadPDF = false) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        alert('❌ Please login again to download ticket');
        return;
      }
      
      const url = `${BASE_URL}/api/bookings/${bookingId}/ticket`;
      
      console.log('Fetching ticket from:', url);
      
      // Fetch the ticket HTML with authorization
      const response = await fetch(url, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      });

      console.log('Response status:', response.status);
      console.log('Response content-type:', response.headers.get('content-type'));

      if (!response.ok) {
        // Try to parse error as JSON first, then as text
        let errorMessage = 'Failed to generate ticket';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Get the HTML content
      const html = await response.text();
      
      console.log('Received HTML length:', html.length);
      
      if (!html || html.trim().length === 0) {
        throw new Error('Received empty ticket data');
      }
      
      if (downloadPDF) {
        try {
          console.log('Creating PDF container...');
          
          // Create iframe approach for better rendering
          const iframe = document.createElement('iframe');
          iframe.style.cssText = 'position:absolute;width:210mm;height:297mm;top:0;left:0;border:none;';
          document.body.appendChild(iframe);
          
          const iframeDoc = iframe.contentWindow.document;
          iframeDoc.open();
          iframeDoc.write(html);
          iframeDoc.close();
          
          console.log('Iframe created, waiting for content to render...');
          
          // Wait for iframe content to fully render
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          console.log('Starting PDF generation...');
          
          const element = iframeDoc.body;
          
          // Configure PDF options - simplified for better compatibility
          const opt = {
            margin: 10,
            filename: `ticket-${bookingId}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { 
              scale: 2,
              useCORS: true,
              logging: true,
              backgroundColor: '#ffffff',
              scrollY: 0,
              scrollX: 0,
              windowHeight: iframeDoc.body.scrollHeight
            },
            jsPDF: { 
              unit: 'mm', 
              format: 'a4', 
              orientation: 'portrait'
            },
            pagebreak: { mode: 'avoid-all' }
          };
          
          // Generate PDF
          await html2pdf()
            .set(opt)
            .from(element)
            .save();
          
          // Clean up
          document.body.removeChild(iframe);
          
          console.log('PDF generated and downloaded successfully');
          alert('✅ Ticket downloaded successfully!');
          
        } catch (pdfError) {
          console.error('PDF generation failed:', pdfError);
          alert('❌ Failed to generate PDF: ' + pdfError.message + '. Try "View Ticket" instead and use browser print (Ctrl+P) to save as PDF.');
        }
      } else {
        // Open in new window and write content with print support
        const ticketWindow = window.open('', '_blank', 'width=800,height=900');
        if (ticketWindow) {
          // Add print button and styling to the HTML
          const htmlWithPrint = html.replace('</body>', `
            <div style="text-align: center; margin: 20px; padding: 20px; border-top: 2px dashed #ccc;">
              <button onclick="window.print()" style="
                background: #2c5aa0;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
                margin-right: 10px;
              ">🖨️ Print Ticket</button>
              <button onclick="window.close()" style="
                background: #666;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 5px;
                font-size: 16px;
                cursor: pointer;
              ">❌ Close</button>
              <p style="margin-top: 10px; color: #666; font-size: 12px;">
                Tip: Use Ctrl+P to print or save as PDF
              </p>
            </div>
            <style>
              @media print {
                button { display: none !important; }
                .print-hide { display: none !important; }
              }
            </style>
          </body>`);
          
          ticketWindow.document.write(htmlWithPrint);
          ticketWindow.document.close();
          console.log('Ticket opened in new window');
        } else {
          alert('❌ Please allow pop-ups to view the ticket');
        }
      }
    } catch (error) {
      console.error('Error loading ticket:', error);
      console.error('Error stack:', error.stack);
      alert('❌ ' + (error.message || 'Failed to load ticket. Please try again.'));
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'confirmed': return 'badge-success';
      case 'pending': return 'badge-warning';
      case 'cancelled': return 'badge-danger';
      case 'completed': return 'badge-info';
      default: return 'badge-secondary';
    }
  };

  const getBookingTypeName = (type, booking) => {
    if (type === 'hotel' && booking.hotel) return booking.hotel.name;
    if (type === 'bus' && booking.bus) return booking.bus.name;
    if (type === 'tour' && booking.tour) return booking.tour.title;
    return type;
  };

  const openTourReviewModal = (booking) => {
    setSelectedBooking(booking);
    setTourReviewData({ rating: 5, comment: '' });
    setShowTourReviewModal(true);
  };

  const closeTourReviewModal = () => {
    setShowTourReviewModal(false);
    setSelectedBooking(null);
    setTourReviewData({ rating: 5, comment: '' });
  };

  const handleTourReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/tours/${selectedBooking.tour._id}/review`,
        tourReviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Review submitted successfully!');
      closeTourReviewModal();
      fetchBookings(); // Refresh bookings
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error submitting review';
      alert('❌ ' + errorMsg);
    }
  };

  const openHotelBookModal = (hotel) => {
    setSelectedWishlistHotel(hotel);
    setHotelBookingData({
      checkInDate: '',
      checkOutDate: '',
      guests: 1,
      roomType: hotel.rooms && hotel.rooms.length > 0 ? hotel.rooms[0].type : ''
    });
    setShowHotelBookModal(true);
  };

  const openTourBookModal = (tour) => {
    setSelectedWishlistTour(tour);
    setTourBookingData({
      numberOfMembers: 1,
      travelDate: '',
      specialRequests: ''
    });
    setShowTourBookModal(true);
  };

  const handleRemoveFromWishlist = async (hotelId) => {
    if (!window.confirm('Are you sure you want to remove this hotel from your wishlist?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/users/wishlist/${hotelId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Hotel removed from wishlist!');
      fetchProfile(); // Refresh profile to update wishlist
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      alert('❌ Failed to remove from wishlist: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleHotelBookingSubmit = (e) => {
    e.preventDefault();
    setShowHotelBookModal(false);
    setShowHotelPaymentModal(true);
  };

  const handleHotelPaymentSubmit = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const checkIn = new Date(hotelBookingData.checkInDate);
      const checkOut = new Date(hotelBookingData.checkOutDate);
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
      const room = selectedWishlistHotel.rooms.find(r => r.type === hotelBookingData.roomType);
      const totalAmount = nights * (room?.pricePerNight || 0) * hotelBookingData.guests;

      await axios.post(
        `${BASE_URL}/api/bookings`,
        {
          bookingType: 'hotel',
          hotel: selectedWishlistHotel._id,
          checkInDate: hotelBookingData.checkInDate,
          checkOutDate: hotelBookingData.checkOutDate,
          guests: hotelBookingData.guests,
          roomType: hotelBookingData.roomType,
          totalAmount: totalAmount,
          status: 'confirmed',
          ...paymentData
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from wishlist after booking
      await axios.delete(
        `${BASE_URL}/api/users/wishlist/${selectedWishlistHotel._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('✅ Hotel booked successfully! Removed from wishlist.');
      setShowHotelPaymentModal(false);
      setSelectedWishlistHotel(null);
      setHotelBookingData({ checkInDate: '', checkOutDate: '', guests: 1, roomType: '', paymentMethod: 'bkash', transactionId: '' });
      fetchProfile();
      fetchBookings();
    } catch (error) {
      console.error('Error booking hotel:', error);
      alert('Failed to book hotel: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleTourBookingSubmit = (e) => {
    e.preventDefault();
    setShowTourBookModal(false);
    setShowTourPaymentModal(true);
  };

  const handleTourPaymentSubmit = async (paymentData) => {
    try {
      const token = localStorage.getItem('token');
      const totalAmount = selectedWishlistTour.price * tourBookingData.numberOfMembers;
      
      await axios.post(
        `${BASE_URL}/api/bookings`,
        {
          bookingType: 'tour',
          tour: selectedWishlistTour._id,
          numberOfMembers: parseInt(tourBookingData.numberOfMembers),
          travelDate: tourBookingData.travelDate,
          totalAmount: totalAmount,
          specialRequests: tourBookingData.specialRequests,
          status: 'confirmed',
          ...paymentData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      alert('✅ Tour booked successfully!');
      setShowTourPaymentModal(false);
      setSelectedWishlistTour(null);
      setTourBookingData({ numberOfMembers: 1, travelDate: '', specialRequests: '', paymentMethod: 'bkash', transactionId: '' });
      fetchProfile();
      fetchBookings();
    } catch (error) {
      console.error('Error booking tour:', error);
      alert('❌ Failed to book tour: ' + (error.response?.data?.message || error.message));
    }
  };

  const calculateHotelTotalAmount = () => {
    if (!selectedWishlistHotel || !hotelBookingData.checkInDate || !hotelBookingData.checkOutDate || !hotelBookingData.roomType) return 0;
    const checkIn = new Date(hotelBookingData.checkInDate);
    const checkOut = new Date(hotelBookingData.checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const room = selectedWishlistHotel.rooms.find(r => r.type === hotelBookingData.roomType);
    return nights * (room?.pricePerNight || 0) * hotelBookingData.guests;
  };

  const calculateTourTotalAmount = () => {
    if (!selectedWishlistTour || !tourBookingData.numberOfMembers) return 0;
    return selectedWishlistTour.price * tourBookingData.numberOfMembers;
  };

  const openHotelReviewModal = (booking) => {
    setSelectedBooking(booking);
    setHotelReviewData({ rating: 5, comment: '' });
    setShowHotelReviewModal(true);
  };

  const handleHotelReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/hotel-bookings/${selectedBooking._id}/review`,
        hotelReviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ Review submitted successfully!');
      setShowHotelReviewModal(false);
      setSelectedBooking(null);
      setHotelReviewData({ rating: 5, comment: '' });
      fetchBookings();
    } catch (error) {
      alert('❌ ' + (error.response?.data?.message || 'Error submitting review'));
    }
  };

  const downloadBookingSlip = async (booking) => {
    try {
      const element = document.createElement('div');
      element.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4ecdc4; padding-bottom: 20px;">
            <h1 style="color: #4ecdc4; margin: 0;">ROAMING SONIC</h1>
            <h2 style="color: #666; margin: 10px 0 0 0;">Booking Confirmation</h2>
          </div>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
            <h3 style="color: #333; margin-top: 0;">Booking Details</h3>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
            <p><strong>Booking Type:</strong> ${booking.bookingType.toUpperCase()}</p>
            <p><strong>Status:</strong> <span style="color: ${booking.status === 'confirmed' ? 'green' : 'orange'}">${booking.status.toUpperCase()}</span></p>
            <p><strong>Booking Date:</strong> ${new Date(booking.createdAt).toLocaleDateString()}</p>
          </div>

          ${booking.bookingType === 'hotel' && booking.hotel ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #333;">Hotel Information</h3>
              <p><strong>Hotel Name:</strong> ${booking.hotel.name}</p>
              <p><strong>Location:</strong> ${booking.hotel.address?.city}, ${booking.hotel.address?.division}</p>
              <p><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()}</p>
              <p><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Room Type:</strong> ${booking.roomType}</p>
            </div>
          ` : ''}

          ${booking.bookingType === 'tour' && booking.tour ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #333;">Tour Information</h3>
              <p><strong>Tour:</strong> ${booking.tour.title}</p>
              <p><strong>Destination:</strong> ${booking.tour.destination}</p>
              <p><strong>Date:</strong> ${new Date(booking.bookingDate).toLocaleDateString()}</p>
              <p><strong>Participants:</strong> ${booking.participants}</p>
            </div>
          ` : ''}

          ${booking.bookingType === 'bus' && booking.bus ? `
            <div style="margin-bottom: 20px;">
              <h3 style="color: #333;">Bus Information</h3>
              <p><strong>Bus:</strong> ${booking.bus.name} (${booking.bus.busNumber})</p>
              <p><strong>Route:</strong> ${booking.bus.from} → ${booking.bus.to}</p>
              <p><strong>Journey Date:</strong> ${new Date(booking.journeyDate).toLocaleDateString()}</p>
              <p><strong>Seats:</strong> ${booking.seats?.join(', ')}</p>
            </div>
          ` : ''}

          <div style="background: #4ecdc4; color: white; padding: 20px; border-radius: 10px; text-align: center;">
            <h2 style="margin: 0 0 10px 0;">Total Amount</h2>
            <h1 style="margin: 0; font-size: 36px;">৳${booking.totalAmount?.toLocaleString() || '0'}</h1>
            <p style="margin: 10px 0 0 0;">Payment Status: ${booking.paymentStatus?.toUpperCase()}</p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 2px dashed #ccc; text-align: center; color: #666;">
            <p>Thank you for choosing Roaming Sonic!</p>
            <p style="font-size: 12px;">For any queries, contact us at support@roamingsonic.com</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 10,
        filename: `booking-${booking._id}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      html2pdf().set(opt).from(element).save();
      alert('✅ Booking slip downloaded successfully!');
    } catch (error) {
      console.error('Error downloading slip:', error);
      alert('❌ Failed to download booking slip');
    }
  };

  const openReviewModal = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
  };

  const closeReviewModal = () => {
    setShowReviewModal(false);
    setSelectedRequest(null);
    setReviewData({ rating: 5, comment: '' });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${BASE_URL}/api/guide-requests/${selectedRequest._id}/review`,
        reviewData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Review submitted successfully!');
      closeReviewModal();
      fetchGuideRequests();
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleCancelRequest = async (requestId) => {
    if (!window.confirm('Are you sure you want to cancel this guide request?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${BASE_URL}/api/guide-requests/${requestId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Request cancelled successfully!');
      fetchGuideRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      alert(error.response?.data?.message || 'Failed to cancel request');
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

  // Group Tour Functions
  const fetchMyGroupTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/group-tours/my/tours`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyGroupTours(response.data.data || response.data);
    } catch (error) {
      console.error('Error fetching my group tours:', error);
    }
  };

  const fetchJoinedGroupTours = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/group-tours/my/joined`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const tours = response.data.data || response.data;
      console.log('Joined group tours:', tours);
      // Log each tour's membership status
      tours.forEach(tour => {
        console.log(`Tour ${tour._id}: myMembershipStatus = ${tour.myMembershipStatus}`);
      });
      setJoinedGroupTours(tours);
    } catch (error) {
      console.error('Error fetching joined group tours:', error);
    }
  };

  const fetchTourPackages = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/tours`);
      setTourPackages(response.data);
    } catch (error) {
      console.error('Error fetching tour packages:', error);
    }
  };

  const openGroupTourModal = () => {
    fetchTourPackages();
    setShowGroupTourModal(true);
  };

  const closeGroupTourModal = () => {
    setShowGroupTourModal(false);
    setGroupTourForm({
      title: '',
      description: '',
      tourDate: '',
      endDate: '',
      destination: '',
      meetingPoint: '',
      meetingTime: '',
      maxMembers: 5,
      costPerPerson: '',
      includes: '',
      notes: ''
    });
  };

  const handleGroupTourSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Submitting group tour data:', groupTourForm);
      const response = await axios.post(`${BASE_URL}/api/group-tours`, groupTourForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Group tour created:', response.data);
      alert('Group tour request submitted successfully! Awaiting admin approval.');
      closeGroupTourModal();
      fetchMyGroupTours();
    } catch (error) {
      console.error('Error creating group tour:', error);
      console.error('Error response:', error.response);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to create group tour';
      alert('Error: ' + errorMsg);
    }
  };

  const viewGroupTourMembers = async (groupTourId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BASE_URL}/api/group-tours/${groupTourId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Group tour details:', response.data);
      const tourData = response.data.data || response.data;
      console.log('Tour members:', tourData.members);
      setSelectedGroupTour(tourData);
      setShowMembersModal(true);
    } catch (error) {
      console.error('Error fetching group tour details:', error);
      alert('Failed to load group tour details');
    }
  };

  const handleApproveMember = async (groupTourId, userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/group-tours/${groupTourId}/members/${userId}`,
        { status: 'approved' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Member approved successfully!');
      viewGroupTourMembers(groupTourId);
      fetchMyGroupTours();
    } catch (error) {
      console.error('Error approving member:', error);
      alert(error.response?.data?.message || 'Failed to approve member');
    }
  };

  const handleRejectMember = async (groupTourId, userId) => {
    if (!window.confirm('Are you sure you want to reject this member request?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BASE_URL}/api/group-tours/${groupTourId}/members/${userId}`,
        { status: 'rejected' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Member request rejected');
      viewGroupTourMembers(groupTourId);
      fetchMyGroupTours();
    } catch (error) {
      console.error('Error rejecting member:', error);
      alert(error.response?.data?.message || 'Failed to reject member');
    }
  };

  const handleCancelGroupTour = async (groupTourId) => {
    if (!window.confirm('Are you sure you want to cancel this group tour?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/group-tours/${groupTourId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Group tour cancelled successfully');
      fetchMyGroupTours();
    } catch (error) {
      console.error('Error cancelling group tour:', error);
      alert(error.response?.data?.message || 'Failed to cancel group tour');
    }
  };

  // eslint-disable-next-line no-unused-vars
  const handleCompleteGroupTour = async (groupTourId) => {
    if (!window.confirm('Mark this group tour as completed?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/group-tours/${groupTourId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Group tour marked as completed');
      fetchMyGroupTours();
    } catch (error) {
      console.error('Error completing group tour:', error);
      alert(error.response?.data?.message || 'Failed to complete group tour');
    }
  };

  const handleLeaveGroupTour = async (groupTourId) => {
    // Find the tour to get its details for confirmation message
    const tour = joinedGroupTours.find(t => t._id === groupTourId);
    const isPending = tour?.myMembershipStatus === 'pending';
    
    const confirmMessage = isPending 
      ? 'Are you sure you want to cancel your request to join this group tour?'
      : 'Are you sure you want to leave this group tour? You may not be able to rejoin if it\'s full.';
    
    if (!window.confirm(confirmMessage)) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`${BASE_URL}/api/group-tours/${groupTourId}/leave`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const successMessage = isPending 
        ? 'Your join request has been cancelled successfully'
        : 'You have left the group tour';
      alert(successMessage);
      fetchJoinedGroupTours();
    } catch (error) {
      console.error('Error leaving group tour:', error);
      alert(error.response?.data?.message || 'Failed to process your request');
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
          🎫 Bookings
        </button>
        <button 
          className={activeSection === 'guides' ? 'active' : ''}
          onClick={() => { setActiveSection('guides'); window.history.pushState({}, '', '/dashboard?tab=guides'); }}
        >
          🧭 Guides
        </button>
        <button 
          className={activeSection === 'group-tours' ? 'active' : ''}
          onClick={() => { setActiveSection('group-tours'); window.history.pushState({}, '', '/dashboard?tab=group-tours'); }}
        >
          👥 Group Tours
        </button>
        <button 
          className={activeSection === 'wishlist' ? 'active' : ''}
          onClick={() => { setActiveSection('wishlist'); window.history.pushState({}, '', '/dashboard?tab=wishlist'); }}
        >
          ❤️ Wishlist
        </button>
        <button 
          className={activeSection === 'complaints' ? 'active' : ''}
          onClick={() => { setActiveSection('complaints'); window.history.pushState({}, '', '/dashboard?tab=complaints'); }}
        >
          📝 Complaints
        </button>
      </div>

      {activeSection === 'overview' && (
        <>
          <div className="dashboard-header">
            <h1>Welcome back, {user?.name}! 👋</h1>
            <p>Explore Bangladesh with Roaming Sonic</p>
          </div>

          {/* Profile Photo Section */}
          <div className="content-card" style={{marginBottom: '20px'}}>
            <div style={{textAlign: 'center'}}>
              <div style={{
                width: '120px',
                height: '120px',
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
                    fontSize: '50px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white'
                  }}>
                    {profile?.name?.charAt(0) || 'U'}
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
                <label htmlFor="photoUpload" className="btn-primary" style={{cursor: 'pointer'}}>
                  {uploadingPhoto ? '⏳ Uploading...' : '📷 Upload Photo'}
                </label>
              </div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎫</div>
              <div className="stat-details">
                <h3>Total Bookings</h3>
                <p className="stat-value">{bookings.length}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-details">
                <h3>Wishlist</h3>
                <p className="stat-value">{profile?.wishlist?.length || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🎁</div>
              <div className="stat-details">
                <h3>Referrals</h3>
                <p className="stat-value">{profile?.referralCount || 0}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <div className="stat-details">
                <h3>Referral Code</h3>
                <p className="stat-value" style={{fontSize: '20px'}}>{profile?.referralCode || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Referral Rewards Section */}
          <div className="content-card" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', marginTop: '2rem'}}>
            <h2 style={{color: 'white', marginBottom: '1rem'}}>🎁 Referral Rewards</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center'}}>
              <div>
                <p style={{fontSize: '16px', marginBottom: '0.5rem'}}>Total Referrals: <strong>{profile?.referralCount || 0}</strong></p>
                <p style={{fontSize: '16px', marginBottom: '0.5rem'}}>Claimed Coupons: <strong>{profile?.claimedCoupons?.length || 0}</strong></p>
                <p style={{fontSize: '16px', marginBottom: '0.5rem'}}>Unclaimed Rewards: <strong>{(profile?.referralCount || 0) - (profile?.claimedCoupons?.length || 0)}</strong></p>
                <p style={{fontSize: '14px', marginTop: '1rem', opacity: '0.9'}}>💡 Refer friends and earn exclusive coupon codes!</p>
              </div>
              <div style={{textAlign: 'center'}}>
                <button
                  onClick={handleClaimCoupon}
                  disabled={claimingCoupon || (profile?.referralCount || 0) <= (profile?.claimedCoupons?.length || 0)}
                  style={{
                    padding: '15px 30px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    background: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: (profile?.referralCount || 0) > (profile?.claimedCoupons?.length || 0) ? 'pointer' : 'not-allowed',
                    opacity: (profile?.referralCount || 0) > (profile?.claimedCoupons?.length || 0) ? 1 : 0.5,
                    marginBottom: '1rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}
                >
                  {claimingCoupon ? '⏳ Claiming...' : '🎟️ Claim Your Coupon'}
                </button>
                {profile?.claimedCoupons?.length > 0 && (
                  <button
                    onClick={() => setShowCouponsModal(true)}
                    style={{
                      padding: '10px 20px',
                      fontSize: '14px',
                      background: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      border: '1px solid white',
                      borderRadius: '20px',
                      cursor: 'pointer'
                    }}
                  >
                    📋 View My Coupons ({profile?.claimedCoupons?.length})
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="content-card">
            <h2>Recent Bookings</h2>
            {profile?.bookings && profile.bookings.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.bookings.slice(0, 5).map((booking) => (
                    <tr key={booking._id}>
                      <td>#{booking._id?.substring(0, 8)}</td>
                      <td>{booking.type || 'Hotel'}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td>
                        <span className="badge badge-success">Confirmed</span>
                      </td>
                      <td>৳{booking.amount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
                No bookings yet. Start exploring! 🌏
              </p>
            )}
          </div>

          <div className="content-card">
            <h2>Your Wishlist</h2>
            {profile?.wishlist && profile.wishlist.length > 0 ? (
              <div className="wishlist-grid">
                {profile.wishlist.slice(0, 4).map((item) => (
                  <div key={item._id} className="wishlist-item">
                    <h4>{item.name}</h4>
                    <p>📍 {item.address?.city || 'N/A'}, {item.address?.division || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
                Your wishlist is empty. Add some hotels! ❤️
              </p>
            )}
          </div>
        </>
      )}

      {activeSection === 'bookings' && (
        <div className="content-card">
          <h2>My Bookings 🎫</h2>
          
          {bookingsLoading ? (
            <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
              Loading bookings...
            </p>
          ) : bookings.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
              No bookings yet. Start exploring! 🌏
            </p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking._id} className="booking-card">
                  <div className="booking-header">
                    <div>
                      <h3>{getBookingTypeName(booking.bookingType, booking)}</h3>
                      <p className="booking-id">Booking ID: #{booking._id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    <span className={`badge ${getStatusBadgeClass(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="booking-details">
                    <div className="booking-info-grid">
                      <div className="info-item">
                        <span className="label">Type:</span>
                        <span className="value">{booking.bookingType.toUpperCase()}</span>
                      </div>

                      {booking.bookingType === 'tour' && booking.numberOfMembers && (
                        <div className="info-item">
                          <span className="label">Members:</span>
                          <span className="value">{booking.numberOfMembers} person(s)</span>
                        </div>
                      )}

                      {booking.travelDate && (
                        <div className="info-item">
                          <span className="label">Travel Date:</span>
                          <span className="value">{new Date(booking.travelDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {booking.checkInDate && (
                        <div className="info-item">
                          <span className="label">Check In:</span>
                          <span className="value">{new Date(booking.checkInDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      {booking.checkOutDate && (
                        <div className="info-item">
                          <span className="label">Check Out:</span>
                          <span className="value">{new Date(booking.checkOutDate).toLocaleDateString()}</span>
                        </div>
                      )}

                      <div className="info-item">
                        <span className="label">Booked On:</span>
                        <span className="value">{new Date(booking.createdAt).toLocaleDateString()}</span>
                      </div>

                      <div className="info-item">
                        <span className="label">Total Amount:</span>
                        <span className="value amount">৳{booking.totalAmount.toLocaleString()}</span>
                      </div>

                      <div className="info-item">
                        <span className="label">Payment Status:</span>
                        <span className={`value ${booking.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                          {booking.paymentStatus.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {booking.specialRequests && (
                      <div className="special-requests">
                        <strong>Special Requests:</strong>
                        <p>{booking.specialRequests}</p>
                      </div>
                    )}

                    {booking.adminNotes && (
                      <div className="admin-notes">
                        <strong>Admin Notes:</strong>
                        <p>{booking.adminNotes}</p>
                      </div>
                    )}

                    {booking.tour && (
                      <div className="tour-details">
                        <strong>Tour Details:</strong>
                        <p>📍 {booking.tour.destination} | ⏱️ {booking.tour.duration.days}D/{booking.tour.duration.nights}N</p>
                      </div>
                    )}

                    {booking.bus && (
                      <div className="bus-details">
                        <strong>Bus Details:</strong>
                        <p>🚌 {booking.bus.from} → {booking.bus.to}</p>
                        <p>🕐 Departure: {booking.bus.departureTime} | Seats: {booking.numberOfSeats || 1}</p>
                        {booking.passengerName && <p>👤 Passenger: {booking.passengerName}</p>}
                      </div>
                    )}

                    {booking.status === 'cancelled' && booking.refundAmount > 0 && (
                      <div className="refund-info">
                        <strong>Refund Amount:</strong>
                        <span className="refund-amount">৳{booking.refundAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  <div className="booking-actions">
                    <button 
                      className="btn-success"
                      onClick={() => downloadBookingSlip(booking)}
                      title="Download booking slip"
                    >
                      📥 Download Slip
                    </button>

                    {booking.bookingType === 'bus' && booking.status === 'confirmed' && (
                      <>
                        <button 
                          className="btn-success"
                          onClick={() => handleDownloadTicket(booking._id, true)}
                          title="Download ticket as PDF file"
                          style={{ marginLeft: '10px' }}
                        >
                          📥 Download Ticket
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={() => handleDownloadTicket(booking._id, false)}
                          title="View and print ticket in browser"
                          style={{ marginLeft: '10px' }}
                        >
                          👁️ View & Print
                        </button>
                      </>
                    )}
                    
                    {booking.status === 'pending' || booking.status === 'confirmed' ? (
                      <button 
                        className="btn-danger"
                        onClick={() => handleCancelBooking(booking._id)}
                        title="Cancel booking"
                        style={{ marginLeft: '10px' }}
                      >
                        Cancel Booking
                      </button>
                    ) : booking.status === 'cancelled' ? (
                      <span className="cancelled-text">✓ Cancelled (Refund: ৳{booking.refundAmount?.toFixed(2) || 0})</span>
                    ) : booking.status === 'completed' && booking.bookingType === 'hotel' && !booking.hotelReviewed ? (
                      <button 
                        className="btn-primary"
                        onClick={() => openHotelReviewModal(booking)}
                        style={{ marginLeft: '10px' }}
                      >
                        ⭐ Rate Hotel
                      </button>
                    ) : booking.status === 'completed' && booking.bookingType === 'tour' && !booking.userReview ? (
                      <button 
                        className="btn-primary"
                        onClick={() => openTourReviewModal(booking)}
                        style={{ marginLeft: '10px' }}
                      >
                        ⭐ Rate Tour
                      </button>
                    ) : (booking.status === 'completed' && (booking.userReview || booking.hotelReviewed)) ? (
                      <div className="user-review-display">
                        <span className="review-label">✓ Reviewed</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Guide Requests Section */}
      {activeSection === 'guides' && (
        <div className="content-card">
          <h2>My Guide Requests 🧭</h2>
          {guideRequests.length === 0 ? (
            <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
              No guide requests yet. Browse guides and send connection requests!
            </p>
          ) : (
            <div className="requests-list">
              {guideRequests.map(request => (
                <div key={request._id} className="request-card">
                  <div className="request-header">
                    <div>
                      <h3>{request.guide?.name || 'Guide Not Available'}</h3>
                      <p style={{color: '#666', fontSize: '14px'}}>{request.guide?.email || 'N/A'}</p>
                      {request.guide && (
                        <div className="guide-rating">
                          ⭐ {request.guide.rating?.toFixed(1) || '0.0'} ({request.guide.totalReviews || 0} reviews)
                        </div>
                      )}
                    </div>
                    <span className={`badge badge-${request.status === 'pending' ? 'warning' : request.status === 'approved' ? 'success' : request.status === 'completed' ? 'info' : 'danger'}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="request-details">
                    <p><strong>Destination:</strong> {request.destination}</p>
                    <p><strong>Tour Date:</strong> {new Date(request.tourDate).toLocaleDateString()}</p>
                    <p><strong>Duration:</strong> {request.duration} hours</p>
                    <p><strong>People:</strong> {request.numberOfPeople}</p>
                    <p><strong>Total Cost:</strong> ৳{request.totalCost}</p>
                    {request.message && <p><strong>Your Message:</strong> {request.message}</p>}
                    {request.responseMessage && (
                      <div className="response-message">
                        <strong>Guide's Response:</strong> {request.responseMessage}
                      </div>
                    )}
                  </div>
                  <div className="request-actions">
                    {request.status === 'completed' && (
                      <button 
                        className="btn-primary"
                        onClick={() => openReviewModal(request)}
                      >
                        ⭐ Add Review & Rating
                      </button>
                    )}
                    {(request.status === 'pending' || request.status === 'approved') && (
                      <button 
                        className="btn-secondary"
                        onClick={() => handleCancelRequest(request._id)}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          marginLeft: '10px'
                        }}
                      >
                        ❌ Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeSection === 'wishlist' && (
        <div className="content-card">
          <h2>Your Wishlist ❤️</h2>
          
          {/* Tour Wishlist Section */}
          {profile?.tourWishlist && profile.tourWishlist.length > 0 && (
            <>
              <h3 style={{marginTop: '20px', marginBottom: '15px', color: '#667eea'}}>
                🗺️ Tour Packages
              </h3>
              <div className="wishlist-grid">
                {profile.tourWishlist.map((tour) => (
                  <div key={tour._id} className="wishlist-item">
                    {tour.images && tour.images.length > 0 ? (
                      <img 
                        src={tour.images[0].url} 
                        alt={tour.title}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          borderRadius: '8px 8px 0 0',
                          marginBottom: '15px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '200px',
                        background: 'linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%)',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '48px'
                      }}>
                        🗺️
                      </div>
                    )}
                    <h4 style={{margin: '0 0 10px 0', fontSize: '18px', color: '#333'}}>{tour.title}</h4>
                    <p style={{fontSize: '14px', color: '#666', margin: '0 0 8px 0'}}>
                      📍 {tour.destination}
                    </p>
                    <p style={{fontSize: '13px', color: '#888', margin: '0 0 8px 0'}}>
                      ⏱️ {tour.duration?.days || 1}D/{tour.duration?.nights || 0}N
                    </p>
                    <p style={{fontSize: '13px', color: '#888', margin: '0 0 8px 0'}}>
                      👥 {tour.currentMembers || 0}/{tour.maxGroupSize || 20} members
                    </p>
                    {tour.rating && tour.rating > 0 && (
                      <p style={{fontSize: '13px', color: '#ffc107', margin: '0 0 10px 0', fontWeight: 'bold'}}>
                        ⭐ {tour.rating.toFixed(1)} ({tour.totalReviews || 0} reviews)
                      </p>
                    )}
                    <p style={{fontSize: '13px', color: '#28a745', margin: '0 0 15px 0', fontWeight: '600'}}>
                      ৳{tour.price?.toLocaleString()} per person
                    </p>
                    <p style={{fontSize: '13px', color: '#666', margin: '0 0 15px 0', lineHeight: '1.4'}}>
                      {tour.description?.substring(0, 100)}{tour.description?.length > 100 ? '...' : ''}
                    </p>
                    <div style={{display: 'flex', gap: '10px', marginTop: 'auto'}}>
                      <button 
                        className="btn-primary" 
                        onClick={() => openTourBookModal(tour)}
                        disabled={tour.isEnded || tour.currentMembers >= tour.maxGroupSize}
                        style={{
                          flex: 1,
                          padding: '12px',
                          fontSize: '14px',
                          fontWeight: '600'
                        }}
                      >
                        {tour.isEnded ? 'Ended' : tour.currentMembers >= tour.maxGroupSize ? 'Full' : '📅 Book Now'}
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={async () => {
                          if (window.confirm('Remove this tour from wishlist?')) {
                            try {
                              const token = localStorage.getItem('token');
                              await axios.delete(
                                `${BASE_URL}/api/tours/${tour._id}/wishlist`,
                                { headers: { Authorization: `Bearer ${token}` } }
                              );
                              alert('✅ Tour removed from wishlist!');
                              fetchProfile();
                            } catch (error) {
                              alert('❌ Failed to remove: ' + (error.response?.data?.message || error.message));
                            }
                          }
                        }}
                        style={{
                          padding: '12px 16px',
                          fontSize: '14px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                        title="Remove from wishlist"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Hotel Wishlist Section */}
          {profile?.wishlist && profile.wishlist.length > 0 && (
            <>
              <h3 style={{marginTop: '30px', marginBottom: '15px', color: '#667eea'}}>
                🏨 Hotels
              </h3>
              <div className="wishlist-grid">
              {profile.wishlist.map((hotel) => (
                <div key={hotel._id} className="wishlist-item">
                  {hotel.photos && hotel.photos.length > 0 ? (
                    <img 
                      src={`${BASE_URL}${hotel.photos[0].url}`} 
                      alt={hotel.name}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px 8px 0 0',
                        marginBottom: '15px'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '200px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px 8px 0 0',
                      marginBottom: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '48px'
                    }}>
                      🏨
                    </div>
                  )}
                  <h4 style={{margin: '0 0 10px 0', fontSize: '18px', color: '#333'}}>{hotel.name}</h4>
                  <p style={{fontSize: '14px', color: '#666', margin: '0 0 8px 0'}}>
                    📍 {hotel.address?.city || 'N/A'}, {hotel.address?.division || 'N/A'}
                  </p>
                  {hotel.category && (
                    <p style={{fontSize: '13px', color: '#888', margin: '0 0 8px 0'}}>
                      ⭐ {hotel.category}
                    </p>
                  )}
                  {hotel.rating && (
                    <p style={{fontSize: '13px', color: '#ffc107', margin: '0 0 10px 0', fontWeight: 'bold'}}>
                      ⭐ {hotel.rating.toFixed(1)} / 5.0
                    </p>
                  )}
                  {hotel.rooms && hotel.rooms.length > 0 && (
                    <p style={{fontSize: '13px', color: '#28a745', margin: '0 0 15px 0', fontWeight: '600'}}>
                      From ৳{Math.min(...hotel.rooms.map(r => r.pricePerNight)).toLocaleString()} / night
                    </p>
                  )}
                  <p style={{fontSize: '13px', color: '#666', margin: '0 0 15px 0', lineHeight: '1.4'}}>
                    {hotel.description?.substring(0, 100)}{hotel.description?.length > 100 ? '...' : ''}
                  </p>
                  <div style={{display: 'flex', gap: '10px', marginTop: 'auto'}}>
                    <button 
                      className="btn-primary" 
                      onClick={() => openHotelBookModal(hotel)}
                      style={{
                        flex: 1,
                        padding: '12px',
                        fontSize: '14px',
                        fontWeight: '600'
                      }}
                    >
                      📅 Book Now
                    </button>
                    <button 
                      className="btn-secondary" 
                      onClick={() => handleRemoveFromWishlist(hotel._id)}
                      style={{
                        padding: '12px 16px',
                        fontSize: '14px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                      title="Remove from wishlist"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
              Your wishlist is empty. Add some hotels! ❤️
            </p>
          )}
          </>
          )}

          {/* Empty State */}
          {(!profile?.wishlist || profile.wishlist.length === 0) && 
           (!profile?.tourWishlist || profile.tourWishlist.length === 0) && (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <div style={{fontSize: '64px', marginBottom: '20px'}}>💝</div>
              <h3 style={{color: '#333', marginBottom: '10px'}}>Your Wishlist is Empty</h3>
              <p style={{color: '#666', marginBottom: '30px'}}>
                Start adding your favorite tours and hotels to your wishlist!
              </p>
              <div style={{display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap'}}>
                <button 
                  className="btn-primary"
                  onClick={() => window.location.href = '/tours'}
                  style={{padding: '12px 24px'}}
                >
                  🗺️ Browse Tours
                </button>
                <button 
                  className="btn-primary"
                  onClick={() => window.location.href = '/hotels'}
                  style={{padding: '12px 24px'}}
                >
                  🏨 Browse Hotels
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Group Tours Section */}
      {activeSection === 'group-tours' && (
        <>
          <div className="dashboard-header">
            <h1>My Group Tours 👥</h1>
            <button className="btn-primary" onClick={openGroupTourModal}>
              ➕ Create Group Tour
            </button>
          </div>

          {/* My Organized Group Tours */}
          <div className="content-card" style={{marginBottom: '20px'}}>
            <h2>Group Tours I'm Organizing</h2>
            {myGroupTours.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
                You haven't created any group tours yet. Create one to get started!
              </p>
            ) : (
              <div className="requests-list">
                {myGroupTours.map(tour => (
                  <div key={tour._id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{tour.tourPackage?.name || 'Tour Package'}</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>{tour.destination}</p>
                      </div>
                      <span className={`badge badge-${
                        tour.status === 'pending' ? 'warning' : 
                        tour.status === 'active' ? 'success' : 
                        tour.status === 'full' ? 'info' : 
                        tour.status === 'approved' ? 'success' : 
                        'danger'
                      }`}>
                        {tour.status}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><strong>Tour Date:</strong> {new Date(tour.tourDate).toLocaleDateString()}</p>
                      {tour.endDate && <p><strong>End Date:</strong> {new Date(tour.endDate).toLocaleDateString()}</p>}
                      <p><strong>Cost per Person:</strong> ৳{tour.cost}</p>
                      <p><strong>Members:</strong> {tour.currentMembers} / {tour.maxMembers}</p>
                      <p><strong>Available Slots:</strong> {tour.maxMembers - tour.currentMembers}</p>
                      {tour.notes && <p><strong>Notes:</strong> {tour.notes}</p>}
                      {tour.adminNotes && (
                        <div className="response-message">
                          <strong>Admin Notes:</strong> {tour.adminNotes}
                        </div>
                      )}
                      <p><strong>Pending Requests:</strong> {tour.members?.filter(m => m.status === 'pending').length || 0}</p>
                    </div>
                    <div className="request-actions">
                      <button 
                        className="btn-primary"
                        onClick={() => viewGroupTourMembers(tour._id)}
                      >
                        👥 Manage Members ({tour.members?.length || 0})
                      </button>
                      {(tour.status === 'pending' || tour.status === 'active' || tour.status === 'approved') && (
                        <button 
                          className="btn-secondary"
                          onClick={() => handleCancelGroupTour(tour._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            marginLeft: '10px'
                          }}
                        >
                          ❌ Cancel Tour
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Tours I've Joined */}
          <div className="content-card">
            <h2>Group Tours I've Joined</h2>
            {joinedGroupTours.length === 0 ? (
              <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
                You haven't joined any group tours yet. Check tour packages to find groups!
              </p>
            ) : (
              <div className="requests-list">
                {joinedGroupTours.map(tour => (
                  <div key={tour._id} className="request-card">
                    <div className="request-header">
                      <div>
                        <h3>{tour.tourPackage?.name || 'Tour Package'}</h3>
                        <p style={{color: '#666', fontSize: '14px'}}>
                          Organized by: {tour.organizer?.name || 'Organizer'}
                        </p>
                        <p style={{color: '#666', fontSize: '14px'}}>{tour.destination}</p>
                      </div>
                      <span className={`badge badge-${
                        tour.myMembershipStatus === 'pending' ? 'warning' : 
                        tour.myMembershipStatus === 'approved' ? 'success' : 
                        'danger'
                      }`} style={{
                        fontSize: '14px',
                        padding: '8px 16px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {tour.myMembershipStatus === 'pending' && '⏳ '}
                        {tour.myMembershipStatus === 'approved' && '✅ '}
                        {tour.myMembershipStatus === 'rejected' && '❌ '}
                        {tour.myMembershipStatus}
                      </span>
                    </div>
                    <div className="request-details">
                      <p><strong>Tour Date:</strong> {new Date(tour.tourDate).toLocaleDateString()}</p>
                      {tour.endDate && <p><strong>End Date:</strong> {new Date(tour.endDate).toLocaleDateString()}</p>}
                      <p><strong>Cost per Person:</strong> ৳{tour.cost}</p>
                      <p><strong>Members:</strong> {tour.currentMembers} / {tour.maxMembers}</p>
                      <p><strong>Group Status:</strong> {tour.status}</p>
                      {tour.notes && <p><strong>Notes:</strong> {tour.notes}</p>}
                    </div>
                    <div className="request-actions" style={{display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', marginTop: '15px'}}>
                      <div style={{flex: 1}}>
                        {tour.myMembershipStatus === 'pending' && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontSize: '24px'}}>⏳</span>
                            <div>
                              <p style={{color: '#856404', fontWeight: '600', margin: 0, fontSize: '15px'}}>
                                Pending Approval
                              </p>
                              <p style={{color: '#666', margin: '2px 0 0 0', fontSize: '13px'}}>
                                Waiting for host to approve your request
                              </p>
                            </div>
                          </div>
                        )}
                        {tour.myMembershipStatus === 'approved' && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontSize: '24px'}}>✅</span>
                            <div>
                              <p style={{color: '#155724', fontWeight: '600', margin: 0, fontSize: '15px'}}>
                                Confirmed Member
                              </p>
                              <p style={{color: '#666', margin: '2px 0 0 0', fontSize: '13px'}}>
                                You're all set for this tour!
                              </p>
                            </div>
                          </div>
                        )}
                        {tour.myMembershipStatus === 'rejected' && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontSize: '24px'}}>❌</span>
                            <div>
                              <p style={{color: '#721c24', fontWeight: '600', margin: 0, fontSize: '15px'}}>
                                Request Rejected
                              </p>
                              <p style={{color: '#666', margin: '2px 0 0 0', fontSize: '13px'}}>
                                The host has declined your request
                              </p>
                            </div>
                          </div>
                        )}
                        {!tour.myMembershipStatus && (
                          <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                            <span style={{fontSize: '24px'}}>❓</span>
                            <div>
                              <p style={{color: '#666', fontWeight: '600', margin: 0, fontSize: '15px'}}>
                                Status Unknown
                              </p>
                              <p style={{color: '#999', margin: '2px 0 0 0', fontSize: '13px'}}>
                                Checking your membership status...
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Show cancel/leave button for pending, approved, or unknown status (not for rejected) */}
                      {tour.myMembershipStatus !== 'rejected' && (
                        <button 
                          className="btn-secondary"
                          onClick={() => handleLeaveGroupTour(tour._id)}
                          style={{
                            backgroundColor: '#dc3545',
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontSize: '15px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                          }}
                          onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#c82333';
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = '0 4px 8px rgba(220, 53, 69, 0.3)';
                          }}
                          onMouseOut={(e) => {
                            e.target.style.backgroundColor = '#dc3545';
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 2px 4px rgba(220, 53, 69, 0.2)';
                          }}
                        >
                          {tour.myMembershipStatus === 'pending' ? (
                            <>
                              <span>🚫</span>
                              <span>Cancel Request</span>
                            </>
                          ) : tour.myMembershipStatus === 'approved' ? (
                            <>
                              <span>🚪</span>
                              <span>Leave Group</span>
                            </>
                          ) : (
                            <>
                              <span>🚫</span>
                              <span>Cancel/Leave</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Claimed Coupons Modal */}
      {showCouponsModal && (
        <div className="modal-overlay" onClick={() => setShowCouponsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <button className="modal-close" onClick={() => setShowCouponsModal(false)}>×</button>
            <h2>🎟️ My Claimed Coupons</h2>
            {profile?.claimedCoupons && profile.claimedCoupons.length > 0 ? (
              <div style={{marginTop: '1rem'}}>
                {profile.claimedCoupons.map((claimed, index) => (
                  <div key={index} style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    marginBottom: '1rem',
                    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
                  }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem'}}>
                      <h3 style={{color: 'white', margin: 0}}>{claimed.coupon?.code || 'Coupon Code'}</h3>
                      <span style={{
                        background: 'rgba(255,255,255,0.3)',
                        padding: '5px 15px',
                        borderRadius: '15px',
                        fontSize: '14px'
                      }}>
                        Referral #{claimed.referralNumber}
                      </span>
                    </div>
                    <p style={{margin: '0.5rem 0', opacity: 0.9}}>{claimed.coupon?.description || 'Discount coupon'}</p>
                    <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '14px'}}>
                      <span>💰 Discount: {claimed.coupon?.discountType === 'percentage' 
                        ? `${claimed.coupon?.discountValue}%` 
                        : `৳${claimed.coupon?.discountValue}`}</span>
                      <span>📅 Expires: {claimed.coupon?.validTo ? new Date(claimed.coupon.validTo).toLocaleDateString() : 'N/A'}</span>
                    </div>
                    <p style={{fontSize: '12px', marginTop: '0.5rem', opacity: 0.8}}>
                      ✨ Claimed on: {new Date(claimed.claimedAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{textAlign: 'center', padding: '2rem', color: '#666'}}>
                No coupons claimed yet. Refer friends to earn coupons!
              </p>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
        <div className="modal-overlay" onClick={closeReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeReviewModal}>×</button>
            <h2>Review Guide</h2>
            <div className="modal-guide-info">
              <h3>{selectedRequest.guide?.name || 'Guide'}</h3>
              <p>Tour to {selectedRequest.destination}</p>
            </div>
            <form onSubmit={handleReviewSubmit} className="review-form">
              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-selector">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${reviewData.rating >= star ? 'selected' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setReviewData({...reviewData, rating: star});
                      }}
                      style={{cursor: 'pointer'}}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p style={{fontSize: '14px', color: '#666', marginTop: '5px'}}>
                  Selected: {reviewData.rating} star{reviewData.rating !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="form-group">
                <label>Your Review</label>
                <textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                  rows="4"
                  placeholder="Share your experience with this guide..."
                  maxLength="500"
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Create Group Tour Modal */}
      {showGroupTourModal && (
        <div className="modal-overlay" onClick={closeGroupTourModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <button className="modal-close" onClick={closeGroupTourModal}>×</button>
            <h2>Create Group Tour</h2>
            <form onSubmit={handleGroupTourSubmit} className="review-form">
              <div className="form-group">
                <label>Tour Title *</label>
                <input
                  type="text"
                  value={groupTourForm.title}
                  onChange={(e) => setGroupTourForm({...groupTourForm, title: e.target.value})}
                  placeholder="e.g., Cox's Bazar Beach Tour"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={groupTourForm.description}
                  onChange={(e) => setGroupTourForm({...groupTourForm, description: e.target.value})}
                  rows="3"
                  placeholder="Describe your tour plan..."
                  required
                />
              </div>

              <div className="form-group">
                <label>Destination *</label>
                <input
                  type="text"
                  value={groupTourForm.destination}
                  onChange={(e) => setGroupTourForm({...groupTourForm, destination: e.target.value})}
                  placeholder="e.g., Cox's Bazar, Sylhet"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tour Start Date *</label>
                  <input
                    type="date"
                    value={groupTourForm.tourDate}
                    onChange={(e) => setGroupTourForm({...groupTourForm, tourDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tour End Date *</label>
                  <input
                    type="date"
                    value={groupTourForm.endDate}
                    onChange={(e) => setGroupTourForm({...groupTourForm, endDate: e.target.value})}
                    min={groupTourForm.tourDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Meeting Point *</label>
                  <input
                    type="text"
                    value={groupTourForm.meetingPoint}
                    onChange={(e) => setGroupTourForm({...groupTourForm, meetingPoint: e.target.value})}
                    placeholder="e.g., Kamalapur Railway Station"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Meeting Time *</label>
                  <input
                    type="time"
                    value={groupTourForm.meetingTime}
                    onChange={(e) => setGroupTourForm({...groupTourForm, meetingTime: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Maximum Members *</label>
                  <input
                    type="number"
                    value={groupTourForm.maxMembers}
                    onChange={(e) => setGroupTourForm({...groupTourForm, maxMembers: parseInt(e.target.value)})}
                    min="2"
                    max="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Cost per Person (৳) *</label>
                  <input
                    type="number"
                    value={groupTourForm.costPerPerson}
                    onChange={(e) => setGroupTourForm({...groupTourForm, costPerPerson: e.target.value})}
                    placeholder="Enter cost in BDT"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>What's Included</label>
                <textarea
                  value={groupTourForm.includes}
                  onChange={(e) => setGroupTourForm({...groupTourForm, includes: e.target.value})}
                  rows="2"
                  placeholder="e.g., Transport, Meals, Accommodation..."
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  value={groupTourForm.notes}
                  onChange={(e) => setGroupTourForm({...groupTourForm, notes: e.target.value})}
                  rows="3"
                  placeholder="Any special instructions, preferences, or details..."
                />
              </div>

              <button type="submit" className="btn-primary">
                Submit for Admin Approval
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && selectedGroupTour && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <button className="modal-close" onClick={() => setShowMembersModal(false)}>×</button>
            <h2>Manage Group Members</h2>
            <div className="modal-guide-info">
              <h3>{selectedGroupTour.tourPackage?.name || 'Tour Package'}</h3>
              <p>Destination: {selectedGroupTour.destination}</p>
              <p>Members: {selectedGroupTour.currentMembers} / {selectedGroupTour.maxMembers}</p>
              <p>Available Slots: {selectedGroupTour.maxMembers - selectedGroupTour.currentMembers}</p>
            </div>

            {selectedGroupTour.members && selectedGroupTour.members.length > 0 ? (
              <div>
                {/* Pending Requests Section */}
                {selectedGroupTour.members.filter(m => m.status === 'pending').length > 0 && (
                  <div style={{marginBottom: '30px'}}>
                    <h3 style={{color: '#856404', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #ffc107', paddingBottom: '8px'}}>
                      ⏳ Pending Requests ({selectedGroupTour.members.filter(m => m.status === 'pending').length})
                    </h3>
                    <div className="members-list">
                      {selectedGroupTour.members.filter(m => m.status === 'pending' && m.user).map(member => (
                        <div key={member.user._id} className="member-card" style={{
                          padding: '15px',
                          border: '2px solid #ffc107',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          backgroundColor: '#fff9e6',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{margin: '0 0 5px 0'}}>{member.user?.name || 'Unknown User'}</h4>
                            <p style={{margin: '0', fontSize: '14px', color: '#666'}}>{member.user?.email || 'No email'}</p>
                            {member.user?.phone && (
                              <p style={{margin: '0', fontSize: '14px', color: '#666'}}>📞 {member.user.phone}</p>
                            )}
                            <p style={{margin: '5px 0 0 0', fontSize: '13px', color: '#999'}}>
                              Requested: {new Date(member.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{display: 'flex', gap: '10px', flexDirection: 'column'}}>
                            <button 
                              className="btn-primary"
                              onClick={() => handleApproveMember(selectedGroupTour._id, member.user?._id)}
                              disabled={selectedGroupTour.currentMembers >= selectedGroupTour.maxMembers || !member.user}
                              style={{
                                fontSize: '14px',
                                padding: '8px 20px',
                                backgroundColor: (selectedGroupTour.currentMembers >= selectedGroupTour.maxMembers || !member.user) ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: (selectedGroupTour.currentMembers >= selectedGroupTour.maxMembers || !member.user) ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              ✅ Approve
                            </button>
                            <button 
                              className="btn-secondary"
                              onClick={() => handleRejectMember(selectedGroupTour._id, member.user?._id)}
                              disabled={!member.user}
                              style={{
                                fontSize: '14px',
                                padding: '8px 20px',
                                backgroundColor: !member.user ? '#ccc' : '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: !member.user ? 'not-allowed' : 'pointer',
                                fontWeight: '500'
                              }}
                            >
                              ❌ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedGroupTour.currentMembers >= selectedGroupTour.maxMembers && (
                      <p style={{color: '#dc3545', fontSize: '14px', fontStyle: 'italic', marginTop: '10px'}}>
                        ⚠️ Tour is full - cannot approve more members
                      </p>
                    )}
                  </div>
                )}

                {/* Approved Members Section */}
                {selectedGroupTour.members.filter(m => m.status === 'approved').length > 0 && (
                  <div style={{marginBottom: '30px'}}>
                    <h3 style={{color: '#155724', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #28a745', paddingBottom: '8px'}}>
                      ✅ Approved Members ({selectedGroupTour.members.filter(m => m.status === 'approved').length})
                    </h3>
                    <div className="members-list">
                      {selectedGroupTour.members.filter(m => m.status === 'approved' && m.user).map(member => (
                        <div key={member.user._id} className="member-card" style={{
                          padding: '15px',
                          border: '2px solid #28a745',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          backgroundColor: '#f0f9f4',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{margin: '0 0 5px 0'}}>{member.user?.name || 'Unknown User'}</h4>
                            <p style={{margin: '0', fontSize: '14px', color: '#666'}}>{member.user?.email || 'No email'}</p>
                            {member.user?.phone && (
                              <p style={{margin: '0', fontSize: '14px', color: '#666'}}>📞 {member.user.phone}</p>
                            )}
                            <p style={{margin: '5px 0 0 0', fontSize: '13px', color: '#999'}}>
                              Approved: {new Date(member.approvedDate || member.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span style={{
                            fontSize: '14px',
                            padding: '6px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            borderRadius: '20px',
                            fontWeight: '500'
                          }}>
                            ✅ Confirmed
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rejected Members Section */}
                {selectedGroupTour.members.filter(m => m.status === 'rejected').length > 0 && (
                  <div>
                    <h3 style={{color: '#721c24', fontSize: '18px', marginBottom: '15px', borderBottom: '2px solid #dc3545', paddingBottom: '8px'}}>
                      ❌ Rejected Requests ({selectedGroupTour.members.filter(m => m.status === 'rejected').length})
                    </h3>
                    <div className="members-list">
                      {selectedGroupTour.members.filter(m => m.status === 'rejected' && m.user).map(member => (
                        <div key={member.user._id} className="member-card" style={{
                          padding: '15px',
                          border: '2px solid #dc3545',
                          borderRadius: '8px',
                          marginBottom: '10px',
                          backgroundColor: '#f8e6e6',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <h4 style={{margin: '0 0 5px 0'}}>{member.user?.name || 'Unknown User'}</h4>
                            <p style={{margin: '0', fontSize: '14px', color: '#666'}}>{member.user?.email || 'No email'}</p>
                            <p style={{margin: '5px 0 0 0', fontSize: '13px', color: '#999'}}>
                              Rejected: {new Date(member.requestDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span style={{
                            fontSize: '14px',
                            padding: '6px 12px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '20px',
                            fontWeight: '500'
                          }}>
                            ❌ Rejected
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedGroupTour.members.length === 0 && (
                  <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
                    No member requests yet
                  </p>
                )}
              </div>
            ) : (
              <p style={{textAlign: 'center', color: '#666', padding: '30px 0'}}>
                No member requests yet
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tour Review Modal */}
      {showTourReviewModal && selectedBooking && (
        <div className="modal-overlay" onClick={closeTourReviewModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <button className="modal-close" onClick={closeTourReviewModal}>×</button>
            <h2>Rate Your Tour Experience</h2>
            
            <div className="modal-guide-info">
              <h3>{selectedBooking.tour?.title}</h3>
              <p>📍 {selectedBooking.tour?.destination}</p>
            </div>

            <form onSubmit={handleTourReviewSubmit}>
              <div className="form-group">
                <label>Rating *</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${tourReviewData.rating >= star ? 'active' : ''}`}
                      onClick={() => setTourReviewData({...tourReviewData, rating: star})}
                      style={{
                        fontSize: '2.5rem',
                        cursor: 'pointer',
                        color: tourReviewData.rating >= star ? '#ffc107' : '#ddd',
                        transition: 'color 0.2s'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p style={{textAlign: 'center', margin: '10px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea'}}>
                  {tourReviewData.rating} {tourReviewData.rating === 1 ? 'Star' : 'Stars'}
                </p>
              </div>

              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  value={tourReviewData.comment}
                  onChange={(e) => setTourReviewData({...tourReviewData, comment: e.target.value})}
                  required
                  rows="4"
                  placeholder="Share your experience with this tour..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{width: '100%'}}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hotel Review Modal */}
      {showHotelReviewModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowHotelReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '500px'}}>
            <button className="modal-close" onClick={() => setShowHotelReviewModal(false)}>×</button>
            <h2>Rate Your Hotel Experience</h2>
            
            <div className="modal-guide-info">
              <h3>{selectedBooking.hotel?.name}</h3>
              <p>📍 {selectedBooking.hotel?.address?.city}, {selectedBooking.hotel?.address?.division}</p>
            </div>

            <form onSubmit={handleHotelReviewSubmit}>
              <div className="form-group">
                <label>Rating *</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <span
                      key={star}
                      className={`star ${hotelReviewData.rating >= star ? 'active' : ''}`}
                      onClick={() => setHotelReviewData({...hotelReviewData, rating: star})}
                      style={{
                        fontSize: '2.5rem',
                        cursor: 'pointer',
                        color: hotelReviewData.rating >= star ? '#ffc107' : '#ddd',
                        transition: 'color 0.2s'
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p style={{textAlign: 'center', margin: '10px 0', fontSize: '1.2rem', fontWeight: 'bold', color: '#667eea'}}>
                  {hotelReviewData.rating} {hotelReviewData.rating === 1 ? 'Star' : 'Stars'}
                </p>
              </div>

              <div className="form-group">
                <label>Your Review *</label>
                <textarea
                  value={hotelReviewData.comment}
                  onChange={(e) => setHotelReviewData({...hotelReviewData, comment: e.target.value})}
                  required
                  rows="4"
                  placeholder="Share your experience with this hotel..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd'
                  }}
                />
              </div>

              <button type="submit" className="btn-primary" style={{width: '100%'}}>
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hotel Booking Modal */}
      {showHotelBookModal && selectedWishlistHotel && (
        <div className="modal-overlay" onClick={() => setShowHotelBookModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <button className="modal-close" onClick={() => setShowHotelBookModal(false)}>×</button>
            <h2>Book Hotel from Wishlist</h2>
            
            <div className="modal-guide-info" style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
              <h3 style={{margin: '0 0 10px 0', color: '#333'}}>{selectedWishlistHotel.name}</h3>
              <p style={{margin: '0 0 5px 0', color: '#666'}}>📍 {selectedWishlistHotel.address?.city}, {selectedWishlistHotel.address?.division}</p>
              {selectedWishlistHotel.category && (
                <p style={{margin: '0 0 5px 0', color: '#888'}}>⭐ {selectedWishlistHotel.category}</p>
              )}
            </div>

            <form onSubmit={handleHotelBookingSubmit}>
              <div className="form-group">
                <label>Room Type *</label>
                <select
                  value={hotelBookingData.roomType}
                  onChange={(e) => setHotelBookingData({...hotelBookingData, roomType: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Select a room type</option>
                  {selectedWishlistHotel.rooms && selectedWishlistHotel.rooms.map((room, idx) => (
                    <option key={idx} value={room.type}>
                      {room.type} - ৳{room.pricePerNight}/night ({room.available} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                <div className="form-group">
                  <label>Check-in Date *</label>
                  <input
                    type="date"
                    value={hotelBookingData.checkInDate}
                    onChange={(e) => setHotelBookingData({...hotelBookingData, checkInDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Check-out Date *</label>
                  <input
                    type="date"
                    value={hotelBookingData.checkOutDate}
                    onChange={(e) => setHotelBookingData({...hotelBookingData, checkOutDate: e.target.value})}
                    min={hotelBookingData.checkInDate || new Date().toISOString().split('T')[0]}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ddd',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Number of Guests *</label>
                <input
                  type="number"
                  value={hotelBookingData.guests}
                  onChange={(e) => setHotelBookingData({...hotelBookingData, guests: parseInt(e.target.value)})}
                  min="1"
                  max="10"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              {hotelBookingData.checkInDate && hotelBookingData.checkOutDate && hotelBookingData.roomType && (
                <div style={{
                  background: '#e8f5e9',
                  padding: '15px',
                  borderRadius: '8px',
                  marginBottom: '20px'
                }}>
                  <h4 style={{margin: '0 0 10px 0', color: '#2e7d32'}}>Booking Summary</h4>
                  <p style={{margin: '5px 0', color: '#333'}}>
                    <strong>Nights:</strong> {Math.ceil((new Date(hotelBookingData.checkOutDate) - new Date(hotelBookingData.checkInDate)) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p style={{margin: '5px 0', color: '#333'}}>
                    <strong>Price per night:</strong> ৳{selectedWishlistHotel.rooms.find(r => r.type === hotelBookingData.roomType)?.pricePerNight.toLocaleString()}
                  </p>
                  <p style={{margin: '10px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32'}}>
                    <strong>Total Amount:</strong> ৳{calculateHotelTotalAmount().toLocaleString()}
                  </p>
                </div>
              )}

              <button type="submit" className="btn-primary" style={{width: '100%', padding: '12px', fontSize: '16px', fontWeight: '600'}}>
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hotel Payment Modal */}
      {showHotelPaymentModal && selectedWishlistHotel && (
        <div className="modal-overlay" onClick={() => setShowHotelPaymentModal(false)}>
          <div className="modal-content payment-modal-large" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <button className="modal-close" onClick={() => setShowHotelPaymentModal(false)}>×</button>
            <h2>Complete Payment</h2>
            <PaymentForm
              totalAmount={calculateHotelTotalAmount()}
              onPaymentSubmit={handleHotelPaymentSubmit}
              onCancel={() => setShowHotelPaymentModal(false)}
            />
          </div>
        </div>
      )}

      {/* Tour Booking Modal */}
      {showTourBookModal && selectedWishlistTour && (
        <div className="modal-overlay" onClick={() => setShowTourBookModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{maxWidth: '600px'}}>
            <button className="modal-close" onClick={() => setShowTourBookModal(false)}>×</button>
            <h2>Book Tour from Wishlist</h2>
            
            <div className="modal-guide-info" style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px'}}>
              <h3 style={{margin: '0 0 10px 0', color: '#333'}}>{selectedWishlistTour.title}</h3>
              <p style={{margin: '0 0 5px 0', color: '#666'}}>📍 {selectedWishlistTour.destination}</p>
              <p style={{margin: '0 0 5px 0', color: '#888'}}>⏱️ {selectedWishlistTour.duration?.days || 1}D/{selectedWishlistTour.duration?.nights || 0}N</p>
              <p style={{margin: '0 0 5px 0', color: '#28a745', fontWeight: '600'}}>৳{selectedWishlistTour.price?.toLocaleString()} per person</p>
              <p style={{margin: '0', color: '#888'}}>
                Available Slots: {selectedWishlistTour.maxGroupSize - (selectedWishlistTour.currentMembers || 0)}
              </p>
            </div>

            <form onSubmit={handleTourBookingSubmit}>
              <div className="form-group">
                <label>Number of Members *</label>
                <input
                  type="number"
                  value={tourBookingData.numberOfMembers}
                  onChange={(e) => setTourBookingData({...tourBookingData, numberOfMembers: parseInt(e.target.value)})}
                  min="1"
                  max={selectedWishlistTour.maxGroupSize - (selectedWishlistTour.currentMembers || 0)}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-group">
                <label>Travel Date *</label>
                <input
                  type="date"
                  value={tourBookingData.travelDate}
                  onChange={(e) => setTourBookingData({...tourBookingData, travelDate: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div className="form-group">
                <label>Special Requests (Optional)</label>
                <textarea
                  value={tourBookingData.specialRequests}
                  onChange={(e) => setTourBookingData({...tourBookingData, specialRequests: e.target.value})}
                  rows="3"
                  placeholder="Any special requirements or requests..."
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{
                background: '#e8f5e9',
                padding: '15px',
                borderRadius: '8px',
                marginBottom: '20px'
              }}>
                <h4 style={{margin: '0 0 10px 0', color: '#2e7d32'}}>Booking Summary</h4>
                <p style={{margin: '5px 0', color: '#333'}}>
                  <strong>Members:</strong> {tourBookingData.numberOfMembers}
                </p>
                <p style={{margin: '5px 0', color: '#333'}}>
                  <strong>Price per person:</strong> ৳{selectedWishlistTour.price?.toLocaleString()}
                </p>
                <p style={{margin: '10px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#2e7d32'}}>
                  <strong>Total Amount:</strong> ৳{calculateTourTotalAmount().toLocaleString()}
                </p>
              </div>

              <button type="submit" className="btn-primary" style={{width: '100%', padding: '12px', fontSize: '16px', fontWeight: '600'}}>
                Proceed to Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tour Payment Modal */}
      {showTourPaymentModal && selectedWishlistTour && (
        <div className="modal-overlay" onClick={() => setShowTourPaymentModal(false)}>
          <div className="modal-content payment-modal-large" onClick={(e) => e.stopPropagation()} style={{maxWidth: '700px'}}>
            <button className="modal-close" onClick={() => setShowTourPaymentModal(false)}>×</button>
            <h2>Complete Payment</h2>
            <PaymentForm
              totalAmount={calculateTourTotalAmount()}
              onPaymentSubmit={handleTourPaymentSubmit}
              onCancel={() => setShowTourPaymentModal(false)}
            />
          </div>
        </div>
      )}

      {/* Complaints Section */}
      {activeSection === 'complaints' && (
        <div className="content-card">
          <h2>My Complaints 📝</h2>
          <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>
            View your submitted complaints and admin responses
          </p>

          {complaintsLoading ? (
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
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px'}}>
                    <div>
                      <h3 style={{margin: '0 0 5px 0', fontSize: '18px', color: 'var(--text-primary)'}}>
                        {complaint.subject}
                      </h3>
                      <div style={{display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '13px'}}>
                        <span style={{color: 'var(--text-secondary)'}}>
                          📅 {new Date(complaint.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span style={{
                          background: complaint.category === 'urgent' ? '#fee' : '#e3f2fd',
                          color: complaint.category === 'urgent' ? '#c62828' : '#1565c0',
                          padding: '3px 10px',
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
                          padding: '3px 10px',
                          borderRadius: '12px'
                        }}>
                          🔥 {complaint.priority}
                        </span>
                      </div>
                    </div>
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
                      {complaint.status === 'pending' && '⏳'}
                      {complaint.status === 'in-progress' && '🔄'}
                      {complaint.status === 'resolved' && '✅'}
                      {complaint.status === 'closed' && '🔒'}
                      {' '}{complaint.status}
                    </span>
                  </div>

                  <p style={{margin: '15px 0', color: 'var(--text-primary)', lineHeight: '1.6'}}>
                    {complaint.description}
                  </p>

                  {complaint.adminFeedback && (
                    <div style={{
                      marginTop: '15px',
                      padding: '15px',
                      background: 'var(--bg-primary)',
                      borderLeft: '4px solid #4CAF50',
                      borderRadius: '8px'
                    }}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                        <strong style={{color: '#4CAF50', fontSize: '14px'}}>
                          💬 Admin Response
                        </strong>
                        {complaint.feedbackDate && (
                          <span style={{fontSize: '12px', color: 'var(--text-secondary)'}}>
                            {new Date(complaint.feedbackDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p style={{margin: '0', color: 'var(--text-primary)', lineHeight: '1.5'}}>
                        {complaint.adminFeedback}
                      </p>
                    </div>
                  )}

                  {complaint.resolvedBy && complaint.resolvedAt && (
                    <div style={{marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)'}}>
                      Resolved on {new Date(complaint.resolvedAt).toLocaleDateString()} by {complaint.resolvedBy.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{textAlign: 'center', padding: '60px 20px'}}>
              <div style={{fontSize: '64px', marginBottom: '20px'}}>📋</div>
              <h3 style={{color: 'var(--text-primary)', marginBottom: '10px'}}>No Complaints Yet</h3>
              <p style={{color: 'var(--text-secondary)', marginBottom: '20px'}}>
                You haven't submitted any complaints. If you face any issues, feel free to reach out.
              </p>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default TouristDashboard;
