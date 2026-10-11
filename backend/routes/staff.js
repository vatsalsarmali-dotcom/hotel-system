const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');

// Get all staff
router.get('/', auth, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.find()
      .populate('user')
      .populate('assignedRooms')
      .sort({ joinDate: -1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id)
      .populate('user')
      .populate('assignedRooms');
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add staff
router.post('/', auth, authorize('admin'), async (req, res) => {
  try {
    const { user, department, position, salary, joinDate } = req.body;
    
    const staff = new Staff({
      user,
      department,
      position,
      salary,
      joinDate
    });
    
    await staff.save();
    await staff.populate('user');
    
    res.status(201).json({
      message: 'Staff added successfully',
      staff
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff
router.put('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('user')
      .populate('assignedRooms');
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({
      message: 'Staff updated successfully',
      staff
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign rooms to staff
router.patch('/:id/assign-rooms', auth, authorize('admin'), async (req, res) => {
  try {
    const { roomIds } = req.body;
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      { assignedRooms: roomIds },
      { new: true }
    ).populate(['user', 'assignedRooms']);
    
    res.json({
      message: 'Rooms assigned successfully',
      staff
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete staff
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ message: 'Staff deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
