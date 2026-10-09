import mongoose from 'mongoose';

const MeetingSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  department: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  locationType: { type: String, required: true },
  location: { type: String },
  onlineLink: { type: String },
  description: { type: String },
  notifyEmails: { type: String },
  hostName: { type: String },
  hostPosition: { type: String },
  hostContact: { type: String },
  discussionSummary: { type: String, default: '' },
  suggestions: { type: String, default: '' },
  furtherNotes: { type: String, default: '' },
  createdBy: { type: String, required: true },
}, { timestamps: true });

export default mongoose.models.Meeting || mongoose.model('Meeting', MeetingSchema);
