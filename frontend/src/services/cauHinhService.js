import api from './api';

export async function getThoiGianTuyChinh() {
  const res = await api.get("/cauhinh/thoi-gian-tuy-chinh");
  return res.data;
}

export async function setThoiGianTuyChinh(data) {
  const res = await api.post("/cauhinh/thoi-gian-tuy-chinh", data);
  return res.data;
}
