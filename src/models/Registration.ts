import mongoose from 'mongoose';

const RegistrationSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  position: { type: String },
  contact: { type: String },
  checkedIn: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Registration || mongoose.model('Registration', RegistrationSchema);
