import api from './api';

export async function getStudents(params) {
  return (await api.get('/students', { params })).data;
}
export async function createStudent(data) {
  // Đúng chuẩn backend: mssv, hoTen, lop, email, soDienThoai, maDeTai
  return (await api.post('/students', {
    mssv: data.mssv,
    hoTen: data.hoTen,
    lop: data.lop,
    email: data.email,
    soDienThoai: data.soDienThoai,
    maDeTai: data.maDeTai,
  })).data;
}
export async function updateStudent(mssv, data) {
  return (await api.put(`/students/${mssv}`, {
    hoTen: data.hoTen,
    lop: data.lop,
    email: data.email,
    soDienThoai: data.soDienThoai,
    maDeTai: data.maDeTai,
  })).data;
}
export async function deleteStudent(mssv) {
  return (await api.delete(`/students/${mssv}`)).data;
}

// Lấy danh sách lớp
export async function getLopList(params) {
  return (await api.get('/students/lop-list', { params })).data;
}

// Import danh sách sinh viên từ file
export async function importStudents(file, kyLvtnId) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('ky_lvtn_id', kyLvtnId);
  const res = await api.post('/students/import', formData, {
    headers: { 'Content-Type': undefined },
  });
  return res.data;
}
