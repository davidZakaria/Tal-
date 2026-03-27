import { clsx } from "clsx";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variants: Record<Variant, string> = {
  primary:
    "bg-sapphire text-white hover:bg-turquoise shadow-lg hover:shadow-xl disabled:opacity-50",
  secondary:
    "bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white hover:text-sapphire",
  ghost: "bg-transparent text-sapphire hover:bg-sand-light/80 border border-sapphire/15",
};

export default function Button({
  className,
  variant = "primary",
  children,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
