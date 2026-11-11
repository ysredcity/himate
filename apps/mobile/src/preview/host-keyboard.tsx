import { useState, type ReactNode, type SyntheticEvent } from "react";
import { ArrowBigUp, Delete, Globe, Mic } from "lucide-react";
import type { HostKey } from "./host-bridge";

/**
 * 宿主预览壳的模拟系统键盘（iOS 拼音键盘外观，402 宽）：Composer 输入框聚焦时从底部滑出，宿主网页视口随之缩短。
 * 按键只做演示输入：字母（小写 / 上档大写）、空格、退格、发送，经 postMessage 交给产品插入到光标位置；不做拼音候选与真实输入法。
 * 所有按键在 pointerdown 阻止默认行为，避免点击键盘时 iframe 内输入框失焦、键盘被收起。
 */
const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"] as const;

export function HostKeyboard({ open, onKey }: { open: boolean; onKey: (key: HostKey) => void }) {
  const [shift, setShift] = useState(false);
  const press = (key: HostKey) => {
    onKey(key);
    if (key.kind === "text" && shift) setShift(false);
  };
  const letter = (char: string) => {
    const text = shift ? char.toUpperCase() : char;
    return <Key key={char} label={text} onPress={() => press({ kind: "text", text })}>{text}</Key>;
  };

  return (
    <div className="host-keyboard" data-open={open || undefined} aria-hidden={!open} inert={!open}>
      <div className="host-keyboard-inner" role="group" aria-label="模拟键盘（演示）">
        <div className="host-keyboard-candidates" aria-hidden="true" />
        <div className="host-keyboard-row">{ROWS[0].split("").map(letter)}</div>
        <div className="host-keyboard-row host-keyboard-row-indent">{ROWS[1].split("").map(letter)}</div>
        <div className="host-keyboard-row">
          <Key fn wide label="大写" pressed={shift} onPress={() => setShift((value) => !value)}><ArrowBigUp fill={shift ? "currentColor" : "none"} /></Key>
          <span className="host-keyboard-gap" />
          {ROWS[2].split("").map(letter)}
          <span className="host-keyboard-gap" />
          <Key fn wide label="删除" onPress={() => press({ kind: "backspace" })}><Delete /></Key>
        </div>
        <div className="host-keyboard-row">
          <Key fn label="数字键盘（演示不可用）" className="host-key-123">123</Key>
          <Key label="空格" className="host-key-space" onPress={() => press({ kind: "text", text: " " })}>空格</Key>
          <Key accent label="发送" className="host-key-return" onPress={() => press({ kind: "enter" })}>发送</Key>
        </div>
        <div className="host-keyboard-bottom" aria-hidden="true">
          <Globe />
          <Mic />
          <span className="host-home-indicator" />
        </div>
      </div>
    </div>
  );
}

function Key({ children, label, onPress, fn, accent, wide, pressed, className }: { children: ReactNode; label: string; onPress?: () => void; fn?: boolean; accent?: boolean; wide?: boolean; pressed?: boolean; className?: string }) {
  const keep = (event: SyntheticEvent) => event.preventDefault();
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      aria-pressed={pressed}
      className={["host-key", fn && "host-key-fn", accent && "host-key-accent", wide && "host-key-wide", className].filter(Boolean).join(" ")}
      onPointerDown={keep}
      onMouseDown={keep}
      onClick={onPress}
    >
      {children}
    </button>
  );
}
