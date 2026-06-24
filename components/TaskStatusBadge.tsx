import type { TaskStatusLabel } from "@/lib/contracts/microWorkEscrow";

const statusStyles: Record<TaskStatusLabel, string> = {
  Created: "border-slate-500/60 bg-slate-500/10 text-slate-200",
  Funded: "border-arc-blue/60 bg-arc-blue/10 text-arc-blue",
  Assigned: "border-violet-300/60 bg-violet-300/10 text-violet-100",
  Submitted: "border-amber-300/60 bg-amber-300/10 text-amber-100",
  Released: "border-arc-mint/60 bg-arc-mint/10 text-arc-mint",
  Cancelled: "border-red-300/60 bg-red-300/10 text-red-100"
};

type TaskStatusBadgeProps = {
  status: TaskStatusLabel | string;
};

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  const style =
    status in statusStyles
      ? statusStyles[status as TaskStatusLabel]
      : "border-arc-border bg-black/30 text-arc-mint";

  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
