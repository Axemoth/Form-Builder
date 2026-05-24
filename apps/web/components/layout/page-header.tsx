"use client";

import { ReactNode } from "react";
import { cn } from "~/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 mb-8 border-b border-ocean-surface/30",
        className,
      )}
    >
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-wide text-wano-cream flex flex-col gap-1.5 w-fit">
          <span className="ink-brush-text">{title}</span>
        </h1>
        {description && (
          <p className="text-wano-cream/60 text-sm mt-2 max-w-2xl leading-relaxed font-light">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">{actions}</div>
      )}
    </div>
  );
}
