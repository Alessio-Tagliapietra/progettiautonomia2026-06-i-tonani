const API_BASE = 'http://127.0.0.1:5000';

const api = {
  // AUTH
  async register(nick, email, password) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nick, email, password })
    });
    return res.json();
  },

  async login(nick, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ nick, password })
    });
    return { ok: res.ok, data: await res.json() };
  },

  async logout() {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  },

  // FEED
  async getFeed() {
    const res = await fetch(`${API_BASE}/api/feed`, { credentials: 'include' });
    return res.json();
  },

  // POST
  async uploadPost(formData) {
    const res = await fetch(`${API_BASE}/api/post`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return { ok: res.ok, data: await res.json() };
  },

  async deletePost(postId) {
    const res = await fetch(`${API_BASE}/api/post/${postId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return res.json();
  },

  async toggleLike(postId) {
    const res = await fetch(`${API_BASE}/api/post/${postId}/like`, {
      method: 'POST',
      credentials: 'include'
    });
    return { ok: res.ok, data: await res.json() };
  },

  // PROFILO
  async getProfile(nick) {
    const res = await fetch(`${API_BASE}/api/profile/${nick}`, { credentials: 'include' });
    return res.json();
  }
};