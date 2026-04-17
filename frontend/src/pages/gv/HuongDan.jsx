import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeTais, chamDiemHD } from '../../services/deTaiService';
import Modal from '../../components/common/Modal';

import { useAuth } from '../../context/AuthContext';

export default function GVHDHuongDanPage() {
  const queryClient = useQueryClient();
  const [editDeTai, setEditDeTai] = useState(null);
  const [editForm, setEditForm] = useState({
    // Các trường cơ bản
    tong_diem: '',
    nhanXet: '',
    uuDiem: '',
    thieuSot: '',
    ndDieuChinh: '',
    cauHoi: '',
    thuyetMinh: '', // "Đạt" hoặc "Không đạt"
    diemPhanTich: ['', ''],
    diemThietKe: ['', ''],
    diemHienThuc: ['', ''],
    diemBaoCao: ['', ''],
    diemTongCong: ['', ''],
    diemFinal: ['', ''],
    deNghi: ['', ''], // "Được bảo vệ", "Không được bảo vệ", "Bổ sung"
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [search, setSearch] = useState('');

  // Lấy mã GV hiện tại từ context
  const { user } = useAuth() || {};
  const maGV_HD = user?.id || '';

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
    // Nếu có data_json.gvhd thì fill vào form, không thì lấy từ các trường cũ
    const gvhd = deTai.data_json && deTai.data_json.gvhd ? deTai.data_json.gvhd : {};
    setEditForm(f => ({
      ...f,
      tong_diem: gvhd.tong_diem ?? deTai.diemHuongDan ?? '',
      nhanXet: gvhd.nhanXet ?? deTai.nhanXetHuongDan ?? '',
      uuDiem: gvhd.uuDiem ?? deTai.uuDiem ?? '',
      thieuSot: gvhd.thieuSot ?? deTai.thieuSot ?? '',
      ndDieuChinh: gvhd.ndDieuChinh ?? deTai.ndDieuChinh ?? '',
      cauHoi: gvhd.cauHoi ?? deTai.cauHoi ?? '',
      thuyetMinh: gvhd.thuyetMinh ?? deTai.thuyetMinh ?? '',
      diemPhanTich: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.diemPhanTich ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.diemPhanTich ?? '') : ['']),
      diemThietKe: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.diemThietKe ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.diemThietKe ?? '') : ['']),
      diemHienThuc: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.diemHienThuc ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.diemHienThuc ?? '') : ['']),
      diemBaoCao: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.diemBaoCao ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.diemBaoCao ?? '') : ['']),
      diemTongCong: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.diemTongCong ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.diemTongCong ?? '') : ['']),
      diemFinal: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.diemFinal ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.diemFinal ?? '') : ['']),
      deNghi: Array.isArray(gvhd.sinh_viens) ? gvhd.sinh_viens.map(sv => sv.deNghi ?? '') : (Array.isArray(deTai.sinh_viens) ? deTai.sinh_viens.map(sv => sv.deNghi ?? '') : ['']),
    }));
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
        <Modal isOpen={true} onClose={() => setShowEditModal(false)} title="Phiếu chấm Hướng dẫn" maxWidth="max-w-2xl">
          <div className="max-h-[70vh] overflow-y-auto pr-0">
            <div className="mb-4 p-2 rounded border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 uppercase">Tên đề tài</span>
              <p className="text-sm font-semibold text-slate-800 mt-1">{editDeTai.tenDeTai}</p>
            </div>

            {Array.isArray(editDeTai.sinh_viens) && editDeTai.sinh_viens.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">1. Đánh giá sinh viên</h3>
                <div className="space-y-2">
                  {editDeTai.sinh_viens.map((sv, idx) => (
                    <div key={sv.mssv} className="bg-white border border-slate-200 rounded p-2">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                        <div className="w-6 h-6 rounded bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800">{sv.hoTen} - ({sv.mssv})</h4>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Phân tích</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemPhanTich[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemPhanTich]; arr[idx] = e.target.value; return { ...f, diemPhanTich: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Thiết kế</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemThietKe[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemThietKe]; arr[idx] = e.target.value; return { ...f, diemThietKe: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Hiện thực</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemHienThuc[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemHienThuc]; arr[idx] = e.target.value; return { ...f, diemHienThuc: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Kiểm tra SP</label>
                          <input type="number" min="0" max="10" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemBaoCao[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemBaoCao]; arr[idx] = e.target.value; return { ...f, diemBaoCao: arr }; })}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-700 mb-1">Tổng cộng</label>
                          <input type="number" min="0" max="40" step="0.5" className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 font-medium placeholder:text-slate-300" placeholder="0.0"
                            value={editForm.diemTongCong[idx] ?? ''}
                            onChange={e => setEditForm(f => { const arr = [...f.diemTongCong]; arr[idx] = e.target.value; return { ...f, diemTongCong: arr }; })}
                          />
                        </div>
                       
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-700 whitespace-nowrap">Đề nghị hội đồng:</label>
                        <select className="w-full md:w-auto min-w-[120px] border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400" 
                          value={editForm.deNghi[idx] ?? ''}
                          onChange={e => setEditForm(f => { const arr = [...f.deNghi]; arr[idx] = e.target.value; return { ...f, deNghi: arr }; })}>
                          <option value="">-- Chọn đề nghị --</option>
                          <option value="Được bảo vệ">Được bảo vệ</option>
                          <option value="Không được bảo vệ">Không được bảo vệ</option>
                          <option value="Bổ sung">Bổ sung/hiệu chỉnh để được bảo vệ</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-2">
              <h3 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">2. Đánh giá chung của GVHD</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Ưu điểm chính</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập ưu điểm..." value={editForm.uuDiem} onChange={e => setEditForm(f => ({ ...f, uuDiem: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Thiếu sót chính</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập thiếu sót..." value={editForm.thieuSot} onChange={e => setEditForm(f => ({ ...f, thieuSot: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Yêu cầu điều chỉnh/bổ sung (nếu có)</label>
                  <textarea rows={1} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập yêu cầu..." value={editForm.ndDieuChinh} onChange={e => setEditForm(f => ({ ...f, ndDieuChinh: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Câu hỏi dành cho sinh viên</label>
                  <textarea rows={1} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập danh sách câu hỏi..." value={editForm.cauHoi} onChange={e => setEditForm(f => ({ ...f, cauHoi: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nhận xét chung</label>
                  <textarea rows={2} className="w-full border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 placeholder:text-slate-300" placeholder="Nhập nhận xét..." value={editForm.nhanXet} onChange={e => setEditForm(f => ({ ...f, nhanXet: e.target.value }))} />
                </div>
                <div className="md:col-span-2 mt-2 flex flex-col md:flex-row md:items-center gap-2">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Kết luận Thuyết minh:</label>
                  <select className="w-full md:w-32 border border-slate-200 rounded px-2 py-1 text-xs bg-white focus:outline-none focus:border-blue-400 font-medium" value={editForm.thuyetMinh} onChange={e => setEditForm(f => ({ ...f, thuyetMinh: e.target.value }))}>
                    <option value="">-- Chọn kết quả --</option>
                    <option value="Đạt">Đạt</option>
                    <option value="Không đạt">Không đạt</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-4 pt-3 border-t border-slate-200 bg-white">
            <button
              className="px-3 py-1.5 rounded border border-slate-200 text-slate-700 font-medium text-xs hover:bg-slate-50 transition-colors"
              onClick={() => setShowEditModal(false)}
            >Hủy</button>
            <button
              className="px-3 py-1.5 rounded bg-slate-200 text-slate-700 font-medium text-xs transition-colors flex items-center gap-1"
              onClick={async () => {
                if (editDeTai?.maDeTai) {
                  const { exportWordGVHD } = await import('../../services/deTaiService');
                  exportWordGVHD(editDeTai.maDeTai);
                }
              }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Xuất Word
            </button>
            <button
              className="px-4 py-1.5 rounded bg-blue-600 text-white font-medium text-xs disabled:opacity-60 disabled:cursor-not-allowed transition-colors shadow-sm"
              disabled={updateMut.isPending || saveSuccess}
              onClick={() => {
                if (!updateMut.isPending && !saveSuccess) {
                  updateMut.mutate({
                    deTaiId: editDeTai?.maDeTai,
                    data: {
                      diemHuongDan: editForm.tong_diem,
                      nhanXetHuongDan: editForm.nhanXet,
                      uuDiem: editForm.uuDiem,
                      thieuSot: editForm.thieuSot,
                      ndDieuChinh: editForm.ndDieuChinh,
                      cauHoi: editForm.cauHoi,
                      thuyetMinh: editForm.thuyetMinh,
                      diemPhanTich: editForm.diemPhanTich,
                      diemThietKe: editForm.diemThietKe,
                      diemHienThuc: editForm.diemHienThuc,
                      diemBaoCao: editForm.diemBaoCao,
                      diemTongCong: editForm.diemTongCong,
                      diemFinal: editForm.diemFinal,
                      deNghi: editForm.deNghi,
                      data_json: {
                        gvhd: {
                          tong_diem: editForm.tong_diem,
                          nhanXet: editForm.nhanXet,
                          uuDiem: editForm.uuDiem,
                          thieuSot: editForm.thieuSot,
                          ndDieuChinh: editForm.ndDieuChinh,
                          cauHoi: editForm.cauHoi,
                          thuyetMinh: editForm.thuyetMinh,
                          sinh_viens: Array.isArray(editDeTai.sinh_viens) ? editDeTai.sinh_viens.map((sv, idx) => ({
                            mssv: sv.mssv,
                            hoTen: sv.hoTen,
                            lop: sv.lop ?? '',
                            diemPhanTich: editForm.diemPhanTich[idx] ?? '',
                            diemThietKe: editForm.diemThietKe[idx] ?? '',
                            diemHienThuc: editForm.diemHienThuc[idx] ?? '',
                            diemBaoCao: editForm.diemBaoCao[idx] ?? '',
                            diemTongCong: editForm.diemTongCong[idx] ?? '',
                            diemFinal: editForm.diemFinal[idx] ?? '',
                            deNghi: editForm.deNghi[idx] ?? '',
                          })) : [],
                        },
                        // Nếu muốn giữ nguyên dữ liệu gvpb thì lấy từ editDeTai.data_json.gvpb nếu có
                        gvpb: (editDeTai.data_json && editDeTai.data_json.gvpb) ? editDeTai.data_json.gvpb : {
                          tong_diem: '',
                          nhanXet: '',
                          uuDiem: '',
                          thieuSot: '',
                          ndDieuChinh: '',
                          cauHoi: '',
                          thuyetMinh: '',
                          sinh_viens: Array.isArray(editDeTai.sinh_viens) ? editDeTai.sinh_viens.map(sv => ({
                            mssv: sv.mssv,
                            hoTen: sv.hoTen,
                            lop: sv.lop ?? '',
                            diemPhanTich: '',
                            diemThietKe: '',
                            diemHienThuc: '',
                            diemBaoCao: '',
                            diemTongCong: '',
                            diemFinal: '',
                            deNghi: '',
                          })) : [],
                        }
                      },
                    },
                  });
                }
              }}
            >
              {saveSuccess ? 'Đã lưu!' : updateMut.isPending ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
          {updateMut.isError && <div className="text-red-500 mt-3 text-xs text-center font-medium bg-white p-2 rounded border border-red-100">Cập nhật thất bại, vui lòng kiểm tra lại dữ liệu và thử lại.</div>}
        </Modal>
      )}
    </div>
  );
}
