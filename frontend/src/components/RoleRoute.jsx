import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


export default function RoleRoute({ allowed }) {
  let { user } = useAuth() || {};

  // Chuẩn hoá role: chỉ nhận 'thuky', 'gv', 'sinhvien'
  let role = user?.role?.toLowerCase();
  if (role === 'gvhd' || role === 'gvpb') {
    role = 'gv';
  } else if (role === 'sv' || role === 'sinhvien') {
    role = 'sinhvien';
  } // giữ nguyên 'thuky', các role khác sẽ bị chặn


  // Chặn nếu không đúng role được phép
  if (allowed !== role) {
    // Điều hướng hợp lý tuỳ từng role
    if (role === 'thuky') return <Navigate to="/admin/tong-quan" replace />;
    if (role === 'gv') return <Navigate to="/gv/tong-quan" replace />;
    if (role === 'sinhvien') return <Navigate to="/sv/tong-quan" replace />;
    // Nếu không xác định, về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu hợp lệ, cho phép render các route con
  return <Outlet />;
}
