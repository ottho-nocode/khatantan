import { cn } from "@/lib/utils";
import * as React from "react";

// Define spinner size variants
const sizeVariants = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

export interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: keyof typeof sizeVariants;
}

const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = "md", ...props }, ref) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" // Default width, will be overridden by Tailwind class
        height="24" // Default height, will be overridden by Tailwind class
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor" // Use currentColor to inherit text color
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("animate-spin", sizeVariants[size], className)} // Apply animation, size, and custom classes
        ref={ref}
        {...props}
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />{" "}
        {/* Simple path for spinning effect */}
      </svg>
    );
  },
);
Spinner.displayName = "Spinner";

export { Spinner };
