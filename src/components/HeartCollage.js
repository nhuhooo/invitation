import React, { useState, useEffect, useRef } from "react";
import { PRESET_IMAGES, CAPTIONS } from "../data";
import { Heart, Sparkles } from "lucide-react";

// Map beautiful Heart structure coordinates for a grid layout.
// Row-by-row mapping. Each cell holds either:
// - { type: "image", id: number }
// - { type: "badge" } -- center overlay glass plate
// - { type: "blank" }
const HEART_GRID = [
    // Row 1
    [
        { type: "blank" },
        { type: "blank" },
        { type: "image", index: 0 },
        { type: "image", index: 1 },
        { type: "blank" },
        { type: "blank" },
        { type: "image", index: 2 },
        { type: "image", index: 3 },
        { type: "blank" },
        { type: "blank" },
    ],
    // Row 2
    [
        { type: "blank" },
        { type: "image", index: 4 },
        { type: "image", index: 5 },
        { type: "image", index: 6 },
        { type: "image", index: 7 },
        { type: "image", index: 8 },
        { type: "image", index: 9 },
        { type: "image", index: 10 },
        { type: "image", index: 11 },
        { type: "blank" },
    ],
    // Row 3 (Contains parts of the badge in the center cells)
    [
        { type: "image", index: 12 },
        { type: "image", index: 13 },
        { type: "image", index: 14 },
        { type: "image", index: 15 },
        { type: "image", index: 16 },
        { type: "image", index: 17 },
        { type: "image", index: 18 },
        { type: "image", index: 19 },
        { type: "image", index: 20 },
        { type: "image", index: 21 },
    ],
    // Row 4 (Central text badge area begins at columns 3..6)
    [
        { type: "image", index: 22 },
        { type: "image", index: 23 },
        { type: "image", index: 10 }, // recycling gracefully
        { type: "badge" }, // spans columns
        { type: "badge" },
        { type: "badge" },
        { type: "badge" },
        { type: "image", index: 8 },
        { type: "image", index: 12 },
        { type: "image", index: 1 },
    ],
    // Row 5 (Central Badge continues)
    [
        { type: "blank" },
        { type: "image", index: 9 },
        { type: "image", index: 14 },
        { type: "badge" }, // badge span
        { type: "badge" },
        { type: "badge" },
        { type: "badge" },
        { type: "image", index: 7 },
        { type: "image", index: 15 },
        { type: "blank" },
    ],
    // Row 6
    [
        { type: "blank" },
        { type: "blank" },
        { type: "image", index: 3 },
        { type: "image", index: 16 },
        { type: "image", index: 5 },
        { type: "image", index: 13 },
        { type: "image", index: 19 },
        { type: "image", index: 4 },
        { type: "blank" },
        { type: "blank" },
    ],
    // Row 7
    [
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "image", index: 11 },
        { type: "image", index: 6 },
        { type: "image", index: 18 },
        { type: "image", index: 2 },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
    ],
    // Row 8
    [
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "image", index: 20 },
        { type: "image", index: 22 },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
    ],
    // Row 9 (Tip of the heart)
    [
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "image", index: 0 },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
        { type: "blank" },
    ],
];

export const HeartCollage = ({
    customPhotos = [],
}) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [isGridVisible, setIsGridVisible] = useState(false);
    const [isAssembled, setIsAssembled] = useState(false);
    const [assemblyStatus, setAssemblyStatus] = useState("idle"); // "idle" | "swirling" | "assembled"
    const [particlesData, setParticlesData] = useState([]);

    const gridRef = useRef(null);
    const containerRef = useRef(null);
    const particleRefs = useRef([]);
    const particlesRef = useRef([]);

    const pointerActive = useRef(false);
    const pointerX = useRef(0);
    const pointerY = useRef(0);
    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const interactionProgress = useRef(0);
    const hasInteracted = useRef(false);
    const mountTime = useRef(0);
    const animationFrameId = useRef(null);
    const forceAutoFillTime = useRef(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsGridVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );
        const currentRef = gridRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }
        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    // Get photo at index
    const getPhotoForIndex = (gridIdx) => {
        if (gridIdx < customPhotos.length) {
            return customPhotos[gridIdx];
        }
        const presetIdx = (gridIdx - customPhotos.length) % PRESET_IMAGES.length;
        return {
            url: PRESET_IMAGES[presetIdx],
            caption: CAPTIONS[presetIdx % CAPTIONS.length],
        };
    };

    // Physics and Animation Loop
    const loop = () => {
        if (!containerRef.current || !gridRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        const timeSinceMount = Date.now() - mountTime.current;
        
        // Kiểm tra xem chế độ Auto-fill cưỡng bức (click/chạm nhưng không xoay) có đang bật hay không
        const isForced = forceAutoFillTime.current !== null;
        const timeForForced = isForced ? (Date.now() - forceAutoFillTime.current) : 0;

        const isAutoSwirling = (!hasInteracted.current && timeSinceMount > 60000) || (isForced && timeForForced > 0);
        const isAutoLocking = (!hasInteracted.current && timeSinceMount > 63000) || (isForced && timeForForced > 3000);

        let targetX = centerX;
        let targetY = centerY;
        let isAttracting = false;

        if (pointerActive.current) {
            targetX = pointerX.current;
            targetY = pointerY.current;
            isAttracting = true;
            hasInteracted.current = true;
        } else if (isAutoSwirling) {
            // Auto orbit around center
            const angle = (Date.now() / 600) % (Math.PI * 2);
            targetX = centerX + Math.cos(angle) * 70;
            targetY = centerY + Math.sin(angle) * 70;
            isAttracting = true;
        }

        let allLocked = true;

        particlesRef.current.forEach((p, idx) => {
            if (p.status === "locked") return;

            allLocked = false;

            // State machine transitions
            if (isAutoLocking) {
                const lockDelay = idx * 100;
                const limit = isForced ? (3000 + lockDelay) : (63000 + lockDelay);
                const elapsed = isForced ? timeForForced : timeSinceMount;
                if (elapsed > limit) {
                    p.status = "locking";
                }
            } else if (pointerActive.current) {
                p.status = "swirling";
                const lockThreshold = 80 + idx * 20;
                if (interactionProgress.current > lockThreshold) {
                    p.status = "locking";
                }
            } else if (hasInteracted.current && !pointerActive.current && !isForced) {
                // Force locking immediately on release (chỉ khi không trong chế độ Auto-fill cưỡng bức)
                p.status = "locking";
            }

            if (p.status === "locking") {
                // Fly to target heart cell
                const dx = p.targetX - p.x;
                const dy = p.targetY - p.y;
                
                // Fast exponential ease
                p.x += dx * 0.12;
                p.y += dy * 0.12;
                p.scale += (1.0 - p.scale) * 0.12;
                p.rotation += (0 - p.rotation) * 0.12;

                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 2.0) {
                    p.x = p.targetX;
                    p.y = p.targetY;
                    p.scale = 1.0;
                    p.rotation = 0;
                    p.status = "locked";

                    // Show target grid image with popup transition
                    const cellImg = document.getElementById(`cell-img-${idx}`);
                    if (cellImg) {
                        cellImg.classList.remove("opacity-0", "scale-75");
                        cellImg.classList.add("opacity-100", "scale-100", "duration-500", "ease-out");
                        
                        // Briefly pop it up slightly to look polished
                        cellImg.style.transform = "scale(1.1)";
                        setTimeout(() => {
                            cellImg.style.transform = "";
                        }, 250);
                    }
                }
            } else if (p.status === "swirling" || isAttracting) {
                // Swirl vortex physics
                const dx = targetX - (p.x + p.size / 2);
                const dy = targetY - (p.y + p.size / 2);
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;

                // Gravitational pull to center/cursor
                const pull = 0.45;
                p.vx += (dx / dist) * pull;
                p.vy += (dy / dist) * pull;

                // Tangential orbit vector
                const swirl = 0.65;
                p.vx += (-dy / dist) * swirl;
                p.vy += (dx / dist) * swirl;

                // Damping
                p.vx *= 0.93;
                p.vy *= 0.93;

                p.x += p.vx;
                p.y += p.vy;

                // Swirling properties
                p.scale += (0.7 - p.scale) * 0.05;
                p.rotation += p.vx * 1.5;
            } else {
                // Orbit drifting mode
                p.angle += 0.004;
                const targetDriftX = centerX + Math.cos(p.angle) * p.orbitRadius - p.size / 2;
                const targetDriftY = centerY + Math.sin(p.angle) * p.orbitRadius - p.size / 2;
                
                p.x += (targetDriftX - p.x) * 0.015;
                p.y += (targetDriftY - p.y) * 0.015;
                p.rotation += 0.08;
            }

            // Apply directly to DOM style
            const el = particleRefs.current[idx];
            if (el) {
                el.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) scale(${p.scale}) rotate(${p.rotation}deg)`;
                el.style.opacity = p.status === "locked" ? "0" : "1";
            }
        });

        if (allLocked) {
            setIsAssembled(true);
            setAssemblyStatus("assembled");
        } else {
            animationFrameId.current = requestAnimationFrame(loop);
        }
    };

    useEffect(() => {
        if (!isGridVisible || typeof window === "undefined" || !containerRef.current) return;

        // Measure layout after initial display
        const timer = setTimeout(() => {
            if (!containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            const tempParticles = [];
            const tempPics = [];

            let imgIdx = 0;
            HEART_GRID.forEach((row) => {
                row.forEach((cell) => {
                    if (cell.type === "image") {
                        const currentIdx = imgIdx++;
                        const photo = getPhotoForIndex(currentIdx);
                        const placeholderEl = document.getElementById(`placeholder-${currentIdx}`);
                        if (placeholderEl) {
                            const rect = placeholderEl.getBoundingClientRect();
                            const targetX = rect.left - containerRect.left;
                            const targetY = rect.top - containerRect.top;
                            const size = rect.width;

                            const centerX = containerRect.width / 2;
                            const centerY = containerRect.height / 2;
                            const angle = Math.random() * Math.PI * 2;
                            const radius = 160 + Math.random() * 120;
                            const startX = centerX + Math.cos(angle) * radius - size / 2;
                            const startY = centerY + Math.sin(angle) * radius - size / 2;

                            tempParticles.push({
                                x: startX,
                                y: startY,
                                vx: (Math.random() - 0.5) * 2.5,
                                vy: (Math.random() - 0.5) * 2.5,
                                targetX,
                                targetY,
                                size,
                                status: "floating",
                                angle,
                                orbitRadius: radius,
                                scale: 0.6 + Math.random() * 0.2,
                                rotation: (Math.random() - 0.5) * 40,
                            });

                            tempPics.push({
                                url: photo.url,
                                size
                            });
                        }
                    }
                });
            });

            particlesRef.current = tempParticles;
            setParticlesData(tempPics);
            mountTime.current = Date.now();
            animationFrameId.current = requestAnimationFrame(loop);
        }, 200);

        return () => {
            clearTimeout(timer);
            if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        };
    }, [isGridVisible]);

    const handlePointerDown = (e) => {
        if (isAssembled || !containerRef.current) return;
        try {
            e.currentTarget.setPointerCapture(e.pointerId);
        } catch (err) {}

        pointerActive.current = true;
        hasInteracted.current = true;
        
        // Hủy bỏ chế độ Auto-fill cưỡng bức nếu người dùng chạm lại
        forceAutoFillTime.current = null;
        
        setAssemblyStatus("swirling");

        const rect = containerRef.current.getBoundingClientRect();
        pointerX.current = e.clientX - rect.left;
        pointerY.current = e.clientY - rect.top;
        startXRef.current = e.clientX;
        startYRef.current = e.clientY;
        interactionProgress.current = 0;
    };

    const handlePointerMove = (e) => {
        if (isAssembled || !pointerActive.current || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        pointerX.current = e.clientX - rect.left;
        pointerY.current = e.clientY - rect.top;
        interactionProgress.current += 1.8;
    };

    const handlePointerUp = (e) => {
        if (isAssembled) return;
        pointerActive.current = false;
        
        const deltaX = e.clientX - startXRef.current;
        const deltaY = e.clientY - startYRef.current;
        const dragDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        // Nếu người dùng chạm/click nhẹ nhưng không xoay ngón tay (tiến trình xoay nhỏ hoặc khoảng cách di chuyển rất ngắn)
        // thì chuyển sang kích hoạt lốc xoáy tự động 3 giây rồi điền lần lượt giống cơ chế Auto-fill
        if (dragDistance < 15 && interactionProgress.current < 45) {
            forceAutoFillTime.current = Date.now();
            hasInteracted.current = false; // reset để cho phép chạy logic auto-swirling
            setAssemblyStatus("swirling");
        } else {
            if (assemblyStatus !== "assembled") {
                setAssemblyStatus("idle");
            }
        }
    };

    let imageCounter = 0;

    return (
        <div className="flex flex-col items-center py-6 relative select-none">
            {/* Background decorations */}
            <Sparkles className="absolute right-12 bottom-20 w-7 h-7 text-pink-300 opacity-50 animate-pulse animate-bounce" />

            {/* Title block */}
            <span className="bg-pink-100 text-pink-500 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest shadow-xs select-none">
                MY JOURNEY
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary text-center mt-3 select-none">
                Hành Trình Kỷ Niệm
            </h2>
            <p className="text-neutral-500 max-w-lg text-center mt-2.5 text-sm leading-relaxed px-4 select-none">
                Ba năm rưỡi khép lại một hành trình dài để nhuhooo trưởng thành. Bốn năm ngập tràn kỷ niệm rực rỡ được lưu giữ trọn vẹn trong trái tim đong đầy tình cảm này.
            </p>

            {/* INSTRUCTION STATUS BANNER */}
            <div className="mt-4 px-5 py-2.5 rounded-full text-xs font-extrabold shadow-sm transition-all duration-500 z-10 flex items-center gap-1.5 min-h-[40px] select-none clay-card border border-white">
                {!isGridVisible ? (
                    <span className="text-neutral-400">Đang chuẩn bị hành trình...</span>
                ) : assemblyStatus === "idle" ? (
                    <span className="text-primary animate-pulse flex items-center gap-1">
                        ✨ Chạm & xoay ngón tay / chuột để tụ hội vũ trụ ảnh kỷ niệm...
                    </span>
                ) : assemblyStatus === "swirling" ? (
                    <span className="text-pink-500 animate-pulse flex items-center gap-1">
                        🌀 Đang kết tụ vũ trụ ký ức tốt nghiệp... xoay tròn để lấp đầy!
                    </span>
                ) : (
                    <span className="text-emerald-600 font-bold flex items-center gap-1">
                        ❤️ Trái tim ký ức đã lấp đầy! Nhấp vào ảnh nhỏ để mở xem.
                    </span>
                )}
            </div>

            {/* HEART GRID MAIN CONTAINER */}
            <div
                ref={gridRef}
                className="w-full max-w-[650px] px-1 sm:px-3 py-6 flex justify-center overflow-hidden relative"
            >
                <div 
                    ref={containerRef}
                    className="grid grid-cols-10 gap-0.5 sm:gap-1 md:gap-1.5 w-full relative touch-none select-none"
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerUp}
                    style={{
                        cursor: isAssembled ? "default" : "grab",
                    }}
                >
                    {HEART_GRID.map((row, rIdx) =>
                        row.map((cell, cIdx) => {
                            if (cell.type === "blank") {
                                return <div key={`blank-${rIdx}-${cIdx}`} className="aspect-square bg-transparent pointer-events-none" />;
                            }

                            if (cell.type === "badge") {
                                if (rIdx === 3 && cIdx === 3) {
                                    return (
                                        <div
                                            key="heart-badge"
                                            className={`col-span-4 row-span-2 flex items-center justify-center z-10 p-0.5 select-none transition-all duration-1000 ${
                                                isAssembled ? "opacity-100 scale-100" : "opacity-30 scale-95"
                                            }`}
                                        >
                                            <div className="clay-card rounded-md sm:rounded-2xl border border-white/60 p-0.5 sm:p-2 text-center shadow-lg transform hover:scale-105 transition duration-300 w-full h-full flex flex-col justify-center items-center">
                                                <Heart className="w-2.5 h-2.5 sm:w-5 sm:h-5 text-red-400 fill-red-400 animate-pulse mb-0.5 sm:mb-1.5 shrink-0" />
                                                <span className="text-[7.5px] sm:text-[11px] md:text-xs text-neutral-500 mt-0.5 font-bold tracking-tight leading-none whitespace-nowrap">2022–2026</span>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }

                            // Normal image cell
                            const currentIdx = imageCounter++;
                            const photo = getPhotoForIndex(currentIdx);

                            return (
                                <div
                                    key={`cell-${currentIdx}`}
                                    id={`placeholder-${currentIdx}`}
                                    onClick={() => isAssembled && setSelectedPhoto(photo)}
                                    className={`aspect-square relative rounded-lg overflow-hidden border transition-all duration-300 ${
                                        isAssembled
                                            ? "cursor-pointer border-white hover:scale-115 hover:z-20 shadow-xs group"
                                            : "border-dashed border-pink-200/40 bg-pink-50/5 flex items-center justify-center"
                                    }`}
                                >
                                    {/* Dashed placeholder icon */}
                                    {!isAssembled && (
                                        <Heart className="w-1.5 sm:w-3 h-1.5 sm:h-3 text-pink-200/30 fill-pink-200/5" />
                                    )}

                                    {/* Actual photo, hidden until locked in */}
                                    <img
                                        id={`cell-img-${currentIdx}`}
                                        alt="kỷ niệm sinh viên"
                                        src={photo.url}
                                        className={`w-full h-full object-cover absolute inset-0 transition-all origin-center duration-300 opacity-0 scale-75`}
                                        loading="lazy"
                                    />

                                    {/* Hover overlay (only active once assembled) */}
                                    {isAssembled && (
                                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {/* Floating universe particles */}
                    {!isAssembled && particlesData.map((p, idx) => (
                        <div
                            key={`particle-${idx}`}
                            ref={(el) => (particleRefs.current[idx] = el)}
                            className="absolute rounded-xs sm:rounded-md overflow-hidden border border-white shadow-md pointer-events-none z-30 transition-opacity duration-300"
                            style={{
                                left: 0,
                                top: 0,
                                width: `${p.size}px`,
                                height: `${p.size}px`,
                                transform: "translate3d(0px, 0px, 0px) scale(0) rotate(0deg)",
                                opacity: 0,
                                willChange: "transform, opacity",
                            }}
                        >
                            <img src={p.url} className="w-full h-full object-cover" alt="" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Quote line */}
            <div className="text-center mt-2 px-4 italic text-neutral-500 text-xs sm:text-sm select-none">
                &ldquo;Cùng cảm ơn hôm qua cho chúng ta như hôm nay/

                Cùng cảm ơn cơn say cho nói ra lời thật thà/

                Cùng cảm ơn mưa sa cho nắng lên xanh bao la/

                Để nhắc ta, nhắc ta luôn nhớ/

                Cùng cảm ơn thương đau cho chúng ta thêm thương nhau/

                Cùng cảm ơn chia xa cho khát khao được về nhà/

                Cùng cảm ơn tinh mơ ta thấy ta không bơ vơ/

                Người vẫn luôn, vẫn luôn ở đó&rdquo;
            </div>

            {/* IMAGE PREVIEW LIGHTBOX */}
            {selectedPhoto && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
                    <div className="bg-white rounded-3xl overflow-hidden max-w-lg w-full shadow-2xl relative border border-white/20">
                        <div className="relative aspect-video">
                            <img alt="xem ảnh kỷ niệm" src={selectedPhoto.url} className="w-full h-full object-cover" />
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold transition"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-5 text-center">
                            <div className="flex gap-1 justify-center mb-2">
                                <span className="bg-primary/10 text-primary text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                                    KỶ NIỆM CLASS_2026
                                </span>
                            </div>
                            <p className="text-neutral-700 font-semibold select-all text-sm md:text-base">
                                &ldquo;{selectedPhoto.caption}&rdquo;
                            </p>
                            <button
                                onClick={() => setSelectedPhoto(null)}
                                className="mt-4 px-5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded-full text-xs font-bold transition"
                            >
                                Đóng Kỷ Niệm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};