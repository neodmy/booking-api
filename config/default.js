module.exports = {
  app: {
    port: process.env.PORT || 4000,
    secretKey: process.env.SECRET_KEY || 'somesecret',
  },
  mongo: {
    host: process.env.MONGO_HOST || 'localhost',
    port: process.env.MONGO_PORT || 27017,
    database: process.env.MONGO_DB || 'bookings',
  },
};
