import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './utils/db.js';
import modulesRouter from './routes/modules.js';
import authRouter from './routes/auth.js';
import contactRouter from './routes/contact.js';
import adminRouter from './routes/admin.js';
import profileRouter from './routes/profile.js';
import statsRouter from './routes/stats.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const UPLOADS_ROOT = process.env.UPLOADS_DIR || path.join(__dirname, '../../uploads');
fs.mkdirSync(path.join(UPLOADS_ROOT, 'models'), { recursive: true });
fs.mkdirSync(path.join(UPLOADS_ROOT, 'sketches'), { recursive: true });

const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(mongoSanitize());
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use('/uploads', express.static(UPLOADS_ROOT));

app.use('/api/modules', modulesRouter);
app.use('/api/auth', authRouter);
app.use('/api/contact', contactRouter);
app.use('/api/admin', adminRouter);
app.use('/api/profile', profileRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Serve built frontend in production
if (isProduction) {
  const clientBuild = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

connectDB()
  .then(() => {
    const host = isProduction ? '0.0.0.0' : 'localhost';
    app.listen(PORT, host, () => {
      console.log(`Server running on http://${host}:${PORT}`);
    });
  })
  .catch(err => {
    console.error('DB connection failed:', err.message);
    process.exit(1);
  });

export default app;
