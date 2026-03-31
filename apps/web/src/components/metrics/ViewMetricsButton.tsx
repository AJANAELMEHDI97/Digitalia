import { BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ViewMetricsButtonProps {
  publicationId: string;
  variant?: "default" | "ghost" | "outline";
  size?: "default" | "sm" | "icon";
  className?: string;
}

export function ViewMetricsButton({ 
  publicationId, 
  variant = "ghost",
  size = "sm",
  className 
}: ViewMetricsButtonProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/metrics?publication=${publicationId}`);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      className={className}
    >
      <BarChart3 className="h-4 w-4 mr-1.5" />
      Métriques
    </Button>
  );
}
