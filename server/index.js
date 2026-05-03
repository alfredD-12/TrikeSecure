const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const config = require('./config');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const driverRoutes = require('./routes/driver');
const scanRoutes = require('./routes/scan');
const ridesRoutes = require('./routes/rides');
const sosRoutes = require('./routes/sos');
const fuelRoutes = require('./routes/fuel');
const complaintsRoutes = require('./routes/complaints');
const profileRoutes = require('./routes/profile');
const supportRoutes = require('./routes/support');

const app = express();
const MySQLStore = MySQLStoreFactory(session);
const uploadsRoot = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadsRoot, { recursive: true });

function isDevPrivateNetworkOrigin(origin) {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return false;
    }

    const host = url.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return true;
    }

    if (host.startsWith('10.') || host.startsWith('192.168.')) {
      return true;
    }

    if (host.startsWith('172.')) {
      const secondOctet = Number(host.split('.')[1]);
      return Number.isInteger(secondOctet) && secondOctet >= 16 && secondOctet <= 31;
    }

    return false;
  } catch {
    return false;
  }
}

const sessionStore = new MySQLStore({
  host: config.database.host,
  port: config.database.port,
  user: config.database.user,
  password: config.database.password,
  database: config.database.name,
  createDatabaseTable: true,
  schema: {
    tableName: config.session.tableName,
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data',
    },
  },
});

sessionStore.on('error', (error) => {
  console.error('Session store error:', error.message);
});

// Middleware
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }

    if (config.clientOrigins.includes(origin)) {
      return callback(null, true);
    }

    if (!config.isProduction && isDevPrivateNetworkOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json({ limit: '10kb' }));
app.use('/uploads', express.static(uploadsRoot));

const enableApiRateLimit = config.isProduction || process.env.ENABLE_API_RATE_LIMIT === 'true';

if (enableApiRateLimit) {
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests. Please try again later.' },
  });

  app.use('/api', apiLimiter);
}

app.use(session({
  name: 'sid',
  secret: config.security.sessionSecret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: config.session.cookieSecure,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  },
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api/scan', scanRoutes);
app.use('/api/rides', ridesRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/fuel', fuelRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/support', supportRoutes);

// Geocode proxy — keeps the Geoapify key server-side and avoids browser CORS/401
const GEOAPIFY_KEY = process.env.GEOAPIFY_KEY || '';

app.get('/api/geocode/reverse', async (req, res) => {
  const { lat, lon, lang } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'lat and lon are required.' });
  }

  try {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&lang=${encodeURIComponent(lang || 'en')}&apiKey=${GEOAPIFY_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Geocode reverse proxy error:', err.message);
    res.status(502).json({ message: 'Geocode service unavailable.' });
  }
});

app.get('/api/geocode/search', async (req, res) => {
  const { text, lang, bias, filter, limit } = req.query;
  if (!text) {
    return res.status(400).json({ message: 'text is required.' });
  }

  try {
    const params = new URLSearchParams({
      text,
      lang: lang || 'en',
      apiKey: GEOAPIFY_KEY,
    });
    if (bias) params.set('bias', bias);
    if (filter) params.set('filter', filter);
    if (limit) params.set('limit', limit);

    const url = `https://api.geoapify.com/v1/geocode/autocomplete?${params.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Geocode search proxy error:', err.message);
    res.status(502).json({ message: 'Geocode service unavailable.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
