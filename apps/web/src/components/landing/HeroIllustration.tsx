import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { 
  Linkedin, BarChart3, Shield, Calendar, CheckCircle, 
  Users, Sparkles 
} from "lucide-react";

interface HeroIllustrationProps {
  className?: string;
  imageUrl?: string;
}

// Floating bubble component
const FloatingBubble = ({ 
  size, 
  position, 
  color, 
  delay = 0,
  duration = 4 
}: { 
  size: string; 
  position: string; 
  color: string; 
  delay?: number;
  duration?: number;
}) => (
  <motion.div
    className={cn(
      "absolute rounded-full opacity-70 shadow-lg",
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
  />
);

// Floating icon component
const FloatingIcon = ({ 
  Icon, 
  position, 
  bgColor,
  iconColor,
  delay = 0 
}: { 
  Icon: React.ElementType;
  position: string;
  bgColor: string;
  iconColor: string;
  delay?: number;
}) => (
  <motion.div
    className={cn(
      "absolute w-12 h-12 rounded-xl shadow-lg flex items-center justify-center",
      position,
      bgColor
    )}
    animate={{
      y: [0, -8, 0],
      rotate: [0, 3, -3, 0],
    }}
    transition={{
      duration: 3.5,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    <Icon className={cn("h-6 w-6", iconColor)} />
  </motion.div>
);

export function HeroIllustration({ className, imageUrl }: HeroIllustrationProps) {
  // If we have an AI-generated image, display it
  if (imageUrl) {
    return (
      <div className={cn("relative", className)}>
        {/* Background floating elements */}
        <FloatingBubble 
          size="w-20 h-20" 
          position="top-0 left-0" 
          color="bg-gradient-to-br from-orange-300 to-orange-400" 
          delay={0} 
        />
        <FloatingBubble 
          size="w-14 h-14" 
          position="top-1/4 right-0" 
          color="bg-gradient-to-br from-blue-300 to-blue-500" 
          delay={0.5} 
        />
        <FloatingBubble 
          size="w-10 h-10" 
          position="bottom-1/4 left-4" 
          color="bg-gradient-to-br from-emerald-300 to-emerald-500" 
          delay={1} 
        />
        <FloatingBubble 
          size="w-16 h-16" 
          position="bottom-8 right-8" 
          color="bg-gradient-to-br from-violet-300 to-violet-500" 
          delay={0.3} 
        />
        
        {/* Main image */}
        <motion.img
          src={imageUrl}
          alt="SocialPulse - Communication pour avocats"
          className="relative z-10 w-full h-auto drop-shadow-2xl rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        />
      </div>
    );
  }

  // Fallback: Stylized 3D-like illustration with floating elements
  return (
    <div className={cn("relative", className)}>
      {/* Large decorative background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-violet-100 via-blue-50 to-indigo-100 rounded-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Floating colored bubbles - 3D style */}
      <FloatingBubble 
        size="w-24 h-24" 
        position="-top-4 -left-4" 
        color="bg-gradient-to-br from-orange-300 to-orange-400" 
        delay={0}
        duration={5}
      />
      <FloatingBubble 
        size="w-16 h-16" 
        position="top-1/4 -right-2" 
        color="bg-gradient-to-br from-blue-400 to-indigo-500" 
        delay={0.7}
        duration={4.5}
      />
      <FloatingBubble 
        size="w-12 h-12" 
        position="bottom-1/3 -left-2" 
        color="bg-gradient-to-br from-emerald-400 to-teal-500" 
        delay={1.2}
        duration={4}
      />
      <FloatingBubble 
        size="w-20 h-20" 
        position="-bottom-4 right-1/4" 
        color="bg-gradient-to-br from-violet-400 to-purple-500" 
        delay={0.3}
        duration={5.5}
      />
      <FloatingBubble 
        size="w-8 h-8" 
        position="top-1/2 left-1/4" 
        color="bg-gradient-to-br from-pink-300 to-rose-400" 
        delay={0.9}
        duration={3.5}
      />
      <FloatingBubble 
        size="w-10 h-10" 
        position="top-8 left-1/3" 
        color="bg-gradient-to-br from-cyan-300 to-blue-400" 
        delay={1.5}
        duration={4.2}
      />

      {/* Floating icons */}
      <FloatingIcon 
        Icon={Linkedin}
        position="top-8 right-8"
        bgColor="bg-white"
        iconColor="text-[#0A66C2]"
        delay={0.2}
      />
      <FloatingIcon 
        Icon={Calendar}
        position="top-1/3 left-4"
        bgColor="bg-white"
        iconColor="text-primary"
        delay={0.8}
      />
      <FloatingIcon 
        Icon={BarChart3}
        position="bottom-16 right-4"
        bgColor="bg-white"
        iconColor="text-violet-600"
        delay={0.5}
      />
      <FloatingIcon 
        Icon={Shield}
        position="bottom-8 left-8"
        bgColor="bg-white"
        iconColor="text-emerald-600"
        delay={1.1}
      />

      {/* Central dashboard mockup */}
      <motion.div
        className="relative z-10 mx-8 my-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Browser frame */}
        <div className="bg-gray-800 rounded-t-xl p-2 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex-1 bg-gray-700 rounded-md h-6 flex items-center justify-center">
            <span className="text-gray-400 text-xs">socialpulse.app</span>
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="bg-white rounded-b-xl shadow-2xl p-4 space-y-3">
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <motion.div 
              className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-primary">12</div>
              <div className="text-[10px] text-muted-foreground">À valider</div>
            </motion.div>
            <motion.div 
              className="bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg p-3 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-emerald-600">+45%</div>
              <div className="text-[10px] text-muted-foreground">Engagement</div>
            </motion.div>
            <motion.div 
              className="bg-gradient-to-br from-violet-100 to-violet-50 rounded-lg p-3 text-center"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-lg font-bold text-violet-600">2.4k</div>
              <div className="text-[10px] text-muted-foreground">Vues</div>
            </motion.div>
          </div>
          
          {/* Post preview */}
          <motion.div 
            className="bg-gray-50 rounded-lg p-3 border border-gray-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium">Cabinet Martin & Associés</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Linkedin className="h-3 w-3 text-[#0A66C2]" />
                  Programmé pour demain
                </div>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 text-xs">
                <CheckCircle className="h-4 w-4" />
                Validé
              </div>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">
              📚 Nouvelle jurisprudence : la Cour de cassation clarifie les règles de prescription en matière de...
            </p>
          </motion.div>
          
          {/* Mini chart */}
          <div className="flex items-end justify-between h-12 gap-1 px-2">
            {[40, 65, 45, 80, 60, 90, 75].map((height, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary to-primary/60 rounded-t"
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
      
      {/* Decorative sparkles */}
      <motion.div
        className="absolute top-4 right-1/3"
        animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.1, 0.9] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Sparkles className="h-6 w-6 text-yellow-400" />
      </motion.div>
    </div>
  );
}