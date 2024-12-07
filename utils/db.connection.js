const mongoose = require('mongoose');

// const uri = 'mongodb://localhost:27017/videoCall'
const uri = process.env.MONGODB_URI
 
async function connectDB() {
  try {
    await mongoose.connect(uri);
    console.log('>>>>>>>>>>> db connected');
  } catch (error) {
    console.error('Error connecting to the database:', error.message);
  }
}

module.exports = { connectDB };
