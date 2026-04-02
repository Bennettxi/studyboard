"use client";

import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  bgColor?: string;
  className?: string;
}

export default function Badge({ children, color, bgColor, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        !color && !bgColor && "bg-primary-light text-primary",
        className
      )}
      style={color && bgColor ? { color, backgroundColor: bgColor } : undefined}
    >
      {children}
    </span>
  );
}
