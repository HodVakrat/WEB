/* ============================================================
   storage.js
   ------------------------------------------------------------
   Thin wrapper around localStorage. The rest of the app NEVER
   touches localStorage directly — it goes through the
   functions in this file. Keeping the storage concern isolated
   here makes it easy to swap to a real backend later: only
   this file would need to change.

   localStorage keys:
     mathkids:users        Array of user objects
     mathkids:currentUser  The currently logged-in user, or null

   User object shape:
     {
       username:   string
       password:   string  (plaintext — fake data only)
       age:        number
       avatar:     string  (single emoji character)
       points:     number
       ownedSkins: array of skin ids
       history:    array of quiz records
     }

   Public API:
     getUsers()                  → array of all users
     findUser(username)          → user object or undefined
     saveUser(user)              → append a brand-new user
     updateUser(updatedUser)     → replace an existing user by username
     getCurrentUser()            → currently logged-in user, or null
     setCurrentUser(user)        → mark a user as logged-in
     logout()                    → clear the currentUser key
   ============================================================ */

const USERS_KEY         = 'mathkids:users';
const CURRENT_USER_KEY  = 'mathkids:currentUser';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
}

function findUser(username) {
  return getUsers().find(function (u) {
    return u.username === username;
  });
}

function saveUser(user) {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function updateUser(updatedUser) {
  const users = getUsers();
  const idx = users.findIndex(function (u) {
    return u.username === updatedUser.username;
  });
  if (idx === -1) return;
  users[idx] = updatedUser;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Keep currentUser in sync when the updated user is the logged-in one.
  const current = getCurrentUser();
  if (current && current.username === updatedUser.username) {
    setCurrentUser(updatedUser);
  }
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
}

function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
}
