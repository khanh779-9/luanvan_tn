import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useLocation } from "react-router-dom";

const statusMessages = {
  con_phancong: "Chưa đến hoặc đã qua thời hạn phân công",
  con_dangky: "Chưa đến hoặc đã qua thời hạn đăng ký",
  con_chamGK: "Chưa đến hoặc đã qua thời hạn chấm điểm GK",
  con_chamPB: "Chưa đến hoặc đã qua thời hạn chấm điểm PB",
  con_chamHD: "Chưa đến hoặc đã qua thời hạn chấm điểm HD",
};

function StageStatusBanner() {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    api
      .get("/giai-doan/current")
      .then((res) => {
        let data = res.data?.data || {};

        // Khai báo map ánh xạ giữa đường dẫn trang và cờ trạng thái tương ứng
        const routeKeyMap = {
          "/admin/phancong": "con_phancong",
          "/sv/dang-ky-detai": "con_dangky",
          "/gv/giua-ky": "con_chamGK",
          "/gv/phanbien": "con_chamPB",
          "/gv/huongdan": "con_chamHD",
        };

        const currentKey = routeKeyMap[location.pathname];
        let inactiveMessages = [];

        // Nếu đường dẫn hiện tại nằm trong map quản lý và trạng thái bị false (chưa/hết hạn)
        if (currentKey) {
          const value = data[currentKey];
          if (value === false || value === "false") {
            inactiveMessages.push(statusMessages[currentKey]);
          }
        }

        setStatus(inactiveMessages);
      })
      .catch(() => setStatus(["Không thể lấy trạng thái giai đoạn"]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || status.length === 0) return null;

  return (
    <div
      style={{
        background: "#fff3cd",
        color: "#856404",
        padding: "8px 16px",
        border: "1px solid #ffeeba",
        borderRadius: 4,
        marginBottom: 16,
      }}
    >
      {status.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );
}

export default StageStatusBanner;
