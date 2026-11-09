import { useState } from "react"
import { Tabs } from "@base-ui/react/tabs"
import { Check, ChevronRight, IndentIncrease, Info, MessageCircle, Plus, Trash2, UsersRound } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
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
const introductions = {
  mine: "在智能体管理平台个人空间发布的 AI 助手，会在这里汇集。",
}

export function ExpertPage({ scheduledIds, isSidebarDocked, onOpenSidebar, onAdd, onRemove, onSummon }: ExpertPageProps) {
  const [tab, setTab] = useState<ExpertTab>("market")
  const [scene, setScene] = useState("全部")
  const [detail, setDetail] = useState<Expert | null>(null)
  const installedIds = installedExpertIds(scheduledIds, expertCatalog)
  const personalCount = personalInstallationCount(installedIds, expertCatalog)
  const lists = {
    market: expertCatalog.filter((expert) => (scene === "全部" || expert.scene === scene)),
    mine: expertCatalog.filter((expert) => expert.mine),
    scheduled: expertCatalog.filter((expert) => installedIds.includes(expert.id)),
  }
  const summon = (expert: Expert) => { setDetail(null); onSummon(expert) }

  return <section aria-label="专家中心" className="@container/experts flex min-w-0 flex-1 flex-col bg-background-desktop [@media(pointer:coarse)]:[&_button]:min-h-11 [@media(pointer:coarse)]:[&_button]:min-w-11">
    <Tabs.Root value={tab} onValueChange={(value) => setTab(value as ExpertTab)} className="flex min-h-0 flex-1 flex-col">
    <header className="flex h-13 shrink-0 items-center gap-3 border-b px-4">
      {!isSidebarDocked && <IconButton aria-label="展开导航" onClick={onOpenSidebar}><IndentIncrease /></IconButton>}
      <h1 className="sr-only">专家</h1>
      <Tabs.List aria-label="专家列表" className="flex h-full min-w-0 flex-1 items-stretch gap-6 overflow-x-auto max-[659px]:gap-4">
        {tabs.map((item) => <Tabs.Tab key={item.id} value={item.id} className="flex shrink-0 items-center gap-2 border-b-2 border-transparent px-0.5 text-base text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring data-active:border-foreground data-active:font-semibold data-active:text-foreground">
          {item.label}{item.id === "scheduled" && <span className="font-normal">{installedIds.length}</span>}
        </Tabs.Tab>)}
      </Tabs.List>
    </header>
    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 max-[659px]:px-4">
      <div className="mx-auto max-w-[1240px]">
          {tabs.map((item) => <Tabs.Panel key={item.id} value={item.id} className="outline-none">
            {item.id === "mine" && <p className="text-sm leading-6 text-muted-foreground">{introductions.mine}</p>}
            {item.id === "scheduled" && <Alert>
              <Info aria-hidden="true" /><AlertTitle>安装说明</AlertTitle>
              <AlertDescription>可自行安装 {SCHEDULED_EXPERT_LIMIT} 位专家（已用 {personalCount} 位）。企业默认专家不占名额，且不可删除。</AlertDescription>
            </Alert>}
            {item.id === "market" && <ExpertRecommendationBanner onSelect={setDetail} />}
            {item.id === "market" && <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="按场景筛选专家" className="flex min-w-0 flex-1 flex-wrap gap-1">
                {["全部", ...expertScenes].map((label) => <Button key={label} variant="ghost" className={cn("min-h-9 rounded-full px-2.5 font-normal max-[659px]:min-h-11", scene === label && "bg-foreground font-medium text-background hover:bg-foreground hover:text-background")} aria-pressed={scene === label} onClick={() => setScene(label)}>{label}</Button>)}
              </div>
            </div>}
            <div className="mt-5 grid grid-cols-1 gap-3 @min-[660px]/experts:grid-cols-2 @min-[1000px]/experts:grid-cols-3 @min-[1320px]/experts:grid-cols-4">
              {lists[item.id].map((expert) => <ExpertCard key={expert.id} expert={expert} scheduled={installedIds.includes(expert.id)} removable={item.id === "scheduled"} onDetail={() => setDetail(expert)} onAdd={() => onAdd(expert.id)} onRemove={() => onRemove(expert.id)} onSummon={() => summon(expert)} />)}
            </div>
            {lists[item.id].length === 0 && <div className="mt-6 flex min-h-64 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed bg-card text-center">
              <UsersRound className="size-8 text-muted-foreground" />
              <p className="font-medium">{item.id === "scheduled" ? "还没有安装的专家" : item.id === "mine" ? "还没有发布的专家" : "暂无符合条件的专家"}</p>
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
          <DialogHeader>
            <img src={detail.avatar} alt="" className="mb-2 size-16 rounded-2xl object-cover" />
            <DialogTitle>{detail.name}</DialogTitle>
            <DialogDescription className="leading-6">{detail.description}</DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-[64px_1fr] gap-x-4 gap-y-3 text-sm">
            <dt className="text-muted-foreground">适用角色</dt><dd>{detail.role}</dd>
            <dt className="text-muted-foreground">场景</dt><dd>{detail.scene}</dd>
            <dt className="text-muted-foreground">来源</dt><dd>{detail.source}{detail.mine && " · 个人空间发布"}</dd>
            <dt className="text-muted-foreground">调用方式</dt><dd>{detail.canSummon ? "支持直接召唤" : "独立页面入口"}</dd>
            <dt className="text-muted-foreground">能力</dt><dd className="flex flex-wrap gap-1.5">{detail.tags.map((tag) => <span key={tag} className="rounded bg-muted px-2 py-0.5">{tag}</span>)}</dd>
          </dl>
          <div className="flex justify-end border-t pt-4">
            <ExpertActions expert={detail} installed={installedIds.includes(detail.id)} removable={tab === "scheduled"} onInstall={() => onAdd(detail.id)} onRemove={() => { onRemove(detail.id); setDetail(null) }} onSummon={() => summon(detail)} />
          </div>
        </>}
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
          <p className="truncate text-xs leading-4 text-muted-foreground">{expert.role}</p>
        </div>
      </div>
    </div>
    <p className="pointer-events-none line-clamp-2 min-h-9 text-xs leading-[18px] text-muted-foreground">{expert.description}</p>
      <ExpertActions expert={expert} installed={scheduled} removable={removable} onInstall={onAdd} onRemove={onRemove} onSummon={onSummon} />
  </article>
}

function ExpertActions({ expert, installed, removable, onInstall, onRemove, onSummon }: { expert: Expert; installed: boolean; removable: boolean; onInstall: () => void; onRemove: () => void; onSummon: () => void }) {
  const canRemove = removable && !expert.enterpriseDefault
  const isInstalled = installed || Boolean(expert.enterpriseDefault)
  const locked = Boolean(expert.enterpriseDefault) || (isInstalled && !canRemove)
  const label = expert.enterpriseDefault ? "企业默认安装" : canRemove ? "删除" : isInstalled ? "已安装" : "安装"
  return <div role="group" aria-label={`${expert.name}操作`} className="pointer-events-none relative z-10 mt-auto flex w-full items-center justify-between gap-3">
    {expert.canSummon ? <Tooltip>
      <TooltipTrigger render={<span className="pointer-events-auto inline-flex" tabIndex={locked ? 0 : undefined} aria-label={locked ? `${expert.name}${label}` : undefined} />}>
        <Button variant="outline" size={locked ? "sm" : "icon-sm"} disabled={locked} aria-label={`${label}${expert.name}`} className={canRemove ? "text-destructive-foreground hover:bg-destructive-bg hover:text-destructive-foreground" : undefined} onClick={locked ? undefined : canRemove ? onRemove : onInstall}>{canRemove ? <Trash2 /> : isInstalled ? <Check /> : <Plus />}{locked && <span>已安装</span>}</Button>
      </TooltipTrigger>
      <TooltipContent>{expert.enterpriseDefault ? "企业默认安装，不可删除" : label}</TooltipContent>
    </Tooltip> : <span />}
    <Button variant={expert.canSummon ? "default" : "secondary"} size="sm" className="pointer-events-auto px-3" aria-label={`${expert.canSummon ? "召唤" : "进入"}${expert.name}`} onClick={expert.canSummon ? onSummon : undefined}>{expert.canSummon ? "召唤" : "进入"}{expert.canSummon ? <MessageCircle aria-hidden="true" data-icon="inline-end" /> : <ChevronRight aria-hidden="true" data-icon="inline-end" />}</Button>
  </div>
}
