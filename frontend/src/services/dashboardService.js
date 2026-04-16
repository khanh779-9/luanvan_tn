import api from './api';

export async function getGiaiDoan() {
  const res = await api.get('/giai-doan');
  return res.data;
}

export async function getDeTaiStats() {
  const res = await api.get('/de-tai');
  const data = res.data?.data || res.data || [];
  const list = Array.isArray(data) ? data : [];
  return {
    total: list.length,
    finished: list.filter(d => d.trangThai === 'dat').length,
  };
}

export async function getStudentStats() {
  const res = await api.get('/sinh-vien');
  const total = res.data?.total || res.data?.meta?.total || 0;
  return { total };
}

export async function getOverallStats() {
  const res = await api.get('/stats');
  return res.data;
}
