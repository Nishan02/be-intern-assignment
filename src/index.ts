import express from 'express';
import dotenv from 'dotenv';
import 'reflect-metadata'; // Usually required for TypeORM
import userRouter from './routes/user.routes';
import postRouter from './routes/post.routes';
import { AppDataSource } from './data-source';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'online', message: 'API is running' });
});

// Routes
app.use('/api/users', userRouter);
app.use('/api/posts', postRouter);

// Database connection & Server start
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log('--- Database Connected ---');

    app.listen(PORT, () => {
      console.log(`--- Server ready at: http://localhost:${PORT} ---`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1); // Kill the process if DB fails
  }
};

startServer();