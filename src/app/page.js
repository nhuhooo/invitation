'use client'
import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Sparkles,
  Music,
  Music2,
  Share2,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  GraduationCap,
  Award,
  ChevronRight,
  ClipboardCheck,
  Send,
  PartyPopper
} from "lucide-react";

import { FloatingDecoration } from "@/components/FloatingDecoration";
import { HeartCollage } from "@/components/HeartCollage";
import { EventAddons } from "@/components/EventAddons";
import { ScrollReveal } from "@/components/ScrollReveal";
import { INITIAL_WISHES, EVENT_DETAILS, PRESET_IMAGES } from "@/data";

export default function App() {
  const [activeTab, setActiveTab] = useState("HOME");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [recipientName, setRecipientName] = useState("");

  const audioRef = useRef(null);

  // Trích xuất tên người nhận từ URL Query Parameters (?to=Tên hoặc ?name=Tên)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const to = params.get("to") || params.get("name");
      if (to) {
        setRecipientName(to);
      }
    }
  }, []);

  // Cơ chế Smart Autoplay bắt tương tác nhạy bén
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = 0.5;

    const startAudio = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlayingMusic(true);
            cleanUpListeners(); // Nhạc chạy rồi thì hủy toàn bộ sự kiện theo dõi
          })
          .catch((err) => {
            console.log("Trình duyệt vẫn đang chờ tương tác chạm thực tế...", err);
          });
      }
    };

    const handleUserInteraction = () => {
      startAudio();
    };

    const cleanUpListeners = () => {
      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("touchstart", handleUserInteraction);
      window.removeEventListener("touchmove", handleUserInteraction); // Bắt hành động vuốt màn hình
      window.removeEventListener("scroll", handleUserInteraction);
    };

    // Thử chạy ngay khi vừa mount
    startAudio();

    // Đăng ký toàn bộ các hành động từ click, chạm, vuốt, cuộn
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("touchstart", handleUserInteraction);
    window.addEventListener("touchmove", handleUserInteraction, { passive: true });
    window.addEventListener("scroll", handleUserInteraction, { passive: true });

    return () => {
      cleanUpListeners();
    };
  }, []);

  // Update countdown to June 24, 2026
  useEffect(() => {
    const targetDate = new Date("2026-10-01T09:00:00").getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        setCountdown({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, mins, secs });
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, []);

  const hasConfettiFired = useRef(false);

  const fireConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#0d6683", "#89cff0", "#725477", "#fad3fd", "#fed7aa"]
      });
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#0d6683", "#89cff0", "#725477", "#fad3fd"]
        });
      }, 150);
      
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.8 },
          colors: ["#0d6683", "#89cff0", "#725477", "#fad3fd"]
        });
      }, 300);
      
    } catch (err) {
      console.error("Failed to load canvas-confetti", err);
    }
  };

  // Scroll Spy logic to highlight navigation tab
  useEffect(() => {
    if (typeof window === "undefined") return;

    const sections = ["home", "journey", "event"];
    const observerOptions = {
      root: null,
      rootMargin: "-30% 0px -55% 0px",
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          setActiveTab(id.toUpperCase());

          if (id === "event" && !hasConfettiFired.current) {
            hasConfettiFired.current = true;
            fireConfetti();
          }
        } else {
          if (entry.target.id === "event") {
            hasConfettiFired.current = false;
          }
        }
      });
    }, observerOptions);

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      sections.forEach((id) => {
        const el = document.getElementById(id);
        if (el) observer.unobserve(el);
      });
    };
  }, []);

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const togglePlayMusic = () => {
    if (!audioRef.current) return;

    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] relative flex flex-col transition-colors duration-300">

      {/* Đưa thẻ Audio ra ngoài cấu trúc Button để tránh lỗi kẹt ref của trình duyệt */}
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <FloatingDecoration activeTab={activeTab} />

      {/* TOP GLASS HEADER */}
      <header className="sticky top-0 z-40 bg-[rgba(255,255,255,0.8)] backdrop-blur-md border-b border-white select-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-3 flex items-center justify-between gap-1">

          <div
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-1 cursor-pointer text-primary shrink-0"
          >
            <span className="font-serif italic font-extrabold text-sm sm:text-xl md:text-2xl tracking-tight select-none">
              ✨ GRAD_2026
            </span>
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-2 md:gap-4 overflow-x-auto scrollbar-hide shrink">
            {["HOME", "JOURNEY", "EVENT"].map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab.toLowerCase())}
                className={`px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs font-bold tracking-wider sm:tracking-widest transition-all relative cursor-pointer shrink-0 ${
                  activeTab === tab ? "text-[#0d6683]" : "text-neutral-500 hover:text-[#0d6683]"
                }`}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 sm:w-4 h-0.5 sm:h-1 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </nav>

         <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={togglePlayMusic}
              className={`p-1.5 sm:p-2.5 rounded-full border transition-all hover:scale-110 cursor-pointer ${
                isPlayingMusic ? "bg-primary text-white border-primary shadow-xs" : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
              }`}
              title={isPlayingMusic ? "Mute music" : "Play warm background theme"}
            >
              {isPlayingMusic ? (
                <div className="flex items-end gap-[2px] h-3.5 w-3.5 sm:h-4 sm:w-4 justify-center pb-[2px]">
                  <span className="w-[1.5px] sm:w-[2px] h-full bg-white rounded-xs animate-eq-1" />
                  <span className="w-[1.5px] sm:w-[2px] h-[85%] bg-white rounded-xs animate-eq-2" />
                  <span className="w-[1.5px] sm:w-[2px] h-[70%] bg-white rounded-xs animate-eq-3" />
                </div>
              ) : (
                <Music className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          </div>

        </div>
      </header>

      <main className="flex-grow relative z-10 px-4 md:px-8 max-w-7xl mx-auto w-full space-y-0 py-0">
        
        {/* Section 1: HOME */}
        <section id="home" className="min-h-[calc(100vh-80px)] flex flex-col justify-center scroll-mt-20 py-8">
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6 pt-6 select-none">
              {recipientName ? (
                <ScrollReveal direction="down" delay={100} duration={800}>
                  <div className="inline-flex items-center gap-2 bg-[#fad3fd]/65 text-[#725477] border border-white/60 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide shadow-md backdrop-blur-xs animate-bounce">
                    🌸 Thân gửi: <span className="font-serif italic font-extrabold text-[#0d6683] text-base ml-1">{recipientName}</span> 🌸
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal direction="down" delay={100} duration={800}>
                  <div className="inline-flex items-center gap-1.5 bg-[#bee9ff] text-[#005974] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-xs">
                    <PartyPopper className="w-3.5 h-3.5" /> CHÀO MỪNG LỄ TỐT NGHIỆP TRỌNG ĐẠI
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal direction="up" delay={200} duration={1000}>
                <h1 className="text-3xl md:text-5xl font-extrabold text-primary leading-tight tracking-tight">
                  Luminous Celebration 2026: <br className="hidden md:inline" />
                  Kiến Tạo Thăng Hoa Dưới Ánh Sáng Tri Thức
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300} duration={1000}>
                <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  Nơi lưu giữ trọn vẹn những hoài bão, nụ cười hạnh phúc, những đồ án đầy tự hào của thế hệ kỹ sư Công nghệ khóa 2022-2026. Hãy để tinh thần mạo hiểm dẫn lối bạn vươn cao!
                </p>
              </ScrollReveal>

              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 py-4 select-none">
                {[
                  { label: "NGÀY", val: countdown.days },
                  { label: "GIỜ", val: countdown.hours },
                  { label: "PHÚT", val: countdown.mins },
                  { label: "GIÂY", val: countdown.secs },
                ].map((item, i) => (
                  <ScrollReveal key={i} direction="zoom" delay={400 + i * 100} duration={800}>
                    <div className="clay-card rounded-2xl w-14 sm:w-16 md:w-20 py-2.5 sm:py-3 text-center hover:scale-105 transition">
                      <span className="block text-lg sm:text-xl md:text-2xl font-bold font-mono text-primary leading-none">
                        {String(item.val).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] sm:text-[10px] text-neutral-400 font-extrabold tracking-wider mt-1 sm:mt-1.5 block">
                        {item.label}
                      </span>
                    </div>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal direction="up" delay={800} duration={800}>
                <div className="flex flex-wrap gap-4 justify-center pt-2">
                  <button
                    onClick={() => scrollToSection("journey")}
                    className="clay-btn btn-shimmer text-white font-bold px-6 py-3 rounded-full text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Khám Phá Hành Trình Trái Tim ➜
                  </button>
                  <button
                    onClick={() => scrollToSection("event")}
                    className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-bold border border-neutral-200 rounded-full text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Thông Tin Lễ Đường & Đón Tiếp
                  </button>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Section 2: JOURNEY */}
        <section id="journey" className="min-h-[calc(100vh-80px)] flex flex-col justify-center scroll-mt-20 border-t border-neutral-200/40 py-8">
          <ScrollReveal direction="up" duration={1000}>
            <HeartCollage />
          </ScrollReveal>
        </section>

        {/* Section 3: EVENT */}
        <section id="event" className="min-h-[calc(100vh-80px)] flex flex-col justify-center scroll-mt-20 border-t border-neutral-200/40 py-8">
          <div className="space-y-12">
            <ScrollReveal direction="up" duration={800}>
              <div className="text-center max-w-2xl mx-auto space-y-4 pt-4 select-none">
                <span 
                  onClick={fireConfetti}
                  className="bg-[#fad3fd] text-[#77587c] font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-xs cursor-pointer hover:scale-105 active:scale-95 transition-all inline-block"
                  title="Nhấp để bắn pháo hoa giấy! 🎉"
                >
                  ✨ COMMENCEMENT EXERCISE ✨
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d6683] tracking-tight">
                  Ngày Trọng Đại Của Chúng Ta
                </h2>
                <p className="text-neutral-500 text-sm max-w-lg mx-auto leading-relaxed">
                  Tôn vinh sự giao thoa hoàn hảo giữa công nghệ, tư duy sáng tạo dẫn đầu và những nỗ lực học thuật bền bỉ. Đồng hành chung vui cùng khóa 2026!
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="zoom" delay={150} duration={900}>
              <div className="max-w-4xl mx-auto w-full">
                <div className="clay-card rounded-3xl p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex gap-4 items-start select-none">
                      <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center shrink-0">
                        <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">THỜI GIAN & NGÀY THÁNG</span>
                        <strong className="text-lg md:text-xl font-extrabold text-neutral-800 tracking-tight mt-1 block">
                          {EVENT_DETAILS.date}
                        </strong>
                        <span className="text-sm text-neutral-500 block mt-1">
                          {EVENT_DETAILS.time}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-4 items-start select-none border-t md:border-t-0 md:border-l border-neutral-100 pt-5 md:pt-0 md:pl-6">
                      <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center shrink-0">
                        <MapPin className="w-6 h-6 text-pink-500" />
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider block">ĐỊA ĐIỂM TỔ CHỨC</span>
                        <strong className="text-base md:text-lg font-extrabold text-neutral-800 block mt-1">
                          {EVENT_DETAILS.venue}
                        </strong>
                        <span className="text-xs text-neutral-500 leading-relaxed block mt-1">
                          {EVENT_DETAILS.address}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-neutral-100 pt-6">
                    <EventAddons />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </main>
    </div>
  );
}