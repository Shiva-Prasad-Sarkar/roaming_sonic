const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { uploadToCloudinary } = require('../config/cloudinary');

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Hotel Owner, Admin)
exports.createHotel = async (req, res) => {
  try {
    console.log('=== CREATE HOTEL REQUEST ===');
    console.log('Files:', req.files?.length || 0);
    console.log('Body keys:', Object.keys(req.body));
    
    // Parse JSON fields from FormData
    const hotelData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      phone: req.body.phone,
      email: req.body.email,
      website: req.body.website,
      checkInTime: req.body.checkInTime,
      checkOutTime: req.body.checkOutTime,
      owner: req.user._id
    };

    // Parse JSON strings
    try {
      if (req.body.address) hotelData.address = JSON.parse(req.body.address);
      if (req.body.location) hotelData.location = JSON.parse(req.body.location);
      if (req.body.facilities) hotelData.facilities = JSON.parse(req.body.facilities);
      if (req.body.refundPolicy) hotelData.refundPolicy = JSON.parse(req.body.refundPolicy);
      if (req.body.rooms) hotelData.rooms = JSON.parse(req.body.rooms);
      if (req.body.amenities) hotelData.amenities = JSON.parse(req.body.amenities);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      return res.status(400).json({
        success: false,
        message: 'Invalid data format',
        error: parseError.message
      });
    }

    // Handle uploaded photos
    if (req.files && req.files.length > 0) {
      hotelData.photos = await Promise.all(req.files.map(async (file, index) => {
        const result = await uploadToCloudinary(file.buffer, 'roaming-sonic/hotels');
        return {
          url: result.secure_url,
          caption: req.body[`photoCaption${index}`] || '',
          type: req.body[`photoType${index}`] || 'hotel'
        };
      }));
    }

    console.log('Hotel data to create:', JSON.stringify(hotelData, null, 2));

    const hotel = await Hotel.create(hotelData);

    // Add hotel to owner's hotels array
    await User.findByIdAndUpdate(req.user._id, {
      $push: { hotels: hotel._id }
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Create hotel error:', error);
    console.error('Error details:', error.errors);
    res.status(500).json({
      success: false,
      message: 'Failed to create hotel',
      error: error.message,
      details: error.errors ? Object.keys(error.errors).map(key => ({
        field: key,
        message: error.errors[key].message
      })) : undefined
    });
  }
};

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getAllHotels = async (req, res) => {
  try {
    const { city, district, division, category, minPrice, maxPrice, minRating, facilities } = req.query;
    
    let query = { 
      isActive: true,
      isVerified: true,
      verificationStatus: 'approved'
    };

    // Filters
    if (city) query['address.city'] = new RegExp(city, 'i');
    if (district) query['address.district'] = new RegExp(district, 'i');
    if (division) query['address.division'] = division;
    if (category) query.category = category;
    
    // Rating filter
    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }
    
    // Facilities filter
    if (facilities) {
      const facilitiesArray = facilities.split(',');
      query.facilities = { $all: facilitiesArray };
    }

    let hotels = await Hotel.find(query)
      .populate('owner', 'name email phone')
      .select('-reviews')
      .sort('-rating -createdAt');

    // Filter by price range if specified
    if (minPrice || maxPrice) {
      hotels = hotels.filter(hotel => {
        if (!hotel.rooms || hotel.rooms.length === 0) return false;
        
        const minRoomPrice = Math.min(...hotel.rooms.map(room => room.pricePerNight));
        
        if (minPrice && minRoomPrice < Number(minPrice)) return false;
        if (maxPrice && minRoomPrice > Number(maxPrice)) return false;
        
        return true;
      });
    }

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: error.message
    });
  }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('owner', 'name email phone businessName')
      .populate('reviews.user', 'name photo');

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      data: hotel
    });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotel',
      error: error.message
    });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Hotel Owner - own hotel, Admin)
exports.updateHotel = async (req, res) => {
  try {
    let hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this hotel'
      });
    }

    // Parse JSON fields from FormData
    const updateData = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      phone: req.body.phone,
      email: req.body.email,
      website: req.body.website,
      checkInTime: req.body.checkInTime,
      checkOutTime: req.body.checkOutTime
    };

    // Parse JSON strings
    if (req.body.address) updateData.address = JSON.parse(req.body.address);
    if (req.body.location) updateData.location = JSON.parse(req.body.location);
    if (req.body.facilities) updateData.facilities = JSON.parse(req.body.facilities);
    if (req.body.refundPolicy) updateData.refundPolicy = JSON.parse(req.body.refundPolicy);
    if (req.body.rooms) updateData.rooms = JSON.parse(req.body.rooms);
    if (req.body.amenities) updateData.amenities = JSON.parse(req.body.amenities);

    // Handle uploaded photos
    if (req.files && req.files.length > 0) {
      const newPhotos = await Promise.all(req.files.map(async (file, index) => {
        const result = await uploadToCloudinary(file.buffer, 'roaming-sonic/hotels');
        return {
          url: result.secure_url,
          caption: req.body[`photoCaption${index}`] || '',
          type: req.body[`photoType${index}`] || 'hotel'
        };
      }));
      
      // If keepExisting is true, merge with existing photos
      if (req.body.keepExistingPhotos === 'true' && hotel.photos) {
        updateData.photos = [...hotel.photos, ...newPhotos].slice(0, 5);
      } else {
        updateData.photos = newPhotos;
      }
    }

    hotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      message: 'Hotel updated successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update hotel',
      error: error.message
    });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Hotel Owner - own hotel, Admin)
exports.deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check ownership
    if (hotel.owner.toString() !== req.user._id.toString() && req.user.userType !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this hotel'
      });
    }

    await Hotel.findByIdAndDelete(req.params.id);

    // Remove from owner's hotels array
    await User.findByIdAndUpdate(hotel.owner, {
      $pull: { hotels: req.params.id }
    });

    res.status(200).json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete hotel',
      error: error.message
    });
  }
};

// @desc    Get hotels by owner
// @route   GET /api/hotels/my-hotels
// @access  Private (Hotel Owner)
exports.getMyHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ owner: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Get my hotels error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your hotels',
      error: error.message
    });
  }
};

// @desc    Add review to hotel
// @route   POST /api/hotels/:id/reviews
// @access  Private (Tourist)
exports.addHotelReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check if already reviewed
    const alreadyReviewed = hotel.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }

    const review = {
      user: req.user._id,
      rating,
      comment
    };

    hotel.reviews.push(review);
    hotel.calculateAverageRating();

    await hotel.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};

// @desc    Toggle hotel verification status
// @route   PUT /api/hotels/:id/verify
// @access  Private (Admin)
exports.toggleVerification = async (req, res) => {
  try {
    const { verificationStatus } = req.body;

    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus,
        isVerified: verificationStatus === 'approved'
      },
      { new: true }
    );

    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Hotel ${verificationStatus}`,
      data: hotel
    });
  } catch (error) {
    console.error('Verify hotel error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update verification status',
      error: error.message
    });
  }
};

// @desc    Get all hotels for admin (including pending)
// @route   GET /api/hotels/admin/all
// @access  Private (Admin)
exports.getAllHotelsAdmin = async (req, res) => {
  try {
    const hotels = await Hotel.find()
      .populate('owner', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: hotels.length,
      data: hotels
    });
  } catch (error) {
    console.error('Get all hotels admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch hotels',
      error: error.message
    });
  }
};

// @desc    Add review to hotel
// @route   POST /api/hotels/:id/reviews
// @access  Private (Tourist)
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const hotelId = req.params.id;
    
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5'
      });
    }

    const hotel = await Hotel.findById(hotelId);
    
    if (!hotel) {
      return res.status(404).json({
        success: false,
        message: 'Hotel not found'
      });
    }

    // Check if user already reviewed this hotel
    const existingReview = hotel.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      existingReview.date = Date.now();
    } else {
      // Add new review
      hotel.reviews.push({
        user: req.user._id,
        rating,
        comment,
        date: Date.now()
      });
    }

    // Recalculate average rating
    hotel.calculateAverageRating();
    
    await hotel.save();
    
    // Populate user data in the response
    await hotel.populate('reviews.user', 'name');

    res.status(200).json({
      success: true,
      message: existingReview ? 'Review updated successfully' : 'Review added successfully',
      data: hotel
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add review',
      error: error.message
    });
  }
};
