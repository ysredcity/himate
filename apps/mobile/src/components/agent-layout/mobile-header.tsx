import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * 移动端 chat-container-header-agent 的玻璃按钮（Figma 5271:62234、2516:59109）：
 * 白底、0.5px 描边、0 2px 6px 10% 投影，单个按钮 48px 圆形，按钮组为同样外观的胶囊。
 */
// 深色模式下与页面背景拉开层次：底色比背景亮 10%（背景混 10% 前景色），描边 foreground/15（2026-11-11）
export const glassSurface = "border-[0.5px] border-border bg-background drop-shadow-[0_2px_6px_rgba(0,0,0,0.1)] dark:border-foreground/15 dark:bg-[color-mix(in_oklab,var(--background)_90%,var(--foreground))]"

/**
 * 悬浮磨砂玻璃（与工作台首页底部输入胶囊同感）：65% 背景 + 16px 模糊 + 浅色描边 + 浮层投影。
 * 用于专家页底部 Tab 栏与顶栏搜索。
 */
export const glassSurfaceClass = "border border-white/80 bg-background/65 shadow-[0_4px_16px_rgba(0,0,0,0.1)] backdrop-blur-[16px] dark:border-white/10"

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
