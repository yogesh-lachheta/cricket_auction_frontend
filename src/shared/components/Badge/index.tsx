import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white",
        secondary:
          "bg-secondary text-white",
        destructive:
          "bg-accent-coral text-white",
        outline: "border-2 border-primary bg-transparent text-primary",
        success:
          "bg-secondary text-white",
        warning:
          "bg-accent-yellow text-text-main",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
