"use client";

import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export default function Input({ label, className, id, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          "px-3 py-2 rounded-lg border border-border bg-surface text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors",
          className
        )}
        {...props}
      />
    </div>
  );
}
