import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Scale, Calendar, BarChart3, MessageSquare, Users, 
  Sparkles, Shield, TrendingUp, CheckCircle 
} from "lucide-react";

interface HeroIllustration3DProps {
  className?: string;
}

// Floating bubble with animation
const FloatingBubble = ({ 
  size, 
  position, 
  color, 
  delay = 0,
  duration = 4,
  children
}: { 
  size: string; 
  position: string; 
  color: string; 
  delay?: number;
  duration?: number;
  children?: React.ReactNode;
}) => (
  <motion.div
    className={cn(
      "absolute rounded-full shadow-lg flex items-center justify-center",
      size,
      position,
      color
    )}
    animate={{
      y: [0, -12, 0],
      x: [0, 4, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// Floating card with icon
const FloatingCard = ({
  position,
  delay = 0,
  icon: Icon,
  label,
  color,
}: {
  position: string;
  delay?: number;
  icon: React.ElementType;
  label: string;
  color: string;
}) => (
  <motion.div
    className={cn(
      "absolute bg-white/95 backdrop-blur-sm rounded-xl shadow-xl px-3 py-2 flex items-center gap-2",
      position
    )}
    animate={{
      y: [0, -8, 0],
      rotate: [0, 2, -2, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    <div className={cn("p-1.5 rounded-lg", color)}>
      <Icon className="h-4 w-4 text-white" />
    </div>
    <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{label}</span>
  </motion.div>
);

export function HeroIllustration3D({ className }: HeroIllustration3DProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Main container with gradient background */}
      <motion.div
        className="relative w-full aspect-square max-w-lg mx-auto"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Background gradient orb */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-violet-200/30 blur-3xl" />
        
        {/* Decorative rings */}
        <motion.div 
          className="absolute inset-8 rounded-full border-2 border-primary/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />
        <motion.div 
          className="absolute inset-16 rounded-full border-2 border-accent/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
        />

        {/* Central 3D-style element */}
        <motion.div
          className="absolute inset-0 m-auto w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-primary via-accent to-violet-500 shadow-2xl shadow-primary/30"
          animate={{
            rotateY: [0, 10, -10, 0],
            rotateX: [0, -5, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <Scale className="h-16 w-16 md:h-20 md:w-20 text-white" />
          </div>
          {/* Glass reflection effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/30 via-transparent to-transparent" />
        </motion.div>

        {/* Floating colored bubbles */}
        <FloatingBubble 
          size="w-20 h-20" 
          position="top-4 left-4" 
          color="bg-gradient-to-br from-orange-300 to-orange-400 opacity-80" 
          delay={0}
          duration={5}
        >
          <Calendar className="h-8 w-8 text-white" />
        </FloatingBubble>

        <FloatingBubble 
          size="w-16 h-16" 
          position="top-8 right-8" 
          color="bg-gradient-to-br from-blue-400 to-indigo-500 opacity-80" 
          delay={0.7}
          duration={4.5}
        >
          <BarChart3 className="h-6 w-6 text-white" />
        </FloatingBubble>

        <FloatingBubble 
          size="w-14 h-14" 
          position="bottom-12 left-8" 
          color="bg-gradient-to-br from-emerald-400 to-teal-500 opacity-80" 
          delay={1.2}
          duration={4}
        >
          <CheckCircle className="h-5 w-5 text-white" />
        </FloatingBubble>

        <FloatingBubble 
          size="w-18 h-18" 
          position="bottom-8 right-4" 
          color="bg-gradient-to-br from-violet-400 to-purple-500 opacity-80" 
          delay={0.3}
          duration={5.5}
        >
          <Users className="h-7 w-7 text-white" />
        </FloatingBubble>

        <FloatingBubble 
          size="w-12 h-12" 
          position="top-1/3 left-0" 
          color="bg-gradient-to-br from-pink-400 to-rose-500 opacity-80" 
          delay={0.9}
          duration={4.2}
        >
          <MessageSquare className="h-4 w-4 text-white" />
        </FloatingBubble>

        <FloatingBubble 
          size="w-10 h-10" 
          position="bottom-1/3 right-0" 
          color="bg-gradient-to-br from-amber-400 to-orange-500 opacity-80" 
          delay={1.5}
          duration={3.8}
        >
          <TrendingUp className="h-4 w-4 text-white" />
        </FloatingBubble>

        {/* Floating feature cards */}
        <FloatingCard
          position="top-1/2 -left-4 md:-left-8"
          delay={0.5}
          icon={Shield}
          label="100% déontologique"
          color="bg-emerald-500"
        />

        <FloatingCard
          position="bottom-1/4 -right-4 md:-right-8"
          delay={1}
          icon={Sparkles}
          label="IA génératrice"
          color="bg-violet-500"
        />

        {/* Sparkle particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/60 rounded-full"
            style={{
              top: `${20 + Math.random() * 60}%`,
              left: `${20 + Math.random() * 60}%`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.4,
              ease: "easeInOut",
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}