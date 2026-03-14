import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
}

export function TypewriterText({ text, delay = 0, speed = 50 }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, delay + currentIndex * speed);

    return () => clearTimeout(timeout);
  }, [currentIndex, text, delay, speed]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className="relative">
      <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-300 bg-clip-text text-transparent">
        {displayText}
      </span>
      <AnimatePresence>
        {currentIndex < text.length && showCursor && (
          <motion.span
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="inline-block w-1 h-[0.9em] bg-gradient-to-b from-cyan-400 to-blue-500 ml-1 align-middle"
            style={{ boxShadow: "0 0 20px rgba(6, 182, 212, 0.8)" }}
          />
        )}
      </AnimatePresence>
    </span>
  );
}