import { cloneElement, isValidElement, type ReactNode } from "react"

/**
 * HiMate 移动端：触屏界面不显示 Tooltip（用户 2026-11-08 确认）。
 * 保留与 shadcn / Base UI Tooltip 相同的导出与用法，避免改动模板调用处：
 * - Tooltip / TooltipProvider 只渲染子节点；
 * - TooltipTrigger 直接渲染 render 元素（或 children）；
 * - TooltipContent 不渲染任何内容。
 * 纯图标按钮的可访问名称仍由各自的 aria-label 提供。
 */
type Children = { children?: ReactNode }

function TooltipProvider({ children }: Children & { delay?: number }) {
  return <>{children}</>
}

function Tooltip({ children }: Children & { open?: boolean; onOpenChange?: (open: boolean) => void }) {
  return <>{children}</>
}

function TooltipTrigger({ render, children, ...props }: Children & { render?: unknown; [key: string]: unknown }) {
  if (isValidElement<Record<string, unknown>>(render)) return children === undefined ? cloneElement(render, props) : cloneElement(render, props, children)
  return <>{children}</>
}

function TooltipContent(_props: Children & { [key: string]: unknown }) {
  return null
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
