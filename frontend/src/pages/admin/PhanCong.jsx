// Trang phân công cho thư ký
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { HiOutlineExclamationTriangle } from 'react-icons/hi2';
import { getAssignments, updateAssignment, deleteAssignment } from '../../services/phanCongService';
import { getLecturers } from '../../services/giangVienService';

export default function AdminPhanCongPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  const [formGVHD, setFormGVHD] = useState('');
  const [formGVPB, setFormGVPB] = useState('');

  const { data: pcData, isLoading } = useQuery({
    queryKey: ['phancong'],
    queryFn: getAssignments,
  });

  const { data: gvData } = useQuery({
    queryKey: ['giangvien'],
    queryFn: getLecturers,
  });
  
  const gvList = Array.isArray(gvData) ? gvData : (gvData?.data || []);

  const updateMut = useMutation({
    mutationFn: (data) => updateAssignment(editItem.maDeTai, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phancong'] });
      setShowFormModal(false);
      setEditItem(null);
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['phancong'] });
      setShowDeleteConfirm(false);
      setDeleteItem(null);
    },
  });

  const handleEditClick = (pc) => {
    setEditItem(pc);
    setFormGVHD(pc.maGV_HD || '');
    setFormGVPB(pc.maGV_PB || '');
    setShowFormModal(true);
  };

  const handleSave = () => {
    updateMut.mutate({
      maGV_HD: formGVHD || null,
      maGV_PB: formGVPB || null,
    });
  };

  const filtered = useMemo(() => {
    if (!pcData?.data) return [];
    if (!search.trim()) return pcData.data;
    const q = search.toLowerCase();
    return pcData.data.filter(pc =>
      pc.tenDeTai?.toLowerCase().includes(q) ||
      pc.sinh_vien?.some(sv => sv.hoTen?.toLowerCase().includes(q) || sv.mssv?.toLowerCase().includes(q)) ||
      pc.giang_vien_h_d?.tenGV?.toLowerCase().includes(q) ||
      pc.giang_vien_p_b?.tenGV?.toLowerCase().includes(q)
    );
  }, [pcData, search]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Quản lý phân công</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Tìm kiếm đề tài, sinh viên, giảng viên..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none flex-1"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Tên đề tài</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-1/4">Sinh viên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">GVHD</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">GVPB</th>
              <th className="px-4 py-3 w-32"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài nào</p>
                </td>
              </tr>
            ) : (
              filtered.map(pc => (
                <tr key={pc.maDeTai} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{pc.tenDeTai}</td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {pc.sinh_vien?.length > 0 ? (
                      <div className="space-y-1">
                        {pc.sinh_vien.map(sv => (
                          <div key={sv.mssv}>{sv.hoTen} ({sv.mssv})</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Chưa có SV</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">
                    {pc.giang_vien_h_d?.tenGV || <span className="text-slate-400 font-normal italic">Chưa phân công</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                    {pc.giang_vien_p_b?.tenGV || <span className="text-slate-400 font-normal italic">Chưa phân công</span>}
                  </td>
                  <td className="px-4 py-3 border-t border-slate-100">
                    <div className="flex gap-3 justify-end pr-2">
                      <button onClick={() => handleEditClick(pc)} className="text-sm font-medium text-blue-600 hover:text-blue-800">Sửa</button>
                      <button 
                        onClick={() => { setDeleteItem(pc); setShowDeleteConfirm(true); }} 
                        className="text-sm font-medium text-red-500 hover:text-red-700"
                        disabled={!pc.maGV_HD && !pc.maGV_PB}
                        title={!pc.maGV_HD && !pc.maGV_PB ? "Không có GV để xoá" : "Gỡ GVHD & GVPB"}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showFormModal && editItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Sửa phân công Đề tài</h3>
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-sm font-semibold text-slate-700 block mb-1">Tên đề tài:</span>
              <span className="text-sm text-slate-600">{editItem.tenDeTai}</span>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giảng viên Hướng Dẫn</label>
                <select
                  value={formGVHD}
                  onChange={e => setFormGVHD(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Chưa phân công --</option>
                  {gvList.map(gv => (
                    <option key={gv.maGV} value={gv.maGV}>{gv.tenGV} ({gv.maGV})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Giảng viên Phản Biện</label>
                <select
                  value={formGVPB}
                  onChange={e => setFormGVPB(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Chưa phân công --</option>
                  {gvList.map(gv => (
                    <option key={gv.maGV} value={gv.maGV}>{gv.tenGV} ({gv.maGV})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setShowFormModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                Hủy
              </button>
              <button 
                onClick={handleSave} 
                disabled={updateMut.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {updateMut.isPending ? 'Đang lưu...' : 'Lưu phân công'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && deleteItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-auto text-center shadow-xl">
            <HiOutlineExclamationTriangle className="text-red-500 mx-auto mb-4" size={48} />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Xóa phân công?</h3>
            <p className="text-sm text-slate-500 mb-6">Bạn có chắc muốn gỡ GVHD và GVPB khỏi đề tài này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteItem(null); }}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 rounded-lg transition-colors text-sm">Trở lại</button>
              <button onClick={() => deleteMut.mutate(deleteItem.maDeTai)} disabled={deleteMut.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors text-sm disabled:opacity-50">
                {deleteMut.isPending ? 'Đang xóa...' : 'Xác nhận gỡ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
