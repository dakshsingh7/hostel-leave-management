import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
  studentEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  fromDate: {
    type: String,
    required: true
  },
  toDate: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  movement: {
    type: String,
    enum: ['in', 'out'],
    default: 'in'
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

export default mongoose.model('LeaveRequest', leaveRequestSchema);

