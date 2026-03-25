"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function CursorSystem() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices
    if ("ontouchstart" in window) return;

    const onMouseMove = (e: MouseEvent) => {
      gsap.to(cursorRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.2,
        ease: "power2.out",
      });
      gsap.to(cursorDotRef.current, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.05,
      });
    };

    const onHover = () => {
      gsap.to(cursorRef.current, { scale: 2.5, duration: 0.2 });
    };

    const onLeave = () => {
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousemove", onMouseMove);

    // Observe DOM for new interactive elements
    const observer = new MutationObserver(() => {
      const els = document.querySelectorAll("button, a, .interactive, input");
      els.forEach((el) => {
        el.addEventListener("mouseenter", onHover);
        el.addEventListener("mouseleave", onLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial binding
    const els = document.querySelectorAll("button, a, .interactive, input");
    els.forEach((el) => {
      el.addEventListener("mouseenter", onHover);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="fixed w-8 h-8 border-2 border-primary rounded-full pointer-events-none z-50 mix-blend-difference hidden md:block"
        style={{ left: -16, top: -16 }}
      />
      <div
        ref={cursorDotRef}
        className="fixed w-2 h-2 bg-primary rounded-full pointer-events-none z-50 hidden md:block"
        style={{ left: -4, top: -4 }}
      />
    </>
  );
}
