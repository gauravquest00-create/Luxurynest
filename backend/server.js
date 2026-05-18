import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import areaRoutes from './routes/areaRoutes.js';

// Import routes
import projectRoutes from './routes/projectRoutes.js';
import propertyRoutes from './routes/propertyRoutes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import leadRoutes from './routes/leadRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import matchRoutes from './routes/matchRoutes.js';

dotenv.config();
connectDB();

// Auto-create default admin
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        email: 'admin@luxurynest.org.in',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('✅ Default admin created: admin@luxurynest.org.in / admin123');
    } else {
      console.log('✅ Admin already exists');
    }
  } catch (err) {
    console.error('Admin creation error:', err.message);
  }
};
createDefaultAdmin();

const app = express();
app.use(cors());
app.use(express.json());

// Serve admin panel
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// app.use('/luxuryadmin', express.static(path.join(__dirname, 'admin')));

// app.get('/luxuryadmin', (req, res) => {
//   res.sendFile(path.join(__dirname, 'admin', 'login.html'));
// });

app.use('/luxuryadmin', express.static(path.join(__dirname, 'admin')));


// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/match', matchRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/areas', areaRoutes);

app.get('/', (req, res) => {
  res.send('LuxuryNest API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));