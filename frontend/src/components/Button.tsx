import { type ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

const variantStyles: Record<string, string> = {
  primary:
    "bg-amber text-void font-semibold hover:bg-amber-dim active:scale-[0.98] glow-amber",
  ghost:
    "bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/[0.04]",
  outline:
    "bg-transparent text-text-primary border border-border-strong hover:border-amber/40 hover:text-amber",
};

const sizeStyles: Record<string, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  disabled = false,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center justify-center gap-2
        font-mono font-medium tracking-wide uppercase
        rounded-sm cursor-pointer
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
