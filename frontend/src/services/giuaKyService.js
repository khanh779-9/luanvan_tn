import api from './api';

export async function updateGiuaKy(deTaiId, data) {
  const res = await api.put(`/de-tai/${deTaiId}`, data);
  return res.data;
}

export async function chamDiemGK(deTaiId, data) {
  const res = await api.put(`/de-tai/${deTaiId}/cham-diem-gk`, data);
  return res.data;
}
