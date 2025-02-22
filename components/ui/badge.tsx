import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset gap-1",
  {
    variants: {
      variant: {
        pattern: "bg-blue-50 text-blue-700 ring-blue-700/10",
        strategy: "bg-green-50 text-green-700 ring-green-700/10",
        executed: "bg-orange-50 text-orange-700 ring-orange-700/10",
        notExecuted: "bg-gray-50 text-gray-700 ring-gray-700/10",
      },
    },
    defaultVariants: {
      variant: "pattern",
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
