import { useEffect, useRef, useState, type TouchEvent } from "react"
import { Tabs } from "@base-ui/react/tabs"
import { Check, ChevronRight, CircleCheckBig, Info, Menu, MessageCircle, Plus, Search, Store, Trash2, UserRound, UsersRound, X, type LucideIcon } from "lucide-react"

import { Alert, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { ExpertRecommendationBanner } from "./expert-recommendation-banner"
import { expertCatalog, expertScenes, type Expert } from "./expert-data"
import { installedExpertIds, personalInstallationCount, SCHEDULED_EXPERT_LIMIT } from "./expert-rules"
import { GlassAction, glassSurface, glassSurfaceClass } from "./mobile-header"
import { rem } from "@/lib/design-scale"

type ExpertPageProps = {
  scheduledIds: readonly string[]
  isSidebarDocked: boolean
  onOpenSidebar: () => void
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onSummon: (expert: Expert) => void
}

type ExpertTab = "market" | "mine" | "scheduled"
/** 分类滑动手势的边缘保护宽度（px） */
const SWIPE_EDGE_GUARD = 32
// Tab、说明、空状态文案与桌面 expert-page 一致
const tabs: { id: ExpertTab; label: string }[] = [{ id: "market", label: "专家市场" }, { id: "mine", label: "我的专家" }, { id: "scheduled", label: "已安装" }]
// 已安装列表的安装来源筛选，与桌面一致
const installSources = ["全部", "企业默认安装", "我安装的"] as const
type InstallSource = (typeof installSources)[number]
const tabIcons: Record<ExpertTab, LucideIcon> = { market: Store, mine: UserRound, scheduled: CircleCheckBig }

/**
 * 移动端专家列表页：功能与桌面 ExpertPage 一致（三 Tab、场景筛选、推荐 Banner、详情、安装 / 卸载、召唤 / 进入），
 * 界面按用户截图改为列表行；安装与卸载只在详情面板中操作；移动端额外提供搜索。
 */
export function ExpertPage({ scheduledIds, isSidebarDocked, onOpenSidebar, onAdd, onRemove, onSummon }: ExpertPageProps) {
  const [tab, setTab] = useState<ExpertTab>("market")
  const [scene, setScene] = useState("全部")
  // 分类切换方向：1 = 切到右侧分类（列表从右滑入），-1 = 切到左侧分类，0 = 初始不播放
  const [sceneDirection, setSceneDirection] = useState<-1 | 0 | 1>(0)
  const [detail, setDetail] = useState<Expert | null>(null)
  const [searching, setSearching] = useState(false)
  const [query, setQuery] = useState("")
  const [installSource, setInstallSource] = useState<InstallSource>("全部")
  // 卸载需二次确认（与桌面一致）：详情里点卸载只记录待卸载专家，确认后才移出名单
  const [uninstalling, setUninstalling] = useState<Expert | null>(null)
  const confirmUninstall = () => {
    if (!uninstalling) return
    onRemove(uninstalling.id)
    if (detail?.id === uninstalling.id) setDetail(null)
    setUninstalling(null)
    toast.success("已卸载")
  }
  const installedIds = installedExpertIds(scheduledIds, expertCatalog)
  // Tab 计数只算自行安装的专家，企业默认安装不计入（与桌面、20 位额度口径一致）
  const personalCount = personalInstallationCount(installedIds, expertCatalog)
  const keyword = query.trim()
  const matches = (expert: Expert) => !keyword || [expert.name, expert.role, expert.description, ...expert.tags].some((text) => text.includes(keyword))
  const lists = {
    market: expertCatalog.filter((expert) => (scene === "全部" || expert.scene === scene) && matches(expert)),
    mine: expertCatalog.filter((expert) => expert.mine && matches(expert)),
    scheduled: expertCatalog.filter((expert) => installedIds.includes(expert.id) && (installSource === "全部" || (installSource === "企业默认安装") === Boolean(expert.enterpriseDefault)) && matches(expert)),
  }
  const summon = (expert: Expert) => { setDetail(null); onSummon(expert) }
  const closeSearch = () => { setSearching(false); setQuery("") }
  const searchInputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (searching) searchInputRef.current?.focus() }, [searching])

  // 专家市场：在列表区域左右滑动切换场景分类（左滑下一个、右滑上一个）
  const sceneLabels = ["全部", ...expertScenes]
  const sceneBarRef = useRef<HTMLDivElement>(null)
  const swipeStart = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    // 切换后把选中的分类胶囊滚到可见区域
    // 只改横向滚动位置，不用 scrollIntoView，避免带动列表纵向滚动
    const bar = sceneBarRef.current
    const active = bar?.querySelector<HTMLElement>("[aria-pressed='true']")
    if (!bar || !active) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    bar.scrollTo({ left: active.offsetLeft - (bar.clientWidth - active.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" })
  }, [scene])
  const changeScene = (next: string) => {
    if (next === scene) return
    setSceneDirection(sceneLabels.indexOf(next) > sceneLabels.indexOf(scene) ? 1 : -1)
    setScene(next)
  }
  const changeInstallSource = (next: InstallSource) => {
    if (next === installSource) return
    setSceneDirection(installSources.indexOf(next) > installSources.indexOf(installSource) ? 1 : -1)
    setInstallSource(next)
  }
  const onSwipeStart = (event: TouchEvent) => {
    // Banner 轮播与分类栏自身有横向滑动，从这两处开始的手势不切换分类
    const target = event.target as HTMLElement
    if (event.touches.length !== 1 || target.closest("[data-swipe-ignore]")) { swipeStart.current = null; return }
    // 起点落在左右边缘 32px 内时留给系统 / 宿主的边缘返回手势（iOS 约 20pt，Android 手势导航默认约 24dp，可调大）
    const { clientX, clientY } = event.touches[0]
    if (clientX < SWIPE_EDGE_GUARD || clientX > window.innerWidth - SWIPE_EDGE_GUARD) { swipeStart.current = null; return }
    swipeStart.current = { x: clientX, y: clientY }
  }
  const onSwipeEnd = (event: TouchEvent) => {
    const start = swipeStart.current
    swipeStart.current = null
    if (!start) return
    const dx = event.changedTouches[0].clientX - start.x
    const dy = event.changedTouches[0].clientY - start.y
    // 水平位移超过 56px 且明显大于垂直位移，才算切换手势，避免与上下滚动冲突
    if (Math.abs(dx) < 56 || Math.abs(dx) < Math.abs(dy) * 1.5) return
    const index = sceneLabels.indexOf(scene) + (dx < 0 ? 1 : -1)
    if (index >= 0 && index < sceneLabels.length) changeScene(sceneLabels[index])
  }

  return (
    <section aria-label="专家中心" className="relative flex min-w-0 flex-1 flex-col bg-background">
      <Tabs.Root value={tab} onValueChange={(value) => setTab(value as ExpertTab)} className="flex min-h-0 flex-1 flex-col">
        {/* 顶部栏不透明并压在滚动区之上，避免与吸顶筛选栏之间透出列表内容（2026-11-11） */}
        <header className="relative z-30 flex h-16 shrink-0 items-center gap-3 bg-background px-4">
          {!isSidebarDocked && <GlassAction label="展开导航" onClick={onOpenSidebar}><Menu /></GlassAction>}
          <h1 className={cn("min-w-0 flex-1 truncate text-lg leading-7 font-medium tracking-[-0.18px] transition-opacity", searching && "opacity-0")}>专家</h1>
          {/*
            搜索：与左上角菜单 / 对话页右上胶囊同款玻璃外观；点击后在原位置向左展开为搜索框并聚焦，遮住标题。
            展开宽度 = 页面宽 - 左右 16px - 菜单按钮 48px - 间距 12px。
          */}
          <div
            className={cn(glassSurface, "absolute top-2 right-4 flex h-12 items-center overflow-hidden rounded-full transition-[width] duration-200 ease-out motion-reduce:transition-none")}
            style={{ width: searching ? `calc(100% - ${rem(isSidebarDocked ? 32 : 92)})` : rem(48) }}
          >
            {searching ? (
              <>
                <Search aria-hidden="true" className="ml-3.5 size-5 shrink-0 text-muted-foreground" />
                <input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") closeSearch() }} aria-label="搜索专家" placeholder="搜索专家" className="h-full min-w-0 flex-1 bg-transparent px-2 text-base outline-none placeholder:text-muted-foreground" />
                <button type="button" aria-label="取消搜索" className="grid size-11 shrink-0 place-items-center rounded-full" onClick={closeSearch}><X className="size-5" /></button>
              </>
            ) : (
              <button type="button" aria-label="搜索专家" className="grid size-12 shrink-0 place-items-center rounded-full text-foreground [&_svg]:size-6" onClick={() => setSearching(true)}><Search /></button>
            )}
          </div>
        </header>
        {/*
          滚动区延伸到 Home Indicator 区域下方（2026-11-11：该区域透明，列表从下面透出），
          底部留出 Home Indicator / 安全区 + 悬浮 Tab 栏高度，避免最后一行被遮住
        */}
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain pb-[calc(max(var(--host-bottom-inset,0px),env(safe-area-inset-bottom))+88px)]">
          {tabs.map((item) => (
            <Tabs.Panel
              key={item.id}
              value={item.id}
              className="min-h-full px-4 pt-2 pb-6 outline-none"
              onTouchStart={item.id === "market" ? onSwipeStart : undefined}
              onTouchEnd={item.id === "market" ? onSwipeEnd : undefined}
              onTouchCancel={item.id === "market" ? () => { swipeStart.current = null } : undefined}
            >
              {/* 顶部说明与桌面一致（2026-11-11）：我的专家为单行说明 Alert（移动端不放「前往管理」，2026-11-11），已安装为单行安装规则 Alert */}
              {item.id === "mine" && (
                <Alert className="*:[svg]:row-span-1">
                  <Info aria-hidden="true" /><AlertTitle>在智能体管理平台个人空间发布的智能体</AlertTitle>
                </Alert>
              )}
              {item.id === "scheduled" && (
                <Alert className="*:[svg]:row-span-1">
                  <Info aria-hidden="true" /><AlertTitle>安装后支持自动调度，最多安装{SCHEDULED_EXPERT_LIMIT}个专家，企业默认安装的专家不占名额且不可卸载。</AlertTitle>
                </Alert>
              )}
              {item.id === "market" && <div data-swipe-ignore className="mb-1"><ExpertRecommendationBanner onSelect={setDetail} /></div>}
              {/*
                场景 / 安装来源筛选：横滑胶囊，选中深灰底白字；滚到顶部时吸顶（2026-11-11）。已安装列表的来源筛选与专家市场同款（与桌面一致）。
                吸顶层与横滑层分开：外层只负责 sticky 与不透明底色（z-20 高于列表行内按钮），内层负责横向滚动，避免抖动；
                -top-px：吸顶时向上多盖 1px，消除宿主缩放下与顶部栏之间的亚像素缝
              */}
              {item.id === "market" && <FilterChips barRef={sceneBarRef} label="按场景筛选专家" options={sceneLabels} value={scene} onChange={changeScene} />}
              {item.id === "scheduled" && <FilterChips label="按安装来源筛选专家" options={installSources} value={installSource} onChange={changeInstallSource} className="mt-2" />}
              {/* 专家市场 / 已安装切换筛选时，列表按切换方向左右滑入并淡入（key 随分类变化以重播动画；减弱动效时不播放） */}
              <div
                key={item.id === "market" ? scene : item.id === "scheduled" ? installSource : item.id}
                className={cn(item.id !== "mine" && sceneDirection !== 0 && "animate-in fade-in-0 duration-250 ease-out motion-reduce:animate-none", sceneDirection > 0 ? "slide-in-from-right-10" : "slide-in-from-left-10")}
              >
              <ul className="mt-2 flex flex-col" aria-label={`${item.label}列表`}>
                {lists[item.id].map((expert) => <ExpertRow key={expert.id} expert={expert} onDetail={() => setDetail(expert)} onSummon={() => summon(expert)} />)}
              </ul>
              {lists[item.id].length === 0 && (
                <div className="mt-4 flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card px-4 text-center">
                  <UsersRound className="size-8 text-muted-foreground" />
                  <p className="font-medium">{keyword ? "没有找到相关专家" : item.id === "scheduled" ? (installSource === "全部" ? "还没有安装的专家" : "暂无符合条件的专家") : item.id === "mine" ? "还没有发布的专家" : "暂无符合条件的专家"}</p>
                  <p className="text-sm text-muted-foreground">{keyword ? "换个关键词试试。" : item.id === "scheduled" ? "从专家市场或我的专家中安装，最多自行安装 20 位。" : "试试调整筛选条件，或稍后再来查看。"}</p>
                  {item.id === "scheduled" && !keyword && <button type="button" className="h-10 rounded-full border px-4 text-sm font-medium" onClick={() => setTab("market")}>去专家市场</button>}
                </div>
              )}
              </div>
            </Tabs.Panel>
          ))}
        </div>
        {/*
          底部渐变遮罩：从页面底部（Home Indicator 区）到 Tab 栏顶部，底部不透明 → 顶部完全透明；不拦截触摸。
          底色比页面背景深 6%（背景混 6% 前景色），与半透明白色 Tab 栏拉开层次（2026-11-11）
        */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[calc(max(12px,calc(max(var(--host-bottom-inset,0px),env(safe-area-inset-bottom))-10px))+60px)] bg-linear-to-t from-[color-mix(in_oklab,var(--background)_94%,var(--foreground))] to-transparent" />
        {/* 一级 Tab：底部悬浮玻璃栏，背景 45%；下缘压进 Home Indicator 区 10px（无安全区的设备至少离底 12px），高 60px */}
        <Tabs.List aria-label="专家列表" className={cn(glassSurfaceClass, "bg-background/45 absolute bottom-[max(12px,calc(max(var(--host-bottom-inset,0px),env(safe-area-inset-bottom))-10px))] left-1/2 z-30 grid h-15 w-[min(288px,calc(100%-64px))] -translate-x-1/2 grid-cols-3 rounded-full p-1")}>
          {/* 选中填充：Base UI Indicator 提供当前 Tab 相对位置，切换时色块滑到目标 Tab（减弱动效时直接跳转） */}
          <Tabs.Indicator className="absolute top-(--active-tab-top) left-(--active-tab-left) h-(--active-tab-height) w-(--active-tab-width) rounded-full bg-foreground/5 transition-[left,width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none" />
          {tabs.map((item) => {
            const Icon = tabIcons[item.id]
            return (
              <Tabs.Tab key={item.id} value={item.id} className="relative z-10 flex flex-col items-center justify-center gap-0.5 rounded-full text-xs leading-4 text-muted-foreground outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none data-active:font-medium data-active:text-foreground [&_svg]:size-[22px]">
                <Icon aria-hidden="true" />
                <span>{item.label}{item.id === "scheduled" && ` ${personalCount}`}</span>
              </Tabs.Tab>
            )
          })}
        </Tabs.List>
      </Tabs.Root>

      {/* 详情：底部面板，内容与桌面详情弹窗一致；安装 / 卸载只在这里操作 */}
      <Sheet open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null) }}>
        <SheetContent side="bottom" showCloseButton={false} overlayClassName="bg-black/50 supports-backdrop-filter:backdrop-blur-none" className="gap-0 rounded-t-3xl data-[side=bottom]:h-[80dvh] border-t-0 pt-5 pb-[max(24px,env(safe-area-inset-bottom))]">
          {/* 统一高度 80dvh，不随内容长短变化：内容区独立滚动，操作按钮固定在底部 */}
          {detail && (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
              {/* 字段与桌面详情对话框一致（2026-11-11）：头像右侧名称 + 更新时间；下方「适用角色」「专家介绍」上下堆叠 */}
              <div className="flex items-center gap-3">
                <img src={detail.avatar} alt="" className="size-14 shrink-0 rounded-full object-cover" />
                <div className="grid min-w-0 flex-1 gap-1">
                  <SheetTitle className="truncate text-lg leading-7 font-semibold">{detail.name}</SheetTitle>
                  <p className="text-sm leading-5 text-muted-foreground">更新时间：{detail.updatedAt}</p>
                </div>
                <button type="button" aria-label="关闭" className="-mr-2 grid size-11 shrink-0 place-items-center self-start rounded-full" onClick={() => setDetail(null)}><X className="size-5" /></button>
              </div>
              <SheetDescription className="sr-only">{detail.description}</SheetDescription>
              <dl className="mt-6 grid gap-5">
                <div className="grid gap-2">
                  <dt className="text-base leading-6 font-medium">适用角色</dt>
                  <dd className="text-base leading-6 text-muted-foreground">{detail.role}</dd>
                </div>
                <div className="grid gap-2">
                  <dt className="text-base leading-6 font-medium">专家介绍</dt>
                  <dd className="text-base leading-6 text-muted-foreground">{detail.description}</dd>
                </div>
              </dl>
              </div>
              <DetailActions expert={detail} installed={installedIds.includes(detail.id)} removable={tab === "scheduled"} onInstall={() => onAdd(detail.id)} onRemove={() => setUninstalling(detail)} onSummon={() => summon(detail)} />
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* 卸载二次确认：文案与桌面一致；危险操作不设为默认焦点 */}
      <Dialog open={Boolean(uninstalling)} onOpenChange={(open) => { if (!open) setUninstalling(null) }}>
        <DialogContent showCloseButton={false} className="gap-5 rounded-3xl p-6">
          <DialogHeader className="gap-2 text-left">
            <DialogTitle className="text-lg leading-7 font-semibold">卸载{uninstalling?.name}？</DialogTitle>
            <DialogDescription className="text-base leading-6">卸载后该专家不再参与自动调度，已有对话不受影响，之后可在专家市场重新安装。</DialogDescription>
          </DialogHeader>
          <DialogFooter className="m-0 flex-row gap-3 border-0 bg-transparent p-0">
            <DialogClose render={<button type="button" className="h-12 flex-1 rounded-full border text-base font-medium" />}>取消</DialogClose>
            <button type="button" className="h-12 flex-1 rounded-full bg-destructive text-base font-medium text-primary-foreground" onClick={confirmUninstall}>卸载</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}

/** 列表行（参考截图）：56px 头像、名称、能力标签（竖线分隔）、一行描述，右侧召唤 / 进入 */
function ExpertRow({ expert, onDetail, onSummon }: { expert: Expert; onDetail: () => void; onSummon: () => void }) {
  return (
    <li className="relative flex items-center gap-3 py-3">
      <button type="button" aria-label={`查看${expert.name}详情`} onClick={onDetail} className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      <img src={expert.avatar} alt="" loading="lazy" className="pointer-events-none size-14 shrink-0 rounded-full object-cover" />
      <div className="pointer-events-none min-w-0 flex-1">
        <h2 className="truncate text-base leading-6 font-medium">{expert.name}</h2>
        <p className="truncate text-sm leading-5 text-muted-foreground">{expert.tags.join(" | ")}</p>
        <p className="truncate text-sm leading-5 text-muted-foreground">{expert.description}</p>
      </div>
      {/* 与桌面一致：可召唤为 primary「召唤」，否则为 secondary「进入」且不跳转 */}
      <button type="button" aria-label={`${expert.canSummon ? "召唤" : "进入"}${expert.name}`} onClick={expert.canSummon ? onSummon : undefined} className={cn("relative z-10 h-9 shrink-0 rounded-full px-4 text-sm font-medium", expert.canSummon ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
        {expert.canSummon ? "召唤" : "进入"}
      </button>
    </li>
  )
}

/** 详情操作：规则与桌面 ExpertActions 一致；移动端无 Tooltip，安装状态直接显示文字 */
function DetailActions({ expert, installed, removable, onInstall, onRemove, onSummon }: { expert: Expert; installed: boolean; removable: boolean; onInstall: () => void; onRemove: () => void; onSummon: () => void }) {
  const canRemove = removable && !expert.enterpriseDefault
  const isInstalled = installed || Boolean(expert.enterpriseDefault)
  const locked = Boolean(expert.enterpriseDefault) || (isInstalled && !canRemove)
  const label = expert.enterpriseDefault ? "企业默认安装" : canRemove ? "卸载" : isInstalled ? "已安装" : "安装"
  return (
    <div role="group" aria-label={`${expert.name}操作`} className="flex shrink-0 gap-3 px-5 pt-4">
      {expert.canSummon && (
        <button type="button" disabled={locked} aria-label={`${label}${expert.name}`} onClick={locked ? undefined : canRemove ? onRemove : onInstall} className={cn("flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full border text-base font-medium disabled:opacity-50 [&_svg]:size-5", canRemove && "text-destructive-foreground")}>
          {canRemove ? <Trash2 /> : isInstalled ? <Check /> : <Plus />}{label}
        </button>
      )}
      <button type="button" aria-label={`${expert.canSummon ? "召唤" : "进入"}${expert.name}`} onClick={expert.canSummon ? onSummon : undefined} className={cn("flex h-12 flex-1 items-center justify-center gap-1.5 rounded-full text-base font-medium [&_svg]:size-5", expert.canSummon ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground")}>
        {expert.canSummon ? "召唤" : "进入"}{expert.canSummon ? <MessageCircle aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
      </button>
    </div>
  )
}

/** 横滑筛选胶囊（专家市场场景 / 已安装来源共用）：外层吸顶，内层横向滚动 */
function FilterChips<T extends string>({ label, options, value, onChange, barRef, className }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void; barRef?: React.Ref<HTMLDivElement>; className?: string }) {
  return (
    <div className={cn("sticky -top-px z-20 -mx-4 bg-background py-2", className)}>
      <div ref={barRef} data-swipe-ignore role="group" aria-label={label} className="no-scrollbar flex gap-2 overflow-x-auto scroll-px-4 px-4">
        {options.map((option) => (
          <button key={option} type="button" aria-pressed={value === option} onClick={() => onChange(option)} className={cn("h-9 shrink-0 rounded-full px-3.5 text-sm whitespace-nowrap", value === option ? "bg-foreground font-medium text-background" : "bg-muted text-foreground")}>{option}</button>
        ))}
      </div>
    </div>
  )
}
