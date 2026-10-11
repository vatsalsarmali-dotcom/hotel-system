const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide first name']
  },
  lastName: {
    type: String,
    required: [true, 'Please provide last name']
  },
  email: {
    type: String,
    required: [true, 'Please provide email'],
    lowercase: true
  },
  phone: {
    type: String,
    required: true
  },
  address: String,
  city: String,
  country: String,
  idType: {
    type: String,
    enum: ['Passport', 'Driving License', 'National ID', 'Visa'],
    required: true
  },
  idNumber: {
    type: String,
    required: true
  },
  dateOfBirth: Date,
  numberOfVisits: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Guest', guestSchema);
