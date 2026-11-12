import { useState } from "react"

import type { AppConfig } from "@/agent-ui/immersive/contracts"
import type { ContextItem } from "./composer"
import { NavMenuAction } from "./mobile-header"
import { MobileComposer } from "./mobile-composer"

type NewConversationPageProps = {
  /** 从专家页召唤时预选的专家（与桌面召唤一致：只预选，不自动发送） */
  initialExpert?: string | null
  config: Pick<AppConfig, "experts" | "welcome">
  isSidebarDocked: boolean
  onOpenSidebar: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
}

/** 新对话默认只显示欢迎语；分类列表展开时隐藏欢迎语。 */
export function NewConversationPage({ config, initialExpert = null, isSidebarDocked, onOpenSidebar, onStartConversation }: NewConversationPageProps) {
  const [selectedExpert, setSelectedExpert] = useState<string | null>(initialExpert)
  const [draft, setDraft] = useState("")
  // 欢迎语以第一个「！」断成两行，与设计稿的两行标题一致
  const [greetingFirst, greetingRest] = splitGreeting(config.welcome.greeting)


  return (
    <>
      <header className="flex shrink-0 items-center gap-3 px-4 py-2">
        {!isSidebarDocked && <NavMenuAction onClick={onOpenSidebar} />}
      </header>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4">
        {/* 欢迎语距顶 144px（2026-11-11 由 96px 下移 48px） */}
        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 pt-36">
          <h1 className="flex flex-col gap-1 px-2 text-[28px] leading-9 font-semibold tracking-[-0.42px]">
            <span>{greetingFirst}</span>{greetingRest && <span>{greetingRest}</span>}
          </h1>
        </div>
      </div>
      <footer className="w-full shrink-0 px-4">
        <div className="mx-auto w-full max-w-3xl py-3">
          <MobileComposer
            experts={config.experts}
            quickExpertIds={config.welcome.expertIds}
            draft={draft}
            onDraftChange={setDraft}
            selectedExpert={selectedExpert}
            onSelectedExpertChange={setSelectedExpert}
            onSend={onStartConversation}
          />
        </div>
      </footer>
    </>
  )
}

function splitGreeting(greeting: string): [string, string] {
  const index = greeting.indexOf("！")
  if (index < 0 || index === greeting.length - 1) return [greeting, ""]
  return [greeting.slice(0, index + 1), greeting.slice(index + 1)]
}
