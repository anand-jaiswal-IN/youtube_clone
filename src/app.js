import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '20kb' }));
app.use(express.static('public'));
app.use(cookieParser());

//routes import
import adminRouter from './routes/admin.routes.js';
import userRouter from './routes/user.routes.js';
import channelRouter from './routes/channel.routes.js';
import videoRouter from './routes/video.routes.js';

// routes declaration

app.use('/api/v1/admin', adminRouter);

app.use('/api/v1/users', userRouter);
app.use('/api/v1/channel', channelRouter);
app.use('/api/v1/channel/video', videoRouter);
export default app;
