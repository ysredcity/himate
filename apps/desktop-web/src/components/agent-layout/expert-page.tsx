import { useRef, useState } from "react"
import { Tabs } from "@base-ui/react/tabs"
import { Check, ChevronRight, IndentIncrease, Info, MessageCircle, Plus, Search, Trash2, Users, UsersRound, X } from "lucide-react"

import { Alert, AlertAction, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ExpertRecommendationBanner } from "./expert-recommendation-banner"
import { IconButton } from "./icon-button"
import { expertCatalog, expertScenes, type Expert } from "./expert-data"
import { installedExpertIds, personalInstallationCount, SCHEDULED_EXPERT_LIMIT } from "./expert-rules"

type ExpertPageProps = {
  scheduledIds: readonly string[]
  isSidebarDocked: boolean
  onOpenSidebar: () => void
  onAdd: (id: string) => void
  onRemove: (id: string) => void
  onSummon: (expert: Expert) => void
}

type ExpertTab = "market" | "mine" | "scheduled"
const tabs: { id: ExpertTab; label: string }[] = [{ id: "market", label: "专家市场" }, { id: "mine", label: "我的专家" }, { id: "scheduled", label: "已安装" }]
const installSources = ["全部", "企业默认安装", "我安装的"] as const
type InstallSource = (typeof installSources)[number]

/** 专家市场与已安装共用的筛选标签栏 */
function FilterChips<T extends string>({ label, options, value, onChange, className }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void; className?: string }) {
  return <div role="group" aria-label={label} className={cn("flex min-w-0 flex-wrap gap-1", className)}>
    {options.map((option) => <Button key={option} variant={value === option ? "selected" : "ghost"} className={cn("min-h-9 rounded-full px-2.5 font-normal max-[659px]:min-h-11", value === option && "font-medium")} aria-pressed={value === option} onClick={() => onChange(option)}>{option}</Button>)}
  </div>
}

/** 搜索只匹配卡片与详情里可见的资料：名称、适用角色、简介、场景和能力标签 */
function matchesQuery(expert: Expert, query: string) {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return true
  return [expert.name, expert.role, expert.description, expert.scene, ...expert.tags].some((text) => text.toLowerCase().includes(keyword))
}

export function ExpertPage({ scheduledIds, isSidebarDocked, onOpenSidebar, onAdd, onRemove, onSummon }: ExpertPageProps) {
  const [tab, setTab] = useState<ExpertTab>("market")
  const [scene, setScene] = useState("全部")
  const [installSource, setInstallSource] = useState<InstallSource>("全部")
  const [detail, setDetail] = useState<Expert | null>(null)
  const [query, setQuery] = useState("")
  // 卸载需二次确认：卡片与详情都只记录待卸载的专家，确认后才真正移出名单
  const [uninstalling, setUninstalling] = useState<Expert | null>(null)
  const confirmUninstall = () => {
    if (!uninstalling) return
    onRemove(uninstalling.id)
    if (detail?.id === uninstalling.id) setDetail(null)
    setUninstalling(null)
    toast.success("已卸载")
  }
  const searchRef = useRef<HTMLInputElement>(null)
  const installedIds = installedExpertIds(scheduledIds, expertCatalog)
  // Tab 计数只算自行安装的专家，企业默认安装不计入（与 20 位额度口径一致）
  const personalCount = personalInstallationCount(installedIds, expertCatalog)
  const baseLists = {
    market: expertCatalog.filter((expert) => (scene === "全部" || expert.scene === scene)),
    mine: expertCatalog.filter((expert) => expert.mine),
    scheduled: expertCatalog.filter((expert) => installedIds.includes(expert.id) && (installSource === "全部" || (installSource === "企业默认安装") === Boolean(expert.enterpriseDefault))),
  }
  // 搜索只作用于列表：Banner、分类筛选、说明文字保持不变；关键词在三个 Tab 间共用。
  const lists = {
    market: baseLists.market.filter((expert) => matchesQuery(expert, query)),
    mine: baseLists.mine.filter((expert) => matchesQuery(expert, query)),
    scheduled: baseLists.scheduled.filter((expert) => matchesQuery(expert, query)),
  }
  const clearSearch = () => { setQuery(""); searchRef.current?.focus() }
  const summon = (expert: Expert) => { setDetail(null); onSummon(expert) }

  return <section aria-label="专家中心" className="@container/experts flex min-w-0 flex-1 flex-col bg-background-desktop [@media(pointer:coarse)]:[&_button]:min-h-11 [@media(pointer:coarse)]:[&_button]:min-w-11">
    <Tabs.Root value={tab} onValueChange={(value) => setTab(value as ExpertTab)} className="flex min-h-0 flex-1 flex-col">
    <header className="flex h-13 shrink-0 items-center gap-3 border-b px-4">
      {!isSidebarDocked && <IconButton aria-label="展开导航" onClick={onOpenSidebar}><IndentIncrease /></IconButton>}
      <h1 className="sr-only">专家</h1>
      <Tabs.List aria-label="专家列表" className="flex h-full min-w-0 flex-1 items-stretch gap-6 overflow-x-auto max-[659px]:gap-4">
        {tabs.map((item) => <Tabs.Tab key={item.id} value={item.id} className="flex shrink-0 items-center gap-2 border-b-2 border-transparent px-0.5 text-base text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-foreground data-active:font-semibold data-active:text-foreground">
          {item.label}{item.id === "scheduled" && <span className="font-normal">{personalCount}</span>}
        </Tabs.Tab>)}
      </Tabs.List>
      <div role="search" className="relative w-60 shrink-0 max-[899px]:w-44 max-[659px]:w-36">
        <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input ref={searchRef} type="search" value={query} placeholder="搜索专家" aria-label="搜索当前列表中的专家" className="bg-card pr-8 pl-8 [&::-webkit-search-cancel-button]:hidden" onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape" && query) { event.preventDefault(); setQuery("") } }} />
        {query && <button type="button" aria-label="清空搜索" className="absolute top-1/2 right-1.5 grid size-5 -translate-y-1/2 place-items-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring" onClick={clearSearch}><X className="size-3.5" /></button>}
      </div>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 max-[659px]:px-4">
      <div className="mx-auto max-w-[1240px]">
          {tabs.map((item) => <Tabs.Panel key={item.id} value={item.id} className="outline-none">
            {item.id === "mine" && <Alert className="*:[svg]:row-span-1">
              <Info aria-hidden="true" /><AlertTitle>在智能体管理平台个人空间发布的智能体</AlertTitle>
              {/* 演示阶段只占位，不跳转 */}
              <AlertAction className="top-1/2 right-2.5 -translate-y-1/2"><Button variant="link" size="sm" className="h-auto p-0 text-sm font-medium">前往管理</Button></AlertAction>
            </Alert>}
            {item.id === "scheduled" && <Alert className="*:[svg]:row-span-1">
              <Info aria-hidden="true" /><AlertTitle>安装后支持自动调度，最多安装{SCHEDULED_EXPERT_LIMIT}个专家，企业默认安装的专家不占名额且不可删除。</AlertTitle>
            </Alert>}
            {item.id === "market" && <ExpertRecommendationBanner onSelect={setDetail} />}
            {item.id === "market" && <FilterChips label="按场景筛选专家" options={["全部", ...expertScenes]} value={scene} onChange={setScene} />}
            {item.id === "scheduled" && <FilterChips label="按安装来源筛选专家" options={installSources} value={installSource} onChange={setInstallSource} className="mt-4" />}
            <div className="mt-5 grid grid-cols-1 gap-3 @min-[660px]/experts:grid-cols-2 @min-[1000px]/experts:grid-cols-3 @min-[1320px]/experts:grid-cols-4">
              {lists[item.id].map((expert) => <ExpertCard key={expert.id} expert={expert} scheduled={installedIds.includes(expert.id)} removable={item.id === "scheduled"} onDetail={() => setDetail(expert)} onAdd={() => onAdd(expert.id)} onRemove={() => setUninstalling(expert)} onSummon={() => summon(expert)} />)}
            </div>
            {query.trim() && baseLists[item.id].length > 0 && lists[item.id].length === 0 && <div role="status" className="mt-6 flex min-h-64 flex-col items-center justify-center gap-2 px-4 text-center">
              <p className="text-base font-medium text-muted-foreground">未找到符合筛选的内容</p>
              <p className="text-sm text-muted-foreground">{item.id === "mine" ? "尝试更换关键词或清空搜索。" : "尝试切换分类或清空搜索。"}</p>
              <Button className="mt-3 rounded-full bg-foreground px-4 text-background hover:bg-foreground/90" onClick={clearSearch}>清空筛选</Button>
            </div>}
            {baseLists[item.id].length === 0 && <div className="mt-6 flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card text-center">
              <UsersRound className="size-8 text-muted-foreground" />
              <p className="font-medium">{item.id === "scheduled" ? (installSource === "我安装的" ? "还没有自行安装的专家" : "还没有安装的专家") : item.id === "mine" ? "还没有发布的专家" : "暂无符合条件的专家"}</p>
              <p className="px-4 text-sm text-muted-foreground">{item.id === "scheduled" ? "从专家市场或我的专家中安装，最多自行安装 20 位。" : "试试调整筛选条件，或稍后再来查看。"}</p>
              {item.id === "scheduled" && <Button variant="outline" onClick={() => setTab("market")}>去专家市场</Button>}
            </div>}
          </Tabs.Panel>)}
      </div>
    </div>
    </Tabs.Root>
    <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null) }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto rounded-2xl sm:max-w-[520px]">
        {detail && <>
          {/* 头像右侧：名称 + 更新时间 */}
          <DialogHeader className="flex-row items-center gap-3 pr-8">
            <img src={detail.avatar} alt="" className="size-12 shrink-0 rounded-xl object-cover" />
            <div className="grid min-w-0 gap-2">
              <DialogTitle className="truncate">{detail.name}</DialogTitle>
              <p className="text-xs leading-4 text-muted-foreground">更新时间：{detail.updatedAt}</p>
            </div>
            <DialogDescription className="sr-only">{detail.description}</DialogDescription>
          </DialogHeader>
          {/* 字段按上下堆叠：标题 14px Medium，内容在下方 */}
          <dl className="grid gap-4 text-sm">
            <div className="grid gap-2">
              <dt className="font-medium">适用角色</dt>
              <dd className="leading-6 text-muted-foreground">{detail.role}</dd>
            </div>
            <div className="grid gap-2">
              <dt className="font-medium">专家介绍</dt>
              <dd className="leading-6 text-muted-foreground">{detail.description}</dd>
            </div>
          </dl>
          <div className="flex justify-end border-t pt-4">
            <ExpertActions expert={detail} installed={installedIds.includes(detail.id)} removable={tab === "scheduled"} size="default" onInstall={() => onAdd(detail.id)} onRemove={() => setUninstalling(detail)} onSummon={() => summon(detail)} />
          </div>
        </>}
      </DialogContent>
    </Dialog>
    <Dialog open={Boolean(uninstalling)} onOpenChange={(open) => { if (!open) setUninstalling(null) }}>
      <DialogContent className="rounded-2xl sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>卸载{uninstalling?.name}？</DialogTitle>
          <DialogDescription>卸载后该专家不再参与自动调度，已有对话不受影响，之后可在专家市场重新安装。</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>取消</DialogClose>
          <Button variant="destructive" onClick={confirmUninstall}>卸载</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </section>
}

function ExpertCard({ expert, scheduled, removable, onDetail, onAdd, onRemove, onSummon }: { expert: Expert; scheduled: boolean; removable: boolean; onDetail: () => void; onAdd: () => void; onRemove: () => void; onSummon: () => void }) {
  return <article className="relative flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-home-card-hover focus-within:shadow-home-card-hover">
    <button type="button" aria-label={`查看${expert.name}详情`} onClick={onDetail} className="absolute inset-0 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring" />
    <div className="pointer-events-none relative flex min-w-0 items-start gap-2">
      <div className="pointer-events-none flex min-w-0 flex-1 items-center gap-2">
        <img src={expert.avatar} alt="" className="size-8 shrink-0 rounded-lg object-cover" loading="lazy" />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-semibold leading-5">{expert.name}</h2>
          <p className="flex min-w-0 items-center gap-1 text-xs leading-4 text-muted-foreground"><Users aria-hidden="true" className="size-3 shrink-0" /><span className="truncate">{expert.role}</span></p>
        </div>
      </div>
    </div>
    <p className="pointer-events-none line-clamp-2 min-h-9 text-xs leading-[18px] text-muted-foreground">{expert.description}</p>
      <ExpertActions expert={expert} installed={scheduled} removable={removable} onInstall={onAdd} onRemove={onRemove} onSummon={onSummon} />
  </article>
}

/** size：卡片内用 sm，详情对话框用 default（大一号） */
function ExpertActions({ expert, installed, removable, size = "sm", onInstall, onRemove, onSummon }: { expert: Expert; installed: boolean; removable: boolean; size?: "sm" | "default"; onInstall: () => void; onRemove: () => void; onSummon: () => void }) {
  const canRemove = removable && !expert.enterpriseDefault
  const isInstalled = installed || Boolean(expert.enterpriseDefault)
  const locked = Boolean(expert.enterpriseDefault) || (isInstalled && !canRemove)
  const label = expert.enterpriseDefault ? "企业默认安装" : canRemove ? "卸载" : isInstalled ? "已安装" : "安装"
  // 安装与已安装始终显示文字；卡片里只有卸载保持纯图标，详情对话框（default）全部显示文字
  const showText = locked || size === "default" || !canRemove
  const text = canRemove ? "卸载" : isInstalled ? "已安装" : "安装"
  return <div role="group" aria-label={`${expert.name}操作`} className="pointer-events-none relative z-10 mt-auto flex w-full items-center justify-between gap-3">
    {expert.canSummon ? <Tooltip>
      <TooltipTrigger render={<span className="pointer-events-auto inline-flex" tabIndex={locked ? 0 : undefined} aria-label={locked ? `${expert.name}${label}` : undefined} />}>
        <Button variant="outline" size={showText ? size : "icon-sm"} disabled={locked} aria-label={`${label}${expert.name}`} className={canRemove ? "text-destructive-foreground hover:bg-destructive-bg hover:text-destructive-foreground" : undefined} onClick={locked ? undefined : canRemove ? onRemove : onInstall}>{canRemove ? <Trash2 /> : isInstalled ? <Check /> : <Plus />}{showText && <span>{text}</span>}</Button>
      </TooltipTrigger>
      <TooltipContent>{expert.enterpriseDefault ? "企业默认安装，不可卸载" : !isInstalled ? "安装后可自动调用" : label}</TooltipContent>
    </Tooltip> : <span />}
    <Button variant={expert.canSummon ? "default" : "secondary"} size={size} className={cn("pointer-events-auto", size === "sm" ? "px-3" : "px-4")} aria-label={`${expert.canSummon ? "召唤" : "进入"}${expert.name}`} onClick={expert.canSummon ? onSummon : undefined}>{expert.canSummon ? "召唤" : "进入"}{expert.canSummon ? <MessageCircle aria-hidden="true" data-icon="inline-end" /> : <ChevronRight aria-hidden="true" data-icon="inline-end" />}</Button>
  </div>
}
