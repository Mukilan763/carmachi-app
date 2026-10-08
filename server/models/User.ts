import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  garage: [{ type: String }], // Array of car IDs
}, { timestamps: true });

export default mongoose.model('User', userSchema);
