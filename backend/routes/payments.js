const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { auth, authorize } = require('../middleware/auth');

// Get all payments
router.get('/', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('booking')
      .populate('guest')
      .sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('booking')
      .populate('guest');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create payment
router.post('/', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { booking, guest, amount, paymentMethod, description } = req.body;
    
    // Get booking to verify amount
    const bookingData = await Booking.findById(booking);
    if (!bookingData) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    const payment = new Payment({
      booking,
      guest,
      amount,
      paymentMethod,
      description,
      status: 'Completed',
      processedBy: req.user.id
    });
    
    await payment.save();
    
    // Update booking payment status
    const totalPayments = await Payment.aggregate([
      { $match: { booking: require('mongoose').Types.ObjectId(booking), status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalPaid = totalPayments[0]?.total || 0;
    let paymentStatus = 'Pending';
    if (totalPaid >= bookingData.totalPrice) paymentStatus = 'Paid';
    else if (totalPaid > 0) paymentStatus = 'Partial';
    
    await Booking.findByIdAndUpdate(booking, { paymentStatus });
    
    await payment.populate(['booking', 'guest']);
    
    res.status(201).json({
      message: 'Payment recorded successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get payments by booking
router.get('/booking/:bookingId', auth, async (req, res) => {
  try {
    const payments = await Payment.find({ booking: req.params.bookingId })
      .populate('guest');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
