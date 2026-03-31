import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: string;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    if (!isInView) return;

    // Extract numeric part and suffix (K, M, %, +, etc.)
    const numericMatch = value.match(/^([\d.]+)/);
    const suffixMatch = value.match(/[^\d.]+$/);
    const prefixMatch = value.match(/^[^\d]+/);
    
    const numericValue = numericMatch ? parseFloat(numericMatch[1]) : 0;
    const suffix = suffixMatch ? suffixMatch[0] : "";
    const prefix = prefixMatch && !numericMatch ? "" : (value.startsWith("+") ? "+" : "");
    
    const isDecimal = value.includes(".");
    const startTime = performance.now();
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = numericValue * easeOutQuart;
      
      if (isDecimal) {
        setDisplayValue(`${prefix}${currentValue.toFixed(1)}${suffix}`);
      } else {
        setDisplayValue(`${prefix}${Math.floor(currentValue)}${suffix}`);
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };
    
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="tabular-nums"
    >
      {displayValue}
    </motion.span>
  );
}
