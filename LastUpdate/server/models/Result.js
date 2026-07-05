/*
 * Result.js
 * ------------------------------------------------------------------
 * Mongoose schema for a single finished quiz. One document per quiz;
 * this collection grows over time. profileId references the embedded
 * profile (_id) that played. points is frozen at earn time and powers
 * statistics; the profile's wallet (coins) is updated separately.
 * ------------------------------------------------------------------
 */
import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  subject:   { type: String, required: true },
  level:     { type: String, required: true, enum: ['beginner', 'intermediate', 'advanced', 'adaptive'] },
  questionLevels: { type: [String], default: [] },
  score:     { type: Number, required: true, min: 0 },
  total:     { type: Number, required: true, min: 0 },
  points:    { type: Number, required: true, min: 0 },
  // Correct answers that used bot help (earned no coins). Old documents
  // saved before this feature read back as 0 via the default.
  assistedCorrect: { type: Number, default: 0, min: 0 },
  date:      { type: Date, default: Date.now },
});

// Model name "Result" maps to the "results" collection.
export const Result = mongoose.model('Result', resultSchema);
