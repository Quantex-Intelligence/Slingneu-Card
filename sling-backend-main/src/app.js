const dns = require('dns');
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config');
const tcsligneoRoutes = require('./routes/tcsligneoRoutes');
const authRoutes = require('./routes/authRoutes');
const cashfreeRoutes = require('./routes/cashfreeRoutes');
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');
const layoutRoutes = require('./routes/layoutRoutes');
const publicLayoutRoutes = require('./routes/publicLayoutRoutes');
const cashbackRoutes = require('./routes/cashbackRoutes');
const scratchCardRoutes = require('./routes/scratchCardRoutes');
const physicalCardRoutes = require('./routes/physicalCardRoutes');
const rechargeRoutes = require('./routes/rechargeRoutes');
const operatorRoutes = require('./routes/operatorRoutes');
const rechargePlanRoutes = require('./routes/rechargePlanRoutes');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sling-backend')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// CORS Configuration - Allow any origin
const corsOptions = {
  origin: '*', // Allow any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check routes
app.get('/', (req, res) => res.json({ status: 'ok', message: 'Sling Backend API Service is running' }));
app.get('/api', (req, res) => res.json({ status: 'ok', message: 'Sling Backend API' }));

// Routes
app.use('/api/slingneo', tcsligneoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cashfree', cashfreeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/layouts', layoutRoutes);
app.use('/api/public/layouts', publicLayoutRoutes);
app.use('/api/cashbacks', cashbackRoutes);
app.use('/api/scratchcards', scratchCardRoutes);
app.use('/api/physical-cards', physicalCardRoutes);
app.use('/api/recharge', rechargeRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/recharge-plans', rechargePlanRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: config.nodeEnv === 'development' ? err : {}
    });
});

// Start server
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
}); 