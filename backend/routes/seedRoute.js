const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Bus = require('../models/Bus');
const TourPackage = require('../models/TourPackage');
const Coupon = require('../models/Coupon');

const hotelsData = [
  { name: 'Pan Pacific Sonargaon Dhaka', category: 'hotel', description: 'A luxurious 5-star hotel in the heart of Dhaka with world-class amenities and services.', address: { street: '107 Kazi Nazrul Islam Avenue', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', zipCode: '1000' }, phone: '+880-2-8159001', email: 'info@sonargaonpanpacific.com', website: 'www.panpacific.com', rooms: [{ type: 'deluxe', name: 'Deluxe Room', pricePerNight: 15000, maxGuests: 2, totalRooms: 20 }, { type: 'suite', name: 'Executive Suite', pricePerNight: 25000, maxGuests: 3, totalRooms: 10 }], facilities: { wifi: true, parking: true, restaurant: true, gym: true, spa: true, swimmingPool: true, ac: true }, amenities: ['24/7 Room Service', 'Concierge', 'Business Center'], rating: 4.8, verificationStatus: 'approved' },
  { name: 'Hotel Sea Crown', category: 'resort', description: "Beautiful beachfront hotel in Cox's Bazar with stunning ocean views.", address: { street: 'Hotel Motel Zone', city: "Cox's Bazar", district: "Cox's Bazar", division: 'Chittagong', zipCode: '4700' }, phone: '+880-341-51234', email: 'info@seacrown.com', website: 'www.hotelseacrown.com', rooms: [{ type: 'double', name: 'Sea View Room', pricePerNight: 5000, maxGuests: 2, totalRooms: 30 }, { type: 'family', name: 'Family Suite', pricePerNight: 8000, maxGuests: 4, totalRooms: 15 }], facilities: { wifi: true, parking: true, restaurant: true, spa: true, ac: true }, amenities: ['Beach Access', 'Sea View', 'Restaurant'], rating: 4.3, verificationStatus: 'approved' },
  { name: 'Hotel Noorjahan Grand', category: 'hotel', description: 'Comfortable hotel in Sylhet with modern facilities and excellent service.', address: { street: 'Zindabazar', city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', zipCode: '3100' }, phone: '+880-821-725544', email: 'info@noorjahangrand.com', website: 'www.noorjahangrand.com', rooms: [{ type: 'single', name: 'Standard Room', pricePerNight: 4000, maxGuests: 2, totalRooms: 25 }, { type: 'suite', name: 'Executive Suite', pricePerNight: 10000, maxGuests: 4, totalRooms: 5 }], facilities: { wifi: true, parking: true, restaurant: true, gym: true, ac: true }, amenities: ['Restaurant', 'Coffee Shop', 'Room Service'], rating: 4.1, verificationStatus: 'approved' },
  { name: 'Hotel Castle Sanmar', category: 'hotel', description: 'Premium hotel in Chittagong with exceptional hospitality and modern amenities.', address: { street: 'CDA Avenue', city: 'Chittagong', district: 'Chattogram', division: 'Chittagong', zipCode: '4000' }, phone: '+880-31-2523401', email: 'info@castlesanmar.com', website: 'www.castlesanmar.com', rooms: [{ type: 'double', name: 'Superior Room', pricePerNight: 8000, maxGuests: 2, totalRooms: 20 }, { type: 'suite', name: 'Suite', pricePerNight: 20000, maxGuests: 4, totalRooms: 8 }], facilities: { wifi: true, parking: true, restaurant: true, gym: true, spa: true, swimmingPool: true, ac: true }, amenities: ['Spa', 'Gym', 'Multiple Restaurants'], rating: 4.6, verificationStatus: 'approved' },
  { name: 'Hotel Garden Inn', category: 'guest-house', description: 'Affordable and clean budget hotel in Rajshahi city center.', address: { street: 'Shaheb Bazar', city: 'Rajshahi', district: 'Rajshahi', division: 'Rajshahi', zipCode: '6000' }, phone: '+880-721-772233', email: 'info@gardeninn.com', website: 'www.gardeninnrajshahi.com', rooms: [{ type: 'single', name: 'Standard Room', pricePerNight: 2000, maxGuests: 2, totalRooms: 30 }], facilities: { wifi: true, parking: true, restaurant: true, ac: true }, amenities: ['Restaurant', 'Room Service', 'Free WiFi'], rating: 3.8, verificationStatus: 'approved' }
];

const busesData = [
  { name: 'Shohag Paribahan', busNumber: 'SH-101', busType: 'AC', totalSeats: 40, from: 'Dhaka', to: 'Chittagong', departureTime: '07:00 AM', arrivalTime: '01:00 PM', duration: '6 hours', fare: 800, amenities: ['WiFi', 'Charging Port', 'TV', 'Water'], availableSeats: 40, rating: 4.5, operator: { name: 'Shohag Paribahan Ltd', phone: '+880-2-9001234', email: 'info@shohagparibahan.com' }, status: 'active' },
  { name: 'Green Line Paribahan', busNumber: 'GL-202', busType: 'Luxury', totalSeats: 36, from: 'Dhaka', to: "Cox's Bazar", departureTime: '09:00 PM', arrivalTime: '07:00 AM', duration: '10 hours', fare: 1500, amenities: ['WiFi', 'Charging Port', 'TV', 'Snacks', 'Blanket'], availableSeats: 36, rating: 4.7, operator: { name: 'Green Line Paribahan', phone: '+880-2-9002345', email: 'info@greenlinebd.com' }, status: 'active' },
  { name: 'Hanif Enterprise', busNumber: 'HE-303', busType: 'AC', totalSeats: 42, from: 'Dhaka', to: 'Sylhet', departureTime: '11:00 PM', arrivalTime: '06:00 AM', duration: '7 hours', fare: 900, amenities: ['WiFi', 'Charging Port', 'Water'], availableSeats: 42, rating: 4.3, operator: { name: 'Hanif Enterprise', phone: '+880-2-9003456', email: 'info@hanifenterprise.com' }, status: 'active' },
  { name: 'Ena Transport', busNumber: 'ET-404', busType: 'Semi-Sleeper', totalSeats: 38, from: 'Dhaka', to: 'Rajshahi', departureTime: '10:00 PM', arrivalTime: '06:00 AM', duration: '8 hours', fare: 850, amenities: ['Charging Port', 'Water', 'Blanket'], availableSeats: 38, rating: 4.2, operator: { name: 'Ena Transport Services', phone: '+880-2-9004567', email: 'info@enatransport.com' }, status: 'active' },
  { name: 'Shyamoli Paribahan', busNumber: 'SY-505', busType: 'AC', totalSeats: 40, from: 'Dhaka', to: 'Khulna', departureTime: '08:00 AM', arrivalTime: '04:00 PM', duration: '8 hours', fare: 750, amenities: ['WiFi', 'TV', 'Water'], availableSeats: 40, rating: 4.0, operator: { name: 'Shyamoli Paribahan', phone: '+880-2-9005678', email: 'info@shyamoliparibahan.com' }, status: 'active' },
  { name: 'Saudia Paribahan', busNumber: 'SA-606', busType: 'Non-AC', totalSeats: 45, from: 'Dhaka', to: 'Barisal', departureTime: '06:00 AM', arrivalTime: '01:00 PM', duration: '7 hours', fare: 500, amenities: ['Water'], availableSeats: 45, rating: 3.8, operator: { name: 'Saudia Paribahan', phone: '+880-2-9006789', email: 'info@saudiaparibahan.com' }, status: 'active' },
  { name: 'TR Travels', busNumber: 'TR-707', busType: 'Luxury', totalSeats: 32, from: 'Chittagong', to: "Cox's Bazar", departureTime: '08:00 AM', arrivalTime: '12:00 PM', duration: '4 hours', fare: 600, amenities: ['WiFi', 'Charging Port', 'TV', 'Water'], availableSeats: 32, rating: 4.6, operator: { name: 'TR Travels', phone: '+880-31-2507890', email: 'info@trtravels.com' }, status: 'active' },
  { name: 'Silk Line', busNumber: 'SL-808', busType: 'AC', totalSeats: 40, from: 'Sylhet', to: 'Dhaka', departureTime: '10:00 PM', arrivalTime: '05:00 AM', duration: '7 hours', fare: 900, amenities: ['WiFi', 'Charging Port', 'Water'], availableSeats: 40, rating: 4.4, operator: { name: 'Silk Line Paribahan', phone: '+880-821-708901', email: 'info@silkline.com' }, status: 'active' }
];

const guidesData = [
  { name: 'Rakibul Hasan', email: 'guide1@gmail.com', password: '123456', phone: '01712345671', userType: 'guide', bio: 'Experienced tour guide specializing in historical sites and cultural tours.', experience: 8, languages: ['Bengali', 'English', 'Hindi'], specializations: ['Historical Tours', 'Cultural Heritage', 'Old Dhaka Tours'], divisions: ['Dhaka', 'Chittagong', 'Sylhet'], address: { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' }, hourlyRate: 800, availability: true, rating: 4.8, totalReviews: 156, isActive: true, isVerified: true },
  { name: 'Fatima Rahman', email: 'guide2@gmail.com', password: '123456', phone: '01812345672', userType: 'guide', bio: 'Nature enthusiast and adventure guide specializing in coastal destinations.', experience: 6, languages: ['Bengali', 'English', 'Arabic'], specializations: ['Beach Tours', 'Adventure Tours', 'Photography Tours'], divisions: ['Chittagong', 'Barisal'], address: { city: "Cox's Bazar", district: "Cox's Bazar", division: 'Chittagong' }, hourlyRate: 700, availability: true, rating: 4.7, totalReviews: 98, isActive: true, isVerified: true },
  { name: 'Anisur Rahman', email: 'guide3@gmail.com', password: '123456', phone: '01912345673', userType: 'guide', bio: 'Tea garden expert and hill tract specialist.', experience: 10, languages: ['Bengali', 'English', 'Sylheti'], specializations: ['Tea Garden Tours', 'Hill Tracts', 'Eco-Tourism'], divisions: ['Sylhet', 'Chittagong'], address: { city: 'Sylhet', district: 'Sylhet', division: 'Sylhet' }, hourlyRate: 900, availability: true, rating: 4.9, totalReviews: 203, isActive: true, isVerified: true },
  { name: 'Mahmud Hossain', email: 'guide4@gmail.com', password: '123456', phone: '01712345675', userType: 'guide', bio: 'Sundarbans expert and wildlife enthusiast.', experience: 9, languages: ['Bengali', 'English', 'Hindi'], specializations: ['Sundarbans Tours', 'Wildlife Tours', 'Bird Watching'], divisions: ['Khulna', 'Barisal'], address: { city: 'Khulna', district: 'Khulna', division: 'Khulna' }, hourlyRate: 850, availability: true, rating: 4.8, totalReviews: 174, isActive: true, isVerified: true },
  { name: 'Kamal Uddin', email: 'guide5@gmail.com', password: '123456', phone: '01912345677', userType: 'guide', bio: 'Archaeological sites and ancient history expert.', experience: 12, languages: ['Bengali', 'English', 'French'], specializations: ['Archaeological Sites', 'Ancient History', 'UNESCO Sites'], divisions: ['Rajshahi', 'Rangpur', 'Dhaka'], address: { city: 'Bogra', district: 'Bogra', division: 'Rajshahi' }, hourlyRate: 950, availability: true, rating: 4.9, totalReviews: 245, isActive: true, isVerified: true }
];

const toursData = [
  { title: 'Sundarbans Mangrove Adventure', description: "Explore the world's largest mangrove forest. Spot Royal Bengal Tigers, deer, and crocodiles.", destination: 'Sundarbans, Khulna', duration: { days: 3, nights: 2 }, price: 8500, maxGroupSize: 15, category: 'Wildlife', difficulty: 'Moderate', includes: ['Boat transportation', 'Accommodation', 'All meals', 'Professional guide', 'Forest entry permits'], excludes: ['Personal expenses', 'Travel insurance'], itinerary: [{ day: 1, title: 'Departure', description: 'Journey to Mongla port', activities: ['Travel to Mongla', 'Board boat', 'River cruise'] }, { day: 2, title: 'Forest Exploration', description: 'Full day exploration', activities: ['Tiger tracking', 'Bird watching'] }, { day: 3, title: 'Return', description: 'Return journey', activities: ['Morning walk', 'Return to Dhaka'] }], featured: true, availableDates: [{ startDate: new Date('2026-08-15'), endDate: new Date('2026-08-17'), availableSlots: 15 }, { startDate: new Date('2026-09-10'), endDate: new Date('2026-09-12'), availableSlots: 15 }] },
  { title: "Cox's Bazar Beach Paradise", description: "Visit the world's longest natural sea beach. Enjoy pristine beaches, sunsets, and fresh seafood.", destination: "Cox's Bazar, Chittagong", duration: { days: 4, nights: 3 }, price: 12000, maxGroupSize: 20, category: 'Beach', difficulty: 'Easy', includes: ['AC bus transportation', '3-star hotel', 'Daily breakfast', 'Tour guide'], excludes: ['Lunch and dinner', 'Water sports'], itinerary: [{ day: 1, title: 'Arrival', description: 'Hotel check-in', activities: ['Check-in', 'Beach walk', 'Sunset viewing'] }, { day: 2, title: 'Inani Beach', description: 'Nearby attractions', activities: ['Himchari waterfall', 'Inani Beach'] }, { day: 3, title: 'Saint Martin', description: 'Day trip', activities: ['Boat to Saint Martin', 'Island exploration'] }, { day: 4, title: 'Departure', description: 'Return', activities: ['Morning beach walk', 'Return to Dhaka'] }], featured: true, availableDates: [{ startDate: new Date('2026-08-20'), endDate: new Date('2026-08-23'), availableSlots: 20 }] },
  { title: 'Sajek Valley Cloud Paradise', description: "Experience the 'Queen of Hills' with breathtaking cloud and mountain views.", destination: 'Sajek Valley, Rangamati', duration: { days: 2, nights: 1 }, price: 6500, maxGroupSize: 18, category: 'Adventure', difficulty: 'Moderate', includes: ['Jeep transportation', 'Resort accommodation', 'All meals', 'Local guide'], excludes: ['Personal expenses'], itinerary: [{ day: 1, title: 'Journey to Sajek', description: 'Hill drive', activities: ['Jeep ride', 'Helipad visit', 'Bonfire'] }, { day: 2, title: 'Sunrise & Return', description: 'Departure', activities: ['Sunrise viewing', 'Village tour', 'Return'] }], featured: true, availableDates: [{ startDate: new Date('2026-08-08'), endDate: new Date('2026-08-09'), availableSlots: 18 }] },
  { title: 'Srimangal Tea Garden Retreat', description: 'Explore the tea capital with lush gardens, Lawachara rainforest, and seven-layer tea.', destination: 'Srimangal, Sylhet', duration: { days: 2, nights: 1 }, price: 5500, maxGroupSize: 20, category: 'Cultural', difficulty: 'Easy', includes: ['Transportation', 'Tea resort', 'All meals', 'Tea garden tour'], excludes: ['Personal shopping'], itinerary: [{ day: 1, title: 'Tea Garden', description: 'Arrival and exploration', activities: ['Tea garden tour', 'Factory visit', 'Seven-layer tea'] }, { day: 2, title: 'Rainforest', description: 'Wildlife and return', activities: ['Lawachara forest walk', 'Return journey'] }], availableDates: [{ startDate: new Date('2026-09-14'), endDate: new Date('2026-09-15'), availableSlots: 20 }] },
  { title: 'Bandarban Hill Hiking Expedition', description: "Trek through Bangladesh's highest peaks, tribal villages, and mountain views.", destination: 'Bandarban, Chittagong Hill Tracts', duration: { days: 3, nights: 2 }, price: 9500, maxGroupSize: 15, category: 'Adventure', difficulty: 'Challenging', includes: ['Jeep transportation', 'Resort accommodation', 'All meals', 'Trekking guide', 'Entry permits'], excludes: ['Personal hiking gear', 'Travel insurance'], itinerary: [{ day: 1, title: 'Nilgiri Hills', description: 'Arrival', activities: ['Golden Temple', 'Jeep to Nilgiri', 'Sunset'] }, { day: 2, title: 'Tribal Trek', description: 'Deep trekking', activities: ['Chimbuk Hill', 'Tribal village', 'Bonfire'] }, { day: 3, title: 'Return', description: 'Departure', activities: ['Shoilo Propat waterfall', 'Return to Dhaka'] }], featured: true, availableDates: [{ startDate: new Date('2026-09-05'), endDate: new Date('2026-09-07'), availableSlots: 15 }] },
  { title: 'Dhaka Heritage Walk', description: 'Discover Old Dhaka with Mughal monuments, traditional markets, and cultural landmarks.', destination: 'Old Dhaka, Dhaka', duration: { days: 1, nights: 0 }, price: 1500, maxGroupSize: 30, category: 'Historical', difficulty: 'Easy', includes: ['Walking guide', 'All entry fees', 'Traditional lunch', 'Rickshaw rides'], excludes: ['Personal shopping'], itinerary: [{ day: 1, title: 'Old Dhaka', description: 'Full day walk', activities: ['Lalbagh Fort', 'Ahsan Manzil', 'Sadarghat', 'Star Mosque'] }], availableDates: [{ startDate: new Date('2026-08-01'), endDate: new Date('2026-08-01'), availableSlots: 30 }, { startDate: new Date('2026-09-01'), endDate: new Date('2026-09-01'), availableSlots: 30 }] },
  { title: 'Rangamati Lake Discovery', description: "Experience the 'Lake City' with hanging bridge, Kaptai Lake, and Buddhist temples.", destination: 'Rangamati, Chittagong Hill Tracts', duration: { days: 2, nights: 1 }, price: 5800, maxGroupSize: 20, category: 'Cultural', difficulty: 'Easy', includes: ['Bus transportation', 'Lake resort', 'All meals', 'Speed boat tours'], excludes: ['Personal shopping'], itinerary: [{ day: 1, title: 'Lake Exploration', description: 'Arrival', activities: ['Hanging bridge', 'Speed boat', 'Buddhist temple'] }, { day: 2, title: 'Cultural Experience', description: 'Return', activities: ['Chakma village', 'Kaptai Dam', 'Return'] }], availableDates: [{ startDate: new Date('2026-08-28'), endDate: new Date('2026-08-29'), availableSlots: 20 }] },
  { title: 'Kuakata Panoramic Sea Beach', description: "Watch both sunrise and sunset from the same beach — the 'Daughter of the Sea'.", destination: 'Kuakata, Patuakhali', duration: { days: 3, nights: 2 }, price: 7500, maxGroupSize: 20, category: 'Beach', difficulty: 'Easy', includes: ['AC bus transportation', 'Beach resort', 'Daily breakfast', 'Guide service'], excludes: ['Lunch and dinner', 'Water sports'], itinerary: [{ day: 1, title: 'Arrival', description: 'Check-in', activities: ['Beach walk', 'Sunset viewing'] }, { day: 2, title: 'Full Day', description: 'Sightseeing', activities: ['Sunrise', 'Keranipara temple', 'Rakhine village'] }, { day: 3, title: 'Departure', description: 'Return', activities: ['Morning walk', 'Return to Dhaka'] }], availableDates: [{ startDate: new Date('2026-09-12'), endDate: new Date('2026-09-14'), availableSlots: 20 }] },
  { title: 'Paharpur Buddhist Heritage Tour', description: 'Visit the UNESCO World Heritage Site — largest Buddhist monastery south of the Himalayas.', destination: 'Paharpur, Naogaon', duration: { days: 2, nights: 1 }, price: 4500, maxGroupSize: 25, category: 'Historical', difficulty: 'Easy', includes: ['AC bus transportation', 'Hotel', 'Breakfast and dinner', 'Site entry fees', 'Guide'], excludes: ['Lunch', 'Souvenirs'], itinerary: [{ day: 1, title: 'Heritage Site', description: 'Exploration', activities: ['Somapura Mahavihara', 'Museum', 'Terracotta art'] }, { day: 2, title: 'Return', description: 'Departure', activities: ['Village tour', 'Return to Dhaka'] }], availableDates: [{ startDate: new Date('2026-08-22'), endDate: new Date('2026-08-23'), availableSlots: 25 }] },
  { title: 'Ratargul Swamp Forest Expedition', description: "Bangladesh's only freshwater swamp forest — navigate through submerged trees by boat.", destination: 'Ratargul, Sylhet', duration: { days: 2, nights: 1 }, price: 4800, maxGroupSize: 16, category: 'Wildlife', difficulty: 'Easy', includes: ['AC bus transportation', 'Hotel in Sylhet', 'Breakfast and dinner', 'Boat ride'], excludes: ['Lunch', 'Camera fees'], itinerary: [{ day: 1, title: 'Swamp Forest', description: 'Arrival', activities: ['Ratargul boat tour', 'Jaflong visit'] }, { day: 2, title: 'Return', description: 'Sightseeing', activities: ['Shah Jalal Mazar', 'Return to Dhaka'] }], availableDates: [{ startDate: new Date('2026-09-20'), endDate: new Date('2026-09-21'), availableSlots: 16 }] }
];

const couponsData = [
  { code: 'WELCOME2026', description: 'Welcome discount - 15% off on all services', discountType: 'percentage', discountValue: 15, serviceTypes: ['all'], minPurchaseAmount: 2000, maxDiscountAmount: 1000, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), usageLimit: 100, isActive: true },
  { code: 'SUMMER50', description: 'Summer special - ৳500 off on tours', discountType: 'fixed', discountValue: 500, serviceTypes: ['tour'], minPurchaseAmount: 3000, validFrom: new Date('2026-06-01'), validTo: new Date('2026-12-31'), usageLimit: 50, isActive: true },
  { code: 'HOTEL20', description: '20% discount on hotel bookings', discountType: 'percentage', discountValue: 20, serviceTypes: ['hotel'], minPurchaseAmount: 5000, maxDiscountAmount: 2000, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), isActive: true },
  { code: 'BUS100', description: 'Bus travel discount - ৳100 off', discountType: 'fixed', discountValue: 100, serviceTypes: ['bus'], minPurchaseAmount: 500, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), usageLimit: 200, isActive: true },
  { code: 'MEGA25', description: 'Mega sale - 25% off on tours and hotels', discountType: 'percentage', discountValue: 25, serviceTypes: ['tour', 'hotel'], minPurchaseAmount: 10000, maxDiscountAmount: 3000, validFrom: new Date('2026-06-01'), validTo: new Date('2026-12-31'), usageLimit: 30, isActive: true },
  { code: 'GUIDE50', description: 'Guide booking special - ৳50 off', discountType: 'fixed', discountValue: 50, serviceTypes: ['guide'], minPurchaseAmount: 300, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), isActive: true }
];

const runSeed = async (secret, res) => {

  if (!process.env.SEED_SECRET || secret !== process.env.SEED_SECRET) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const results = {};

    // 1. Admin user
    let admin = await User.findOne({ email: 'admin@roamingsonic.com' });
    if (!admin) {
      admin = new User({
        name: 'Admin',
        email: 'admin@roamingsonic.com',
        password: 'Admin@123',
        userType: 'admin',
        phone: '01700000000',
        isVerified: true,
        isActive: true
      });
      await admin.save();
      results.admin = 'created';
    } else {
      results.admin = 'already exists';
    }

    // 2. Hotels
    await Hotel.deleteMany({});
    const hotels = await Hotel.insertMany(hotelsData.map(h => ({ ...h, owner: admin._id, isVerified: true, isActive: true })));
    results.hotels = hotels.length;

    // 3. Buses
    await Bus.deleteMany({});
    const buses = await Bus.insertMany(busesData);
    results.buses = buses.length;

    // 4. Guides
    const guideEmails = guidesData.map(g => g.email);
    await User.deleteMany({ email: { $in: guideEmails } });
    let guideCount = 0;
    for (const g of guidesData) {
      const guide = new User({ ...g, isApproved: true, approvalStatus: 'approved' });
      await guide.save();
      guideCount++;
    }
    results.guides = guideCount;

    // 5. Tours
    await TourPackage.deleteMany({});
    const tours = await TourPackage.insertMany(toursData.map(t => ({ ...t, createdBy: admin._id })));
    results.tours = tours.length;

    // 6. Coupons
    await Coupon.deleteMany({});
    const coupons = await Coupon.insertMany(couponsData.map(c => ({ ...c, createdBy: admin._id })));
    results.coupons = coupons.length;

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      results,
      adminCredentials: {
        email: 'admin@roamingsonic.com',
        password: 'Admin@123',
        loginAs: 'Admin'
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/seed?secret=xxx  — open in browser
router.get('/', (req, res) => runSeed(req.query.secret, res));

// POST /api/seed  { "secret": "xxx" }
router.post('/', (req, res) => runSeed(req.body.secret, res));

module.exports = router;
