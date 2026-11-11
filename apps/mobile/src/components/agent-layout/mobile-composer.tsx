import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { ArrowUp, Camera, Check, ChevronLeft, ChevronRight, Image as ImageIcon, Keyboard, Mic, Plus, RotateCcw, Search, X } from "lucide-react"
import { toast } from "sonner"

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import type { WelcomeExpert } from "@/agent-ui/immersive/contracts"
import type { ComposerSendHandler, ContextItem } from "./composer"
import { ExpertLineIcon, shortExpertLabel } from "./resource-visuals"
import { PillButton } from "./pill-button"
import { contextIcons } from "./icon-registry"
import { ComposerRecommendations, RecommendationItems, type RecommendationCategory } from "./composer-recommendations"
import { Spinner } from "@/components/ui/spinner"
import { useInstalledExperts, useOpenExperts } from "./expert-context"
import { expertCatalog } from "./expert-data"
import { designScale, rem } from "@/lib/design-scale"
import { isHostBridgeMessage, KEY_INPUT, reportKeyboard, type HostKey } from "@/preview/host-bridge"
import { ALBUM_FAIL_ONCE_INDEX, albumSamples, cameraSamples, UPLOAD_DURATION, type UploadSample } from "./upload-samples"

const ExpertEntryIcon = contextIcons.专家

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
  /** 是否显示推荐分类行：新对话页显示，对话页不显示（2026-11-11 用户确认） */
  showRecommendations?: boolean
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
 * - 同一面板底部有「专家」入口（参考用户截图），进入二级「专家」列表：与桌面 Composer 一致，只列已安装专家，
 *   支持搜索；选中后作为指定专家显示在输入框内。「查看更多专家」与桌面同文案，移动端暂无专家目录，点击仅提示。
 */
export function MobileComposer({ experts, draft, onDraftChange, selectedExpert, onSelectedExpertChange, onSend, onRecommendationsOpenChange, showRecommendations = true, disabled = false, sending = false, placeholder = "发送消息给我" }: MobileComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [focused, setFocused] = useState(false)
  const [voice, setVoice] = useState(false)
  const [pressing, setPressing] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  // 推荐指令蒙层：点击分类标签打开，标题为分类名，点 X / 空白处 / Esc 关闭
  const [recommendCategory, setRecommendCategory] = useState<RecommendationCategory | null>(null)
  const installedExperts = useInstalledExperts()
  const openExperts = useOpenExperts()
  const [pickerView, setPickerView] = useState<"add" | "experts">("add")
  const [expertQuery, setExpertQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [uploads, setUploads] = useState<ImageUpload[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const hasValue = draft.trim().length > 0
  const doneUploads = uploads.filter((item) => item.status === "done")
  const uploading = uploads.some((item) => item.status === "uploading")
  const canSend = (hasValue || doneUploads.length > 0) && !uploading
  const expanded = focused || hasValue || Boolean(selectedExpert) || uploads.length > 0
  const locked = disabled || sending
  const selectedVisualKey = experts.find((expert) => expert.label === selectedExpert)?.visualKey
  // 已选专家标签用与专家列表一致的圆形头像；目录中没有该专家时回退为线性图标
  const selectedAvatar = expertCatalog.find((expert) => expert.name === selectedExpert)?.avatar

  const [textHeight, setTextHeight] = useState(LINE_HEIGHT)
  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = "auto"
    // 高度常量是 402 基准值：实测 scrollHeight 先换回基准再比较，写回时用 rem 随屏宽缩放
    const next = Math.min(Math.max(Math.round(textarea.scrollHeight / designScale()), LINE_HEIGHT), MAX_TEXTAREA_HEIGHT)
    textarea.style.height = rem(next)
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

  // 宿主模拟键盘：输入框聚焦时弹出，失焦或卸载时收起；按键由宿主发来，插入到光标位置
  // 连续按键可能早于重新渲染到达，所以用 ref 记录最新草稿与光标，不直接读渲染时的 draft / selection
  const pendingInput = useRef<{ value: string; caret: number } | null>(null)
  const keyHandler = useRef<(key: HostKey) => void>(() => {})
  keyHandler.current = (key) => {
    const textarea = textareaRef.current
    if (!textarea || locked || document.activeElement !== textarea) return
    if (key.kind === "enter") { pendingInput.current = null; void send(); return }
    const value = pendingInput.current?.value ?? draft
    const start = pendingInput.current?.caret ?? textarea.selectionStart ?? value.length
    const end = pendingInput.current?.caret ?? textarea.selectionEnd ?? value.length
    const from = key.kind === "backspace" && start === end ? Math.max(0, start - 1) : start
    const next = value.slice(0, from) + (key.kind === "text" ? key.text : "") + value.slice(end)
    const caret = from + (key.kind === "text" ? key.text.length : 0)
    pendingInput.current = { value: next, caret }
    onDraftChange(next)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(caret, caret)
      if (pendingInput.current?.value === next) pendingInput.current = null
    })
  }
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source === window.parent && isHostBridgeMessage(event) && event.data.type === KEY_INPUT) keyHandler.current(event.data.key)
    }
    window.addEventListener("message", onMessage)
    return () => { window.removeEventListener("message", onMessage); reportKeyboard(false) }
  }, [])

  const openRecommendations = (category: RecommendationCategory) => {
    setRecommendCategory(category)
    onRecommendationsOpenChange?.(true)
  }
  const closeRecommendations = () => {
    setRecommendCategory(null)
    onRecommendationsOpenChange?.(false)
  }
  useEffect(() => {
    if (!recommendCategory) return
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") closeRecommendations() }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  // 打开「+」面板前记录输入框是否已调起键盘：面板关闭后恢复原状态（原来聚焦则重新聚焦，原来未聚焦则保持未聚焦）
  const keyboardBeforePicker = useRef(false)
  const openPicker = () => {
    keyboardBeforePicker.current = document.activeElement === textareaRef.current
    setPickerView("add")
    setExpertQuery("")
    setSearching(false)
    setPickerOpen(true)
  }

  const chooseExpert = (name: string) => {
    onSelectedExpertChange(name)
    setPickerOpen(false)
    // 按住说话模式下选专家保持语音模式（专家标签显示在语音框底部）。
    // 键盘只由点击输入框调起：选专家、上传图片、选推荐指令都不自动聚焦（2026-11-11 用户要求）
  }

  const query = expertQuery.trim()
  const visibleExperts = query ? installedExperts.filter((expert) => `${expert.name}${expert.role}`.includes(query)) : installedExperts

  // 右侧键盘按钮只切换回文字输入模式，不聚焦输入框、不调起键盘（2026-11-11 用户要求）
  const exitVoice = () => setVoice(false)
  // 按住说话模式永远不出现键盘：输入框被卸载时浏览器不一定触发 blur，这里显式收起并清除聚焦态
  useEffect(() => {
    if (!voice) return
    setFocused(false)
    reportKeyboard(false)
  }, [voice])

  // 文字模式与按住说话模式共用的已选专家标签
  // 已选专家标签：PillButton 自定义样式（2026-11-11）。整枚标签即移除按钮，比单独的小 X 更好点；X 紧跟名称（间距 4px）
  const expertChip = selectedExpert ? (
    <PillButton
      aria-label={`移除专家 ${selectedExpert}`}
      disabled={locked}
      className="h-9 gap-1 bg-primary-bg pr-2.5 pl-2 text-sm font-medium text-primary hover:bg-primary-bg hover:text-primary [&_svg:not([class*='size-'])]:size-4"
      onPointerDown={(event) => event.preventDefault()}
      onClick={() => onSelectedExpertChange(null)}
    >
      {selectedAvatar ? <img src={selectedAvatar} alt="" className="size-5 shrink-0 rounded-full object-cover" /> : <ExpertLineIcon expert={selectedExpert} visualKey={selectedVisualKey} />}
      <span className="px-0.5">{shortExpertLabel(selectedExpert)}</span>
      <X aria-hidden="true" />
    </PillButton>
  ) : null

  // 文字模式与按住说话模式共用的附件缩略图区
  const attachmentList = uploads.length > 0 ? (
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
  ) : null

  return (
    <div className="flex flex-col gap-2">
      {/* 推荐分类行只在单行且键盘输入状态显示；展开（聚焦 / 有内容 / 有附件或专家）或按住说话时隐藏 */}
      {showRecommendations && !expanded && !voice && <ComposerRecommendations disabled={locked} onOpen={openRecommendations} />}

      {recommendCategory && (
        // 蒙层盖住页面与分类标签，输入框保持在蒙层之上可用（参考用户截图：白色磨砂）
        <button type="button" aria-label="关闭推荐指令" tabIndex={-1} className="fixed inset-0 z-40 bg-background/80 backdrop-blur-xl motion-safe:animate-in motion-safe:fade-in-0" onClick={() => closeRecommendations()} />
      )}
      <div className={cn("relative", recommendCategory && "z-50")}>
      {recommendCategory && (
        <section role="dialog" aria-modal="false" aria-labelledby={`recommend-${recommendCategory.id}`} className="absolute inset-x-0 bottom-full mb-3 flex max-h-[55dvh] flex-col motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2" onKeyDown={(event) => { if (event.key === "Escape") closeRecommendations() }}>
          <div className="flex shrink-0 items-center justify-between pl-2">
            <h2 id={`recommend-${recommendCategory.id}`} className="text-xl leading-7 font-semibold">{recommendCategory.label}</h2>
            <button type="button" aria-label="关闭推荐指令" className="-mr-1 grid size-11 place-items-center rounded-full" onClick={() => closeRecommendations()}><X className="size-6" /></button>
          </div>
          <div className="mt-2 min-h-0 overflow-y-auto">
            <RecommendationItems category={recommendCategory} disabled={locked} onSelect={(item) => {
              onDraftChange(item.prompt)
              onSelectedExpertChange(item.expert ?? null)
              setVoice(false)
              closeRecommendations()
            }} />
          </div>
        </section>
      )}

      {voice ? (
        // 按住说话模式：有图片时附件区出现在上方、外框变为 24px 圆角，仍保持按住说话（参考用户截图）
        // 已选专家时（参考用户截图）：上方整行「按住说话」，下方操作栏为「+」、专家标签与键盘切换，外框 24px 圆角
        <div className={cn("overflow-hidden border bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)]", uploads.length || selectedExpert ? "rounded-[24px]" : "rounded-[28px]")}>
        {attachmentList}
        <div className={cn("flex items-center px-2.5", selectedExpert ? "h-[46px] pt-1.5" : "h-[54px]")}>
          {/* 按住说话模式也保留「+」添加入口，位置与文字模式一致；已选专家时移到下方操作栏 */}
          {!selectedExpert && <InputButton label="添加图片或专家" disabled={locked} onClick={openPicker}><Plus /></InputButton>}
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
          {!selectedExpert && <InputButton label="切换到键盘输入" onClick={exitVoice}><Keyboard /></InputButton>}
        </div>
        {selectedExpert && (
          <div className="flex h-[55px] items-center gap-2 px-2.5">
            <InputButton label="添加图片或专家" disabled={locked} onClick={openPicker}><Plus /></InputButton>
            {expertChip}
            <span className="flex-1" />
            <InputButton label="切换到键盘输入" onClick={exitVoice}><Keyboard /></InputButton>
          </div>
        )}
        </div>
      ) : (
        <div
          // 单行与多行共用同一结构：只过渡高度与圆角，按钮固定在右下角，避免布局切换造成跳动
          className={cn(
            "relative overflow-hidden border bg-background shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-[height,border-radius] duration-200 ease-out motion-reduce:transition-none",
            expanded ? "rounded-[24px]" : "rounded-[28px]",
          )}
          style={{ height: rem(boxHeight) }}
        >
          {attachmentList}
          <div className={cn("transition-[padding] duration-200 ease-out motion-reduce:transition-none", expanded ? "pb-2 pl-5 pr-5 pt-[15px]" : "py-[15px] pl-[54px] pr-14")}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={draft}
              disabled={locked}
              aria-label="消息内容"
              placeholder={disabled ? "请先处理上方的批准请求" : placeholder}
              className="block max-h-[120px] w-full resize-none bg-transparent text-base leading-6 text-foreground outline-none placeholder:text-muted-foreground/72"
              onChange={(event) => onDraftChange(event.target.value)}
              onFocus={() => { setFocused(true); reportKeyboard(true) }}
              onBlur={() => { setFocused(false); reportKeyboard(false) }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault()
                  void send()
                }
              }}
            />
          </div>
          {expertChip && <span className={cn("absolute bottom-[9px] left-[54px] transition-opacity duration-200 motion-reduce:transition-none", expanded ? "opacity-100" : "opacity-0")}>{expertChip}</span>}
          <div className="absolute bottom-[9px] left-2.5">
            <InputButton label="添加图片或专家" disabled={locked} onClick={openPicker}><Plus /></InputButton>
          </div>
          <div className="absolute bottom-[9px] right-2.5 flex items-center gap-2">
            <InputButton label="语音输入" disabled={locked} onClick={() => setVoice(true)}><Mic /></InputButton>
            {(hasValue || uploads.length > 0) && (
              <InputButton label="发送" disabled={locked || !canSend} primary onClick={() => void send()}><ArrowUp /></InputButton>
            )}
          </div>
        </div>
      )}

      </div>

      {/* 添加面板：上传方式（Figma 5271:63584）+「专家」入口；二级为专家列表（参考用户截图） */}
      <Sheet open={pickerOpen} onOpenChange={setPickerOpen}>
        {/* 关闭后焦点只在打开前已聚焦输入框时还给输入框，其余情况不聚焦，避免凭空调起键盘 */}
        <SheetContent side="bottom" showCloseButton={false} finalFocus={() => (keyboardBeforePicker.current && !voice ? textareaRef.current : false)} overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-none" className={cn("gap-0 rounded-t-3xl border-t-0 pb-[max(24px,env(safe-area-inset-bottom))]", pickerView === "experts" ? "bg-background-mobile px-4 pt-3 data-[side=bottom]:h-[80dvh]" : "px-4 pt-4")}>
          {pickerView === "add" ? (
            <>
              <SheetTitle className="sr-only">添加</SheetTitle>
              <SheetDescription className="sr-only">上传图片或指定专家。演示环境不会调起相机或相册，将使用本地示例图片</SheetDescription>
              <div className="grid grid-cols-2 gap-3">
                <UploadOption icon={<Camera />} label="拍照" onClick={() => addImages(cameraSamples)} />
                <UploadOption icon={<ImageIcon />} label="从相册选择" onClick={() => addImages(albumSamples, ALBUM_FAIL_ONCE_INDEX)} />
              </div>
              <button type="button" className="mt-3 flex min-h-14 w-full items-center gap-3 rounded-2xl px-2 text-left text-base leading-6 text-foreground" onClick={() => setPickerView("experts")}>
                {/* 图标与桌面「+」菜单的专家入口一致（contextIcons.专家 = Bot）；右侧不显示已选专家 */}
                <ExpertEntryIcon aria-hidden="true" className="size-5" />
                <span className="flex-1">专家</span>
                <ChevronRight aria-hidden="true" className="size-5 text-muted-foreground" />
              </button>
            </>
          ) : (
            <>
              <div className="flex h-12 shrink-0 items-center gap-1">
                <button type="button" aria-label="返回" className="-ml-2 grid size-11 place-items-center rounded-full" onClick={() => { setPickerView("add"); setExpertQuery(""); setSearching(false) }}><ChevronLeft className="size-6" /></button>
                {searching ? (
                  <input autoFocus value={expertQuery} onChange={(event) => setExpertQuery(event.target.value)} aria-label="搜索专家" placeholder="搜索专家" className="h-10 min-w-0 flex-1 rounded-full bg-background px-4 text-base outline-none placeholder:text-muted-foreground" />
                ) : (
                  <SheetTitle className="flex-1 text-base font-medium">专家</SheetTitle>
                )}
                {!searching && <button type="button" aria-label="搜索专家" className="grid size-11 place-items-center rounded-full" onClick={() => setSearching(true)}><Search className="size-5" /></button>}
                <button type="button" aria-label="关闭" className="-mr-2 grid size-11 place-items-center rounded-full" onClick={() => setPickerOpen(false)}><X className="size-5" /></button>
              </div>
              {searching && <SheetTitle className="sr-only">专家</SheetTitle>}
              <SheetDescription className="sr-only">选择一位已安装的专家执行你的下一条指令</SheetDescription>
              <ul className="mt-2 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto" aria-label="已安装专家">
                {visibleExperts.map((expert) => {
                  const selected = expert.name === selectedExpert
                  return (
                    <li key={expert.id}>
                      <button type="button" aria-pressed={selected} className="flex w-full items-center gap-3 rounded-2xl bg-background px-4 py-3 text-left" onClick={() => chooseExpert(expert.name)}>
                        <img src={expert.avatar} alt="" className="size-11 shrink-0 rounded-full object-cover" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-base leading-6 font-medium">{expert.name}</span>
                          <span className="block truncate text-sm leading-5 text-muted-foreground">{expert.role}</span>
                        </span>
                        {selected && <Check aria-hidden="true" className="size-5 shrink-0 text-primary" />}
                      </button>
                    </li>
                  )
                })}
                {visibleExperts.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">没有匹配的专家</li>}
              </ul>
              <button type="button" className="mt-3 h-12 w-full shrink-0 rounded-2xl bg-background text-base font-medium text-foreground" onClick={() => { setPickerOpen(false); if (openExperts) openExperts(); else toast.info("当前页面未提供专家列表") }}>查看更多专家</button>
            </>
          )}
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
