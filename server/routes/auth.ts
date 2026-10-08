import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    // Create token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.json({ token, user: { id: newUser._id, name: newUser.name, email: newUser.email, garage: newUser.garage } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '7d' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email, garage: user.garage } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to verify token (export for other routes to use)
export const verifyToken = (req: any, res: any, next: any) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: 'Invalid token' });
  }
};

// Sync Garage
router.post('/garage/sync', verifyToken, async (req: any, res: any) => {
  try {
    const { garage } = req.body; // Array of car IDs
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.garage = garage;
    await user.save();
    
    res.json({ message: 'Garage synced', garage: user.garage });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
