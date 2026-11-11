/**
 * 宿主预览壳与 HiMate 产品网页（同源 iframe）之间的返回协议。
 * - 产品 → 宿主：`himate:back-state`，告知当前是否有可返回的层级（Agent 页、抽屉、产物面板、图片查看器）。
 * - 宿主 → 产品：`himate:host-back`，用户点击宿主 header 返回按钮。
 * 产品没有可返回层级时，宿主按自身行为处理（当前为「返回宿主应用」说明）。
 * - 产品 → 宿主：`himate:tab-bar`，告知宿主是否显示底部飞书 Tab 栏（只有工作台首页显示，新对话 / 对话页隐藏）。
 * - 宿主 → 产品：`himate:theme`，宿主 header 切换明暗主题后同步给产品（产品不再提供自己的切换入口）。
 * - 产品 → 宿主：`himate:keyboard`，Composer 输入框获得 / 失去焦点，宿主弹出 / 收起模拟键盘。
 * - 宿主 → 产品：`himate:key-input`，模拟键盘按键（字符、退格、发送），由当前聚焦的 Composer 处理。
 * 只校验同源，不传业务数据。纯网页入口（?preview=web 无父窗口）时不发送。
 */
export const HOST_BACK = "himate:host-back"
export const BACK_STATE = "himate:back-state"
export const THEME = "himate:theme"
export const TAB_BAR = "himate:tab-bar"
export const KEYBOARD = "himate:keyboard"
export const KEY_INPUT = "himate:key-input"
export const THEME_STORAGE_KEY = "theme"
/** 模拟键盘按键：普通字符，或退格 / 发送 */
export type HostKey = { kind: "text"; text: string } | { kind: "backspace" } | { kind: "enter" }

export type HostBridgeMessage = { type: typeof HOST_BACK } | { type: typeof BACK_STATE; canGoBack: boolean } | { type: typeof THEME; dark: boolean } | { type: typeof TAB_BAR; visible: boolean } | { type: typeof KEYBOARD; open: boolean } | { type: typeof KEY_INPUT; key: HostKey }

export function isHostBridgeMessage(event: MessageEvent): event is MessageEvent<HostBridgeMessage> {
  return event.origin === window.location.origin && typeof event.data === "object" && event.data !== null && [HOST_BACK, BACK_STATE, THEME, TAB_BAR, KEYBOARD, KEY_INPUT].includes(event.data.type)
}

/** 产品侧：向宿主报告是否可返回 */
export function reportBackState(canGoBack: boolean) {
  if (window.parent === window) return
  window.parent.postMessage({ type: BACK_STATE, canGoBack } satisfies HostBridgeMessage, window.location.origin)
}

/** 产品侧：告知宿主是否显示底部 Tab 栏 */
export function reportTabBar(visible: boolean) {
  if (window.parent === window) return
  window.parent.postMessage({ type: TAB_BAR, visible } satisfies HostBridgeMessage, window.location.origin)
}

/** 产品侧：告知宿主 Composer 输入框是否处于键盘输入（聚焦）状态 */
export function reportKeyboard(open: boolean) {
  document.documentElement.toggleAttribute("data-host-keyboard", open && window.parent !== window)
  if (window.parent === window) return
  window.parent.postMessage({ type: KEYBOARD, open } satisfies HostBridgeMessage, window.location.origin)
}

/** 是否运行在宿主预览壳的 iframe 内；纯网页入口时为 false */
export const embeddedInHost = () => window.parent !== window

/** 读取已保存的明暗主题；未保存时跟随系统 */
export function readStoredDarkMode() {
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved) return saved === "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}
