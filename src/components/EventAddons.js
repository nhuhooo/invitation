import React, { useState } from "react";
import { Calendar, Map } from "lucide-react";

export const EventAddons = ({ studentName }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  // Khối return PHẢI nằm bên trong hàm EventAddons
  return (
    <div className="space-y-6 select-none relative">
      {/* EXPOSE 2 BUTTON HOOKS TO THE MAIN WORKFLOWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Save to Calendar Trigger */}
        <button
          onClick={() => setCalendarOpen(true)}
          className="w-full clay-btn btn-shimmer text-white font-bold py-3.5 rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Calendar className="w-4 h-4" /> Lưu Lịch Sự Kiện Vào Google Calendar 
        </button>

        {/* View Campus Map Trigger */}
        <button
          onClick={() => setMapOpen(true)}
          className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-full text-xs shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-300"
        >
          <Map className="w-4 h-4" /> Xem Bản Đồ 
        </button>
      </div>

      {/* MODAL 1: CALENDAR REMINDERS */}
      {calendarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-neutral-100">
            <button
              onClick={() => setCalendarOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition"
            >
              ✕
            </button>
            <div className="text-center mb-4">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-2" />
              <h3 className="text-md font-bold text-neutral-800">Lưu Lịch Lễ Tốt Nghiệp</h3>
              <p className="text-xs text-neutral-500 mt-1">
                Tải tệp lịch hoặc truy cập trực tiếp để không bỏ lỡ cột mốc rực rỡ nhất!
              </p>
            </div>
            <div className="space-y-2.5">
              <a
                href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=L%E1%BB%85+T%E1%BB%91t+Nghi%E1%BB%87p+Luminous+2026&dates=20260624T020000Z/20260624T050000Z&details=Ch%C3%BAc+m%E1%BB%ABng+t%C3%A2n+khoa+b%E1%BA%A3n!+H%C3%A3y+mang+theo+v%C3%A9+QR+check-in.&location=The+Innovation+Arena%2C+HCMC"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-primary text-white hover:bg-primary-light hover:text-primary rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                🗓️ Thêm Nhanh Vào Google Calendar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MAP AND DIRECTIONS */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in animate-duration-300">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full shadow-2xl relative border border-neutral-100 flex flex-col max-h-[90vh]">
            <button
              onClick={() => setMapOpen(false)}
              className="absolute top-4 right-4 bg-neutral-100 hover:bg-neutral-200 text-neutral-500 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-xs active:scale-95 z-10"
              aria-label="Đóng"
            >
              ✕
            </button>
            <div className="mb-4">
              <h3 className="text-base font-bold text-neutral-800">Sơ Đồ Địa Điểm & Chỉ Đường Gửi Xe</h3>
              <p className="text-xs text-neutral-500 mt-1">Cơ sở A - Đại học Kinh tế TP.HCM (UEH)</p>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-neutral-100 shadow-inner bg-neutral-50 flex items-center justify-center select-none flex-1 min-h-[250px] max-h-[60vh]">
              <img 
                src="/map.png" 
                alt="Sơ đồ chỉ đường UEH" 
                className="w-full h-full object-contain pointer-events-none" 
              />
            </div>

            <p className="text-xs text-neutral-500 italic mt-4 text-center leading-relaxed">
              💡 <strong>Gợi ý:</strong> Địa điểm làm lễ nằm sát cổng chính đường Nguyễn Đình Chiểu. Quý khách vui lòng lưu ý các khu vực gửi xe (viền đỏ trên sơ đồ) để thuận tiện di chuyển.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};