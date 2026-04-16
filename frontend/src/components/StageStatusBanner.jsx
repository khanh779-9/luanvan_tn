import React, { useEffect, useState } from 'react';
import api from '../services/api';

const statusMessages = {
  con_phancong: 'Chưa đến hoặc đã qua thời hạn phân công',
  con_dangky: 'Chưa đến hoặc đã qua thời hạn đăng ký',
  con_chamGK: 'Chưa đến hoặc đã qua thời hạn chấm điểm GK',
  con_chamPB: 'Chưa đến hoặc đã qua thời hạn chấm điểm PB',
  con_chamHD: 'Chưa đến hoặc đã qua thời hạn chấm điểm HD',
};

function StageStatusBanner() {
  const [status, setStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/giai-doan/current')
      .then(res => {
        const data = res.data?.data || {};
        console.log('Trạng thái giai đoạn:', res);
        console.log('Dữ liệu giai đoạn:', res.data);
        console.log('Dữ liệu giai đoạn (data):', res.data.data);
        const inactive = Object.entries(data)
          .filter(([key, value]) => value === false && statusMessages[key])
          .map(([key]) => statusMessages[key]);
        setStatus(inactive);
      })
      .catch(() => setStatus(['Không thể lấy trạng thái giai đoạn']))
      .finally(() => setLoading(false));
  }, []);

  if (loading || status.length === 0) return null;

  return (
    <div style={{background:'#fff3cd',color:'#856404',padding:'8px 16px',border:'1px solid #ffeeba',borderRadius:4,marginBottom:16}}>
      {status.map((msg, idx) => (
        <div key={idx}>{msg}</div>
      ))}
    </div>
  );
}

export default StageStatusBanner;
