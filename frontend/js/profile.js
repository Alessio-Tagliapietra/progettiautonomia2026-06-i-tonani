let currentUser  = null;
let postToDelete = null;
const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
const uploadModal = new bootstrap.Modal(document.getElementById('uploadModal'));

async function init() {
  currentUser = await api.me();
  if (!currentUser) { window.location.href = 'login.html'; return; }

  document.getElementById('profile-nick').textContent  = `@${currentUser.nick}`;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('avatar-circle').textContent = currentUser.nick[0].toUpperCase();

  const profile    = await api.getProfile(currentUser.nick);
  const posts      = profile.posts || [];
  const totalLikes = posts.reduce((sum, p) => sum + p.likes, 0);

  document.getElementById('stat-posts').textContent = posts.length;
  document.getElementById('stat-likes').textContent = totalLikes;

  renderPosts(posts);
}

function renderPosts(posts) {
  const container = document.getElementById('my-posts');
  if (!posts.length) {
    container.innerHTML = '<p class="text-center text-muted py-5 w-100">Nessuna opera ancora. Carica la prima!</p>';
    return;
  }
  container.innerHTML = posts.map(p => `
    <div class="masonry-item" id="post-${p.idPost}">
      <img src="data:image/jpeg;base64,${p.image}" alt="opera" loading="lazy"/>
      <div class="masonry-overlay">
        <div class="desc">${p.descrizione || ''}</div>
        <div class="d-flex justify-content-between align-items-center mt-1">
          <span class="like-btn"><i class="bi bi-heart-fill" style="color:var(--danger)"></i> ${p.likes}</span>
          <button class="btn btn-sm btn-outline-danger" style="font-size:0.75rem;padding:2px 8px;"
            onclick="event.stopPropagation();askDelete(${p.idPost})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function askDelete(postId) {
  postToDelete = postId;
  deleteModal.show();
}

async function confirmDelete() {
  if (!postToDelete) return;
  await api.deletePost(postToDelete);
  deleteModal.hide();
  document.getElementById(`post-${postToDelete}`)?.remove();
  postToDelete = null;
}

function previewImage(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const preview = document.getElementById('img-preview');
    preview.src = e.target.result;
    preview.classList.remove('d-none');
  };
  reader.readAsDataURL(file);
}

async function submitUpload() {
  const file  = document.getElementById('file-input').files[0];
  const desc  = document.getElementById('upload-desc').value;
  const errEl = document.getElementById('upload-error');

  if (!file) { errEl.textContent = "Seleziona un'immagine"; errEl.classList.remove('d-none'); return; }

  const formData = new FormData();
  formData.append('image', file);
  formData.append('descrizione', desc);

  const res = await api.uploadPost(formData);
  if (res.ok) {
    uploadModal.hide();
    init();
  } else {
    errEl.textContent = res.data.error || 'Errore upload';
    errEl.classList.remove('d-none');
  }
}

async function handleLogout() {
  await api.logout();
  window.location.href = 'login.html';
}

init();
