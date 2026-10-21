import { useRef, useState } from "react"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AppConfig } from "@/agent-ui/immersive/contracts"
import { Composer, type ContextItem } from "./composer"
import { IconButton } from "./icon-button"
import { homeAssets, homeRecommendations } from "./home-data"
import { HomeWorkspaceSections } from "./home-workspace-sections"
import { cn } from "@/lib/utils"

type NewConversationPageProps = {
  config: Pick<AppConfig, "experts" | "welcome" | "composerExpertOptions" | "composerExpertVisualKeys" | "showConnectorSelect">
  isSidebarDocked: boolean
  onOpenSidebar: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
  compact?: boolean
}

export function NewConversationPage({ config, isSidebarDocked, onOpenSidebar, onStartConversation, compact = false }: NewConversationPageProps) {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(null)
  const [draft, setDraft] = useState("")
  const [recommendationPage, setRecommendationPage] = useState(0)
  const [animateRecommendations, setAnimateRecommendations] = useState(false)
  const composerRef = useRef<HTMLDivElement>(null)
  const pageCount = Math.ceil(homeRecommendations.length / 3)
  const recommendationPages = Array.from({ length: pageCount }, (_, index) => homeRecommendations.slice(index * 3, index * 3 + 3))

  const prepareTask = (prompt: string, expert?: string) => {
    setDraft(prompt)
    setSelectedExpert(expert ?? null)
    composerRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" })
    composerRef.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus({ preventScroll: true })
  }

  return <div aria-label="新对话工作台" className="@container/home relative min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto bg-background-desktop">
    {!isSidebarDocked && <div className="absolute top-4 left-4 z-10"><Tooltip><TooltipTrigger render={<IconButton aria-label="展开导航" className="relative size-8 bg-card shadow-md hover:bg-accent" onClick={onOpenSidebar}><img src={homeAssets.imgIndentIncrease} alt="" /><span className="absolute top-0 right-0 size-1.5 rounded-full border border-card bg-destructive" /></IconButton>} /><TooltipContent side="right">展开导航</TooltipContent></Tooltip></div>}

    <div className={cn("px-4 pt-28 pb-20 max-[659px]:pt-20 max-[659px]:pb-12", compact && "pb-8")}>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="flex h-20 items-center justify-center gap-3 text-center text-3xl font-medium leading-9 tracking-[-0.6px] max-[659px]:h-16 max-[659px]:gap-1 max-[659px]:text-xl max-[659px]:tracking-[-0.4px]">
          <span>Hey</span><img src={homeAssets.img2} alt="HiMate 智能助手" className="h-20 w-[90px] shrink-0 object-cover max-[659px]:h-16 max-[659px]:w-[72px]" /><span>有什么需要我搞定的？</span>
        </h1>
        <div ref={composerRef}><Composer appearance="welcome" placeholder="发送消息给我" actionIcons={{ add: homeAssets.imgIcon, mic: homeAssets.imgIcon1, send: homeAssets.imgIcon2 }} expertOptions={config.composerExpertOptions} expertVisualKeys={config.composerExpertVisualKeys} showConnectorSelect={config.showConnectorSelect ?? false} onSend={onStartConversation} draft={draft} onDraftChange={setDraft} selectedExpert={selectedExpert} onSelectedExpertChange={setSelectedExpert} menuSide="below" /></div>
        <div className="group/recommendations relative mt-6" aria-label="推荐任务">
          <div className="overflow-hidden">
            <div className={cn("flex", animateRecommendations && "transition-transform duration-[240ms] ease-in-out motion-reduce:transition-none")} style={{ transform: `translateX(-${recommendationPage * 100}%)` }}>
              {recommendationPages.map((suggestions, index) => <div key={index} aria-hidden={index !== recommendationPage} inert={index !== recommendationPage || undefined} className="grid w-full min-w-0 shrink-0 grid-cols-3 gap-3 max-[659px]:grid-cols-1">
                {suggestions.map((item) => <Button key={item.prompt} variant="ghost" className="h-[74px] min-w-0 flex-col items-stretch justify-start gap-2 rounded-[12px] border border-border bg-background p-4 text-left font-normal hover:bg-accent" onClick={() => prepareTask(item.prompt)} title={item.title}>
                  <span className="flex min-w-0 items-center gap-1"><span className="min-w-0 flex-1 truncate text-sm leading-5">{item.title}</span><img src={homeAssets.imgSlotPreviewcardItems} alt="" className="shrink-0" /></span>
                  <span className="text-xs leading-[14px] text-muted-foreground opacity-72">{item.category}</span>
                </Button>)}
              </div>)}
            </div>
          </div>
          <span className="sr-only" aria-live="polite">第 {recommendationPage + 1} 组，共 {pageCount} 组推荐</span>
          {recommendationPage > 0 && <IconButton aria-label="上一组推荐" className={cn(paginationButtonClass, "-left-4")} onClick={(event) => { setAnimateRecommendations(event.detail !== 0); setRecommendationPage((page) => page - 1) }}><ChevronLeft className="size-4" /></IconButton>}
          {recommendationPage < pageCount - 1 && <IconButton aria-label="下一组推荐" className={cn(paginationButtonClass, "-right-4")} onClick={(event) => { setAnimateRecommendations(event.detail !== 0); setRecommendationPage((page) => page + 1) }}><img src={homeAssets.imgChevronRight} alt="" /></IconButton>}

        </div>
      </div>
    </div>

    {!compact && <div className="px-6 max-[659px]:px-4"><HomeWorkspaceSections onTask={(prompt) => onStartConversation(prompt, [])} onSelectAgent={(prompt) => prepareTask(prompt, "项目周报助手")} /></div>}
    <p className="px-4 pb-5 text-center text-xs text-muted-foreground">演示数据 · 尚未连接企业系统或真实模型</p>
  </div>
}

const paginationButtonClass = "invisible absolute top-1/2 size-8 -translate-y-1/2 border bg-card shadow-md hover:border-foreground/30 hover:bg-card hover:shadow-lg dark:hover:bg-card group-hover/recommendations:visible group-focus-within/recommendations:visible [@media(hover:none)]:visible"
