import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeTais } from '../../services/deTaiService';
import { chamDiemGK } from '../../services/giuaKyService';
import Modal from '../../components/common/Modal';

export default function GVHDGiuaKyPage() {
  const queryClient = useQueryClient();
  const [editDeTai, setEditDeTai] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Lấy mã GVHD hiện tại từ localStorage
  const getCurrentMaGV = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user ? user.id : '';
    } catch {
      return '';
    }
  };
  const maGV_HD = getCurrentMaGV();

  const { data: deTaiData, isLoading } = useQuery({
    queryKey: ['deTais', { maGV_HD, q: search }],
    queryFn: () => getDeTais({ maGV_HD, q: search || undefined }),
  });
  const tableData = deTaiData?.data || [];

  const updateMut = useMutation({
    mutationFn: ({ deTaiId, data }) => chamDiemGK(deTaiId, data),
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries(['deTais']);
      setTimeout(() => {
        setShowEditModal(false);
        setEditDeTai(null);
        setEditForm({});
        setSaveSuccess(false);
      }, 1500);
    },
  });

  function openEdit(deTai) {
    setEditDeTai(deTai);
    let nhanXet = deTai.nhanXetGiuaKy ?? '';
    let tong = deTai.diemGiuaKy ?? 0;
    setEditForm({ tong_diem: tong, nhanXet });
    setSaveSuccess(false);
    setShowEditModal(true);
  }

  const hasInput = editForm.tong_diem !== null && editForm.tong_diem !== undefined && editForm.tong_diem !== '';
  const trangThaiGiuaKy = hasInput ? (editForm.tong_diem >= 5 ? 'dat' : 'khong_dat') : null;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Chấm điểm giữa kỳ</h1>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Tìm kiếm đề tài, sinh viên..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        />
      </div>
      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tên đề tài</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Sinh viên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Điểm giữa kỳ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
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
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài</p>
                  <p className="text-sm text-slate-400 mt-1">Không có dữ liệu phù hợp.</p>
                </td>
              </tr>
            ) : (
              tableData.map(deTai => {
                const trangThai = deTai.trangThaiGiuaKy;
                return (
                  <tr key={deTai.maDeTai} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-semibold whitespace-nowrap align-middle">{deTai.tenDeTai}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 align-middle">
                      {Array.isArray(deTai.sinh_viens) && deTai.sinh_viens.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {deTai.sinh_viens.map(sv => (
                            <span key={sv.mssv} className="block text-slate-700">
                              {sv.hoTen} (<span className="font-medium text-slate-800">{sv.mssv}</span>)
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 text-center align-middle">
                      {deTai.diemGiuaKy !== undefined && deTai.diemGiuaKy !== null
                        ? <span className="font-semibold text-blue-600">{deTai.diemGiuaKy}</span>
                        : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    {/* <td className="px-4 py-3 border-t border-slate-100 align-middle">
                      {trangThai ? (
                        <span className={`px-2 py-1 rounded text-xs font-medium ${trangThai === 'dat' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {trangThai === 'dat' ? 'Đạt' : 'Không đạt'}
                        </span>
                      ) : <span className="text-slate-400 italic text-sm">Chưa có</span>}
                    </td> */}
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 align-middle">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        onClick={() => openEdit(deTai)}
                      >Nhập điểm</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {showEditModal && editDeTai && (
        <Modal isOpen={true} onClose={() => setShowEditModal(false)} title="Nhập điểm giữa kỳ" maxWidth="max-w-lg">
          <p className="text-sm text-slate-500 mb-4">{editDeTai.tenDeTai}</p>
          {Array.isArray(editDeTai.sinh_viens) && editDeTai.sinh_viens.length > 0 && (
            <div className="mb-4 bg-slate-50 rounded p-3">
              <p className="text-xs font-medium text-slate-500 mb-1">Sinh viên</p>
              {editDeTai.sinh_viens.map(sv => (
                <p key={sv.mssv} className="text-sm text-slate-700">{sv.hoTen} — {sv.mssv}</p>
              ))}
            </div>
          )}
          <div className="mb-4">
            <label className="text-xs font-medium text-slate-600 mb-2 block">Điểm giữa kỳ (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={editForm.tong_diem ?? ''}
              onChange={e => setEditForm(f => ({ ...f, tong_diem: e.target.value }))}
              className="border border-slate-300 rounded px-3 py-2 text-sm w-full max-w-[150px] focus:outline-blue-500"
            />
            <div className="flex items-center gap-3 mt-4">
              <span className="text-sm text-slate-600 flex-1">Trạng thái</span>
              {trangThaiGiuaKy && (
                <span className={`px-2 py-1 rounded text-xs font-medium ${trangThaiGiuaKy === 'dat' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {trangThaiGiuaKy === 'dat' ? 'Đạt' : 'Không đạt'}
                </span>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600 mb-1">Nhận xét</label>
            <textarea
              rows={3}
              value={editForm.nhanXet ?? ''}
              onChange={e => setEditForm(f => ({ ...f, nhanXet: e.target.value }))}
              className="border border-slate-300 rounded px-2 py-1 text-sm w-full focus:outline-blue-500"
            />
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button
              className="px-4 py-2 rounded border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700"
              onClick={() => setShowEditModal(false)}
            >Hủy</button>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
              disabled={updateMut.isPending || saveSuccess}
              onClick={() => {
                if (!updateMut.isPending && !saveSuccess) {
                  updateMut.mutate({
                    deTaiId: editDeTai?.maDeTai,
                    data: {
                      tong_diem: editForm.tong_diem,
                      nhan_xet: editForm.nhanXet,
                    },
                  });
                }
              }}
            >
              {saveSuccess ? 'Đã lưu!' : updateMut.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
          {updateMut.isError && <div className="text-red-500 mt-2 text-sm">Có lỗi xảy ra, vui lòng thử lại.</div>}
        </Modal>
      )}
    </div>
  );
}
