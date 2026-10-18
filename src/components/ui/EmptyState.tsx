import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-surface px-6 py-12 text-center">
      <Icon size={32} className="text-muted" aria-hidden="true" />
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="max-w-md text-sm text-muted">{description}</p>
      {action}
    </div>
  );
}