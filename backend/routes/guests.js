const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const { auth, authorize } = require('../middleware/auth');

// Get all guests
router.get('/', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const guests = await Guest.find().sort({ createdAt: -1 });
    res.json(guests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guest by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json(guest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create guest
router.post('/', async (req, res) => {
  try {
    const guest = new Guest(req.body);
    await guest.save();
    res.status(201).json({
      message: 'Guest registered successfully',
      guest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update guest
router.put('/:id', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({
      message: 'Guest updated successfully',
      guest
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete guest
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json({ message: 'Guest deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get guest by email
router.get('/search/by-email', auth, async (req, res) => {
  try {
    const { email } = req.query;
    const guest = await Guest.findOne({ email });
    if (!guest) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json(guest);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
