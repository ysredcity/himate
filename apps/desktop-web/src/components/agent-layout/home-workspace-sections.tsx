import { useState, type ReactNode } from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { homeAgents, homeApplications, homeAssets, homeCourses, homeNews, homeReports } from "./home-data"

type Detail = { title: string; image?: string; description: string; prompt?: string }
type Catalog = "reports" | "apps" | "agents" | "courses" | "news"
type Configuration = "apps" | "agents"

type Props = {
  onTask: (message: string) => void
  onSelectAgent: (prompt: string) => void
}

export function HomeWorkspaceSections({ onTask, onSelectAgent }: Props) {
  const [detail, setDetail] = useState<Detail | null>(null)
  const [catalog, setCatalog] = useState<Catalog | null>(null)
  const [configuration, setConfiguration] = useState<Configuration | null>(null)
  const [visibleApps, setVisibleApps] = useState(homeApplications.map((item) => item.id))
  const [visibleAgents, setVisibleAgents] = useState(homeAgents.map((item) => item.id))
  const [pendingItems, setPendingItems] = useState<string[]>([])

  const configure = (kind: Configuration) => {
    setPendingItems(kind === "apps" ? visibleApps : visibleAgents)
    setConfiguration(kind)
  }
  const openDetail = (item: Detail) => { setCatalog(null); setDetail(item) }
  const reportTask = (title: string) => onTask(`分析业务数据，参考“${title}”整理区域指标与增长机会（演示）`)
  const application = (item: typeof homeApplications[number]) => openDetail({
    title: item.name, image: item.image,
    description: "这是企业应用的演示入口。当前尚未连接业务系统，可以将要办理的事项交给企业工作助手整理。",
    prompt: `请帮我处理${item.name}相关事项`,
  })
  const course = (item: typeof homeCourses[number]) => openDetail({ title: item.title, image: item.image, description: "课程卡片来自设计稿示例，尚未连接企业学习平台。你可以让工作助手整理学习目标与待办。", prompt: `帮我整理《${item.title}》的学习目标与待办` })
  const news = (item: typeof homeNews[number]) => openDetail({ title: item.title, image: item.image, description: `来源：${item.source} · ${item.time}。此内容为设计稿中的示例资讯，未接入实时资讯服务，暂无文章正文。` })

  const reportCards = () => homeReports.map((item) => <Button key={item.id} variant="ghost" className="h-[92px] min-w-0 flex-col items-start justify-start gap-1 overflow-hidden rounded-[12px] border border-border bg-background p-4 text-left font-normal whitespace-normal hover:bg-accent" onClick={() => reportTask(item.title)}>
    <span className="w-full truncate text-xs leading-[14px] text-muted-foreground">{item.category}</span>
    <span className="w-full truncate text-sm font-medium leading-5">{item.title}</span>
    <span className="flex w-full items-center gap-1 text-xs leading-[18px]"><Badge variant="ghost" className="h-[18px] gap-0.5 rounded-sm border-0 px-1 py-0 font-normal text-primary"><AssetIcon src={homeAssets.imgCalendarFold} />每日</Badge><span className="truncate text-muted-foreground">{item.updated}</span></span>
  </Button>)
  const appCards = (all = false) => homeApplications.filter((item) => all || visibleApps.includes(item.id)).map((item) => <Button key={item.id} variant="ghost" className="h-[94px] min-w-0 flex-col justify-start gap-2 rounded-[12px] border-0 px-2 py-3 font-normal" onClick={() => application(item)}>
    <img src={item.image} alt="" className="size-12 shrink-0 rounded-full object-cover" loading="lazy" />
    <span className="w-full truncate text-xs leading-[14px]">{item.name}</span>
  </Button>)
  const agentCards = (all = false) => homeAgents.filter((item) => all || visibleAgents.includes(item.id)).map((item, index) => <Button key={item.id} variant="ghost" aria-label={`${item.title} ${index + 1}`} className="h-[84px] min-w-0 justify-start gap-3 rounded-[12px] border border-border bg-background px-4 py-3 text-left whitespace-normal" onClick={() => { setCatalog(null); onSelectAgent(item.prompt) }}>
    <span className="relative size-10 shrink-0"><img src={item.image} alt="" className="size-10 rounded-full object-cover" loading="lazy" />{item.verified && <span className="absolute right-0 bottom-0 rounded-full border border-background bg-success p-0.5" title="已认证"><AssetIcon src={homeAssets.imgCheck} /></span>}</span>
    <span className="min-w-0 py-1"><span className="block truncate text-sm font-semibold leading-5">{item.title}</span><span className="mt-1 line-clamp-2 text-xs font-normal leading-[14px] text-muted-foreground">{item.description}</span></span>
  </Button>)
  const courseCards = () => homeCourses.map((item) => <Button key={item.title} variant="ghost" className="h-auto min-w-0 flex-col items-stretch justify-start gap-0 rounded-[12px] border-0 p-2 text-left font-normal whitespace-normal" onClick={() => course(item)}>
    <span className="relative block aspect-2/1 min-h-0 w-full shrink-0 overflow-hidden"><img src={item.image} alt={item.title} className="absolute inset-0 h-full w-full rounded-[8px] border border-border object-cover" loading="lazy" />{item.due && <Badge variant="destructive" className="absolute top-0 left-0 h-[18px] rounded-tl-lg rounded-br-sm rounded-tr-none rounded-bl-none border-0 bg-destructive px-1 py-0 text-[10px] text-primary-foreground">今日到期</Badge>}</span>
    <span className="block w-full truncate py-4 text-sm leading-5">{item.title}</span>
  </Button>)
  const newsCards = () => homeNews.map((item, index) => <Button key={index} variant="ghost" className="h-auto min-w-0 flex-col items-stretch justify-start gap-0 rounded-[12px] border-0 p-2 text-left font-normal whitespace-normal" onClick={() => news(item)}>
    <img src={item.image} alt={item.title} className="aspect-video w-full rounded-[8px] border border-border object-cover" loading="lazy" />
    <span className="flex w-full flex-col gap-2 py-4"><span className="line-clamp-2 h-10 text-sm font-medium leading-5">{item.title}</span><span className="flex items-center gap-1 text-xs leading-4 text-muted-foreground">{item.badge ? <Badge className="h-4 rounded-sm border-0 px-1 py-0 text-xs font-normal">{item.source}</Badge> : <span className="min-w-0 flex-1 truncate">{item.source}</span>}<span className="ml-auto shrink-0">{item.time}</span></span></span>
  </Button>)

  const configItems = configuration === "apps" ? homeApplications.map((item) => ({ id: item.id, title: item.name, image: item.image })) : homeAgents
  const catalogTitles = { reports: "信数报表", apps: "全部应用", agents: "全部智能体", courses: "学习与成长", news: "资讯" }

  return <>
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-10 pb-[120px]">
      <HomeSection title="信数报表" onMore={() => setCatalog("reports")}><div className={grid}>{reportCards()}</div></HomeSection>
      <HomeSection title="我的应用" compact onConfigure={() => configure("apps")} onMore={() => setCatalog("apps")}><div className="grid grid-cols-4 gap-0 @min-[660px]/home:grid-cols-6 @min-[900px]/home:grid-cols-8 @min-[1100px]/home:grid-cols-12">{appCards()}</div>{!visibleApps.length && <EmptySelection onConfigure={() => configure("apps")} />}</HomeSection>
      <HomeSection title="我的智能体" compact onConfigure={() => configure("agents")} onMore={() => setCatalog("agents")}><div className={grid}>{agentCards()}</div>{!visibleAgents.length && <EmptySelection onConfigure={() => configure("agents")} />}</HomeSection>
      <HomeSection title="学习与成长" onMore={() => setCatalog("courses")}><div className={grid}>{courseCards()}</div></HomeSection>
      <HomeSection title="资讯" onMore={() => setCatalog("news")}><div className={grid}>{newsCards()}</div></HomeSection>
    </div>

    <Dialog open={Boolean(detail)} onOpenChange={(open) => { if (!open) setDetail(null) }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto p-6 sm:max-w-xl">
        <DialogHeader><DialogTitle className="pr-5 text-lg leading-7">{detail?.title}</DialogTitle><DialogDescription>{detail?.description}</DialogDescription></DialogHeader>
        {detail?.image && <img src={detail.image} alt={detail.title} className={cn("w-full rounded-lg object-cover", homeApplications.some((app) => app.image === detail.image) ? "mx-auto size-16" : "aspect-video")} />}
        {detail?.prompt && <DialogFooter><Button onClick={() => { const prompt = detail.prompt; setDetail(null); if (prompt) onTask(prompt) }}>交给工作助手</Button></DialogFooter>}
      </DialogContent>
    </Dialog>

    <Dialog open={Boolean(catalog)} onOpenChange={(open) => { if (!open) setCatalog(null) }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto p-6 sm:max-w-5xl"><DialogHeader><DialogTitle>{catalog ? catalogTitles[catalog] : ""}</DialogTitle><DialogDescription>选择条目查看详情或发起演示任务。</DialogDescription></DialogHeader><div className={catalog === "apps" ? "grid grid-cols-3 gap-2 sm:grid-cols-6" : "grid grid-cols-1 gap-2 sm:grid-cols-3"}>{catalog === "reports" ? reportCards() : catalog === "apps" ? appCards(true) : catalog === "agents" ? agentCards(true) : catalog === "courses" ? courseCards() : newsCards()}</div></DialogContent>
    </Dialog>

    <Dialog open={Boolean(configuration)} onOpenChange={(open) => { if (!open) setConfiguration(null) }}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto p-6 sm:max-w-xl"><DialogHeader><DialogTitle>配置{configuration === "apps" ? "我的应用" : "我的智能体"}</DialogTitle><DialogDescription>选择首页展示的条目，设置仅在本次页面会话中保留。</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-2">{configItems.map((item, index) => <label key={item.id} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent"><Checkbox checked={pendingItems.includes(item.id)} onCheckedChange={(checked) => setPendingItems((items) => checked ? [...items, item.id] : items.filter((id) => id !== item.id))} aria-label={`${item.title} ${index + 1}`} /><img src={item.image} alt="" className="size-7 rounded-full object-cover" /><span className="min-w-0 truncate text-sm">{item.title}</span></label>)}</div><DialogFooter><Button variant="outline" onClick={() => setConfiguration(null)}>取消</Button><Button onClick={() => { if (configuration === "apps") setVisibleApps(pendingItems); else setVisibleAgents(pendingItems); setConfiguration(null) }}>保存配置</Button></DialogFooter></DialogContent>
    </Dialog>
  </>
}

const grid = "grid grid-cols-2 gap-2 @min-[660px]/home:grid-cols-3 @min-[900px]/home:grid-cols-4 @min-[1100px]/home:grid-cols-5"

function HomeSection({ title, children, onConfigure, onMore, compact }: { title: string; children: ReactNode; onConfigure?: () => void; onMore: () => void; compact?: boolean }) {
  return <section aria-label={title} className="flex min-w-0 flex-col gap-2"><div className={cn("flex h-8 items-center justify-between", compact && "h-7")}><h2 className="pl-3 text-lg font-semibold leading-7 tracking-[-0.18px]">{title}</h2><div className="flex items-center gap-1">{onConfigure && <Button variant="ghost" size="sm" className="gap-1 px-2 text-sm font-medium max-[659px]:min-h-11" onClick={onConfigure}><AssetIcon src={homeAssets.imgSettings2} />配置</Button>}<Button variant="ghost" size="sm" className="gap-0 px-1.5 text-sm font-medium max-[659px]:min-h-11" onClick={onMore}><span className="px-1">{onConfigure ? "全部" : "更多"}</span><AssetIcon src={homeAssets.imgChevronRight1} /></Button></div></div>{children}</section>
}

function AssetIcon({ src }: { src: string }) {
  return <img src={src} alt="" aria-hidden="true" className="shrink-0 dark:brightness-150" />
}

function EmptySelection({ onConfigure }: { onConfigure: () => void }) {
  return <div className="rounded-[12px] border border-dashed p-6 text-center text-sm text-muted-foreground">还未选择首页条目。<Button variant="link" onClick={onConfigure}>添加常用入口</Button></div>
}
