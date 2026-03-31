import { ReactNode } from "react";

interface WidgetWrapperProps {
  children: ReactNode;
}

export function WidgetWrapper({ children }: WidgetWrapperProps) {
  return (
    <div className="h-full w-full">
      {children}
    </div>
  );
}
