'use client'
import React, { useEffect, useState } from "react";

const PASTEL_SHAPES = {
  star: (color) => (
    <svg className="w-full h-full" viewBox="0 0 24 24" fill={color} opacity="0.45">
      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  ),
};

const PASTEL_COLORS = [
  "#6cccff", // sky-200
  "#fffb00", // orange-200
  "#c084fc", // purple-400
  "#ff70e7", // purple-400
  "#08d6ff", // purple-400
  "#33ffc2", // purple-400
];

export const FloatingDecoration = ({ activeTab }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Generate initial set of high-quality floating items
    // We keep it to 20 items to avoid cluttering and focus on premium look
    const initialItems = Array.from({ length: 80 }).map((_, i) => {
      const type = ["star"][i % 1];
      return {
        id: i,
        type,
        x: Math.random() * 95,
        y: Math.random() * 95,
        scale: 0.4 + Math.random() * 0.6,
        color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
        delay: Math.random() * -20,
        speedY: 0.1 + Math.random() * 0.15, // slower drift
      };
    });
    setItems(initialItems);

    const interval = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          let newY = item.y - item.speedY * 0.12;
          if (newY < -10) {
            newY = 105;
          }
          return {
            ...item,
            y: newY,
          };
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const getBlobColors = () => {
    switch (activeTab) {
      case "JOURNEY":
        return {
          blob1: "rgba(253, 164, 175, 0.25)", // rose-300
          blob2: "rgba(251, 207, 232, 0.22)", // pink-200
          blob3: "rgba(254, 240, 138, 0.18)", // yellow-200
        };
      case "EVENT":
        return {
          blob1: "rgba(233, 213, 255, 0.2)",  // purple-200
          blob2: "rgba(192, 132, 252, 0.25)", // purple-400
          blob3: "rgba(254, 215, 170, 0.2)",  // orange-200 (gold)
        };
      case "HOME":
      default:
        return {
          blob1: "rgba(186, 230, 253, 0.25)", // sky-200
          blob2: "rgba(251, 207, 232, 0.2)",  // pink-200
          blob3: "rgba(233, 213, 255, 0.15)", // purple-200
        };
    }
  };

  const colors = getBlobColors();

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      
      {/* Dynamic Animated Gradient Blobs (Aurora Mesh Gradient Effect) */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-drift-1 transition-all duration-1000 ease-in-out" 
        style={{ backgroundColor: colors.blob1 }}
      />
      <div 
        className="absolute top-[40%] right-[-10%] w-[45%] h-[45%] rounded-full blur-[120px] animate-drift-2 transition-all duration-1000 ease-in-out" 
        style={{ backgroundColor: colors.blob2 }}
      />
      <div 
        className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] rounded-full blur-[100px] animate-drift-3 transition-all duration-1000 ease-in-out" 
        style={{ backgroundColor: colors.blob3 }}
      />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 dot-grid opacity-60" />

      {/* Floating elegant sparkles */}
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute transition-transform duration-100 ease-out"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
            transform: `scale(${item.scale})`,
          }}
        >
          <div
            className={`${
              item.id % 2 === 0 ? "animate-float" : "animate-float-reverse"
            } w-6 h-6`}
          >
            {PASTEL_SHAPES[item.type]?.(item.color)}
          </div>
        </div>
      ))}
    </div>
  );
};