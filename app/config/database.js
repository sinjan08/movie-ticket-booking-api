const mongoose = require('mongoose');

/**
 * Database connection using mongodb
 */
const INIT_DATABASE = async () => {
  try {
    await mongoose.connect(process.env.MONGOURL, {
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error("Failed to connect database:", err.message);
    process.exit(1);
  }
};

module.exports = INIT_DATABASE;