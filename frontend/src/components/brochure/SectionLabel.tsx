import clsx from "clsx";

type SectionLabelProps = {
  children: React.ReactNode;
  tone?: "gold" | "white";
  className?: string;
  as?: "span" | "p";
};

export function SectionLabel({ children, tone = "gold", className, as = "p" }: SectionLabelProps) {
  const Tag = as;
  return (
    <Tag
      className={clsx(
        "text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] sm:tracking-[0.4em]",
        tone === "gold" ? "text-brand-gold" : "text-brand-white/70",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
