const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

function requireEnv(name, options = {}) {
  const value = process.env[name];
  const { allowEmpty = false } = options;

  if (value === undefined || (!allowEmpty && value.trim() === '')) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const sessionSecret = requireEnv('SESSION_SECRET');
const insecureSessionPlaceholders = new Set([
  'your_secret_key_here',
  'changeme',
  'dev_only_change_this_secret',
]);

if (insecureSessionPlaceholders.has(sessionSecret)) {
  if (isProduction) {
    throw new Error('SESSION_SECRET uses an insecure placeholder value. Set a strong unique value.');
  }
  console.warn('Warning: SESSION_SECRET is using a placeholder value. Replace it before production.');
}

if (isProduction && sessionSecret.length < 32) {
  throw new Error('SESSION_SECRET must be at least 32 characters in production.');
}

const bcryptSaltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

if (!Number.isInteger(bcryptSaltRounds) || bcryptSaltRounds < 10 || bcryptSaltRounds > 15) {
  throw new Error('BCRYPT_SALT_ROUNDS must be an integer between 10 and 15.');
}

const dbPort = Number(process.env.DB_PORT || 3306);
if (!Number.isInteger(dbPort) || dbPort <= 0) {
  throw new Error('DB_PORT must be a valid positive integer.');
}

const clientOrigins = requireEnv('CLIENT_ORIGIN')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

if (clientOrigins.length === 0) {
  throw new Error('CLIENT_ORIGIN must contain at least one allowed origin.');
}

const dbPassword = requireEnv('DB_PASSWORD', { allowEmpty: true });
if (isProduction && dbPassword.trim() === '') {
  throw new Error('DB_PASSWORD cannot be empty in production.');
}

module.exports = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: NODE_ENV,
  isProduction,
  clientOrigins,
  security: {
    sessionSecret,
    bcryptSaltRounds,
  },
  database: {
    host: requireEnv('DB_HOST'),
    port: dbPort,
    user: requireEnv('DB_USER'),
    password: dbPassword,
    name: requireEnv('DB_NAME'),
  },
  session: {
    tableName: process.env.SESSION_TABLE || 'user_sessions',
  },
};
