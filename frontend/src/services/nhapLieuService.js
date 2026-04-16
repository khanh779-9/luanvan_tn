import api from './api';

export function getList(params) {
  return api.get('/nhap-lieu', { params });
}

export function createRecord(data) {
  return api.post('/nhap-lieu', data);
}

export function updateRecord(id, data) {
  return api.put(`/nhap-lieu/${id}`, data);
}

export function deleteRecord(id) {
  return api.delete(`/nhap-lieu/${id}`);
}

export function importExcel(formData) {
  return api.post('/nhap-lieu-import-excel', formData);
}
