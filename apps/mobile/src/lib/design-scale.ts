/**
 * 402 基准宽度等比缩放（2026-11-11）。
 *
 * - 根字号 = 屏宽 / 402 × 16px（index.css 的 html.design-scale），402 宽时 1rem = 16px。
 * - 构建时 vite.config.ts 的 PostCSS 插件把 CSS 里的 px（含 Tailwind 任意值）换成 rem，1px 及以下的细线不换。
 * - JS 里写入行内样式的尺寸用 `rem()` 输出；需要和实测 DOM 尺寸比较时，用 `designScale()` 把实测值换回 402 基准。
 * - 媒体查询、触摸手势阈值仍是物理 px，不参与缩放。
 */
export const DESIGN_WIDTH = 402

/** 402 基准下的 px 转 rem 字符串，用于行内样式 */
export const rem = (px: number) => `${px / 16}rem`

/** 当前缩放比例（实际 px / 402 基准 px） */
export function designScale() {
  if (typeof document === "undefined") return 1
  return Number.parseFloat(getComputedStyle(document.documentElement).fontSize) / 16 || 1
}
