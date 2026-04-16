import api from "./api";

export async function loginSinhVien({ mssv, password }) {
  return (await api.post("/login-sv", { mssv, password })).data;
}
