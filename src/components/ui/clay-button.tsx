import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export interface ClayButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'purple' | 'outline'
  size?: 'sm' | 'md' | 'lg'
}

const ClayButton = React.forwardRef<HTMLButtonElement, ClayButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variantStyles = {
      primary: "bg-clay-primary text-white",
      secondary: "bg-clay-secondary text-white",
      accent: "bg-clay-accent text-black",
      purple: "bg-clay-purple text-white",
      outline: "bg-white border-2 border-clay-primary text-clay-primary shadow-none"
    }

    const sizeStyles = {
      sm: "px-4 py-2 text-sm rounded-clay",
      md: "px-6 py-3 text-base rounded-clay",
      lg: "px-8 py-4 text-lg rounded-clay"
    }

    return (
      // @ts-ignore
      <motion.button
        ref={ref}
        whileHover={{ translateY: -2, boxShadow: "0 6px 0 rgba(0,0,0,0.1)" }}
        whileTap={{ translateY: 2, boxShadow: "0 2px 0 rgba(0,0,0,0.1)" }}
        className={cn(
          "relative font-bold transition-colors duration-200 active:shadow-none",
          "flex items-center justify-center gap-2",
          "shadow-[0_4px_0_rgba(0,0,0,0.1)]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    )
  }
)

ClayButton.displayName = "ClayButton"

export { ClayButton }
