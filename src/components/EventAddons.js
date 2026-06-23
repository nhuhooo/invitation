import React, { useState } from "react";
import { Calendar, Map, CheckCircle, HelpCircle, GraduationCap, Camera, QrCode } from "lucide-react";

export const EventAddons = ({ studentName }) => {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  // Khai báo lại hàm download file lịch .ics hoàn chỉnh
  const downloadIcsFile = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Luminous Grad 2026//NONSGML v1.0//EN",
      "BEGIN:VEVENT",
      "UID:luminous-graduation-2026@aistudio",
      "DTSTAMP:20260623T080000Z",
      "DTSTART:20260624T020000Z", // UTC standard format
      "DTEND:20260624T050000Z",
      "SUMMARY:Le Tot Nghiep Luminous 2026 - Class of 2026",
      "DESCRIPTION:Chuc mung ban da tot nghiep! Hay mang theo ve QR va le phuc day du.",
      "LOCATION:The Innovation Arena, Cyber District, Building 7, Ho Chi Minh",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Luminous_Graduation_2026.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <Calendar className="w-4 h-4" /> Lưu Lịch Sự Kiện Vào Google Calendar / Outlook
        </button>

        {/* View Campus Map Trigger */}
        <button
          onClick={() => setMapOpen(true)}
          className="w-full py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold rounded-full text-xs shadow-xs hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-neutral-300"
        >
          <Map className="w-4 h-4" /> Xem Bản Đồ Giảng Đường Lễ Đường
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
              <button
                onClick={downloadIcsFile}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                📥 Tải File Lịch .ICS (Tương thích Apple/Outlook)
              </button>
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

      {/* MODAL 2: INTERACTIVE CAMPUS MAP */}
      {mapOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative border border-neutral-100">
            <button
              onClick={() => setMapOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600 transition"
            >
              ✕
            </button>
            <div className="mb-4">
              <h3 className="text-sm font-bold text-neutral-800">Bản Đồ Phân Khu Lễ Hội Luminous</h3>
              <p className="text-xs text-neutral-500">Nhấp vào từng ranh giới để xem hướng dẫn chỉ đường chi tiết.</p>
            </div>

            {/* Simulated interactive map vector layout */}
            <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 border-dashed relative select-none">
              <div className="absolute top-3 left-3 bg-white/90 px-2 py-0.5 rounded-md text-[9px] font-bold text-primary shadow-xs">
                ARENA FLOOR PLAN
              </div>

              <div className="grid grid-cols-12 gap-1.5 sm:gap-2 h-44 items-stretch mt-4 text-[7.5px] sm:text-[9px] font-bold leading-tight">
                {/* Building 7 entry */}
                <div className="col-span-4 bg-primary text-white rounded-lg p-1.5 sm:p-2.5 flex flex-col justify-between hover:scale-105 transition cursor-pointer">
                  <span>CỔNG CHÍNH / SẢNH ĐÓN</span>
                  <span className="text-[6.5px] sm:text-[8px] bg-white/20 px-1 py-0.5 rounded-xs self-start">Gate A1</span>
                </div>

                <div className="col-span-8 grid grid-rows-2 gap-1.5 sm:gap-2">
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                    {/* The Hall */}
                    <div className="bg-purple-100 border border-purple-200 text-purple-700 rounded-lg p-1.5 sm:p-2 flex flex-col justify-between hover:scale-105 transition cursor-pointer">
                      <span>LỄ ĐƯỜNG TRUNG TÂM</span>
                      <span className="text-[6.5px] sm:text-[8px] font-extrabold text-purple-600">Building 7 Seat BD</span>
                    </div>

                    {/* Photo Wall popup */}
                    <div className="bg-pink-100 border border-pink-200 text-pink-700 rounded-lg p-1.5 sm:p-2 flex flex-col justify-between hover:scale-105 transition cursor-pointer">
                      <span>GÓC BACKDROP AI</span>
                      <span className="text-[6.5px] sm:text-[8px] text-pink-500 font-extrabold">Mascot & Balloons</span>
                    </div>
                  </div>

                  {/* Buffet areas */}
                  <div className="bg-emerald-100 border border-emerald-200 text-emerald-700 rounded-lg p-1.5 sm:p-2 flex flex-col justify-between hover:scale-105 transition cursor-pointer">
                    <span>KHU VỰC TIỆC BUFFET NHẸ & GIAO LƯU</span>
                    <span className="text-[6px] sm:text-[7px] text-emerald-600">Sảnh Đông (East Wing Garden)</span>
                  </div>
                </div>
              </div>

              {/* Quick helper tip */}
              <p className="text-[10px] text-neutral-500 italic mt-3 text-center">
                💡 Khu vực gửi xe nằm cạnh Sảnh Tây. Sách kỷ yếu và quà tặng hoa quả tươi sẽ được phát trực tiếp tại bàn lễ tân khi ra về!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};