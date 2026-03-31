import { AdminKPICard } from "@/components/admin/shared/AdminUI";
import { LucideIcon } from "lucide-react";

interface BusinessKPICardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  variation?: string;
  variationPositive?: boolean;
  alert?: boolean;
  className?: string;
}

export function BusinessKPICard({
  label,
  value,
  icon,
  variation,
  variationPositive,
  alert = false,
  className,
}: BusinessKPICardProps) {
  return (
    <AdminKPICard
      label={label}
      value={value}
      icon={icon}
      sub={variation}
      alert={alert}
      positive={variationPositive}
      className={className}
    />
  );
}
