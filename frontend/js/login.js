function showTab(tab) {
  document.getElementById('login-form').classList.toggle('d-none', tab !== 'login');
  document.getElementById('register-form').classList.toggle('d-none', tab !== 'register');
  document.querySelectorAll('.auth-tabs .nav-link').forEach((btn, i) => {
    btn.classList.toggle('active', (i === 0 && tab === 'login') || (i === 1 && tab === 'register'));
  });
}

function togglePwd(inputId) {
  const input = document.getElementById(inputId);
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function handleLogin(e) {
  e.preventDefault();
  const nick     = document.getElementById('login-nick').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  const res = await api.login(nick, password);
  if (res.ok) {
    // token già salvato in api.js → redirect
    window.location.href = 'index.html';
  } else {
    errEl.textContent = res.data.error || 'Credenziali non valide';
    errEl.classList.remove('d-none');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const nick     = document.getElementById('reg-nick').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errEl    = document.getElementById('reg-error');
  const successEl= document.getElementById('reg-success');

  const data = await api.register(nick, email, password);
  if (data.error) {
    errEl.textContent = data.error;
    errEl.classList.remove('d-none');
    successEl.classList.add('d-none');
  } else {
    successEl.textContent = 'Registrazione avvenuta! Accedi ora.';
    successEl.classList.remove('d-none');
    errEl.classList.add('d-none');
    setTimeout(() => showTab('login'), 1500);
  }
}
