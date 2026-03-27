import type { ReactNode } from "react";

export default function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-4xl mb-12 md:mb-16 md:pl-12">
      {eyebrow && (
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.25em] text-sapphire/50">
          {eyebrow}
        </p>
      )}
      <h2 className="mb-6 text-5xl font-serif font-light tracking-tighter text-sapphire md:text-7xl">
        {title}
      </h2>
      {children}
    </div>
  );
}
