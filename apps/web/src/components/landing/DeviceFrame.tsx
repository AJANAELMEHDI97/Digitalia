import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceFrameProps {
  type?: "laptop" | "phone" | "tablet";
  url?: string;
  children: React.ReactNode;
  className?: string;
}

export function DeviceFrame({ type = "laptop", url = "app.socialpulse.pro", children, className }: DeviceFrameProps) {
  if (type === "phone") {
    return (
      <div className={cn("relative", className)}>
        <div className="relative rounded-[2.5rem] bg-gray-900 p-2 shadow-2xl shadow-gray-900/30">
          {/* Phone notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
          
          {/* Screen */}
          <div className="relative rounded-[2rem] overflow-hidden bg-white">
            {/* Status bar */}
            <div className="flex items-center justify-between px-6 py-2 bg-gray-50 text-xs text-gray-500">
              <span>9:41</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-2 border border-gray-400 rounded-sm">
                  <div className="w-3 h-1 bg-gray-600 rounded-sm" />
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-4 bg-black/20 blur-xl rounded-full" />
      </div>
    );
  }

  if (type === "tablet") {
    return (
      <div className={cn("relative", className)}>
        <div className="relative rounded-[2rem] bg-gray-900 p-3 shadow-2xl shadow-gray-900/30">
          {/* Camera */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-700 rounded-full" />
          
          {/* Screen */}
          <div className="rounded-[1.5rem] overflow-hidden bg-white mt-2">
            {children}
          </div>
        </div>
        {/* Shadow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/20 blur-xl rounded-full" />
      </div>
    );
  }

  // Laptop (default)
  return (
    <div className={cn("relative", className)}>
      <div className="relative rounded-2xl bg-gray-950 p-3 shadow-2xl shadow-gray-900/20">
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-t-lg">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2 px-4 py-1 bg-gray-800 rounded-md text-xs text-gray-400">
              <Lock className="h-3 w-3" />
              {url}
            </div>
          </div>
        </div>
        
        {/* Content */}
        <div className="bg-gray-50 rounded-b-lg overflow-hidden">
          {children}
        </div>
      </div>
      
      {/* Shadow */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-4/5 h-4 bg-black/20 blur-xl rounded-full" />
    </div>
  );
}
