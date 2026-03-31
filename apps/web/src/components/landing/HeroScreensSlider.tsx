import * as React from "react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

// Import illustrations
import dashboardImg from "@/assets/landing/screens/dashboard.jpg";
import communicationImg from "@/assets/landing/screens/communication.jpg";
import supportImg from "@/assets/landing/screens/support.jpg";
import socialMediaImg from "@/assets/landing/screens/social-media.jpg";

interface HeroScreensSliderProps {
  className?: string;
}

// Screenshots of the application with real captures
const screenshots = [
  { 
    src: dashboardImg, 
    alt: "Tableau de bord SocialPulse - Analyse des performances", 
    label: "Tableau de bord" 
  },
  { 
    src: socialMediaImg, 
    alt: "Gestion des réseaux sociaux et métriques d'engagement", 
    label: "Réseaux sociaux" 
  },
  { 
    src: communicationImg, 
    alt: "Communication multicanal avec vos clients", 
    label: "Communication" 
  },
  { 
    src: supportImg, 
    alt: "Accompagnement personnalisé par nos experts", 
    label: "Accompagnement" 
  },
];

// Floating bubble component with parallax
const FloatingBubble = ({ 
  size, 
  position, 
  color, 
  delay = 0,
  duration = 4,
  parallaxX,
  parallaxY,
  intensity = 1,
}: { 
  size: string; 
  position: string; 
  color: string; 
  delay?: number;
  duration?: number;
  parallaxX: any;
  parallaxY: any;
  intensity?: number;
}) => {
  const x = useTransform(parallaxX, (value: number) => value * intensity);
  const y = useTransform(parallaxY, (value: number) => value * intensity);

  return (
    <motion.div
      className={cn(
        "absolute rounded-full opacity-70 shadow-lg",
        size,
        position,
        color
      )}
      style={{ x, y }}
      animate={{
        translateY: [0, -12, 0],
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
};

export function HeroScreensSlider({ className }: HeroScreensSliderProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [animationKey, setAnimationKey] = React.useState(0);
  
  // Mouse position for parallax effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring-smoothed parallax values
  const parallaxX = useSpring(useTransform(mouseX, [-500, 500], [-20, 20]), { stiffness: 100, damping: 30 });
  const parallaxY = useSpring(useTransform(mouseY, [-500, 500], [-15, 15]), { stiffness: 100, damping: 30 });
  
  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  }, [mouseX, mouseY]);
  
  const handleMouseLeave = React.useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);
  
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "center",
    },
    [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })]
  );

  React.useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
      setAnimationKey(prev => prev + 1); // Trigger animation restart
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  return (
    <div 
      className={cn("relative", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Floating colored bubbles - decorative background with parallax */}
      <FloatingBubble 
        size="w-24 h-24" 
        position="-top-4 -left-4" 
        color="bg-gradient-to-br from-orange-300 to-orange-400" 
        delay={0}
        duration={5}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        intensity={1.5}
      />
      <FloatingBubble 
        size="w-16 h-16" 
        position="top-1/4 -right-2" 
        color="bg-gradient-to-br from-blue-400 to-indigo-500" 
        delay={0.7}
        duration={4.5}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        intensity={-1.2}
      />
      <FloatingBubble 
        size="w-12 h-12" 
        position="bottom-1/3 -left-2" 
        color="bg-gradient-to-br from-emerald-400 to-teal-500" 
        delay={1.2}
        duration={4}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        intensity={0.8}
      />
      <FloatingBubble 
        size="w-20 h-20" 
        position="-bottom-4 right-1/4" 
        color="bg-gradient-to-br from-violet-400 to-purple-500" 
        delay={0.3}
        duration={5.5}
        parallaxX={parallaxX}
        parallaxY={parallaxY}
        intensity={-1}
      />

      {/* Main slider container */}
      <motion.div
        className="relative z-10"
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
            <span className="text-gray-400 text-xs">app.socialpulse.pro</span>
          </div>
        </div>

        {/* Carousel */}
        <div className="bg-white rounded-b-xl shadow-2xl overflow-hidden">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {screenshots.map((screen, index) => (
                <div
                  key={index}
                  className="flex-[0_0_100%] min-w-0"
                >
                  <motion.div 
                    key={`${index}-${selectedIndex === index ? animationKey : 0}`}
                    className="relative aspect-[16/10] bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden"
                    initial={{ scale: 1.02, opacity: 0.9 }}
                    animate={selectedIndex === index ? { 
                      scale: 1,
                      opacity: 1,
                    } : {
                      scale: 1,
                      opacity: 1,
                    }}
                    transition={{ 
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                  >
                    <motion.img
                      src={screen.src}
                      alt={screen.alt}
                      className="w-full h-full object-contain p-6"
                      animate={selectedIndex === index ? {
                        scale: [1, 1.04],
                        y: [0, -6],
                      } : {
                        scale: 1,
                        y: 0,
                      }}
                      transition={{
                        duration: 4,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-2 mt-4">
          {screenshots.map((screen, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "transition-all duration-300 rounded-full",
                selectedIndex === index
                  ? "w-8 h-2 bg-primary"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              )}
              aria-label={`Voir ${screen.label}`}
            />
          ))}
        </div>

        {/* Current slide label */}
        <p className="text-center text-sm text-muted-foreground mt-2">
          {screenshots[selectedIndex]?.label}
        </p>
      </motion.div>
    </div>
  );
}
