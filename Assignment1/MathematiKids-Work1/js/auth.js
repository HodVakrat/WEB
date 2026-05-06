/* ============================================================
   auth.js
   ------------------------------------------------------------
   Login, Register, and Logout handlers. Talks to storage.js
   for persistence and to navigation.js for screen changes.

   Public API:
     initAuth()         Bind submit handlers and render the
                        avatar picker. Called once at boot.
     handleLogout()     Clear the session and return to Login.
                        Bound to the Logout button on Home.

   Internal helpers (kept out of public API):
     handleLoginSubmit(event)
     handleRegisterSubmit(event)
     renderAvatarPicker()
     showError(el, msg)
     showSuccess(el, msg)
   ============================================================ */

let selectedAvatar = null;

function initAuth() {
  document.getElementById('login-form')
    .addEventListener('submit', handleLoginSubmit);

  document.getElementById('register-form')
    .addEventListener('submit', handleRegisterSubmit);

  renderAvatarPicker();
}

function handleLoginSubmit(event) {
  event.preventDefault();

  const username  = document.getElementById('login-username').value.trim();
  const password  = document.getElementById('login-password').value;
  const messageEl = document.getElementById('login-message');

  const user = findUser(username);
  if (!user || user.password !== password) {
    showError(messageEl, 'Invalid username or password.');
    return;
  }

  setCurrentUser(user);
  showSuccess(messageEl, 'Welcome back, ' + user.username + '!');

  setTimeout(function () {
    document.getElementById('login-form').reset();
    messageEl.textContent = '';
    showScreen('home');
  }, 800);
}

function handleRegisterSubmit(event) {
  event.preventDefault();

  const username  = document.getElementById('register-username').value.trim();
  const ageStr    = document.getElementById('register-age').value;
  const password  = document.getElementById('register-password').value;
  const confirm   = document.getElementById('register-confirm').value;
  const messageEl = document.getElementById('register-message');

  if (!selectedAvatar) {
    showError(messageEl, 'Please pick an avatar.');
    return;
  }

  const age = parseInt(ageStr, 10);
  if (isNaN(age) || age < 6 || age > 12) {
    showError(messageEl, 'Age must be between 6 and 12.');
    return;
  }

  if (password !== confirm) {
    showError(messageEl, 'Passwords do not match.');
    return;
  }

  if (findUser(username)) {
    showError(messageEl, 'Username already taken.');
    return;
  }

  const newUser = {
    username:   username,
    password:   password,
    age:        age,
    avatar:     selectedAvatar,
    points:     0,
    ownedSkins: [],
    history:    [],
  };

  saveUser(newUser);
  setCurrentUser(newUser);

  showSuccess(messageEl, 'Welcome, ' + username + '! Loading your home...');

  setTimeout(function () {
    document.getElementById('register-form').reset();
    messageEl.textContent = '';
    resetAvatarPickerSelection();
    showScreen('home');
  }, 1200);
}

function handleLogout() {
  logout();
  showScreen('login');
}

function renderAvatarPicker() {
  const container = document.getElementById('avatar-picker');
  if (!container) return;
  container.innerHTML = '';

  AVATARS.forEach(function (emoji) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = emoji;
    btn.dataset.avatar = emoji;
    btn.className =
      'text-3xl p-2 rounded-xl border-2 border-transparent ' +
      'hover:bg-indigo-50 transition-all';

    btn.addEventListener('click', function () {
      resetAvatarPickerSelection();
      btn.classList.remove('border-transparent');
      btn.classList.add('border-indigo-500', 'bg-indigo-50', 'scale-110');
      selectedAvatar = emoji;
    });

    container.appendChild(btn);
  });
}

function resetAvatarPickerSelection() {
  selectedAvatar = null;
  const buttons = document.querySelectorAll('#avatar-picker button');
  buttons.forEach(function (b) {
    b.classList.remove('border-indigo-500', 'bg-indigo-50', 'scale-110');
    b.classList.add('border-transparent');
  });
}

function showError(el, msg) {
  el.textContent = msg;
  el.className = 'mt-3 text-center text-sm h-5 text-red-500 font-semibold';
}

function showSuccess(el, msg) {
  el.textContent = msg;
  el.className = 'mt-3 text-center text-sm h-5 text-green-600 font-semibold';
}
