import { useEffect, useRef, useState } from "react"
import { IndentIncrease } from "lucide-react"

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AppConfig } from "@/agent-ui/immersive/contracts"
import { Composer, type ContextItem } from "./composer"
import { IconButton } from "./icon-button"
import { homeAssets } from "./home-data"
import { HomeRecommendations } from "./home-recommendations"
import { HomeWorkspaceSections } from "./home-workspace-sections"
import { cn } from "@/lib/utils"

type NewConversationPageProps = {
  config: Pick<AppConfig, "experts" | "welcome" | "composerExpertOptions" | "composerExpertVisualKeys" | "showConnectorSelect">
  isSidebarDocked: boolean
  onOpenSidebar: () => void
  onBrowseExperts?: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
  initialExpert?: string | null
  compact?: boolean
}

export function NewConversationPage({ config, isSidebarDocked, onOpenSidebar, onBrowseExperts, onStartConversation, initialExpert, compact = false }: NewConversationPageProps) {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(initialExpert ?? null)
  const [focusRequest, setFocusRequest] = useState(0)
  const [draft, setDraft] = useState("")
  const composerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (initialExpert) composerRef.current?.querySelector<HTMLElement>('[role="textbox"]')?.focus({ preventScroll: true })
  }, [initialExpert])

  const prepareTask = (prompt: string, expert?: string) => {
    setDraft(prompt)
    setFocusRequest((value) => value + 1)
    setSelectedExpert(expert ?? null)
    composerRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "center" })
  }

  return <div aria-label="新对话工作台" className="@container/home relative min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto bg-background-desktop">
    {!isSidebarDocked && <div className="absolute top-4 left-4 z-10"><Tooltip><TooltipTrigger render={<IconButton aria-label="展开导航" className="group/nav relative size-8 bg-card shadow-md hover:bg-foreground hover:text-background focus-visible:bg-foreground focus-visible:text-background" onClick={onOpenSidebar}><IndentIncrease aria-hidden="true" className="size-4" /><span className="absolute top-0 right-0 size-2 rounded-full border border-card bg-destructive" /></IconButton>} /><TooltipContent side="right">展开导航</TooltipContent></Tooltip></div>}

    <div className={cn("px-4 pt-28 pb-20 max-[659px]:pt-20 max-[659px]:pb-12", compact && "pb-8")}>
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="flex h-20 items-center justify-center gap-3 text-center text-3xl font-medium leading-9 tracking-[-0.6px] max-[659px]:h-16 max-[659px]:gap-1 max-[659px]:text-xl max-[659px]:tracking-[-0.4px]">
          <span>Hey</span><img src={homeAssets.img2} alt="HiMate 智能助手" className="h-20 w-[90px] shrink-0 object-cover max-[659px]:h-16 max-[659px]:w-[72px]" /><span>有什么需要我搞定的？</span>
        </h1>
        <div ref={composerRef}><Composer expertOptions={config.composerExpertOptions} expertVisualKeys={config.composerExpertVisualKeys} showConnectorSelect={config.showConnectorSelect ?? false} onSend={onStartConversation} draft={draft} focusRequest={focusRequest} onDraftChange={setDraft} selectedExpert={selectedExpert} onSelectedExpertChange={setSelectedExpert} menuSide="below" onBrowseExperts={onBrowseExperts} /></div>
        <HomeRecommendations onSelect={prepareTask} />
      </div>
    </div>

    {!compact && <div className="px-6 max-[659px]:px-4"><HomeWorkspaceSections onTask={(prompt) => onStartConversation(prompt, [])} onSelectAgent={(prompt) => prepareTask(prompt)} /></div>}
  </div>
}
