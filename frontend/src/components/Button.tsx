import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-amber text-void font-semibold hover:bg-amber-dim active:scale-[0.98] shadow-[0_0_20px_rgba(212,168,83,0.2)] hover:shadow-[0_0_30px_rgba(212,168,83,0.35)] border border-amber/50",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04] border border-transparent",
  outline:
    "bg-surface/60 text-text-primary border border-border-strong hover:border-amber/50 hover:text-amber hover:bg-amber/[0.05] active:scale-[0.98]",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs tracking-wider",
  md: "px-5 py-2.5 text-xs tracking-widest",
  lg: "px-7 py-3.5 text-sm tracking-widest",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        group relative inline-flex items-center justify-center gap-2.5
        font-mono font-medium uppercase
        rounded-xs cursor-pointer select-none
        transition-all duration-200 ease-out
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
    >
      {children}
    </button>
  );
}

