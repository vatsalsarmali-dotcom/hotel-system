const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const { auth, authorize } = require('../middleware/auth');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const filter = { isActive: true };
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const rooms = await Room.find(filter);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create room (admin only)
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json({
      message: 'Room created successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update room (admin only)
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({
      message: 'Room updated successfully',
      room
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete room (admin only)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update room status
router.patch('/:id/status', auth, authorize('admin', 'receptionist'), async (req, res) => {
  try {
    const { status } = req.body;
    const room = await Room.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    res.json({
      message: 'Room status updated',
      room
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
