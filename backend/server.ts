import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import prisma from './config/database';
import qdrantClient from './config/qdrant';

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');

    try {
      await qdrantClient.getCollections();
      console.log('Qdrant connected successfully');
    } catch (error) {
      console.warn('Qdrant connection warning:', error);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Auth endpoints:`);
      console.log(`  POST http://localhost:${PORT}/api/auth/register`);
      console.log(`  POST http://localhost:${PORT}/api/auth/login`);
      console.log(`  GET  http://localhost:${PORT}/api/auth/profile`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', async () => {
  console.log('\nShutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
