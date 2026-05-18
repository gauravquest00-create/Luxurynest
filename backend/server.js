import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// Routes
import projectRoutes from './routes/projectRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import areaRoutes from './routes/areaRoutes.js';

dotenv.config();
connectDB();

const app = express();


// ✅ FIXED CORS (VERY IMPORTANT)
app.use(cors({
  origin: [
    'https://luxurynest.vercel.app', // frontend
    'http://localhost:3000'          // local dev
  ],
  credentials: true
}));

app.use(express.json());


// ✅ Path setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ✅ Static Admin Panel
app.use('/luxuryadmin', express.static(path.join(__dirname, 'admin')));


// ✅ Static Uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ✅ API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/leads', leadRoutes);

app.use('/api/admin', adminRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/areas', areaRoutes);


// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('🚀 LuxuryNest API is running...');
});


// ✅ Auto-create Admin (SAFE VERSION)
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);

      await User.create({
        email: process.env.ADMIN_EMAIL || 'admin@luxurynest.org.in',
        password: hashedPassword,
        role: 'admin'
      });

      console.log('✅ Default admin created');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (err) {
    console.error('❌ Admin creation error:', err.message);
  }
};


// ✅ Start Server AFTER DB + Admin setup
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  await createDefaultAdmin();
});
