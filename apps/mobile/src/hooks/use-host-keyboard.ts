import { useEffect, useRef, type RefObject } from "react"
import { isHostBridgeMessage, KEY_INPUT, reportKeyboard, type HostKey } from "@/preview/host-bridge"

/**
 * 让普通文本框接入宿主模拟键盘（ADR 0013）：聚焦时弹出、失焦或卸载时收起，宿主按键插入到光标位置，「发送」键触发 onEnter。
 * 返回值挂到文本框的 onFocus / onBlur。Composer 有自己的实现，不使用本 hook。
 */
export function useHostKeyboard(ref: RefObject<HTMLTextAreaElement | HTMLInputElement | null>, value: string, onChange: (value: string) => void, onEnter?: () => void) {
  const latest = useRef({ value, onChange, onEnter })
  latest.current = { value, onChange, onEnter }
  // 连续按键可能早于重新渲染到达，用 ref 记录最新值与光标
  const pending = useRef<{ value: string; caret: number } | null>(null)
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== window.parent || !isHostBridgeMessage(event) || event.data.type !== KEY_INPUT) return
      const field = ref.current
      if (!field || document.activeElement !== field) return
      const key: HostKey = event.data.key
      if (key.kind === "enter") { pending.current = null; latest.current.onEnter?.(); return }
      const current = pending.current?.value ?? latest.current.value
      const start = pending.current?.caret ?? field.selectionStart ?? current.length
      const end = pending.current?.caret ?? field.selectionEnd ?? current.length
      const from = key.kind === "backspace" && start === end ? Math.max(0, start - 1) : start
      const next = current.slice(0, from) + (key.kind === "text" ? key.text : "") + current.slice(end)
      const caret = from + (key.kind === "text" ? key.text.length : 0)
      pending.current = { value: next, caret }
      latest.current.onChange(next)
      requestAnimationFrame(() => {
        field.setSelectionRange(caret, caret)
        if (pending.current?.value === next) pending.current = null
      })
    }
    window.addEventListener("message", onMessage)
    return () => { window.removeEventListener("message", onMessage); reportKeyboard(false) }
  }, [ref])
  return { onFocus: () => reportKeyboard(true), onBlur: () => reportKeyboard(false) }
}
