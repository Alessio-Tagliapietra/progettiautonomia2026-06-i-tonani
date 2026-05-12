let currentUser   = null;
let currentPostId = null;
const postModal   = new bootstrap.Modal(document.getElementById('postModal'));

async function init() {
  const params = new URLSearchParams(window.location.search);
  const nick   = params.get('nick');
  if (!nick) { window.location.href = 'index.html'; return; }

  currentUser = await api.me();   // opzionale: serve solo per il like

  const profile    = await api.getProfile(nick);
  const posts      = profile.posts || [];
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  document.getElementById('profile-nick').textContent = `@${profile.nick}`;
  document.getElementById('avatar-circle').textContent= profile.nick[0].toUpperCase();
  document.getElementById('stat-posts').textContent   = posts.length;
  document.getElementById('stat-likes').textContent   = totalLikes;
  document.title = `Portfol.io — @${profile.nick}`;

  const container = document.getElementById('view-posts');
  if (!posts.length) {
    container.innerHTML = '<p class="text-center text-muted py-5 w-100">Nessuna opera pubblicata.</p>';
    return;
  }
  container.innerHTML = posts.map(p => `
    <div class="masonry-item" onclick="openModal(${p.idPost}, '${p.image}', \`${(p.descrizione || '').replace(/`/g, '\\`')}\`, ${p.likes}, '${p.data}')">
      <img src="data:image/jpeg;base64,${p.image}" alt="opera" loading="lazy"/>
      <div class="masonry-overlay">
        <div class="desc">${p.descrizione || ''}</div>
        <div class="d-flex justify-content-between align-items-center mt-1">
          <span class="like-btn"><i class="bi bi-heart-fill" style="color:var(--danger)"></i> ${p.likes}</span>
        </div>
      </div>
    </div>
  `).join('');
}

function openModal(id, image, desc, likes, data) {
  currentPostId = id;
  document.getElementById('modal-img').src           = `data:image/jpeg;base64,${image}`;
  document.getElementById('modal-desc').textContent  = desc;
  document.getElementById('modal-likes').textContent = likes;
  document.getElementById('modal-date').textContent  = new Date(data).toLocaleDateString('it-IT');
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
