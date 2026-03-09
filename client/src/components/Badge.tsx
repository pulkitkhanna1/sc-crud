import type { ReactNode } from "react";

type BadgeTone = "muted" | "info" | "success" | "warning" | "danger";

const toneClassName: Record<BadgeTone, string> = {
  muted: "badge-muted",
  info: "badge-info",
  success: "badge-success",
  warning: "badge-warning",
  danger: "badge-danger",
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
}

export function Badge({ tone = "muted", children }: BadgeProps) {
  return <span className={`badge ${toneClassName[tone]}`}>{children}</span>;
}
