let currentUser   = null;
let currentPostId = null;
const postModal   = new bootstrap.Modal(document.getElementById('postModal'));

async function init() {
  currentUser = await api.me();   // restituisce null se non loggato
  updateNav();
  loadFeed();
}

function updateNav() {
  const loginBtn  = document.getElementById('nav-login-btn');
  const logoutBtn = document.getElementById('nav-logout-btn');
  const profileBtn= document.getElementById('nav-profile-btn');
  const navUser   = document.getElementById('nav-user');

  if (currentUser) {
    loginBtn.classList.add('d-none');
    logoutBtn.classList.remove('d-none');
    profileBtn.classList.remove('d-none');
    profileBtn.href   = 'profile.html';
    navUser.textContent = `@${currentUser.nick}`;
  } else {
    loginBtn.classList.remove('d-none');
    logoutBtn.classList.add('d-none');
    profileBtn.classList.add('d-none');
    navUser.textContent = '';
  }
}

async function handleLogout() {
  await api.logout();
  window.location.reload();
}

async function loadFeed() {
  const container = document.getElementById('feed-container');
  try {
    const posts = await api.getFeed();
    if (!posts.length) {
      container.innerHTML = '<p class="text-center text-muted py-5 w-100">Nessun post ancora. Sii il primo!</p>';
      return;
    }
    container.innerHTML = posts.map(post => `
      <div class="masonry-item" onclick="openModal(${post.idPost}, '${post.image}', '${post.autore}', \`${(post.descrizione || '').replace(/`/g, '\\`')}\`, ${post.likes}, '${post.data}')">
        <img src="data:image/jpeg;base64,${post.image}" alt="post" loading="lazy"/>
        <div class="masonry-overlay">
          <div class="desc">${post.descrizione || ''}</div>
          <div class="d-flex justify-content-between align-items-center mt-1">
            <a href="profile-view.html?nick=${post.autore}" onclick="event.stopPropagation()" class="author">@${post.autore}</a>
            <span class="like-btn"><i class="bi bi-heart-fill" style="color:var(--danger)"></i> ${post.likes}</span>
          </div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    container.innerHTML = '<p class="text-center text-muted py-5">Errore nel caricamento del feed.</p>';
  }
}

function openModal(id, image, autore, desc, likes, data) {
  currentPostId = id;
  document.getElementById('modal-img').src              = `data:image/jpeg;base64,${image}`;
  document.getElementById('modal-author').textContent   = `@${autore}`;
  document.getElementById('modal-author').href          = `profile-view.html?nick=${autore}`;
  document.getElementById('modal-desc').textContent     = desc;
  document.getElementById('modal-likes').textContent    = likes;
  document.getElementById('modal-date').textContent     = new Date(data).toLocaleDateString('it-IT');
  postModal.show();
}

async function modalToggleLike() {
  if (!currentUser) { window.location.href = 'login.html'; return; }
  const res = await api.toggleLike(currentPostId);
  if (res.ok) {
    const btn   = document.getElementById('modal-like-btn');
    const count = document.getElementById('modal-likes');
    const liked = res.data.message === 'Like aggiunto';
    btn.classList.toggle('liked', liked);
    btn.querySelector('i').className = liked ? 'bi bi-heart-fill' : 'bi bi-heart';
    count.textContent = parseInt(count.textContent) + (liked ? 1 : -1);
  }
}

init();
