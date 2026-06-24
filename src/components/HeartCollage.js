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
    onAddPhoto,
    openCertificate,
}) => {
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [customUrl, setCustomUrl] = useState("");
    const [customCaption, setCustomCaption] = useState("");
    const [isGridVisible, setIsGridVisible] = useState(false);
    const gridRef = useRef(null);

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
        };
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCustomUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };


    // Get photo at index, giving custom uploaded images priority, then presets
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
                Hành Trình 3 Năm Rưỡi
            </h2>
            <p className="text-neutral-500 max-w-lg text-center mt-2.5 text-sm leading-relaxed px-4 select-none">
                Ba năm rưỡi khép lại một hành trình dài để nhuhooo trưởng thành. Giữa những chông chênh và áp lực, điều quý giá nhất nhuhooo có được không chỉ là tấm bằng tốt nghiệp, mà là tình yêu thương từ những người đã đồng hành cùng nhuhooo trên con đường này. Hơn ba năm rực rỡ ấy được gói gọn trong trái tim đong đầy kỷ niệm này.
            </p>

            {/* HEART GRID MAIN CONTAINER */}
            <div
                ref={gridRef}
                className="w-full max-w-[650px] px-1 sm:px-3 py-6 flex justify-center overflow-hidden"
            >
                <div className={`grid grid-cols-10 gap-0.5 sm:gap-1 md:gap-1.5 w-full relative ${isGridVisible ? "heart-grid-visible" : ""}`}>
                    {HEART_GRID.map((row, rIdx) =>
                        row.map((cell, cIdx) => {
                            if (cell.type === "blank") {
                                return <div key={`blank-${rIdx}-${cIdx}`} className="aspect-square bg-transparent" />;
                            }

                            if (cell.type === "badge") {
                                if (rIdx === 3 && cIdx === 3) {
                                    return (
                                        <div
                                            key="heart-badge"
                                            className="col-span-4 row-span-2 flex items-center justify-center z-10 p-0.5 select-none heart-grid-cell"
                                            style={{
                                                animationDelay: `${12 * 45}ms`,
                                            }}
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
                                    key={`img-${rIdx}-${cIdx}`}
                                    onClick={() => setSelectedPhoto(photo)}
                                    className="aspect-square group relative rounded-lg overflow-hidden cursor-pointer shadow-xs border border-white hover:scale-110 active:scale-95 hover:z-20 transition duration-300 heart-grid-cell"
                                    style={{
                                        animationDelay: `${currentIdx * 45}ms`,
                                    }}
                                >
                                    <img
                                        alt="kỷ niệm sinh viên"
                                        src={photo.url}
                                        className="w-full h-full object-cover group-hover:brightness-110"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 heart-overlay transition-opacity flex items-center justify-center">
                                        <Heart className="w-4 h-4 text-white fill-white animate-pulse" />
                                    </div>
                                </div>
                            );
                        })
                    )}
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