import * as React from "react"
import { cn } from "@lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, ...props }, ref) => {
    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-semibold text-text-main leading-none">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 border-border-light bg-surface-light px-4 py-2.5 text-sm text-text-main transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-background-light",
            error && "border-accent-coral focus:ring-accent-coral focus:border-accent-coral",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-accent-coral font-medium">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
