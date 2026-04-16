import api from './api';

export async function getStages() {
  return (await api.get('/giai-doan')).data;
}
export async function getCurrentStage() {
  return (await api.get('/giai-doan/current')).data;
}
export async function createStage(data) {
  return (await api.post('/giai-doan', data)).data;
}
export async function updateStage(id, data) {
  return (await api.put(`/giai-doan/${id}`, data)).data;
}
export async function deleteStage(id) {
  return (await api.delete(`/giai-doan/${id}`)).data;
}
