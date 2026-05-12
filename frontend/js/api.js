const API_BASE = 'http://127.0.0.1:5000';

function getToken() {
  return sessionStorage.getItem('access_token');
}

function setToken(token) {
  sessionStorage.setItem('access_token', token);
}

function clearToken() {
  sessionStorage.removeItem('access_token');
}

function authHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getToken();

  if (!(extra instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

const api = {
  async register(nick, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, email, password })
    });
    return res.json();
  },

  async login(nick, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nick, password })
    });

    const data = await res.json();

    if (res.ok && data.access_token) {
      setToken(data.access_token);
    }

    return { ok: res.ok, data };
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: authHeaders()
    });
    clearToken();
  },

  async me() {
    const token = getToken();
    if (!token) return null;

    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: authHeaders()
    });

    if (!res.ok) return null;
    return res.json();
  },

  async getFeed() {
    const res = await fetch(`${API_BASE}/api/feed`);
    return res.json();
  },

  async uploadPost(formData) {
    const token = getToken();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/api/post`, {
      method: 'POST',
      headers,
      body: formData
    });

    return { ok: res.ok, data: await res.json() };
  },

  async deletePost(postId) {
    const res = await fetch(`${API_BASE}/api/post/${postId}`, {
      method: 'DELETE',
      headers: authHeaders()
    });
    return { ok: res.ok, data: await res.json() };
  },

  async toggleLike(postId) {
    const res = await fetch(`${API_BASE}/api/post/${postId}/like`, {
      method: 'POST',
      headers: authHeaders()
    });
    return { ok: res.ok, data: await res.json() };
  },

  async getProfile(nick) {
    const res = await fetch(`${API_BASE}/api/profile/${nick}`);
    return res.json();
  }
};