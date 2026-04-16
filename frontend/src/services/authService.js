import api from './api';

export async function login(maGV, password) {
  const res = await api.post('/login', { maGV, password });
  return res.data;
}

export async function getMe() {
  const res = await api.get('/me');
  return res.data;
}

export async function logout() {
  await api.post('/logout');
}
