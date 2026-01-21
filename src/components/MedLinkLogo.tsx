import { cn } from "@/lib/utils";

interface MedLinkLogoProps {
  className?: string;
  variant?: "default" | "white" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-14 w-14",
};

const textSizeClasses = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-2xl",
  xl: "text-4xl",
};

export const MedLinkLogo = ({
  className,
  variant = "default",
  size = "md",
}: MedLinkLogoProps) => {
  const textColor = variant === "white" ? "text-white" : "text-navy";

  // Logo Image Component
  const LogoIcon = ({ iconClass }: { iconClass?: string }) => (
    <img
      src="/images/medlink-logo-v2.png"
      alt="MedLink Logo"
      className={cn(sizeClasses[size], "object-contain", iconClass)}
    />
  );

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center", className)}>
        <LogoIcon />
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoIcon />
      <span
        className={cn("tracking-tight", textSizeClasses[size], textColor)}
        style={{ fontFamily: "'Poppins', sans-serif" }}
      >
        MedLink
      </span>
    </div>
  );
};
