# ADR 0012：移动端以 402 为基准等比缩放
- 日期：2026-11-11（Asia/Shanghai）
- 状态：已接受
- 替代关系：替代 DESIGN.md 中「402px 为几何基准，文字字号、图标尺寸与触控区域保持设计值，不整体缩放页面」的旧约定

## 问题
用户要求移动端所有元素尺寸以 402px 宽为基准定义，其他宽度下等比例缩放（rem 等方案均可，效果为等比即可）。原实现在窄屏时只收缩卡片列宽，字号、图标、控件保持固定 px，320 / 430 等宽度下比例与设计稿不一致。

## 选项
1. 视口 meta `width=402`：由浏览器整体缩放，代码零改动；但部分 Android WebView 默认不启用宽视口，且宿主预览的 iframe 不受控制，不可靠。
2. CSS `zoom`：写法最少；但视口单位与 zoom 叠加、事件坐标在不同内核上不一致，有溢出风险。
3. rem：根字号随屏宽变化，CSS 中的 px 换成 rem。Tailwind v4 的间距、字号本身已是 rem；剩余 px（index.css、Tailwind 任意值）在构建时自动换算，不需要逐个改源码。需要处理少量写入行内样式的 JS 尺寸。
4. 引入 postcss-pxtorem 等第三方依赖：与方案 3 同效，但新增依赖。

## 结论
采用方案 3，换算用 vite.config.ts 内联的 PostCSS 插件实现，不新增依赖：
- `html.design-scale { font-size: calc(min(100vw, 480px) / 402 * 16) }`，402 宽时 1rem = 16px；上限 480px，避免桌面浏览器直接打开时无限放大。
- 只在产品页面（`?preview=web`）给 html 加 `design-scale`，宿主预览外壳不缩放；宿主 iframe 固定 402 宽，所以预览里比例仍是 1。
- 构建 / 开发时把 CSS 声明值中的 px 换成 rem（÷16），绝对值 ≤ 1px 的细线、媒体查询参数不换。
- JS 写入的尺寸用 `src/lib/design-scale.ts` 的 `rem()` 输出；与实测 DOM 尺寸比较时用 `designScale()` 换回基准值。
- 触摸手势阈值、边缘保护宽度保持物理 px，不缩放。

## 后果
- 影响：`apps/mobile/vite.config.ts`、`src/index.css`、`src/main.tsx`、`src/lib/design-scale.ts`，以及 `mobile-composer.tsx`（输入框高度动画）、`agent-shell.tsx`（侧栏宽度变量）、`expert-page.tsx`（搜索框展开宽度）的行内尺寸。
- 新增组件时照常按 402 设计稿写 px（Tailwind 任意值或 CSS），不必手写 rem；只有写进 `style` 的数字需要用 `rem()`。
- 320px 宽时所有尺寸约为设计值的 0.8 倍，正文 16px 约为 12.7px，可读性需真机确认。
- 桌面应用 desktop-web 不受影响。

## 验证
2026-11-11 Playwright 实测 320 / 375 / 402 / 430 宽：根字号 12.74 / 14.93 / 16 / 17.11px，专家页 Tab 栏 229.3 / 268.7 / 288 / 308px、顶部栏高 50.9 / 59.7 / 64 / 68.5px、列表头像 44.6 / 52.2 / 56 / 59.9px，均与屏宽成比例；四个宽度页面均无横向溢出。宿主外壳根字号 16px，iframe 内 16px、宽 402。真机未验证。
