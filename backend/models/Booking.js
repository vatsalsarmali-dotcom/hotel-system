const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  checkInDate: {
    type: Date,
    required: [true, 'Please provide check-in date']
  },
  checkOutDate: {
    type: Date,
    required: [true, 'Please provide check-out date']
  },
  numberOfGuests: {
    type: Number,
    required: true,
    default: 1
  },
  numberOfNights: Number,
  totalPrice: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled'],
    default: 'Pending'
  },
  specialRequests: String,
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partial', 'Paid', 'Refunded'],
    default: 'Pending'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Generate booking number before saving
bookingSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  const count = await mongoose.model('Booking').countDocuments();
  this.bookingNumber = `BK${Date.now()}${count + 1}`;
  
  // Calculate number of nights
  const nights = Math.ceil((this.checkOutDate - this.checkInDate) / (1000 * 60 * 60 * 24));
  this.numberOfNights = nights > 0 ? nights : 1;
  
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
