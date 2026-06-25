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
  const { profileId, score, total, questionLevels, correctLevels } = req.body;
  const subject = String(req.body.subject || '').toLowerCase();
  const level = String(req.body.level || '').toLowerCase();

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ error: 'Invalid profile id.' });
  }
  if (!SUBJECTS.includes(subject)) {
    return res.status(400).json({ error: 'Unknown subject.' });
  }
  const validLevels = ['beginner', 'intermediate', 'advanced', 'adaptive'];
  if (!validLevels.includes(level)) {
    return res.status(400).json({ error: 'Unknown level.' });
  }
  if (!isInteger(score) || !isInteger(total) || score < 0 || score > total) {
    return res.status(400).json({ error: 'Invalid score/total.' });
  }
  if (total !== QUIZ_LENGTH) {
    return res.status(400).json({ error: `A quiz must have exactly ${QUIZ_LENGTH} questions.` });
  }
  // correctLevels = the difficulty of each correctly-answered question. The server
  // does NOT trust score alone: the array length must agree with score, and every
  // entry must be a real difficulty. Coins are derived from this array.
  if (
    !Array.isArray(correctLevels) ||
    correctLevels.length !== score ||
    !correctLevels.every((l) => POINTS_PER_LEVEL[l] !== undefined)
  ) {
    return res.status(400).json({ error: 'Invalid correct-answer levels.' });
  }

  try {
    const owner = await Parent.findOne({ 'profiles._id': profileId });
    if (!owner) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    // Coins = sum of the difficulty of the CORRECTLY-answered questions only.
    // A wrong (or timed-out) answer contributes nothing.
    const points = correctLevels.reduce((sum, ql) => sum + POINTS_PER_LEVEL[ql], 0);

    const result = await Result.create({
      profileId, subject, level, score, total, points,
      questionLevels: Array.isArray(questionLevels) ? questionLevels : [],
    });

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
