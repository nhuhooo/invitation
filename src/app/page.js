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
import { EVENT_DETAILS } from "@/data";

export default function App() {
  const [activeTab, setActiveTab] = useState("HOME");
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [recipientName, setRecipientName] = useState("");
  const [typedGreeting, setTypedGreeting] = useState("");

  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  // Khởi tạo/Lấy AudioContext đã được kích hoạt từ tương tác người dùng
  const getAudioContext = () => {
    if (typeof window === "undefined") return null;
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
      const ctx = audioContextRef.current;
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
      return ctx;
    } catch (e) {
      console.error("Failed to get/resume AudioContext:", e);
      return null;
    }
  };

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

  // Hiệu ứng chữ chạy (Typewriter Effect) gõ từng ký tự chào mừng khách mời
  useEffect(() => {
    if (!recipientName) return;
    setTypedGreeting("");
    const textToType = `Thân mời: ${recipientName}`;
    let i = 0;

    const delayTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        setTypedGreeting(textToType.substring(0, i + 1));
        i++;
        if (i >= textToType.length) {
          clearInterval(interval);
        }
      }, 80); // Tốc độ gõ 80ms mỗi ký tự
      return () => clearInterval(interval);
    }, 600); // Trì hoãn 600ms chờ trang load xong

    return () => clearTimeout(delayTimeout);
  }, [recipientName]);

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
      getAudioContext();
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

  // Unlock AudioContext on first actual click/touchstart (required for Web Audio API sound synthesis)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const resumeCtx = () => {
      const ctx = getAudioContext();
      if (ctx && ctx.state === "running") {
        window.removeEventListener("click", resumeCtx);
        window.removeEventListener("touchstart", resumeCtx);
      }
    };

    window.addEventListener("click", resumeCtx);
    window.addEventListener("touchstart", resumeCtx);

    return () => {
      window.removeEventListener("click", resumeCtx);
      window.removeEventListener("touchstart", resumeCtx);
    };
  }, []);

  // Update countdown to October 1, 2026
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

  const playConfettiSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // 1. The Pop: Thump/thud của pháo giấy (sử dụng sóng tam giác có tần số giảm dần nhanh)
      const osc = ctx.createOscillator();
      const gainOsc = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

      gainOsc.gain.setValueAtTime(0.6, now);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gainOsc);
      gainOsc.connect(ctx.destination);

      // 2. Air Burst: Tiếng rít hơi áp suất trung bình
      const bufferSize = ctx.sampleRate * 0.15; // Buffer 150ms nhiễu trắng
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(700, now);
      noiseFilter.Q.setValueAtTime(1.5, now);

      const gainNoise = ctx.createGain();
      gainNoise.gain.setValueAtTime(0.35, now);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(gainNoise);
      gainNoise.connect(ctx.destination);

      // 3. Confetti Fizz: Tiếng xào xạc của giấy bạc bay lơ lửng tần số cao
      const fizzSource = ctx.createBufferSource();
      fizzSource.buffer = buffer; // tái sử dụng buffer nhiễu trắng

      const fizzFilter = ctx.createBiquadFilter();
      fizzFilter.type = "highpass";
      fizzFilter.frequency.setValueAtTime(4000, now);

      const gainFizz = ctx.createGain();
      gainFizz.gain.setValueAtTime(0.12, now);
      gainFizz.gain.exponentialRampToValueAtTime(0.001, now + 0.25); // kéo dài hơn để mô phỏng giấy rơi

      fizzSource.connect(fizzFilter);
      fizzFilter.connect(gainFizz);
      gainFizz.connect(ctx.destination);

      // Khởi chạy đồng bộ tất cả các thành phần âm thanh
      osc.start(now);
      osc.stop(now + 0.08);

      noiseSource.start(now);
      noiseSource.stop(now + 0.15);

      fizzSource.start(now);
      fizzSource.stop(now + 0.25);
    } catch (e) {
      console.error("Audio context error:", e);
    }
  };

  const fireConfetti = async () => {
    try {
      const confetti = (await import("canvas-confetti")).default;

      // Pháo giấy ở trung tâm
      playConfettiSound();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
        colors: ["#0d6683", "#89cff0", "#725477", "#fad3fd", "#fed7aa"]
      });

      // Pháo giấy góc trái bay lên
      setTimeout(() => {
        playConfettiSound();
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.8 },
          colors: ["#0d6683", "#89cff0", "#725477", "#fad3fd"]
        });
      }, 150);

      // Pháo giấy góc phải bay lên
      setTimeout(() => {
        playConfettiSound();
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

  // Dedicated observer to trigger Confetti when scrolling to Event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const eventEl = document.getElementById("event");
    const homeEl = document.getElementById("home");
    if (!eventEl) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === "event" && entry.isIntersecting && !hasConfettiFired.current) {
          hasConfettiFired.current = true;
          fireConfetti();
        } else if (entry.target.id === "home" && entry.isIntersecting) {
          // Reset confetti only when returning all the way to Home section
          hasConfettiFired.current = false;
        }
      });
    }, {
      threshold: 0.25
    });

    observer.observe(eventEl);
    if (homeEl) observer.observe(homeEl);

    return () => {
      observer.unobserve(eventEl);
      if (homeEl) observer.unobserve(homeEl);
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

    // Kích hoạt AudioContext khi người dùng nhấn nút nhạc
    getAudioContext();

    if (isPlayingMusic) {
      audioRef.current.pause();
      setIsPlayingMusic(false);
    } else {
      audioRef.current.play();
      setIsPlayingMusic(true);
    }
  };

  return (
    <div className="min-h-screen font-sans text-[#191c1e] relative flex flex-col transition-colors duration-300">

      {/* Đưa thẻ Audio ra ngoài cấu trúc Button để tránh lỗi kẹt ref của trình duyệt */}
      <audio ref={audioRef} loop>
        <source src="/music.mp3" type="audio/mpeg" />
      </audio>

      <FloatingDecoration activeTab={activeTab} />

      {/* TOP GLASS HEADER */}
      <header className="sticky top-0 z-40 backdrop-blur-md border-b border-white select-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-8 py-3 flex items-center justify-between gap-1">

          <div
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-1 cursor-pointer text-primary shrink-0"
          >
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-2 md:gap-4 overflow-x-auto scrollbar-hide shrink">
            {["INTRO", "JOURNEY", "EVENT"].map((tab) => (
              <button
                key={tab}
                onClick={() => scrollToSection(tab.toLowerCase())}
                className={`px-1.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-xs font-bold tracking-wider sm:tracking-widest transition-all relative cursor-pointer shrink-0 ${activeTab === tab ? "text-[#0d6683]" : "text-neutral-500 hover:text-[#0d6683]"
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
              className={`p-1.5 sm:p-2.5 rounded-full border border-[#0d6683] transition-all hover:scale-110 cursor-pointer ${isPlayingMusic
                ? "bg-primary text-white border-[#0d6683] shadow-xs"
                : "bg-white text-neutral-600 border-neutral-200 hover:bg-neutral-50"
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

      <main className="flex-grow relative z-10 px-2 sm:px-4 md:px-8 max-w-7xl mx-auto w-full space-y-0 py-0">

        {/* Section 1: HOME */}
        <section id="home" className="min-h-[calc(100vh-80px)] flex flex-col justify-center scroll-mt-20 py-8">
          <div className="space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-6 pt-6 select-none">
              {recipientName ? (
                <ScrollReveal direction="down" delay={100} duration={800}>
                  <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-primary select-none flex items-center justify-center">
                    <span className="font-serif italic">{typedGreeting}</span>
                    <span className="w-[2px] h-6 sm:h-8 bg-primary animate-pulse ml-1" />
                  </div>
                </ScrollReveal>
              ) : (
                <ScrollReveal direction="down" delay={100} duration={800}>
                  <div className="inline-flex items-center gap-1.5 bg-[#bee9ff] text-[#005974] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-xs">
                    <PartyPopper className="w-3.5 h-3.5" /> INVITATION
                  </div>
                </ScrollReveal>
              )}

              <ScrollReveal direction="up" delay={200} duration={1000}>
                <h2 className=" italic text-l md:text-2xl font-extrabold text-primary leading-tight tracking-tight">
                  đến tham dự Lễ Tốt Nghiệp của
                </h2>
                <br />
                <h1 className="font-serif italic text-3xl md:text-5xl font-extrabold text-primary leading-tight tracking-tight">
                  HỒ NGỌC NHƯ
                </h1>
              </ScrollReveal>

              <ScrollReveal direction="up" delay={300} duration={1000}>
                <p className="text-neutral-500 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
                  Sự hiện diện của you sẽ là món quà ý nghĩa nhất cho nhuhooo trong khoảnh khắc đáng nhớ này!
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
                    Khám Phá Hành Trình
                  </button>
                  <button
                    onClick={() => scrollToSection("event")}
                    className="px-6 py-3 bg-white hover:bg-neutral-50 text-neutral-700 font-bold border border-neutral-200 rounded-full text-xs shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  >
                    Thông Tin Buổi Lễ & Đón Tiếp
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
                  ✨ SAVE THE DATE  ✨
                </span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-[#0d6683] tracking-tight">
                  Cùng đánh dấu một cột mốc đáng nhớ
                </h2>
                <p className="text-neutral-500 text-sm max-w-lg mx-auto leading-relaxed">
                  Hẹn gặp bạn tại lễ tốt nghiệp để cùng chia sẻ niềm vui của cột mốc đáng nhớ này.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="zoom" delay={150} duration={900}>
              <div className="max-w-4xl mx-auto w-full">
                <div className="clay-card rounded-3xl p-4 sm:p-6 md:p-8 space-y-6">
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
                        <span className="text-xl text-neutral-500 block mt-1">
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
                        <span className="text-l text-neutral-500 leading-relaxed block mt-1">
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
        <div className="pb-20 text-center text-m md:text-l font-bold text-primary leading-tight tracking-tight ">
          <h1>Rất mong sẽ được gặp you và có tấm ảnh kỷ niệm trong ngày lễ.
            Tình iu nào không thể đến được, mình hẹn gặp ở dịp khác nhaaaaaaa!!</h1>
        </div>
      </main>
    </div>
  );
}