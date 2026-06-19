/*
 * profileController.js
 * ------------------------------------------------------------------
 * Logic for managing the kid profiles embedded inside a parent:
 * add, edit, delete. Each function returns the UPDATED parent so the
 * front can refresh its state. Deleting a profile also cascades —
 * it removes all of that profile's results.
 * ------------------------------------------------------------------
 */
import mongoose from 'mongoose';
import { Parent } from '../models/Parent.js';
import { Result } from '../models/Result.js';

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

/*
 * POST /api/profiles  { parentId, name, avatar }
 * Adds a new profile to the parent's embedded profiles array.
 */
export async function addProfile(req, res) {
  const { parentId, name, avatar, birthday } = req.body;

  if (!mongoose.Types.ObjectId.isValid(parentId)) {
    return res.status(400).json({ error: 'Invalid parent id.' });
  }
  if (!isNonEmptyString(name) || name.trim().length > 20) {
    return res.status(400).json({ error: 'Profile name is required (max 20 characters).' });
  }
  if (typeof avatar !== 'string') {
    return res.status(400).json({ error: 'Avatar is required.' });
  }
  if (!birthday || isNaN(Date.parse(birthday))) {
    return res.status(400).json({ error: 'A valid birthday is required.' });
  }

  try {
    const parent = await Parent.findById(parentId);
    if (!parent) {
      return res.status(404).json({ error: 'Parent not found.' });
    }
    parent.profiles.push({ name: name.trim(), avatar, birthday: new Date(birthday), coins: 0 });
    await parent.save();
    return res.status(201).json(parent);
  } catch (err) {
    console.error('addProfile error:', err.message);
    return res.status(500).json({ error: 'Server error while adding profile.' });
  }
}

/*
 * PUT /api/profiles/:profileId  { name, avatar }
 * Finds the parent that owns this embedded profile and updates it.
 */
export async function editProfile(req, res) {
  const { profileId } = req.params;
  const { name, avatar, birthday } = req.body;

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ error: 'Invalid profile id.' });
  }
  if (!isNonEmptyString(name) || name.trim().length > 20) {
    return res.status(400).json({ error: 'Profile name is required (max 20 characters).' });
  }
  if (typeof avatar !== 'string') {
    return res.status(400).json({ error: 'Avatar is required.' });
  }
  if (!birthday || isNaN(Date.parse(birthday))) {
    return res.status(400).json({ error: 'A valid birthday is required.' });
  }

  try {
    const parent = await Parent.findOne({ 'profiles._id': profileId });
    if (!parent) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    const profile = parent.profiles.id(profileId);
    profile.name = name.trim();
    profile.avatar = avatar;
    profile.birthday = new Date(birthday);
    await parent.save();
    return res.status(200).json(parent);
  } catch (err) {
    console.error('editProfile error:', err.message);
    return res.status(500).json({ error: 'Server error while editing profile.' });
  }
}

/*
 * DELETE /api/profiles/:profileId
 * Removes the profile from the parent AND deletes all of its results (cascade).
 */
export async function deleteProfile(req, res) {
  const { profileId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ error: 'Invalid profile id.' });
  }

  try {
    const parent = await Parent.findOne({ 'profiles._id': profileId });
    if (!parent) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    parent.profiles.pull(profileId); // remove the embedded sub-document
    await parent.save();
    await Result.deleteMany({ profileId }); // cascade: remove its results
    return res.status(200).json(parent);
  } catch (err) {
    console.error('deleteProfile error:', err.message);
    return res.status(500).json({ error: 'Server error while deleting profile.' });
  }
}

/*
 * PUT /api/profiles/:profileId/avatar  { avatar, cost }
*/
export async function buyAvatar(req, res) {
  const { profileId } = req.params;
  const { avatar, cost } = req.body;

  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    return res.status(400).json({ error: 'Invalid profile id.' });
  }
  if (typeof avatar !== 'string' || avatar.trim().length === 0) {
    return res.status(400).json({ error: 'Avatar identifier is required.' });
  }
  
  const numericCost = Number(cost) || 0;

  try {
    const parent = await Parent.findOne({ 'profiles._id': profileId });
    if (!parent) {
      return res.status(404).json({ error: 'Profile not found.' });
    }

    const profile = parent.profiles.id(profileId); // 

    if (profile.coins < numericCost) {
      return res.status(400).json({ error: 'you have not enough coins to buy this avatar!' });
    }

    profile.coins -= numericCost;
    profile.avatar = avatar;

    await parent.save(); 
    
    return res.status(200).json(parent); 
  } catch (err) {
    console.error('buyAvatar error:', err.message);
    return res.status(500).json({ error: 'Server error while purchasing avatar.' });
  }
}
