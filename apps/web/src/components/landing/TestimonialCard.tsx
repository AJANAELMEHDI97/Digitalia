import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Import 3D portrait images
import portraitSophie from "@/assets/landing/portrait-sophie.png";
import portraitMarc from "@/assets/landing/portrait-marc.png";
import portraitLaura from "@/assets/landing/portrait-laura.png";

// Map for testimonial portraits
export const testimonialPortraits: Record<string, string> = {
  sophie: portraitSophie,
  marc: portraitMarc,
  laura: portraitLaura,
};

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar: string;
  portraitUrl?: string;
  featured?: boolean;
  className?: string;
}

export function TestimonialCard({ 
  quote, 
  author, 
  role, 
  avatar, 
  portraitUrl,
  featured = false,
  className 
}: TestimonialCardProps) {
  return (
    <Card className={cn(
      "h-full bg-white border-gray-200 hover:shadow-lg transition-all duration-300",
      featured && "lg:col-span-2 border-2 border-primary/20 shadow-lg",
      className
    )}>
      <CardContent className={cn("p-6", featured && "p-8")}>
        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={cn(
              "fill-amber-400 text-amber-400",
              featured ? "h-5 w-5" : "h-4 w-4"
            )} />
          ))}
        </div>
        
        {/* Quote */}
        <p className={cn(
          "text-gray-700 mb-6",
          featured && "text-lg"
        )}>
          "{quote}"
        </p>
        
        {/* Author */}
        <div className="flex items-center gap-3">
          {portraitUrl ? (
            <img 
              src={portraitUrl} 
              alt={author}
              className={cn(
                "rounded-full object-cover ring-2 ring-white shadow-lg",
                featured ? "w-14 h-14" : "w-10 h-10"
              )}
            />
          ) : (
            <div className={cn(
              "rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-medium",
              featured ? "w-14 h-14 text-lg" : "w-10 h-10 text-sm"
            )}>
              {avatar}
            </div>
          )}
          <div>
            <p className={cn(
              "font-medium text-gray-900",
              featured && "text-lg"
            )}>
              {author}
            </p>
            <p className={cn(
              "text-gray-500",
              featured ? "text-sm" : "text-sm"
            )}>
              {role}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
