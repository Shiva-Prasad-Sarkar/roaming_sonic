const Bus = require('../models/Bus');

// @desc    Get all buses with filters
// @route   GET /api/buses
// @access  Public
exports.getAllBuses = async (req, res) => {
  try {
    const {
      from,
      to,
      busType,
      date,
      minFare,
      maxFare,
      minRating,
      amenities,
      sort
    } = req.query;

    // Build query
    let query = { status: 'active' };

    if (from) {
      query.from = { $regex: from, $options: 'i' };
    }

    if (to) {
      query.to = { $regex: to, $options: 'i' };
    }

    if (busType) {
      query.busType = busType;
    }

    if (minFare || maxFare) {
      query.fare = {};
      if (minFare) query.fare.$gte = Number(minFare);
      if (maxFare) query.fare.$lte = Number(maxFare);
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { $all: amenitiesArray };
    }

    // Check day of week for schedule
    if (date) {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      query.schedule = dayOfWeek;
    }

    // Sort
    let sortOption = {};
    if (sort === 'price_low') {
      sortOption.fare = 1;
    } else if (sort === 'price_high') {
      sortOption.fare = -1;
    } else if (sort === 'rating') {
      sortOption.rating = -1;
    } else {
      sortOption.departureTime = 1;
    }

    const buses = await Bus.find(query).sort(sortOption);

    // Always compute available seats from daily seat data.
    // Use the requested date if provided, otherwise fall back to today so
    // seat counts reflect actual bookings even when no date filter is active.
    const targetDate = date || new Date().toISOString().split('T')[0];
    const busesWithAvailability = buses.map(bus => {
      const busObj = bus.toObject();
      const availability = bus.getSeatAvailability(targetDate);
      busObj.availableSeats = availability.availableSeats.length;
      return busObj;
    });

    res.status(200).json({
      success: true,
      count: busesWithAvailability.length,
      data: busesWithAvailability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching buses',
      error: error.message
    });
  }
};

// @desc    Get single bus
// @route   GET /api/buses/:id
// @access  Public
exports.getBusById = async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id).populate('reviews.user', 'name');

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bus',
      error: error.message
    });
  }
};

// @desc    Add bus review
// @route   POST /api/buses/:id/review
// @access  Private (Tourist)
exports.addBusReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating and comment'
      });
    }

    const bus = await Bus.findById(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    // Check if user has booked this bus
    const Booking = require('../models/Booking');
    const hasBooked = await Booking.findOne({
      user: req.user._id,
      bus: req.params.id,
      bookingType: 'bus',
      status: { $in: ['confirmed', 'completed'] }
    });

    if (!hasBooked) {
      return res.status(403).json({
        success: false,
        message: 'You can only review buses you have booked'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = bus.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this bus'
      });
    }

    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    bus.reviews.push(review);
    bus.calculateAverageRating();

    await bus.save();

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: bus
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
};

// @desc    Get popular routes
// @route   GET /api/buses/routes/popular
// @access  Public
exports.getPopularRoutes = async (req, res) => {
  try {
    const routes = await Bus.aggregate([
      { $match: { status: 'active' } },
      {
        $group: {
          _id: { from: '$from', to: '$to' },
          count: { $sum: 1 },
          minFare: { $min: '$fare' },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.status(200).json({
      success: true,
      data: routes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching popular routes',
      error: error.message
    });
  }
};

// @desc    Create new bus
// @route   POST /api/buses
// @access  Private (Admin)
exports.createBus = async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Bus created successfully',
      data: bus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating bus',
      error: error.message
    });
  }
};

// @desc    Update bus
// @route   PUT /api/buses/:id
// @access  Private (Admin)
exports.updateBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus updated successfully',
      data: bus
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating bus',
      error: error.message
    });
  }
};

// @desc    Delete bus
// @route   DELETE /api/buses/:id
// @access  Private (Admin)
exports.deleteBus = async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);

    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bus deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bus',
      error: error.message
    });
  }
};

// @desc    Get seat availability for a bus on a specific date
// @route   GET /api/buses/:id/seats/:date
// @access  Public
exports.getSeatAvailability = async (req, res) => {
  try {
    const { id, date } = req.params;
    
    const bus = await Bus.findById(id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }
    
    // Ensure seat map is initialized
    if (!bus.seatMap || bus.seatMap.length === 0) {
      bus.initializeSeatMap();
      await bus.save();
    }
    
    const availability = bus.getSeatAvailability(date);
    
    res.status(200).json({
      success: true,
      data: {
        seatMap: bus.seatMap,
        seatLayout: bus.seatLayout,
        availableSeats: availability.availableSeats,
        bookedSeats: availability.bookedSeats,
        totalSeats: bus.totalSeats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching seat availability',
      error: error.message
    });
  }
};

// @desc    Book bus seats
// @route   POST /api/buses/:id/book
// @access  Private
exports.bookBusSeats = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      date, 
      seatNumbers, 
      passengerName, 
      passengerPhone, 
      passengerEmail, 
      boardingPoint,
      paymentMethod,
      transactionId,
      paymentDetails,
      couponCode,
      originalAmount,
      discountAmount
    } = req.body;
    
    if (!seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select at least one seat'
      });
    }

    if (!paymentMethod || !transactionId) {
      return res.status(400).json({
        success: false,
        message: 'Payment information is required'
      });
    }
    
    const bus = await Bus.findById(id);
    
    if (!bus) {
      return res.status(404).json({
        success: false,
        message: 'Bus not found'
      });
    }
    
    // Check seat availability
    const availability = bus.getSeatAvailability(date);
    const unavailableSeats = seatNumbers.filter(sn => !availability.availableSeats.includes(sn));
    
    if (unavailableSeats.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Seats ${unavailableSeats.join(', ')} are no longer available. Please refresh and try again.`
      });
    }
    
    // Calculate total amount
    let totalAmount = bus.fare * seatNumbers.length;
    
    // Apply coupon discount if provided
    if (couponCode && discountAmount) {
      totalAmount = originalAmount - discountAmount;
    }
    
    // Create booking
    const Booking = require('../models/Booking');
    const bookingData = {
      user: req.user._id,
      bookingType: 'bus',
      bus: bus._id,
      travelDate: new Date(date),
      seatNumbers: seatNumbers,
      numberOfSeats: seatNumbers.length,
      passengerName: passengerName || req.user.name,
      passengerPhone: passengerPhone || req.user.phone,
      passengerEmail: passengerEmail || req.user.email,
      boardingPoint: boardingPoint,
      totalAmount: totalAmount,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      paymentStatus: 'paid',
      status: 'confirmed'
    };

    // Add payment details if provided
    if (paymentDetails) {
      bookingData.paymentDetails = paymentDetails;
    }

    // Add coupon information if used
    if (couponCode) {
      bookingData.couponCode = couponCode;
      bookingData.originalAmount = originalAmount;
      bookingData.discountAmount = discountAmount;
    }

    const booking = await Booking.create(bookingData);
    
    // Book seats in bus and save
    await bus.bookSeats(date, seatNumbers, booking._id, passengerName || req.user.name);
    
    // Verify seats were booked
    const updatedBus = await Bus.findById(id);
    const verifyAvailability = updatedBus.getSeatAvailability(date);
    console.log('After booking - Booked seats:', verifyAvailability.bookedSeats);
    
    // Populate booking details
    const populatedBooking = await Booking.findById(booking._id)
      .populate('bus', 'name busNumber from to departureTime arrivalTime');
    
    res.status(201).json({
      success: true,
      message: 'Bus seats booked successfully',
      data: populatedBooking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error booking bus seats',
      error: error.message
    });
  }
};
