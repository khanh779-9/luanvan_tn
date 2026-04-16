
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../services/api";
import DangKyDeTaiModal from "./DangKyDeTaiModal";

export default function DangKyDeTaiSV() {
  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const {
    data,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["my-topic-registration-form"],
    queryFn: () => api.get("/topic-registration-form/my").then((r) => r.data.data),
    refetchOnWindowFocus: false,
  });

  const handleOpenModal = (edit = null) => {
    setEditData(edit);
    setShowModal(true);
  };

  return (
    <div className="mx-auto px-2 sm:px-0">
      <h1 className="text-2xl font-bold text-slate-900 mb-7 tracking-tight">Đăng ký đề tài</h1>
      <div className="bg-white rounded-2xl shadow border border-slate-100 p-7">
        <h2 className="text-lg font-semibold text-blue-800 mb-5">Thông tin đăng ký</h2>
        {isLoading ? (
          <div className="text-slate-400 text-base">Đang tải...</div>
        ) : data ? (
          <>
            <div className="space-y-3 text-[15px]">
              <div>
                <span className="font-medium text-slate-700">Tên đề tài:</span>{" "}
                <span className="text-slate-900">{data.topic_title}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Mô tả:</span>{" "}
                <span className="text-slate-800">{data.topic_description || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Loại đề tài:</span>{" "}
                <span className="text-slate-800">{data.topic_type === "mot_sinh_vien" ? "Một sinh viên" : "Hai sinh viên"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Trạng thái:</span>{" "}
                {data.status === "cho_duyet" ? (
                  <span className="text-orange-500 font-semibold">Chờ duyệt</span>
                ) : data.status === "da_duyet" ? (
                  <span className="text-green-600 font-semibold">Được duyệt</span>
                ) : (
                  <span className="text-red-500 font-semibold">Từ chối</span>
                )}
              </div>
              <div>
                <span className="font-medium text-slate-700">GVHD:</span>{" "}
                <span className="text-slate-800">{data.gvhd_code || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">GVPB:</span>{" "}
                <span className="text-slate-800">{data.gvpb_code || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Ghi chú:</span> <span className="text-slate-800">{data.note || "—"}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">Ngày đăng ký:</span>{" "}
                <span className="text-slate-800">{data.registered_at ? new Date(data.registered_at).toLocaleString() : "—"}</span>
              </div>
            </div>
            <div className="flex justify-end mt-7">
              <button
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-5 py-2 text-[15px] font-medium rounded-lg shadow-sm transition-colors"
                onClick={() => handleOpenModal(data)}
              >
                Chỉnh sửa thông tin
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-slate-400 text-base">Bạn chưa đăng ký đề tài nào.</div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-[15px] font-medium rounded-lg shadow-sm transition-colors"
              onClick={() => handleOpenModal(null)}
            >
              Đăng ký đề tài mới
            </button>
          </div>
        )}
      </div>
      <DangKyDeTaiModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refetch();
        }}
        editData={editData}
      />
    </div>
  );
}
