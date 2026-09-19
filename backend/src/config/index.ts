import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root .env or local .env
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5001', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',

  jwt: {
    secret: process.env.JWT_SECRET || 'visionguard_production_secret_key_2026_dev',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '10', 10),
  },

  db: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/visionguard',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  ai: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    geminiModel: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },

  ml: {
    serviceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
    fps: parseInt(process.env.ML_INFERENCE_FPS || '5', 10),
    device: process.env.ML_DEVICE || 'cpu',
  },

  demo: {
    enabled: process.env.DEMO_MODE !== 'false',
    tickIntervalMs: parseInt(process.env.DEMO_TICK_INTERVAL_MS || '2000', 10),
    loiteringThresholdSeconds: parseInt(process.env.LOITERING_THRESHOLD_SECONDS || '30', 10),
    stationaryObjectThresholdSeconds: parseInt(process.env.STATIONARY_OBJECT_THRESHOLD_SECONDS || '45', 10),
  },
};
