/**
 * Combined production seed script.
 * Usage: node scripts/seedProduction.js "mongodb+srv://user:pass@cluster.mongodb.net/roaming-sonic"
 * Or set MONGODB_URI in backend/.env and run: node scripts/seedProduction.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Hotel = require('../models/Hotel');
const Bus = require('../models/Bus');
const User = require('../models/User');
const TourPackage = require('../models/TourPackage');
const Coupon = require('../models/Coupon');

const uri = process.argv[2] || process.env.MONGODB_URI;
if (!uri || uri.includes('localhost')) {
  console.error('\n❌  Pass your Atlas URI as argument:');
  console.error('   node scripts/seedProduction.js "mongodb+srv://user:pass@cluster.mongodb.net/roaming-sonic"\n');
  process.exit(1);
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const hotelsData = [
  { name: 'Pan Pacific Sonargaon Dhaka', category: 'hotel', description: 'A luxurious 5-star hotel in the heart of Dhaka with world-class amenities and services.', address: { street: '107 Kazi Nazrul Islam Avenue', city: 'Dhaka', district: 'Dhaka', division: 'Dhaka', zipCode: '1000' }, phone: '+880-2-8159001', email: 'info@sonargaonpanpacific.com', website: 'www.panpacific.com', rooms: [{ type: 'deluxe', name: 'Deluxe Room', pricePerNight: 15000, maxGuests: 2, totalRooms: 20 }, { type: 'suite', name: 'Executive Suite', pricePerNight: 25000, maxGuests: 3, totalRooms: 10 }, { type: 'suite', name: 'Presidential Suite', pricePerNight: 50000, maxGuests: 4, totalRooms: 2 }], facilities: { wifi: true, parking: true, restaurant: true, gym: true, spa: true, swimmingPool: true, conferenceRoom: true, airportShuttle: true, ac: true }, amenities: ['24/7 Room Service', 'Concierge', 'Business Center', 'Laundry', 'Rooftop Restaurant'], rating: 4.8, verificationStatus: 'approved' },
  { name: 'Hotel Sea Crown', category: 'resort', description: "Beautiful beachfront hotel in Cox's Bazar with stunning ocean views.", address: { street: 'Hotel Motel Zone', city: "Cox's Bazar", district: "Cox's Bazar", division: 'Chittagong', zipCode: '4700' }, phone: '+880-341-51234', email: 'info@seacrown.com', website: 'www.hotelseacrown.com', rooms: [{ type: 'double', name: 'Sea View Room', pricePerNight: 5000, maxGuests: 2, totalRooms: 30 }, { type: 'family', name: 'Family Suite', pricePerNight: 8000, maxGuests: 4, totalRooms: 15 }, { type: 'deluxe', name: 'Deluxe Sea View', pricePerNight: 7000, maxGuests: 3, totalRooms: 20 }], facilities: { wifi: true, parking: true, restaurant: true, gym: false, spa: true, swimmingPool: false, conferenceRoom: false, airportShuttle: true, ac: true }, amenities: ['Beach Access', 'Sea View', 'Restaurant', 'Room Service'], rating: 4.3, verificationStatus: 'approved' },
  { name: 'Hotel Noorjahan Grand', category: 'hotel', description: 'Comfortable hotel in Sylhet with modern facilities and excellent service.', address: { street: 'Zindabazar', city: 'Sylhet', district: 'Sylhet', division: 'Sylhet', zipCode: '3100' }, phone: '+880-821-725544', email: 'info@noorjahangrand.com', website: 'www.noorjahangrand.com', rooms: [{ type: 'single', name: 'Standard Room', pricePerNight: 4000, maxGuests: 2, totalRooms: 25 }, { type: 'deluxe', name: 'Deluxe Room', pricePerNight: 6000, maxGuests: 3, totalRooms: 15 }, { type: 'suite', name: 'Executive Suite', pricePerNight: 10000, maxGuests: 4, totalRooms: 5 }], facilities: { wifi: true, parking: true, restaurant: true, gym: true, spa: false, swimmingPool: false, conferenceRoom: true, airportShuttle: false, ac: true }, amenities: ['Restaurant', 'Coffee Shop', 'Room Service', 'Laundry'], rating: 4.1, verificationStatus: 'approved' },
  { name: 'Hotel Castle Sanmar', category: 'hotel', description: 'Premium hotel in Chittagong with exceptional hospitality and modern amenities.', address: { street: 'CDA Avenue', city: 'Chittagong', district: 'Chattogram', division: 'Chittagong', zipCode: '4000' }, phone: '+880-31-2523401', email: 'info@castlesanmar.com', website: 'www.castlesanmar.com', rooms: [{ type: 'double', name: 'Superior Room', pricePerNight: 8000, maxGuests: 2, totalRooms: 20 }, { type: 'deluxe', name: 'Deluxe Room', pricePerNight: 12000, maxGuests: 3, totalRooms: 15 }, { type: 'suite', name: 'Suite', pricePerNight: 20000, maxGuests: 4, totalRooms: 8 }], facilities: { wifi: true, parking: true, restaurant: true, gym: true, spa: true, swimmingPool: true, conferenceRoom: true, airportShuttle: true, ac: true }, amenities: ['Spa', 'Gym', 'Multiple Restaurants', 'Bar', 'Business Center'], rating: 4.6, verificationStatus: 'approved' },
  { name: 'Hotel Garden Inn', category: 'guest-house', description: 'Affordable and clean budget hotel in Rajshahi city center.', address: { street: 'Shaheb Bazar', city: 'Rajshahi', district: 'Rajshahi', division: 'Rajshahi', zipCode: '6000' }, phone: '+880-721-772233', email: 'info@gardeninn.com', website: 'www.gardeninnrajshahi.com', rooms: [{ type: 'single', name: 'Standard Room', pricePerNight: 2000, maxGuests: 2, totalRooms: 30 }, { type: 'deluxe', name: 'Deluxe Room', pricePerNight: 3000, maxGuests: 3, totalRooms: 10 }], facilities: { wifi: true, parking: true, restaurant: true, gym: false, spa: false, swimmingPool: false, conferenceRoom: false, airportShuttle: false, ac: true }, amenities: ['Restaurant', 'Room Service', 'Free WiFi'], rating: 3.8, verificationStatus: 'approved' }
];

const busesData = [
  { name: 'Shohag Paribahan', busNumber: 'SH-101', busType: 'AC', totalSeats: 40, from: 'Dhaka', to: 'Chittagong', departureTime: '07:00 AM', arrivalTime: '01:00 PM', duration: '6 hours', fare: 800, amenities: ['WiFi', 'Charging Port', 'TV', 'Water'], availableSeats: 40, rating: 4.5, operator: { name: 'Shohag Paribahan Ltd', phone: '+880-2-9001234', email: 'info@shohagparibahan.com' }, status: 'active' },
  { name: 'Green Line Paribahan', busNumber: 'GL-202', busType: 'Luxury', totalSeats: 36, from: 'Dhaka', to: "Cox's Bazar", departureTime: '09:00 PM', arrivalTime: '07:00 AM', duration: '10 hours', fare: 1500, amenities: ['WiFi', 'Charging Port', 'TV', 'Snacks', 'Water', 'Blanket', 'Reading Light'], availableSeats: 36, rating: 4.7, operator: { name: 'Green Line Paribahan', phone: '+880-2-9002345', email: 'info@greenlinebd.com' }, status: 'active' },
  { name: 'Hanif Enterprise', busNumber: 'HE-303', busType: 'AC', totalSeats: 42, from: 'Dhaka', to: 'Sylhet', departureTime: '11:00 PM', arrivalTime: '06:00 AM', duration: '7 hours', fare: 900, amenities: ['WiFi', 'Charging Port', 'Water'], availableSeats: 42, rating: 4.3, operator: { name: 'Hanif Enterprise', phone: '+880-2-9003456', email: 'info@hanifenterprise.com' }, status: 'active' },
  { name: 'Ena Transport', busNumber: 'ET-404', busType: 'Semi-Sleeper', totalSeats: 38, from: 'Dhaka', to: 'Rajshahi', departureTime: '10:00 PM', arrivalTime: '06:00 AM', duration: '8 hours', fare: 850, amenities: ['Charging Port', 'Water', 'Blanket'], availableSeats: 38, rating: 4.2, operator: { name: 'Ena Transport Services', phone: '+880-2-9004567', email: 'info@enatransport.com' }, status: 'active' },
  { name: 'Shyamoli Paribahan', busNumber: 'SY-505', busType: 'AC', totalSeats: 40, from: 'Dhaka', to: 'Khulna', departureTime: '08:00 AM', arrivalTime: '04:00 PM', duration: '8 hours', fare: 750, amenities: ['WiFi', 'TV', 'Water'], availableSeats: 40, rating: 4.0, operator: { name: 'Shyamoli Paribahan', phone: '+880-2-9005678', email: 'info@shyamoliparibahan.com' }, status: 'active' },
  { name: 'Saudia Paribahan', busNumber: 'SA-606', busType: 'Non-AC', totalSeats: 45, from: 'Dhaka', to: 'Barisal', departureTime: '06:00 AM', arrivalTime: '01:00 PM', duration: '7 hours', fare: 500, amenities: ['Water'], availableSeats: 45, rating: 3.8, operator: { name: 'Saudia Paribahan', phone: '+880-2-9006789', email: 'info@saudiaparibahan.com' }, status: 'active' },
  { name: 'TR Travels', busNumber: 'TR-707', busType: 'Luxury', totalSeats: 32, from: 'Chittagong', to: "Cox's Bazar", departureTime: '08:00 AM', arrivalTime: '12:00 PM', duration: '4 hours', fare: 600, amenities: ['WiFi', 'Charging Port', 'TV', 'Water', 'Blanket'], availableSeats: 32, rating: 4.6, operator: { name: 'TR Travels', phone: '+880-31-2507890', email: 'info@trtravels.com' }, status: 'active' },
  { name: 'Silk Line', busNumber: 'SL-808', busType: 'AC', totalSeats: 40, from: 'Sylhet', to: 'Dhaka', departureTime: '10:00 PM', arrivalTime: '05:00 AM', duration: '7 hours', fare: 900, amenities: ['WiFi', 'Charging Port', 'Water'], availableSeats: 40, rating: 4.4, operator: { name: 'Silk Line Paribahan', phone: '+880-821-708901', email: 'info@silkline.com' }, status: 'active' }
];

const guidesData = [
  { name: 'Rakibul Hasan', email: 'guide1@gmail.com', password: '123456', phone: '01712345671', userType: 'guide', bio: 'Experienced tour guide specializing in historical sites and cultural tours across Bangladesh.', experience: 8, languages: ['Bengali', 'English', 'Hindi'], specializations: ['Historical Tours', 'Cultural Heritage', 'Architecture', 'Old Dhaka Tours'], divisions: ['Dhaka', 'Chittagong', 'Sylhet'], address: { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' }, hourlyRate: 800, availability: true, rating: 4.8, totalReviews: 156, isActive: true, isVerified: true },
  { name: 'Fatima Rahman', email: 'guide2@gmail.com', password: '123456', phone: '01812345672', userType: 'guide', bio: "Nature enthusiast and adventure guide with expertise in coastal and beach destinations.", experience: 6, languages: ['Bengali', 'English', 'Arabic'], specializations: ['Beach Tours', 'Adventure Tours', 'Nature & Wildlife', 'Photography Tours'], divisions: ['Chittagong', 'Barisal'], address: { city: "Cox's Bazar", district: "Cox's Bazar", division: 'Chittagong' }, hourlyRate: 700, availability: true, rating: 4.7, totalReviews: 98, isActive: true, isVerified: true },
  { name: 'Anisur Rahman', email: 'guide3@gmail.com', password: '123456', phone: '01912345673', userType: 'guide', bio: 'Tea garden expert and hill tract specialist.', experience: 10, languages: ['Bengali', 'English', 'Sylheti', 'Chakma'], specializations: ['Tea Garden Tours', 'Hill Tracts', 'Tribal Culture', 'Eco-Tourism'], divisions: ['Sylhet', 'Chittagong'], address: { city: 'Sylhet', district: 'Sylhet', division: 'Sylhet' }, hourlyRate: 900, availability: true, rating: 4.9, totalReviews: 203, isActive: true, isVerified: true },
  { name: 'Nasrin Akter', email: 'guide4@gmail.com', password: '123456', phone: '01612345674', userType: 'guide', bio: 'Religious tourism specialist with deep knowledge of mosques, temples, and spiritual sites.', experience: 7, languages: ['Bengali', 'English', 'Urdu', 'Arabic'], specializations: ['Religious Tours', 'Spiritual Sites', 'Mosque Tours', 'Temple Tours'], divisions: ['Dhaka', 'Rajshahi', 'Khulna'], address: { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' }, hourlyRate: 750, availability: true, rating: 4.6, totalReviews: 127, isActive: true, isVerified: true },
  { name: 'Mahmud Hossain', email: 'guide5@gmail.com', password: '123456', phone: '01712345675', userType: 'guide', bio: 'Sundarbans expert and wildlife enthusiast.', experience: 9, languages: ['Bengali', 'English', 'Hindi'], specializations: ['Sundarbans Tours', 'Wildlife Tours', 'Mangrove Ecology', 'Bird Watching'], divisions: ['Khulna', 'Barisal'], address: { city: 'Khulna', district: 'Khulna', division: 'Khulna' }, hourlyRate: 850, availability: true, rating: 4.8, totalReviews: 174, isActive: true, isVerified: true },
  { name: 'Sharmin Islam', email: 'guide6@gmail.com', password: '123456', phone: '01812345676', userType: 'guide', bio: 'Food and culture tour specialist.', experience: 5, languages: ['Bengali', 'English'], specializations: ['Food Tours', 'Cultural Tours', 'Local Cuisine', 'Street Food'], divisions: ['Dhaka', 'Chittagong'], address: { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' }, hourlyRate: 650, availability: true, rating: 4.7, totalReviews: 89, isActive: true, isVerified: true },
  { name: 'Kamal Uddin', email: 'guide7@gmail.com', password: '123456', phone: '01912345677', userType: 'guide', bio: 'Archaeological sites and ancient history expert.', experience: 12, languages: ['Bengali', 'English', 'French'], specializations: ['Archaeological Sites', 'Ancient History', 'Museum Tours', 'UNESCO Sites'], divisions: ['Rajshahi', 'Rangpur', 'Dhaka'], address: { city: 'Bogra', district: 'Bogra', division: 'Rajshahi' }, hourlyRate: 950, availability: true, rating: 4.9, totalReviews: 245, isActive: true, isVerified: true },
  { name: 'Sultana Begum', email: 'guide8@gmail.com', password: '123456', phone: '01612345678', userType: 'guide', bio: 'Family-friendly tour specialist.', experience: 4, languages: ['Bengali', 'English'], specializations: ['Family Tours', 'Kid-Friendly Tours', 'Educational Tours', 'Theme Parks'], divisions: ['Dhaka', 'Chittagong', 'Sylhet'], address: { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' }, hourlyRate: 600, availability: true, rating: 4.8, totalReviews: 72, isActive: true, isVerified: true },
  { name: 'Rezaul Karim', email: 'guide9@gmail.com', password: '123456', phone: '01712345679', userType: 'guide', bio: 'Adventure sports and trekking guide.', experience: 6, languages: ['Bengali', 'English', 'Hindi'], specializations: ['Adventure Tours', 'Trekking', 'Water Sports', 'Rock Climbing'], divisions: ['Chittagong', 'Sylhet', 'Rangpur'], address: { city: 'Bandarban', district: 'Bandarban', division: 'Chittagong' }, hourlyRate: 800, availability: true, rating: 4.7, totalReviews: 115, isActive: true, isVerified: true },
  { name: 'Ayesha Siddiqua', email: 'guide10@gmail.com', password: '123456', phone: '01812345680', userType: 'guide', bio: 'Photography tour specialist and visual storytelling expert.', experience: 5, languages: ['Bengali', 'English', 'Japanese'], specializations: ['Photography Tours', 'Landscape Tours', 'Sunrise/Sunset Tours', 'Street Photography'], divisions: ['Dhaka', 'Barisal', 'Chittagong'], address: { city: 'Dhaka', district: 'Dhaka', division: 'Dhaka' }, hourlyRate: 750, availability: true, rating: 4.9, totalReviews: 142, isActive: true, isVerified: true }
];

const toursData = [
  { title: 'Sundarbans Mangrove Adventure', description: "Explore the world's largest mangrove forest and UNESCO World Heritage Site. Spot Royal Bengal Tigers, deer, crocodiles, and diverse bird species.", destination: 'Sundarbans, Khulna', duration: { days: 3, nights: 2 }, price: 8500, maxGroupSize: 15, category: 'Wildlife', difficulty: 'Moderate', includes: ['Boat transportation', 'Accommodation on boat/resort', 'All meals', 'Professional guide', 'Forest entry permits'], excludes: ['Personal expenses', 'Travel insurance', 'Tips for guides'], itinerary: [{ day: 1, title: 'Departure to Sundarbans', description: 'Journey from Dhaka to Mongla port', activities: ['Travel to Mongla', 'Board boat', 'Evening river cruise', 'Sunset viewing'] }, { day: 2, title: 'Deep Forest Exploration', description: 'Full day exploration', activities: ['Tiger tracking', 'Bird watching', 'Visit Hiron Point'] }, { day: 3, title: 'Return Journey', description: 'Morning walk and return', activities: ['Morning nature walk', 'Return to Dhaka'] }], featured: true, availableDates: [{ startDate: new Date('2026-08-15'), endDate: new Date('2026-08-17'), availableSlots: 15 }, { startDate: new Date('2026-09-10'), endDate: new Date('2026-09-12'), availableSlots: 15 }] },
  { title: "Cox's Bazar Beach Paradise", description: "Visit the world's longest natural sea beach stretching 120 km. Enjoy pristine sandy beaches, stunning sunsets, fresh seafood, and vibrant beach activities.", destination: "Cox's Bazar, Chittagong", duration: { days: 4, nights: 3 }, price: 12000, maxGroupSize: 20, category: 'Beach', difficulty: 'Easy', includes: ['AC bus transportation', '3-star hotel accommodation', 'Daily breakfast', 'Beach resort entry', 'Professional tour guide'], excludes: ['Lunch and dinner', 'Water sports', 'Personal shopping'], itinerary: [{ day: 1, title: "Arrival at Cox's Bazar", description: 'Travel and hotel check-in', activities: ['Departure from Dhaka', 'Hotel check-in', 'Evening beach walk', 'Sunset viewing'] }, { day: 2, title: 'Inani Beach & Himchari', description: 'Explore nearby attractions', activities: ['Himchari waterfall', 'Inani Beach', 'Marine Drive'] }, { day: 3, title: 'Saint Martin Island', description: 'Day trip to coral island', activities: ['Boat to Saint Martin', 'Island exploration', 'Coral viewing'] }, { day: 4, title: 'Departure', description: 'Return journey', activities: ['Morning beach walk', 'Return to Dhaka'] }], featured: true, availableDates: [{ startDate: new Date('2026-08-20'), endDate: new Date('2026-08-23'), availableSlots: 20 }, { startDate: new Date('2026-09-15'), endDate: new Date('2026-09-18'), availableSlots: 20 }] },
  { title: 'Sajek Valley Cloud Paradise', description: "Experience the 'Queen of Hills' with breathtaking views of clouds, mountains, and indigenous villages.", destination: 'Sajek Valley, Rangamati', duration: { days: 2, nights: 1 }, price: 6500, maxGroupSize: 18, category: 'Adventure', difficulty: 'Moderate', includes: ['Jeep transportation', 'Resort accommodation', 'All meals', 'Bonfire night', 'Local guide'], excludes: ['Transportation to Khagrachhari', 'Personal expenses'], itinerary: [{ day: 1, title: 'Journey to Sajek', description: 'Adventure drive through hills', activities: ['Jeep ride to Sajek', 'Helipad visit', 'Sunset viewing', 'Bonfire night'] }, { day: 2, title: 'Sunrise & Return', description: 'Early morning and departure', activities: ['Sunrise at Konglak Hill', 'Village tour', 'Return journey'] }], featured: true, availableDates: [{ startDate: new Date('2026-08-08'), endDate: new Date('2026-08-09'), availableSlots: 18 }] },
  { title: 'Srimangal Tea Garden Retreat', description: 'Explore the tea capital of Bangladesh with lush green tea gardens, Lawachara rainforest, and the famous seven-layer tea.', destination: 'Srimangal, Sylhet', duration: { days: 2, nights: 1 }, price: 5500, maxGroupSize: 20, category: 'Cultural', difficulty: 'Easy', includes: ['Train/bus transportation', 'Tea resort accommodation', 'All meals', 'Tea garden tour', 'Seven-layer tea tasting'], excludes: ['Personal shopping', 'Extra beverages'], itinerary: [{ day: 1, title: 'Tea Garden Experience', description: 'Arrival and exploration', activities: ['Tea garden walking tour', 'Visit tea factory', 'Seven-layer tea tasting'] }, { day: 2, title: 'Rainforest Adventure', description: 'Wildlife and return', activities: ['Lawachara forest walk', 'Spot Hoolock Gibbons', 'Return journey'] }], availableDates: [{ startDate: new Date('2026-08-14'), endDate: new Date('2026-08-15'), availableSlots: 20 }] },
  { title: 'Bandarban Hill Hiking Expedition', description: "Challenge yourself with Bangladesh's highest peaks and most scenic hill tracts. Trek through tribal villages and enjoy panoramic mountain views.", destination: 'Bandarban, Chittagong Hill Tracts', duration: { days: 3, nights: 2 }, price: 9500, maxGroupSize: 15, category: 'Adventure', difficulty: 'Challenging', includes: ['Jeep transportation', 'Hilltop resort accommodation', 'All meals', 'Trekking guide', 'Entry permits'], excludes: ['Personal hiking gear', 'Travel insurance'], itinerary: [{ day: 1, title: 'Nilgiri Hills', description: 'Arrival and hill exploration', activities: ['Visit Golden Temple', 'Jeep ride to Nilgiri', 'Sunset viewing'] }, { day: 2, title: 'Tribal Trek', description: 'Deep hill trekking', activities: ['Trek to Chimbuk Hill', 'Tribal interaction', 'Bonfire night'] }, { day: 3, title: 'Return Journey', description: 'Final sights', activities: ['Shoilo Propat waterfall', 'Return to Dhaka'] }], featured: true, availableDates: [{ startDate: new Date('2026-09-05'), endDate: new Date('2026-09-07'), availableSlots: 15 }] },
  { title: 'Dhaka Heritage Walk', description: 'Discover the rich history of Old Dhaka with Mughal-era monuments, traditional markets, and cultural landmarks.', destination: 'Old Dhaka, Dhaka', duration: { days: 1, nights: 0 }, price: 1500, maxGroupSize: 30, category: 'Historical', difficulty: 'Easy', includes: ['Walking tour guide', 'All entry fees', 'Traditional lunch', 'Rickshaw rides'], excludes: ['Personal shopping', 'Extra food'], itinerary: [{ day: 1, title: 'Old Dhaka Discovery', description: 'Full day heritage walk', activities: ['Lalbagh Fort', 'Ahsan Manzil', 'Sadarghat', 'Star Mosque'] }], availableDates: [{ startDate: new Date('2026-07-15'), endDate: new Date('2026-07-15'), availableSlots: 30 }, { startDate: new Date('2026-08-01'), endDate: new Date('2026-08-01'), availableSlots: 30 }] },
  { title: 'Rangamati Lake District Discovery', description: "Experience the 'Lake City' with its hanging bridge, Kaptai Lake, Buddhist temples, and indigenous culture.", destination: 'Rangamati, Chittagong Hill Tracts', duration: { days: 2, nights: 1 }, price: 5800, maxGroupSize: 20, category: 'Cultural', difficulty: 'Easy', includes: ['Bus transportation', 'Lake view resort', 'All meals', 'Speed boat tours', 'Hanging bridge visit'], excludes: ['Personal shopping', 'Additional boat rides'], itinerary: [{ day: 1, title: 'Lake Exploration', description: 'Arrival and lake activities', activities: ['Hanging bridge visit', 'Speed boat to Shuvolong', 'Buddhist temple'] }, { day: 2, title: 'Cultural Experience', description: 'Tribal culture', activities: ['Chakma village tour', 'Kaptai Dam viewing', 'Return journey'] }], availableDates: [{ startDate: new Date('2026-08-28'), endDate: new Date('2026-08-29'), availableSlots: 20 }] },
  { title: 'Kuakata Panoramic Sea Beach', description: "Experience the rare beauty of both sunrise and sunset from the same beach — the 'Daughter of the Sea'.", destination: 'Kuakata, Patuakhali', duration: { days: 3, nights: 2 }, price: 7500, maxGroupSize: 20, category: 'Beach', difficulty: 'Easy', includes: ['AC bus transportation', 'Beach resort accommodation', 'Daily breakfast', 'Guide service'], excludes: ['Lunch and dinner', 'Water sports'], itinerary: [{ day: 1, title: 'Arrival & Sunset', description: 'Journey to Kuakata', activities: ['Hotel check-in', 'Beach walk', 'Sunset viewing'] }, { day: 2, title: 'Full Day Exploration', description: 'Cultural and natural sights', activities: ['Sunrise viewing', 'Keranipara temple', 'Rakhine village tour'] }, { day: 3, title: 'Departure', description: 'Return', activities: ['Morning beach walk', 'Return to Dhaka'] }], availableDates: [{ startDate: new Date('2026-09-12'), endDate: new Date('2026-09-14'), availableSlots: 20 }] },
  { title: 'Paharpur Buddhist Vihara Heritage Tour', description: 'Visit the UNESCO World Heritage Site — one of the largest Buddhist monasteries south of the Himalayas.', destination: 'Paharpur, Naogaon', duration: { days: 2, nights: 1 }, price: 4500, maxGroupSize: 25, category: 'Historical', difficulty: 'Easy', includes: ['AC bus transportation', 'Hotel accommodation', 'Breakfast and dinner', 'Site entry fees', 'Professional guide'], excludes: ['Lunch', 'Souvenirs'], itinerary: [{ day: 1, title: 'Historical Exploration', description: 'Journey and site visit', activities: ['Explore Somapura Mahavihara', 'Museum visit', 'Terracotta art viewing'] }, { day: 2, title: 'Nearby Sites', description: 'Additional heritage sites', activities: ['Archaeological sites', 'Local village tour', 'Return to Dhaka'] }], availableDates: [{ startDate: new Date('2026-08-06'), endDate: new Date('2026-08-07'), availableSlots: 25 }] },
  { title: 'Ratargul Swamp Forest Expedition', description: "Discover Bangladesh's only freshwater swamp forest. Navigate through submerged trees by boat.", destination: 'Ratargul, Sylhet', duration: { days: 2, nights: 1 }, price: 4800, maxGroupSize: 16, category: 'Wildlife', difficulty: 'Easy', includes: ['AC bus transportation', 'Hotel accommodation in Sylhet', 'Breakfast and dinner', 'Boat ride in Ratargul'], excludes: ['Lunch', 'Camera fees'], itinerary: [{ day: 1, title: 'Sylhet Arrival', description: 'Journey and local sightseeing', activities: ['Ratargul boat tour', 'Floating through submerged forest', 'Jaflong visit'] }, { day: 2, title: 'Return Journey', description: 'Morning sightseeing', activities: ['Visit Hazrat Shah Jalal Mazar', 'Return to Dhaka'] }], availableDates: [{ startDate: new Date('2026-09-20'), endDate: new Date('2026-09-21'), availableSlots: 16 }] }
];

const couponsData = [
  { code: 'WELCOME2026', description: 'Welcome discount for new users - 15% off on all services', discountType: 'percentage', discountValue: 15, serviceTypes: ['all'], minPurchaseAmount: 2000, maxDiscountAmount: 1000, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), usageLimit: 100, isActive: true },
  { code: 'SUMMER50', description: 'Summer special - ৳500 off on tours', discountType: 'fixed', discountValue: 500, serviceTypes: ['tour'], minPurchaseAmount: 3000, validFrom: new Date('2026-06-01'), validTo: new Date('2026-09-30'), usageLimit: 50, isActive: true },
  { code: 'HOTEL20', description: '20% discount on hotel bookings', discountType: 'percentage', discountValue: 20, serviceTypes: ['hotel'], minPurchaseAmount: 5000, maxDiscountAmount: 2000, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), isActive: true },
  { code: 'BUS100', description: 'Bus travel discount - ৳100 off', discountType: 'fixed', discountValue: 100, serviceTypes: ['bus'], minPurchaseAmount: 500, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), usageLimit: 200, isActive: true },
  { code: 'MEGA25', description: 'Mega sale - 25% off on tours and hotels', discountType: 'percentage', discountValue: 25, serviceTypes: ['tour', 'hotel'], minPurchaseAmount: 10000, maxDiscountAmount: 3000, validFrom: new Date('2026-06-01'), validTo: new Date('2026-12-31'), usageLimit: 30, isActive: true },
  { code: 'GUIDE50', description: 'Guide booking special - ৳50 off', discountType: 'fixed', discountValue: 50, serviceTypes: ['guide'], minPurchaseAmount: 300, validFrom: new Date('2026-01-01'), validTo: new Date('2026-12-31'), isActive: true }
];

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('✅ Connected\n');

  // 1. Admin user
  console.log('👤 Setting up admin user...');
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
    console.log('   Created admin — email: admin@roamingsonic.com  password: Admin@123');
  } else {
    console.log('   Admin already exists, skipping');
  }

  // 2. Hotels
  console.log('\n🏨 Seeding hotels...');
  await Hotel.deleteMany({});
  const hotelsWithOwner = hotelsData.map(h => ({ ...h, owner: admin._id }));
  const hotels = await Hotel.insertMany(hotelsWithOwner);
  console.log(`   ✅ ${hotels.length} hotels added`);

  // 3. Buses
  console.log('\n🚌 Seeding buses...');
  await Bus.deleteMany({});
  const buses = await Bus.insertMany(busesData);
  console.log(`   ✅ ${buses.length} buses added`);

  // 4. Guides (use save() so password pre-save hook hashes the password)
  console.log('\n🧭 Seeding guides...');
  await User.deleteMany({ email: { $in: guidesData.map(g => g.email) } });
  let guideCount = 0;
  for (const g of guidesData) {
    const guide = new User(g);
    await guide.save();
    guideCount++;
  }
  console.log(`   ✅ ${guideCount} guides added`);

  // 5. Tours (require admin)
  console.log('\n🗺️  Seeding tours...');
  await TourPackage.deleteMany({});
  const toursWithCreator = toursData.map(t => ({ ...t, createdBy: admin._id }));
  const tours = await TourPackage.insertMany(toursWithCreator);
  console.log(`   ✅ ${tours.length} tours added`);

  // 6. Coupons
  console.log('\n🎟️  Seeding coupons...');
  await Coupon.deleteMany({});
  const couponsWithCreator = couponsData.map(c => ({ ...c, createdBy: admin._id }));
  const coupons = await Coupon.insertMany(couponsWithCreator);
  console.log(`   ✅ ${coupons.length} coupons added`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Production database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Hotels : ${hotels.length}`);
  console.log(`   Buses  : ${buses.length}`);
  console.log(`   Guides : ${guideCount}`);
  console.log(`   Tours  : ${tours.length}`);
  console.log(`   Coupons: ${coupons.length}`);
  console.log('\n🔑 Admin login:  admin@roamingsonic.com  /  Admin@123');
  console.log('🔑 Guide login:  guide1@gmail.com  /  123456  (guide1-10)\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err.message);
  process.exit(1);
});
