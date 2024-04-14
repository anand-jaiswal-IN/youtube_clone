import dotenv from 'dotenv';
import connectDB from './db/index.js';
import app from './app.js';
dotenv.config();

const PORT = process.env.PORT || 8000;
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    app.on('error', (err) => {
      console.log('SERVER ERROR : ', err);
    });
  })
  .catch((err) => {
    console.log('MONGO DB connection FAILED : ', err);
  });
