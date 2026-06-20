/*
 * authController.js
 * ------------------------------------------------------------------
 * The logic behind registration, login, and fetching a parent by id
 * (used to restore a session after a page refresh). This is the only
 * place that decides "is this request valid?" and talks to the Parent
 * model. Routes just point here; the model talks to MongoDB.
 * ------------------------------------------------------------------
 */
import mongoose from 'mongoose';
import { Parent } from '../models/Parent.js';

// Basic email shape check (something@something.something).
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// True only for a real, non-empty string (also guards against NoSQL
// injection, where a client sends an object instead of a string).
function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/*
 * POST /api/auth/register
 * Validates input, ensures the email is free, creates the parent.
 */
export async function register(req, res) {
  const { email, password, firstName, lastName } = req.body;

  if (!isNonEmptyString(email) || !EMAIL_REGEX.test(email.trim())) {
    return res.status(400).json({ error: 'A valid email is required.' });
  }
  if (typeof password !== 'string' || password.length < 4) {
    return res.status(400).json({ error: 'Password must be at least 4 characters.' });
  }
  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return res.status(400).json({ error: 'First and last name are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const existing = await Parent.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ error: 'Email already in use.' });
    }

    const parent = await Parent.create({
      email: normalizedEmail,
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      profiles: [],
    });

    return res.status(201).json(parent); // toJSON transform strips the password
  } catch (err) {
    // The unique index can still trip on a race condition.
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already in use.' });
    }
    console.error('register error:', err.message);
    return res.status(500).json({ error: 'Server error during registration.' });
  }
}

/*
 * POST /api/auth/login
 * Validates input, finds the parent by normalized email, checks password.
 */
export async function login(req, res) {
  const { email, password } = req.body;

  // Type checks: both must be strings (presence + anti NoSQL-injection).
  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const parent = await Parent.findOne({ email: normalizedEmail });
    // Same generic message whether the email or the password is wrong.
    if (!parent || parent.password !== password) {
      return res.status(401).json({ error: 'Wrong email or password.' });
    }
    return res.status(200).json(parent); // password stripped by toJSON
  } catch (err) {
    console.error('login error:', err.message);
    return res.status(500).json({ error: 'Server error during login.' });
  }
}

/*
 * GET /api/parents/:id
 * Returns a fresh parent for session restore on refresh.
 */
export async function getParentById(req, res) {
  const { id } = req.params;

  // A malformed id would make Mongoose throw a CastError -> answer 400, not 500.
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: 'Invalid parent id.' });
  }

  try {
    const parent = await Parent.findById(id);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found.' });
    }
    return res.status(200).json(parent);
  } catch (err) {
    console.error('getParentById error:', err.message);
    return res.status(500).json({ error: 'Server error.' });
  }
}
