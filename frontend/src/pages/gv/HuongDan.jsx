import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeTais, chamDiemHD } from '../../services/deTaiService';
import Modal from '../../components/common/Modal';

export default function GVHDHuongDanPage() {
  const queryClient = useQueryClient();
  const [editDeTai, setEditDeTai] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Lấy mã GV hiện tại từ localStorage
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
    mutationFn: ({ deTaiId, data }) => chamDiemHD(deTaiId, data),
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
    let nhanXet = deTai.nhanXetHuongDan ?? '';
    let tong = deTai.diemHuongDan ?? 0;
    setEditForm({ tong_diem: tong, nhanXet });
    setSaveSuccess(false);
    setShowEditModal(true);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Chấm điểm hướng dẫn</h1>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Điểm Hướng dẫn</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(4)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài</p>
                  <p className="text-sm text-slate-400 mt-1">Không có dữ liệu phù hợp.</p>
                </td>
              </tr>
            ) : (
              tableData.map(deTai => {
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
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 text-left align-middle">
                      {deTai.diemHuongDan !== undefined && deTai.diemHuongDan !== null
                        ? <span className="font-semibold text-blue-600">{deTai.diemHuongDan}</span>
                        : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 align-middle">
                      <button
                        className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
                        onClick={() => openEdit(deTai)}
                      >Nhập điểm/Nhận xét</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      
      {showEditModal && editDeTai && (
        <Modal isOpen={true} onClose={() => setShowEditModal(false)} title="Phiếu chấm Hướng dẫn" maxWidth="max-w-lg">
          <p className="text-sm text-slate-500 mb-4">{editDeTai.tenDeTai}</p>
          {Array.isArray(editDeTai.sinh_viens) && editDeTai.sinh_viens.length > 0 && (
            <div className="mb-4 bg-slate-50 rounded p-3 border border-slate-100">
              <p className="text-xs font-bold text-slate-500 mb-2 uppercase">Sinh viên thực hiện:</p>
              {editDeTai.sinh_viens.map(sv => (
                <p key={sv.mssv} className="text-sm text-slate-700 mb-1 font-medium">{sv.hoTen} — {sv.mssv}</p>
              ))}
            </div>
          )}
          
          <div className="mb-4">
            <label className="text-xs font-bold text-slate-600 mb-2 block uppercase">Điểm Hướng dẫn (0-10)</label>
            <input
              type="number"
              min="0"
              max="10"
              step="0.5"
              value={editForm.tong_diem ?? ''}
              onChange={e => setEditForm(f => ({ ...f, tong_diem: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full max-w-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase">Nhận xét của Cán bộ Hướng dẫn</label>
            <textarea
              rows={4}
              value={editForm.nhanXet ?? ''}
              placeholder="Nhập đánh giá và nhận xét cho nhóm sinh viên..."
              onChange={e => setEditForm(f => ({ ...f, nhanXet: e.target.value }))}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
            <button
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm transition-colors"
              onClick={() => setShowEditModal(false)}
            >Hủy bỏ</button>
            <button
              className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 text-sm disabled:opacity-60 transition-colors"
              disabled={updateMut.isPending || saveSuccess}
              onClick={() => {
                if (!updateMut.isPending && !saveSuccess) {
                  updateMut.mutate({
                    deTaiId: editDeTai?.maDeTai,
                    data: {
                      diemHuongDan: editForm.tong_diem,
                      nhanXetHuongDan: editForm.nhanXet,
                    },
                  });
                }
              }}
            >
              {saveSuccess ? 'Đã lưu thành công!' : updateMut.isPending ? 'Đang lưu...' : 'Hoàn tất chấm điểm'}
            </button>
          </div>
          {updateMut.isError && <div className="text-red-500 mt-3 text-sm text-center">Có lỗi xảy ra, vui lòng kiểm tra lại.</div>}
        </Modal>
      )}
    </div>
  );
}
