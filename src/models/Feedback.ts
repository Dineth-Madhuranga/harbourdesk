import mongoose from 'mongoose';

const FeedbackSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true },
  name: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
}, { timestamps: true });

export default mongoose.models.Feedback || mongoose.model('Feedback', FeedbackSchema);
