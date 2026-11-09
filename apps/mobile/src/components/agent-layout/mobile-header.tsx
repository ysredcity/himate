import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * 移动端 chat-container-header-agent 的玻璃按钮（Figma 5271:62234、2516:59109）：
 * 白底、0.5px 描边、0 2px 6px 10% 投影，单个按钮 48px 圆形，按钮组为同样外观的胶囊。
 */
const glassSurface = "border-[0.5px] border-border bg-background drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)]"

/** 设计稿 chat-container-header-agent 的圆形玻璃按钮：48px、0.5px 描边、柔和投影 */
export function GlassAction({ children, label, onClick }: { children: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className={cn("grid size-12 shrink-0 place-items-center rounded-full text-foreground transition-colors hover:bg-accent [&_svg]:size-6", glassSurface)}
          >
            {children}
          </button>
        }
      />
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  )
}


/** 胶囊按钮组：左右 4px 内边距，按钮 48px，按钮之间 1px × 24px 分隔线 */
export function GlassActionGroup({ children }: { children: React.ReactNode }) {
  return <div className={cn("flex h-12 shrink-0 items-center rounded-full px-1", glassSurface)}>{children}</div>
}

export function GlassGroupDivider() {
  return <span aria-hidden="true" className="h-6 w-px bg-border" />
}

/** 胶囊内的单个 48px 图标按钮；render 供 DropdownMenuTrigger 等组合使用 */
export const glassGroupButtonClass = "grid size-12 place-items-center rounded-full text-foreground transition-colors hover:bg-accent [&_svg]:size-6"
