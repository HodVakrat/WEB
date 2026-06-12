/*
 * resultController.js
 * ------------------------------------------------------------------
 * Logic for saving a finished quiz and reading a profile's results.
 * Saving is the one place that computes points (server-trusted) and
 * updates the profile's coin wallet. The points rule + quiz length are
 * duplicated here on purpose (front and server are separate processes).
 * ------------------------------------------------------------------
 */
import mongoose from 'mongoose';
import { Parent } from '../models/Parent.js';
import { Result } from '../models/Result.js';

const POINTS_PER_LEVEL = { beginner: 3, intermediate: 7, advanced: 20 };
const SUBJECTS = ['addition', 'subtraction', 'multiplication', 'division', 'fractions', 'percentages'];
const QUIZ_LENGTH = 5; // must match QuizLogic.QUESTIONS_PER_QUIZ on the front

function isInteger(n) {
  return typeof n === 'number' && Number.isInteger(n);
}

/*
 * POST /api/results  { profileId, subject, level, score, total }
 * Validates, computes points on the server, saves the result, and adds
 * the earned points to the profile's wallet. Returns { result, coins }.
 */
export async function saveResult(req, res) {
  const { profileId, score, total } = req.body;
  const subject = String(req.body.subject || '').toLowerCase();
  const level = String(req.body.level || '').toLowerCase();

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ error: 'Invalid profile id.' });
  }
  if (!SUBJECTS.includes(subject)) {
    return res.status(400).json({ error: 'Unknown subject.' });
  }
  if (!POINTS_PER_LEVEL[level]) {
    return res.status(400).json({ error: 'Unknown level.' });
  }
  if (!isInteger(score) || !isInteger(total) || score < 0 || score > total) {
    return res.status(400).json({ error: 'Invalid score/total.' });
  }
  if (total !== QUIZ_LENGTH) {
    return res.status(400).json({ error: `A quiz must have exactly ${QUIZ_LENGTH} questions.` });
  }

  try {
    // Make sure the profile exists BEFORE creating a result (avoid orphans).
    const owner = await Parent.findOne({ 'profiles._id': profileId });
    if (!owner) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const points = score * POINTS_PER_LEVEL[level];

    // 1) Insert the result.
    const result = await Result.create({ profileId, subject, level, score, total, points });

    // 2) Atomically add the earned points to the embedded profile's wallet.
    const updatedParent = await Parent.findOneAndUpdate(
      { 'profiles._id': profileId },
      { $inc: { 'profiles.$.coins': points } },
      { new: true },
    );
    const coins = updatedParent.profiles.id(profileId).coins;

    return res.status(201).json({ result, coins });
  } catch (err) {
    console.error('saveResult error:', err.message);
    return res.status(500).json({ error: 'Server error while saving result.' });
  }
}

/*
 * GET /api/results/:profileId
 * Returns all of a profile's results, newest first.
 */
export async function getResults(req, res) {
  const { profileId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ error: 'Invalid profile id.' });
  }
  try {
    const results = await Result.find({ profileId }).sort({ date: -1 });
    return res.status(200).json(results);
  } catch (err) {
    console.error('getResults error:', err.message);
    return res.status(500).json({ error: 'Server error while loading results.' });
  }
}
