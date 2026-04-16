import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDeTais, chamDiemHD, chamDiemPB, exportWordGVHD, exportWordGVPB } from '../../services/deTaiService';
import { getKyLvtn } from '../../services/kyLvtnService';
import { getLecturers } from '../../services/giangVienService';



export default function ChamDiem() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('hd');
  const [kyId, setKyId] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const getCurrentMaGV = () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      return user ? user.id : '';
    } catch {
      return '';
    }
  };
  const [selectedGV, setSelectedGV] = useState(getCurrentMaGV());

  useEffect(() => {
    setSelectedGV(getCurrentMaGV());
  }, []);

  const [editDeTai, setEditDeTai] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [exportingId, setExportingId] = useState(null);

  const { data: kyList } = useQuery({ queryKey: ['kyLvtn'], queryFn: getKyLvtn });
  const { data: lecturerList } = useQuery({ queryKey: ['giangVien'], queryFn: getLecturers });

  const gvMap = useMemo(() => {
    if (!lecturerList?.data) return {};
    const map = {};
    for (const gv of lecturerList.data) map[gv.maGV] = gv.tenGV;
    return map;
  }, [lecturerList]);

  const filterParams = tab === 'hd'
    ? { ky_lvtn_id: kyId || undefined, q: search || undefined, page, maGV_HD: selectedGV || undefined }
    : { ky_lvtn_id: kyId || undefined, q: search || undefined, page, maGV_PB: selectedGV || undefined };

  const { data: deTaiData, isLoading } = useQuery({
    queryKey: ['deTais-cham', tab, kyId, search, page, selectedGV],
    queryFn: () => getDeTais(filterParams),
  });

  const tableData = deTaiData?.data || [];
  const total = deTaiData?.total || 0;
  const perPage = deTaiData?.per_page || 15;

  const hdMut = useMutation({
    mutationFn: ({ id, data }) => chamDiemHD(id, data),
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['deTais-cham'] });
      setTimeout(() => {
        setShowModal(false);
        setEditDeTai(null);
        setSaveSuccess(false);
      }, 1200);
    },
  });

  const pbMut = useMutation({
    mutationFn: ({ id, data }) => chamDiemPB(id, data),
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['deTais-cham'] });
      setTimeout(() => {
        setShowModal(false);
        setEditDeTai(null);
        setSaveSuccess(false);
      }, 1200);
    },
  });

  function openEdit(dt) {
    setEditDeTai(dt);
    let nhanXet = '';
    let diem = 0;

    if (tab === 'hd') {
      nhanXet = dt.nhanXetHuongDan ?? '';
      diem = dt.diemHuongDan ?? 0;
    } else if (tab === 'pb') {
      nhanXet = dt.nhanXetPhanBien ?? '';
      diem = dt.diemPhanBien ?? 0;
    }

    setEditForm({ tong_diem: diem, nhan_xet: nhanXet });
    setSaveSuccess(false);
    setShowModal(true);
  }



  function handleSave() {
    const payload = {
      tong_diem: editForm.tong_diem,
      nhan_xet: editForm.nhan_xet,
    };
    if (tab === 'hd') {
      hdMut.mutate({ id: editDeTai.maDeTai, data: payload });
    } else {
      pbMut.mutate({ id: editDeTai.maDeTai, data: payload });
    }
  }

  async function handleExport(dt) {
    setExportingId(dt.maDeTai);
    try {
      if (tab === 'hd') {
        await exportWordGVHD(dt.maDeTai);
      } else {
        await exportWordGVPB(dt.maDeTai);
      }
    } catch {
      alert('Xuất file thất bại, vui lòng thử lại.');
    } finally {
      setExportingId(null);
    }
  }

  const isSaving = hdMut.isPending || pbMut.isPending;
  const isError = hdMut.isError || pbMut.isError;

  function handleTabChange(t) {
    setTab(t);
    setPage(1);
    setSearch('');
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Chấm điểm HD/PB</h1>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => handleTabChange('hd')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${tab === 'hd' ? 'bg-blue-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Hướng dẫn
        </button>
        <button
          onClick={() => handleTabChange('pb')}
          className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${tab === 'pb' ? 'bg-blue-500 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          Phản biện
        </button>
      </div>

      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <select
          value={kyId}
          onChange={e => { setKyId(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả kỳ</option>
          {kyList?.data?.map(k => (
            <option key={k.id} value={k.id}>{k.ten}</option>
          ))}
        </select>

        <select
          value={selectedGV}
          onChange={e => { setSelectedGV(e.target.value); setPage(1); }}
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          <option value="">Tất cả giảng viên</option>
          {lecturerList?.data?.map(gv => (
            <option key={gv.maGV} value={gv.maGV}>{gv.tenGV}</option>
          ))}
        </select>

        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Tìm tên đề tài..."
          className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white flex-1 min-w-[200px]"
        />
      </div>

      <div className="bg-white rounded-lg border border-slate-200 overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Tên đề tài</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{tab === 'hd' ? 'GVHD' : 'GVPB'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sinh viên</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">{tab === 'hd' ? 'Điểm HD' : 'Điểm PB'}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Nhận xét</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, ci) => (
                    <td key={ci} className="px-4 py-3 border-t border-slate-100">
                      <div className="bg-slate-100 animate-pulse rounded h-4 w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : tableData.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center">
                  <p className="text-slate-500 font-semibold">Chưa có đề tài</p>
                  <p className="text-sm text-slate-400 mt-1">Không có dữ liệu phù hợp.</p>
                </td>
              </tr>
            ) : (
              tableData.map(dt => {
                const diem = tab === 'hd' ? dt.diemHuongDan : dt.diemPhanBien;
                const nhanXet = tab === 'hd' ? dt.nhanXetHuongDan : dt.nhanXetPhanBien;
                const maGV = tab === 'hd' ? dt.maGV_HD : dt.maGV_PB;
                const daDiem = diem !== null && diem !== undefined && diem !== '';
                return (
                  <tr key={dt.maDeTai} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 font-medium">{dt.tenDeTai}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100 whitespace-nowrap">
                      {maGV && gvMap[maGV] ? gvMap[maGV] : (maGV || <span className="text-slate-400 italic">Chưa có</span>)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                      {Array.isArray(dt.sinh_viens) && dt.sinh_viens.length > 0 ? (
                        dt.sinh_viens.map(sv => (
                          <span key={sv.mssv} className="block">{sv.hoTen} ({sv.mssv})</span>
                        ))
                      ) : <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-3 text-sm border-t border-slate-100 text-center">
                      {daDiem
                        ? <span className="font-semibold text-blue-600">{diem}</span>
                        : <span className="text-slate-400 italic">Chưa chấm</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700 border-t border-slate-100">
                      {nhanXet || <span className="text-slate-400 italic">Chưa có</span>}
                    </td>
                    <td className="px-4 py-3 border-t border-slate-100">
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => openEdit(dt)}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                        >
                          Chấm điểm
                        </button>
                        {daDiem && (
                          <button
                            onClick={() => handleExport(dt)}
                            disabled={exportingId === dt.maDeTai}
                            className="text-sm text-green-600 hover:text-green-800 font-medium whitespace-nowrap disabled:opacity-50"
                          >
                            {exportingId === dt.maDeTai ? 'Đang tải...' : 'Xuất Word'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {total > perPage && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-slate-500">
            Hiển thị {(page - 1) * perPage + 1}-{Math.min(page * perPage, total)} / {total} đề tài
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >Trước</button>
            {[...Array(Math.ceil(total / perPage))].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-3 py-1 text-sm border rounded ${page === i + 1 ? 'bg-blue-500 text-white border-blue-500' : 'border-slate-200 hover:bg-slate-50'}`}
              >{i + 1}</button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(total / perPage), p + 1))}
              disabled={page >= Math.ceil(total / perPage)}
              className="px-3 py-1 text-sm border border-slate-200 rounded hover:bg-slate-50 disabled:opacity-50"
            >Sau</button>
          </div>
        </div>
      )}

      {showModal && editDeTai && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-1">
              {tab === 'hd' ? 'Chấm điểm hướng dẫn' : 'Chấm điểm phản biện'}
            </h2>
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
              <label className="text-xs font-medium text-slate-600 mb-2 block">Điểm (0-10)</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={editForm.tong_diem ?? ''}
                onChange={e => setEditForm(f => ({ ...f, tong_diem: e.target.value }))}
                className="border border-slate-300 rounded px-3 py-2 text-sm w-full max-w-[150px] focus:outline-blue-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-600 mb-1">Nhận xét</label>
              <textarea
                rows={4}
                value={editForm.nhan_xet ?? ''}
                onChange={e => setEditForm(f => ({ ...f, nhan_xet: e.target.value }))}
                className="border border-slate-300 rounded px-3 py-2 text-sm w-full focus:outline-blue-500"
              />
            </div>

            {isError && <p className="text-red-500 text-sm mb-3">Có lỗi xảy ra, vui lòng thử lại.</p>}

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-slate-200 hover:bg-slate-300 text-sm"
              >Hủy</button>
              <button
                onClick={handleSave}
                disabled={isSaving || saveSuccess}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 text-sm disabled:opacity-60"
              >
                {saveSuccess ? 'Đã lưu!' : isSaving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
