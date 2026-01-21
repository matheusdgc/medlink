import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
  iconClassName?: string;
}

export const ActionCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  className,
  iconClassName,
}: ActionCardProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group flex flex-col items-center justify-center p-8 rounded-xl",
        "border-2 border-border bg-card",
        "transition-all duration-300 ease-out",
        "hover:border-teal hover:shadow-card hover:-translate-y-1",
        "focus:outline-none focus:ring-2 focus:ring-teal focus:ring-offset-2",
        "min-w-[180px]",
        className
      )}
    >
      <div className={cn(
        "flex items-center justify-center w-16 h-16 mb-4 rounded-xl",
        "bg-teal-light text-teal",
        "transition-colors group-hover:bg-teal group-hover:text-white",
        iconClassName
      )}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="font-display font-semibold text-foreground mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground text-center">
        {description}
      </p>
    </button>
  );
};
