import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Shield, Calendar, BarChart3, CheckCircle, Bell, Share2, 
  Lock, Scale, FileCheck, TrendingUp, Users, Sparkles 
} from "lucide-react";

interface FloatingElement {
  size: string;
  position: string;
  color: string;
  delay?: number;
  duration?: number;
}

interface IllustrationConfig {
  bgGradient: string;
  floatingElements: FloatingElement[];
  icon: React.ElementType;
  iconColor: string;
}

const floatingAnimation = () => ({
  y: [0, -8, 0],
  rotate: [0, 3, -3, 0],
});

const floatingTransition = (delay = 0, duration = 4) => ({
  duration,
  repeat: Infinity,
  delay,
  ease: "easeInOut" as const,
});

const illustrationConfigs: Record<string, IllustrationConfig> = {
  hero: {
    bgGradient: "bg-gradient-to-br from-violet-100 via-blue-50 to-indigo-100",
    floatingElements: [
      { size: "w-16 h-16", position: "top-4 left-4", color: "bg-gradient-to-br from-orange-300 to-orange-400", delay: 0 },
      { size: "w-10 h-10", position: "top-1/4 right-6", color: "bg-gradient-to-br from-blue-300 to-blue-500", delay: 0.5 },
      { size: "w-8 h-8", position: "bottom-8 left-8", color: "bg-gradient-to-br from-emerald-300 to-emerald-500", delay: 1 },
      { size: "w-12 h-12", position: "bottom-4 right-12", color: "bg-gradient-to-br from-violet-300 to-violet-500", delay: 0.3 },
      { size: "w-6 h-6", position: "top-1/2 left-1/4", color: "bg-gradient-to-br from-pink-300 to-pink-400", delay: 0.7 },
    ],
    icon: Sparkles,
    iconColor: "text-primary",
  },
  planning: {
    bgGradient: "bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100",
    floatingElements: [
      { size: "w-14 h-14", position: "top-6 right-6", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0 },
      { size: "w-10 h-10", position: "bottom-6 left-6", color: "bg-gradient-to-br from-blue-400 to-indigo-500", delay: 0.4 },
      { size: "w-8 h-8", position: "top-1/3 left-4", color: "bg-gradient-to-br from-emerald-300 to-teal-400", delay: 0.8 },
    ],
    icon: Calendar,
    iconColor: "text-blue-600",
  },
  validation: {
    bgGradient: "bg-gradient-to-br from-emerald-100 via-green-50 to-teal-100",
    floatingElements: [
      { size: "w-12 h-12", position: "top-4 left-6", color: "bg-gradient-to-br from-emerald-400 to-green-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-8 right-4", color: "bg-gradient-to-br from-blue-300 to-blue-400", delay: 0.5 },
      { size: "w-8 h-8", position: "top-1/2 right-8", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0.3 },
    ],
    icon: CheckCircle,
    iconColor: "text-emerald-600",
  },
  analytics: {
    bgGradient: "bg-gradient-to-br from-violet-100 via-purple-50 to-fuchsia-100",
    floatingElements: [
      { size: "w-14 h-14", position: "top-4 right-4", color: "bg-gradient-to-br from-violet-400 to-purple-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-6 left-8", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0.6 },
      { size: "w-8 h-8", position: "top-1/3 left-4", color: "bg-gradient-to-br from-blue-300 to-indigo-400", delay: 0.3 },
    ],
    icon: BarChart3,
    iconColor: "text-violet-600",
  },
  security: {
    bgGradient: "bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100",
    floatingElements: [
      { size: "w-12 h-12", position: "top-6 left-4", color: "bg-gradient-to-br from-blue-400 to-indigo-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-4 right-6", color: "bg-gradient-to-br from-emerald-300 to-teal-400", delay: 0.4 },
      { size: "w-8 h-8", position: "top-1/2 right-4", color: "bg-gradient-to-br from-violet-300 to-purple-400", delay: 0.7 },
    ],
    icon: Shield,
    iconColor: "text-blue-600",
  },
  receive: {
    bgGradient: "bg-gradient-to-br from-blue-100 via-indigo-50 to-violet-100",
    floatingElements: [
      { size: "w-14 h-14", position: "top-4 right-6", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0 },
      { size: "w-10 h-10", position: "bottom-8 left-4", color: "bg-gradient-to-br from-blue-400 to-indigo-500", delay: 0.5 },
      { size: "w-8 h-8", position: "top-1/3 left-6", color: "bg-gradient-to-br from-pink-300 to-rose-400", delay: 0.3 },
    ],
    icon: Bell,
    iconColor: "text-blue-600",
  },
  publish: {
    bgGradient: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
    floatingElements: [
      { size: "w-12 h-12", position: "top-6 left-4", color: "bg-gradient-to-br from-violet-400 to-purple-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-6 right-8", color: "bg-gradient-to-br from-emerald-300 to-teal-400", delay: 0.6 },
      { size: "w-8 h-8", position: "top-1/2 right-4", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0.2 },
    ],
    icon: Share2,
    iconColor: "text-violet-600",
  },
  deontology: {
    bgGradient: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
    floatingElements: [
      { size: "w-14 h-14", position: "top-4 right-4", color: "bg-gradient-to-br from-amber-400 to-orange-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-6 left-6", color: "bg-gradient-to-br from-blue-300 to-indigo-400", delay: 0.4 },
      { size: "w-8 h-8", position: "top-1/3 left-4", color: "bg-gradient-to-br from-emerald-300 to-teal-400", delay: 0.7 },
    ],
    icon: Scale,
    iconColor: "text-amber-600",
  },
  control: {
    bgGradient: "bg-gradient-to-br from-emerald-100 via-teal-50 to-cyan-100",
    floatingElements: [
      { size: "w-12 h-12", position: "top-6 left-6", color: "bg-gradient-to-br from-emerald-400 to-teal-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-4 right-4", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0.5 },
      { size: "w-8 h-8", position: "top-1/2 right-6", color: "bg-gradient-to-br from-violet-300 to-purple-400", delay: 0.3 },
    ],
    icon: FileCheck,
    iconColor: "text-emerald-600",
  },
  growth: {
    bgGradient: "bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100",
    floatingElements: [
      { size: "w-14 h-14", position: "top-4 left-4", color: "bg-gradient-to-br from-blue-400 to-cyan-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-8 right-6", color: "bg-gradient-to-br from-emerald-300 to-teal-400", delay: 0.6 },
      { size: "w-8 h-8", position: "top-1/3 right-4", color: "bg-gradient-to-br from-orange-300 to-amber-400", delay: 0.2 },
    ],
    icon: TrendingUp,
    iconColor: "text-blue-600",
  },
  clients: {
    bgGradient: "bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100",
    floatingElements: [
      { size: "w-12 h-12", position: "top-6 right-4", color: "bg-gradient-to-br from-violet-400 to-purple-500", delay: 0 },
      { size: "w-10 h-10", position: "bottom-6 left-8", color: "bg-gradient-to-br from-pink-300 to-rose-400", delay: 0.4 },
      { size: "w-8 h-8", position: "top-1/2 left-4", color: "bg-gradient-to-br from-blue-300 to-indigo-400", delay: 0.7 },
    ],
    icon: Users,
    iconColor: "text-violet-600",
  },
};

interface Illustration3DProps {
  type: keyof typeof illustrationConfigs;
  className?: string;
  imageUrl?: string;
  size?: "sm" | "md" | "lg";
}

export function Illustration3D({ type, className, imageUrl, size = "md" }: Illustration3DProps) {
  const config = illustrationConfigs[type] || illustrationConfigs.hero;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "h-32",
    md: "h-48",
    lg: "h-64",
  };

  const iconSizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  const containerSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-3xl",
        config.bgGradient,
        sizeClasses[size],
        className
      )}
    >
      {/* Floating elements */}
      {config.floatingElements.map((el, i) => (
        <motion.div
          key={i}
          className={cn(
            "absolute rounded-full opacity-70 shadow-lg",
            el.size,
            el.position,
            el.color
          )}
          animate={floatingAnimation()}
          transition={floatingTransition(el.delay || 0, el.duration || 4)}
        />
      ))}

      {/* Main content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {imageUrl ? (
          <motion.img
            src={imageUrl}
            alt=""
            className="max-w-full max-h-full object-contain drop-shadow-xl"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        ) : (
          <motion.div
            className={cn(
              "rounded-2xl bg-white/80 backdrop-blur-sm shadow-xl flex items-center justify-center",
              containerSizes[size]
            )}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.05 }}
          >
            <Icon className={cn(iconSizes[size], config.iconColor)} />
          </motion.div>
        )}
      </div>

      {/* Subtle overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent pointer-events-none" />
    </div>
  );
}
