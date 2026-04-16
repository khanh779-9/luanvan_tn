import api from './api';

export async function getAssignments(params) {
  return (await api.get('/phan-cong', { params })).data;
}
export async function createAssignment(data) {
  return (await api.post('/phan-cong', data)).data;
}
export async function updateAssignment(id, data) {
  return (await api.put(`/phan-cong/${id}`, data)).data;
}
export async function deleteAssignment(id) {
  return (await api.delete(`/phan-cong/${id}`)).data;
}
