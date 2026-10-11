const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Please provide room number'],
    unique: true
  },
  type: {
    type: String,
    enum: ['Standard', 'Deluxe', 'Suite'],
    required: true
  },
  floor: {
    type: Number,
    required: true
  },
  capacity: {
    type: Number,
    required: true,
    default: 2
  },
  pricePerNight: {
    type: Number,
    required: [true, 'Please provide price per night']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance'],
    default: 'Available'
  },
  amenities: [String],
  description: String,
  images: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Room', roomSchema);
