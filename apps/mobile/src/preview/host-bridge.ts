/**
 * 宿主预览壳与 HiMate 产品网页（同源 iframe）之间的返回协议。
 * - 产品 → 宿主：`himate:back-state`，告知当前是否有可返回的层级（Agent 页、抽屉、产物面板、图片查看器）。
 * - 宿主 → 产品：`himate:host-back`，用户点击宿主 header 返回按钮。
 * 产品没有可返回层级时，宿主按自身行为处理（当前为「返回宿主应用」说明）。
 * - 宿主 → 产品：`himate:theme`，宿主 header 切换明暗主题后同步给产品（产品不再提供自己的切换入口）。
 * 只校验同源，不传业务数据。纯网页入口（?preview=web 无父窗口）时不发送。
 */
export const HOST_BACK = "himate:host-back"
export const BACK_STATE = "himate:back-state"
export const THEME = "himate:theme"
export const THEME_STORAGE_KEY = "theme"

export type HostBridgeMessage = { type: typeof HOST_BACK } | { type: typeof BACK_STATE; canGoBack: boolean } | { type: typeof THEME; dark: boolean }

export function isHostBridgeMessage(event: MessageEvent): event is MessageEvent<HostBridgeMessage> {
  return event.origin === window.location.origin && typeof event.data === "object" && event.data !== null && (event.data.type === HOST_BACK || event.data.type === BACK_STATE || event.data.type === THEME)
}

/** 产品侧：向宿主报告是否可返回 */
export function reportBackState(canGoBack: boolean) {
  if (window.parent === window) return
  window.parent.postMessage({ type: BACK_STATE, canGoBack } satisfies HostBridgeMessage, window.location.origin)
}

/** 是否运行在宿主预览壳的 iframe 内；纯网页入口时为 false */
export const embeddedInHost = () => window.parent !== window

/** 读取已保存的明暗主题；未保存时跟随系统 */
export function readStoredDarkMode() {
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (saved) return saved === "dark"
  return window.matchMedia("(prefers-color-scheme: dark)").matches
}
