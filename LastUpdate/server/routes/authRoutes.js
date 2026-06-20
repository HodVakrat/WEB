/*
 * authRoutes.js
 * ------------------------------------------------------------------
 * Maps auth-related URLs to their controller functions. This file only
 * routes — no logic lives here. Mounted under "/api" in app.js, so the
 * full paths are /api/auth/register, /api/auth/login, /api/parents/:id.
 * ------------------------------------------------------------------
 */
import express from 'express';
import { register, login, getParentById } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/parents/:id', getParentById);

export default router;
