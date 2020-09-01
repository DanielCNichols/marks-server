module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  DATABASE_URL: process.env.DATABASE_URL || 'mongodb://localhost:27017/marks',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/marks-test',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
};
