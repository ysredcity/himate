import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowUp, Camera, Image as ImageIcon, Keyboard, Mic, RotateCcw, X } from "lucide-react"
import { toast } from "sonner"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { WelcomeExpert } from "@/agent-ui/immersive/contracts"
import type { ComposerSendHandler, ContextItem } from "./composer"
import { ExpertLineIcon, shortExpertLabel } from "./resource-visuals"
import { ComposerRecommendations } from "./composer-recommendations"
import { Spinner } from "@/components/ui/spinner"
import { ALBUM_FAIL_ONCE_INDEX, albumSamples, cameraSamples, UPLOAD_DURATION, type UploadSample } from "./upload-samples"

export type MobileComposerProps = {
  /** 全部可选专家，「更多」面板列出全部 */
  experts: readonly WelcomeExpert[]
  /** 快捷行直接展示的专家 id，其余进入「更多」 */
  quickExpertIds: readonly string[]
  draft: string
  onDraftChange: (value: string) => void
  selectedExpert: string | null
  onSelectedExpertChange: (expert: string | null) => void
  onRecommendationsOpenChange?: (open: boolean) => void
  onSend: ComposerSendHandler
  disabled?: boolean
  sending?: boolean
  placeholder?: string
}

const MAX_TEXTAREA_HEIGHT = 120
const LINE_HEIGHT = 24
/** 附件区：上 12px + 72px 缩略图（Figma 5271:64305 PromptInputHeader 84px） */
const ATTACHMENT_HEADER_HEIGHT = 84

type ImageUpload = UploadSample & { id: string; status: "uploading" | "done" | "failed"; failOnce: boolean }

/**
 * 移动端 Composer（Figma 2903:46039「输入框（移动端）」）：与 PC 端 Composer 分开实现。
 * - 五类指令横滑选择，列表在标签上方展开；仅选择具体指令时填入草稿与专家。
 * - 默认空值且未聚焦：单行胶囊（56px）；聚焦、有值或选中专家：展开为两行（输入区 + 操作栏），圆角 24px。
 * - 有值时右侧出现发送按钮；麦克风切换到「按住说话」，键盘图标切回文字输入。语音为演示，不录音。
 * - 左下角图片按钮打开「拍照 / 从相册选择」面板（Figma 5271:64305），不调起真实相机或相册，使用本地示例图模拟上传；
 *   上传中显示 Spinner，失败可点击重试，可只发送图片。
 */
export function MobileComposer({ experts, draft, onDraftChange, selectedExpert, onSelectedExpertChange, onSend, onRecommendationsOpenChange, disabled = false, sending = false, placeholder = "发送消息给我" }: MobileComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)
  const [voice, setVoice] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [uploads, setUploads] = useState<ImageUpload[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const hasValue = draft.trim().length > 0
  const doneUploads = uploads.filter((item) => item.status === "done")
  const uploading = uploads.some((item) => item.status === "uploading")
  const canSend = (hasValue || doneUploads.length > 0) && !uploading
  const expanded = focused || hasValue || Boolean(selectedExpert) || uploads.length > 0
  const locked = disabled || sending
  const selectedVisualKey = experts.find((expert) => expert.label === selectedExpert)?.visualKey

  const [textHeight, setTextHeight] = useState(LINE_HEIGHT)
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    const next = Math.min(Math.max(textarea.scrollHeight, LINE_HEIGHT), MAX_TEXTAREA_HEIGHT)
    textarea.style.height = `${next}px`
    setTextHeight(next)
  }, [draft, expanded, voice])
  // 设计稿：单行 56px；展开 = 描边 2 + 上 15 + 文本 + 下 8 + 操作栏 55（单行文本时为 104px）
  const boxHeight = expanded ? (uploads.length ? ATTACHMENT_HEADER_HEIGHT : 0) + 2 + 15 + textHeight + 8 + 55 : 56

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((timer) => clearTimeout(timer))
  }, [])

  const startUpload = (id: string, fail: boolean) => {
    const timer = setTimeout(() => {
      timers.current.delete(id)
      setUploads((items) => items.map((item) => item.id === id ? { ...item, status: fail ? "failed" : "done", failOnce: false } : item))
    }, UPLOAD_DURATION)
    timers.current.set(id, timer)
  }

  const addImages = (samples: readonly UploadSample[], failIndex?: number) => {
    setPickerOpen(false)
    const stamp = Date.now()
    const next = samples.map((sample, index) => ({ ...sample, id: `upload-${stamp}-${index}`, status: "uploading" as const, failOnce: index === failIndex }))
    setUploads((items) => [...items, ...next])
    next.forEach((item) => startUpload(item.id, item.failOnce))
  }

  const retryUpload = (id: string) => {
    setUploads((items) => items.map((item) => item.id === id ? { ...item, status: "uploading" } : item))
    startUpload(id, false)
  }

  const removeUpload = (id: string) => {
    clearTimeout(timers.current.get(id))
    timers.current.delete(id)
    setUploads((items) => items.filter((item) => item.id !== id))
  }

  const send = async () => {
    if (!canSend || locked) return
    const context: ContextItem[] = [
      // 只发送已上传成功的图片；附件预览走图片查看器
      ...doneUploads.map((item): ContextItem => ({ id: item.id, label: item.name, type: "upload", size: item.size, target: { type: "image", title: item.name, fileName: item.name, src: item.src, alt: item.name } })),
      ...(selectedExpert ? [{ id: `专家-${selectedExpert}`, label: selectedExpert, type: "专家" } satisfies ContextItem] : []),
    ]
    const accepted = await onSend(draft.trim(), context)
    if (accepted !== false) {
      onDraftChange("")
      setUploads((items) => items.filter((item) => item.status !== "done"))
    }
  }

  const exitVoice = () => {
    setVoice(false)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <div className="flex flex-col gap-2">
      <ComposerRecommendations onOpenChange={onRecommendationsOpenChange} disabled={locked} onSelect={item => {
        onDraftChange(item.prompt)
        onSelectedExpertChange(item.expert ?? null)
        setVoice(false)
        requestAnimationFrame(() => textareaRef.current?.focus())
      }} />

      {voice ? (
        <div className="flex h-14 items-center rounded-full border bg-background px-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
          <span className="size-9 shrink-0" aria-hidden="true" />
          <button
            type="button"
            disabled={locked}
            className={cn("mx-2 h-9 flex-1 touch-none rounded-full text-base font-medium select-none transition-colors disabled:opacity-50", pressing && "bg-muted")}
            onPointerDown={() => setPressing(true)}
            onPointerCancel={() => setPressing(false)}
            onPointerLeave={() => setPressing(false)}
            onPointerUp={() => {
              if (!pressing) return
              setPressing(false)
              toast.info("语音输入为演示，未接入录音与识别")
            }}
          >
            {pressing ? "松开结束" : "按住说话"}
          </button>
          <InputButton label="切换到键盘输入" onClick={exitVoice}><Keyboard /></InputButton>
        </div>
      ) : (
        <div
          // 单行与多行共用同一结构：只过渡高度与圆角，按钮固定在右下角，避免布局切换造成跳动
          className={cn(
            "relative overflow-hidden border bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-[height,border-radius] duration-200 ease-out motion-reduce:transition-none",
            expanded ? "rounded-[24px]" : "rounded-[28px]",
            locked && "opacity-70",
          )}
          style={{ height: boxHeight }}
        >
          {uploads.length > 0 && (
            // 关闭按钮外溢 4px：li 右上留 4px，列表顶部 8px，使缩略图距顶 12px、间距 8px
            <ul className="no-scrollbar flex gap-1 overflow-x-auto px-3 pt-2" aria-label="已添加的图片">
              {uploads.map((item) => (
                <li key={item.id} className="relative shrink-0 pt-1 pr-1">
                  <div className="relative size-[72px] overflow-hidden rounded-[10px]">
                    <img src={item.src} alt={item.name} className="size-full object-cover" />
                    {item.status !== "done" && <span className="absolute inset-0 bg-black/30" aria-hidden="true" />}
                    {item.status === "uploading" && <span className="absolute inset-0 grid place-items-center text-white" role="status" aria-label={`${item.name} 上传中`}><Spinner className="size-7" /></span>}
                    {item.status === "failed" && (
                      <button type="button" aria-label={`${item.name} 上传失败，点击重试`} className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-sm leading-5 text-white" onPointerDown={(event) => event.preventDefault()} onClick={() => retryUpload(item.id)}>
                        <RotateCcw aria-hidden="true" className="size-5" />失败
                      </button>
                    )}
                  </div>
                  <button type="button" aria-label={`移除图片 ${item.name}`} className="absolute top-0 right-0 grid size-[22px] place-items-center rounded-full bg-black/70 text-white" onPointerDown={(event) => event.preventDefault()} onClick={() => removeUpload(item.id)}>
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={cn("transition-[padding] duration-200 ease-out motion-reduce:transition-none", expanded ? "pb-2 pl-5 pr-5 pt-[15px]" : "py-[15px] pl-[54px] pr-14")}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              disabled={locked}
              aria-label="消息内容"
              placeholder={placeholder}
              className="block max-h-[120px] w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground/72"
              onChange={(event) => onDraftChange(event.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  void send()
                }
              }}
            />
          </div>
          {selectedExpert && (
            <span className={cn("absolute bottom-[9px] left-[54px] flex h-9 items-center rounded-full bg-primary-bg px-2 text-sm font-medium text-primary transition-opacity duration-200 motion-reduce:transition-none", expanded ? "opacity-100" : "opacity-0")}>
              <ExpertLineIcon expert={selectedExpert} visualKey={selectedVisualKey} />
              <span className="px-1.5">{shortExpertLabel(selectedExpert)}</span>
              <button type="button" aria-label={`移除专家 ${selectedExpert}`} disabled={locked} className="-mr-1 grid size-7 place-items-center rounded-full disabled:opacity-50" onPointerDown={(event) => event.preventDefault()} onClick={() => onSelectedExpertChange(null)}>
                <X aria-hidden="true" className="size-4" />
              </button>
            </span>
          )}
          <div className="absolute bottom-[9px] left-2.5">
            <InputButton label="上传图片" disabled={locked} onClick={() => setPickerOpen(true)}><ImageIcon /></InputButton>
          </div>
          <div className="absolute bottom-[9px] right-2.5 flex items-center gap-2">
            <InputButton label="语音输入" disabled={locked} onClick={() => setVoice(true)}><Mic /></InputButton>
            {(hasValue || uploads.length > 0) && (
              <InputButton label="发送" disabled={locked || !canSend} primary onClick={() => void send()}><ArrowUp /></InputButton>
            )}
          </div>
        </div>
      )}

      {/* 选择上传方式（Figma 5271:63584）：50% 黑遮罩、24px 顶部圆角、两列 16px 圆角卡片 */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        <SheetContent side="bottom" showCloseButton={false} overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-none" className="gap-0 rounded-t-3xl border-t-0 px-4 pt-4 pb-[max(32px,env(safe-area-inset-bottom))]">
          <SheetTitle className="sr-only">选择上传方式</SheetTitle>
          <SheetDescription className="sr-only">演示环境不会调起相机或相册，将使用本地示例图片</SheetDescription>
          <div className="grid grid-cols-2 gap-3">
            <UploadOption icon={<Camera />} label="拍照" onClick={() => addImages(cameraSamples)} />
            <UploadOption icon={<ImageIcon />} label="从相册选择" onClick={() => addImages(albumSamples, ALBUM_FAIL_ONCE_INDEX)} />
          </div>
        </SheetContent>
      </Sheet>


    </div>
  )
}

function UploadOption({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-accent px-3 py-4 text-sm leading-5 font-medium text-foreground transition-colors hover:bg-muted [&_svg]:size-8 [&_svg]:stroke-[1.5]">
      {icon}
      {label}
    </button>
  )
}

function InputButton({ children, disabled, label, onClick, primary = false }: { children: React.ReactNode; disabled?: boolean; label: string; onClick: () => void; primary?: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      // 失焦前触发点击，避免按钮在 textarea 失焦收起后错位
      onPointerDown={(event) => event.preventDefault()}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-full transition-colors disabled:opacity-50 [&_svg]:size-5",
        primary ? "bg-foreground text-background" : "bg-background text-foreground hover:bg-accent",
      )}
    >
      {children}
    </button>
  )
}
