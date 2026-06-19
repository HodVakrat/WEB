/*
 * Parent.js
 * ------------------------------------------------------------------
 * Mongoose schema for a parent account. Kid profiles are EMBEDDED as a
 * sub-document array (small, always loaded with the parent). Quiz results
 * are NOT here — they live in their own collection (see Result.js).
 * ------------------------------------------------------------------
 */
import mongoose from 'mongoose';

/*
 * Embedded sub-schema for a single kid profile.
 * Mongoose gives every embedded sub-document its own _id automatically,
 * which is what results reference via profileId.
 * coins = the spendable wallet balance (starts at 0).
 */
const profileSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true, maxlength: 20 },
  avatar:   { type: String, required: true },
  birthday: { type: Date, required: true },
  coins:    { type: Number, default: 0 },
});

/*
 * Parent document schema.
 * email is normalized (lowercase + trim) and unique, so the database
 * itself blocks duplicate accounts.
 */
const parentSchema = new mongoose.Schema({
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true }, // PLAIN TEXT for now (temporary)
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  profiles:  { type: [profileSchema], default: [] },
});

/*
 * Always strip the password out of any JSON response (login, profile ops,
 * GET parent). Done centrally here instead of in every controller.
 */
parentSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

// Model name "Parent" maps to the "parents" collection.
export const Parent = mongoose.model('Parent', parentSchema);
