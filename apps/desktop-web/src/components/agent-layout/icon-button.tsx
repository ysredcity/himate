import type { ComponentProps } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function IconButton({ className, ...props }: ComponentProps<typeof Button>) {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className={cn("rounded-full max-[659px]:min-h-11 max-[659px]:min-w-11", className)}
      {...props}
    />
  )
}
