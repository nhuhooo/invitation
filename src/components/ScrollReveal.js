'use client'
import React, { useEffect, useRef, useState } from "react";

export const ScrollReveal = ({
  children,
  className = "",
  direction = "up", // "up" | "down" | "left" | "right" | "zoom" | "none"
  delay = 0, // ms
  duration = 800, // ms
  threshold = 0.1,
  distance = 30, // px
}) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Tôn trọng thiết lập giảm chuyển động của hệ điều hành
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold]);

  const getTransform = () => {
    if (isVisible) return "translate(0, 0) scale(1)";
    switch (direction) {
      case "up":
        return `translateY(${distance}px) scale(1)`;
      case "down":
        return `translateY(-${distance}px) scale(1)`;
      case "left":
        return `translateX(${distance}px) scale(1)`;
      case "right":
        return `translateX(-${distance}px) scale(1)`;
      case "zoom":
        return "translate(0, 0) scale(0.95)";
      case "none":
      default:
        return "none";
    }
  };

  const style = {
    opacity: isVisible ? 1 : 0,
    filter: isVisible ? "blur(0px)" : "blur(8px)",
    transform: getTransform(),
    transitionProperty: "opacity, transform, filter",
    transitionDuration: `${duration}ms`,
    transitionDelay: `${delay}ms`,
    transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)", // easeOutExpo
    willChange: "transform, opacity, filter",
  };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
};
