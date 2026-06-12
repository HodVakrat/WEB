/*
 * resultRoutes.js
 * ------------------------------------------------------------------
 * Maps result URLs to their controller functions. Routing only.
 * Mounted under "/api", so the full paths are /api/results and
 * /api/results/:profileId.
 * ------------------------------------------------------------------
 */
import express from 'express';
import { saveResult, getResults } from '../controllers/resultController.js';

const router = express.Router();

router.post('/results', saveResult);
router.get('/results/:profileId', getResults);

export default router;
