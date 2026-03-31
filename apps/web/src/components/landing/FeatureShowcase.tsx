import { motion } from "framer-motion";
import { DeviceFrame } from "./DeviceFrame";
import { 
  ShieldCheck, 
  Calendar, 
  BarChart3, 
  Check,
  Clock,
  Linkedin,
  Twitter,
  Facebook
} from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface FeatureShowcaseProps {
  type: "validation" | "calendar" | "metrics";
  className?: string;
}

export function FeatureShowcase({ type, className }: FeatureShowcaseProps) {
  if (type === "validation") {
    return (
      <motion.div 
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <DeviceFrame type="laptop">
          <div className="p-6 bg-white min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-900">Publications à valider</h3>
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">3 en attente</span>
            </div>
            
            <div className="space-y-3">
              {[
                { title: "Réforme du droit du travail", platform: "LinkedIn", time: "09:00", icon: Linkedin, color: "#0077B5" },
                { title: "Conseil pratique - Bail commercial", platform: "Twitter", time: "14:30", icon: Twitter, color: "#1DA1F2" },
                { title: "Actualité fiscale 2025", platform: "Facebook", time: "11:00", icon: Facebook, color: "#1877F2" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-primary/30 transition-colors">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <item.icon className="h-4 w-4" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.platform} • {item.time}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                      <Check className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DeviceFrame>
      </motion.div>
    );
  }

  if (type === "calendar") {
    return (
      <motion.div 
        className={className}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
      >
        <DeviceFrame type="laptop">
          <div className="p-6 bg-white min-h-[300px]">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-gray-900">Calendrier éditorial</h3>
              <span className="ml-auto text-xs text-gray-500">Janvier 2025</span>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
              {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                <span key={i} className="text-gray-400 font-medium py-1">{d}</span>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                const hasPost = [4, 8, 13, 19, 23, 28].includes(day);
                const isKeyDate = [6, 16].includes(day);
                
                return (
                  <div 
                    key={i}
                    className={`aspect-square rounded-md flex items-center justify-center text-xs font-medium transition-colors ${
                      hasPost 
                        ? 'bg-primary text-white' 
                        : isKeyDate 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        </DeviceFrame>
      </motion.div>
    );
  }

  // Metrics
  return (
    <motion.div 
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
    >
      <DeviceFrame type="laptop">
        <div className="p-6 bg-white min-h-[300px]">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-amber-600" />
            <h3 className="font-semibold text-gray-900">Performance</h3>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Portée", value: "2.4K", trend: "+12%" },
              { label: "Engagements", value: "342", trend: "+8%" },
              { label: "Clics", value: "89", trend: "+15%" },
            ].map((stat, i) => (
              <div key={i} className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <div className="flex items-end gap-1">
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                  <span className="text-xs text-emerald-600 font-medium">{stat.trend}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t transition-all hover:opacity-80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2 px-2">
            {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d, i) => (
              <span key={i}>{d}</span>
            ))}
          </div>
        </div>
      </DeviceFrame>
    </motion.div>
  );
}
