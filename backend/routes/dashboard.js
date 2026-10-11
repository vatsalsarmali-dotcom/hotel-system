const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const Guest = require('../models/Guest');
const { auth, authorize } = require('../middleware/auth');

// Get dashboard stats
router.get('/stats', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Total revenue
    const revenueData = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueData[0]?.total || 0;
    
    // Today's revenue
    const todayRevenueData = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paymentDate: { $gte: today, $lt: tomorrow }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const todayRevenue = todayRevenueData[0]?.total || 0;
    
    // Total bookings
    const totalBookings = await Booking.countDocuments();
    
    // Today's checkouts
    const todayCheckouts = await Booking.countDocuments({
      checkOutDate: { $gte: today, $lt: tomorrow },
      status: { $in: ['Checked-In', 'Checked-Out'] }
    });
    
    // Occupied rooms
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const totalRooms = await Room.countDocuments({ isActive: true });
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    // Total guests
    const totalGuests = await Guest.countDocuments();
    
    res.json({
      totalRevenue,
      todayRevenue,
      totalBookings,
      todayCheckouts,
      occupiedRooms,
      occupancyRate,
      totalRooms,
      totalGuests
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent bookings
router.get('/recent-bookings', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('guest')
      .populate('room')
      .sort({ createdAt: -1 })
      .limit(10);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get revenue by date range
router.get('/revenue/:startDate/:endDate', auth, authorize('admin'), async (req, res) => {
  try {
    const startDate = new Date(req.params.startDate);
    const endDate = new Date(req.params.endDate);
    
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          paymentDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.json(revenue);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get occupancy status
router.get('/occupancy', auth, async (req, res) => {
  try {
    const roomStatus = await Room.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json(roomStatus);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
