/*
 * app.js
 * ------------------------------------------------------------------
 * Entry point of the Express server: sets up middleware, connects to
 * the database, and starts listening. Routes for auth / profiles /
 * results are mounted in later steps. For now there is a single
 * health-check route so we can confirm the server is alive.
 * ------------------------------------------------------------------
 */
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import authRoutes from './routes/authRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import resultRoutes from './routes/resultRoutes.js';

const app = express();
const PORT = 5000;

/*
 * Middleware.
 * cors()         - allow the React dev server to call this API.
 * express.json() - parse JSON request bodies into req.body.
 */
app.use(cors());
app.use(express.json());

/*
 * Health check - a simple way to verify the server is up.
 * (auth / profiles / results routes will be mounted here later.)
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

/*
 * API routes. Mounted under /api, so authRoutes' "/auth/register"
 * becomes "/api/auth/register", etc.
 */
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', resultRoutes);

/*
 * Start: connect to the DB first, then begin listening.
 */
await connectDB();
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
