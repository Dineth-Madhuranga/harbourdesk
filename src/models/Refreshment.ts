import mongoose from 'mongoose';

const RefreshmentItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ordered: { type: Number, default: 0 },
  used: { type: Number, default: 0 },
});

const RefreshmentSchema = new mongoose.Schema({
  meetingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Meeting', required: true, unique: true },
  items: [RefreshmentItemSchema],
}, { timestamps: true });

export default mongoose.models.Refreshment || mongoose.model('Refreshment', RefreshmentSchema);
