import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

export default function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={clsx(
        "w-full rounded-full border border-white/10 bg-sapphire/50 px-6 py-4 text-center text-xs font-bold tracking-widest text-white placeholder:text-white/30 focus:border-turquoise focus:outline-none focus-visible:ring-2 focus-visible:ring-turquoise",
        className
      )}
      {...props}
    />
  );
}
