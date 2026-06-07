/*
 * profileRoutes.js
 * ------------------------------------------------------------------
 * Maps profile URLs to their controller functions. Routing only.
 * Mounted under "/api" in app.js, so the full paths are
 * /api/profiles and /api/profiles/:profileId.
 * ------------------------------------------------------------------
 */
import express from 'express';
import { addProfile, editProfile, deleteProfile } from '../controllers/profileController.js';

const router = express.Router();

router.post('/profiles', addProfile);
router.put('/profiles/:profileId', editProfile);
router.delete('/profiles/:profileId', deleteProfile);

export default router;
