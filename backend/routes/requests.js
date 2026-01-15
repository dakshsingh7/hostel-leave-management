import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all leave requests (with filters)
router.get('/', authenticate, async (req, res) => {
  try {
    const { studentEmail, status, role } = req.query;
    const query = {};

    // Students can only see their own requests
    if (req.user.role === 'student') {
      query.studentEmail = req.user.email;
    } else if (studentEmail) {
      query.studentEmail = studentEmail;
    }

    if (status) {
      query.status = status;
    }

    const requests = await LeaveRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name email');

    res.json(requests);
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single leave request by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id)
      .populate('approvedBy', 'name email');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Students can only view their own requests
    if (req.user.role === 'student' && request.studentEmail !== req.user.email) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(request);
  } catch (error) {
    console.error('Get request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new leave request (students only)
router.post('/', authenticate, requireRole('student'), async (req, res) => {
  try {
    const { fromDate, toDate } = req.body;

    if (!fromDate || !toDate) {
      return res.status(400).json({ error: 'From date and to date are required' });
    }

    const leaveRequest = new LeaveRequest({
      studentEmail: req.user.email,
      fromDate,
      toDate,
      status: 'pending',
      movement: 'in'
    });

    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update leave request (approve/reject by warden, movement by security)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { status, movement } = req.body;
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Warden can approve/reject
    if (req.user.role === 'warden') {
      if (status === 'approved' || status === 'rejected') {
        request.status = status;
        if (status === 'approved') {
          request.approvedAt = new Date();
          request.approvedBy = req.user.id;
          request.movement = 'in'; // Reset to 'in' when approved
        }
      } else {
        return res.status(400).json({ error: 'Invalid status for warden' });
      }
    }
    // Security can update movement
    else if (req.user.role === 'security') {
      if (movement === 'in' || movement === 'out') {
        if (request.status !== 'approved') {
          return res.status(400).json({ error: 'Can only update movement for approved requests' });
        }
        request.movement = movement;
      } else {
        return res.status(400).json({ error: 'Invalid movement value' });
      }
    }
    // Students can only view, not update
    else if (req.user.role === 'student') {
      return res.status(403).json({ error: 'Students cannot update requests' });
    }

    await request.save();
    res.json(request);
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete leave request (optional - students can delete their own pending requests)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const request = await LeaveRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Only students can delete their own pending requests
    if (req.user.role === 'student') {
      if (request.studentEmail !== req.user.email) {
        return res.status(403).json({ error: 'Access denied' });
      }
      if (request.status !== 'pending') {
        return res.status(400).json({ error: 'Can only delete pending requests' });
      }
    }

    await LeaveRequest.findByIdAndDelete(req.params.id);
    res.json({ message: 'Request deleted successfully' });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

