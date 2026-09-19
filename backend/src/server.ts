import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config';
import { initializeDatabase } from './repositories/storage';
import { socketService } from './services/socketService';
import { demoService } from './services/demoService';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

async function bootstrap() {
  const app = express();
  const server = http.createServer(app);

  // Security Middleware
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false, // For easier demo video stream loading
    })
  );

  const allowedOrigins = [
    config.frontendUrl,
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
  ];

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, true); // Allow dev origins for hackathon presentation flexibility
        }
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Moderate rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again shortly.' },
  });
  app.use('/api', limiter);

  // Initialize Database (MongoDB with resilient In-Memory fallback)
  await initializeDatabase();

  // Initialize Socket.IO
  socketService.init(server, allowedOrigins);

  // Mount API routes
  app.use('/api', routes);

  // Root welcome route
  app.get('/', (req, res) => {
    res.json({
      name: 'VISIONGUARD API',
      tagline: 'See. Understand. Respond.',
      status: 'operational',
      docs: '/api/health',
    });
  });

  // Central Error Handler
  app.use(errorHandler);

  // Start HTTP + WebSocket Server
  const PORT = config.port;
  server.listen(PORT, () => {
    console.log(`
============================================================
🛡️  VISIONGUARD SERVER STARTED
📡  URL: http://localhost:${PORT}
⚡  Socket.IO: Ready
🔒  Auth: JWT + RBAC Enabled
🤖  AI Engine: ${config.ai.geminiApiKey ? 'Gemini 3.8 Flash' : 'VisionGuard Heuristic Fallback'}
🎯  Mode: ${config.demo.enabled ? 'DEMO MODE ACTIVE' : 'LIVE'}
============================================================
    `);

    // Optionally start background demo ticks
    if (config.demo.enabled) {
      demoService.startDemo();
    }
  });
}

bootstrap().catch((err) => {
  console.error('Failed to bootstrap VisionGuard Server:', err);
  process.exit(1);
});
