const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  roomCharges: {
    type: Number,
    required: true
  },
  additionalCharges: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  pendingAmount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Paid', 'Partially Paid', 'Cancelled'],
    default: 'Draft'
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: Date,
  notes: String,
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Generate invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (!this.isNew) return next();
  
  const count = await mongoose.model('Invoice').countDocuments();
  this.invoiceNumber = `INV${Date.now()}${count + 1}`;
  
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
