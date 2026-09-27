import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#1557A6] text-white",
        secondary:
          "border-slate-200 bg-slate-100 text-slate-700",
        destructive:
          "border-transparent bg-red-100 text-red-700 border-red-200",
        outline:
          "text-slate-700 border-slate-200 bg-white",
        success:
          "border-transparent bg-green-100 text-green-800 border-green-200",
        warning:
          "border-transparent bg-amber-100 text-amber-800 border-amber-200",
        info:
          "border-transparent bg-blue-50 text-blue-700 border-blue-200",
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
