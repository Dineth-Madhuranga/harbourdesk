import mongoose from 'mongoose';

const AccountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  department: { type: String, required: true },
  email: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Account || mongoose.model('Account', AccountSchema);
