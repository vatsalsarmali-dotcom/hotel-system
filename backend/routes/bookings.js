const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Guest = require('../models/Guest');
const Room = require('../models/Room');
const { auth, authorize } = require('../middleware/auth');

// Get all bookings
router.get('/', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guest')
      .populate('room')
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get booking by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('guest')
      .populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
router.post('/', async (req, res) => {
  try {
    const { guest, room, checkInDate, checkOutDate, numberOfGuests, specialRequests } = req.body;
    
    // Check room availability
    const existingBooking = await Booking.findOne({
      room,
      status: { $in: ['Confirmed', 'Checked-In'] },
      $or: [
        { checkInDate: { $lt: checkOutDate }, checkOutDate: { $gt: checkInDate } }
      ]
    });
    
    if (existingBooking) {
      return res.status(400).json({ error: 'Room not available for selected dates' });
    }
    
    // Get room details for price calculation
    const roomData = await Room.findById(room);
    const nights = Math.ceil((new Date(checkOutDate) - new Date(checkInDate)) / (1000 * 60 * 60 * 24));
    const totalPrice = roomData.pricePerNight * nights;
    
    const booking = new Booking({
      guest,
      room,
      checkInDate,
      checkOutDate,
      numberOfGuests,
      totalPrice,
      specialRequests,
      createdBy: req.user?.id
    });
    
    await booking.save();
    await booking.populate(['guest', 'room']);
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
router.put('/:id', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('guest')
      .populate('room');
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    res.json({
      message: 'Booking updated successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-in
router.patch('/:id/check-in', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Checked-In' },
      { new: true }
    ).populate(['guest', 'room']);
    
    // Update room status
    await Room.findByIdAndUpdate(booking.room._id, { status: 'Occupied' });
    
    res.json({
      message: 'Guest checked in successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check-out
router.patch('/:id/check-out', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Checked-Out' },
      { new: true }
    ).populate(['guest', 'room']);
    
    // Update room status to cleaning
    await Room.findByIdAndUpdate(booking.room._id, { status: 'Cleaning' });
    
    // Update guest visit count
    await Guest.findByIdAndUpdate(
      booking.guest._id,
      { $inc: { numberOfVisits: 1, totalSpent: booking.totalPrice } }
    );
    
    res.json({
      message: 'Guest checked out successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Cancel booking
router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'Cancelled' },
      { new: true }
    ).populate(['guest', 'room']);
    
    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
