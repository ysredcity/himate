import { useRef, useState } from "react"
import { Menu, MessageSquarePlus, MoreHorizontal, Pencil, Pin, PinOff, Trash2 } from "lucide-react"

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { GlassAction, GlassActionGroup, GlassGroupDivider, glassGroupButtonClass } from "./mobile-header"
import type { Conversation } from "./sidebar"
import { ConversationSection } from "./conversation-section"
import type { AppConfig, ArtifactTarget, MessageAttachment } from "@/agent-ui/immersive/contracts"

type ConversationPageProps = {
  config: AppConfig
  createDraftScene: (content: string, expert?: string, attachments?: MessageAttachment[]) => NonNullable<Conversation["scene"]>
  conversation: Conversation
  isSidebarDocked: boolean
  onNewChat: () => void
  onOpenSidebar: () => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onApprovalStatusChange: (conversation: Conversation, status: "approved" | "rejected") => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onRename: (conversation: Conversation) => void
  pinned: boolean
}

export function ConversationPage({ config, conversation, createDraftScene, isSidebarDocked, onApprovalStatusChange, onNewChat, onOpenArtifact, onOpenSidebar, onPinnedChange, onRename, pinned }: ConversationPageProps) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [titleTruncated, setTitleTruncated] = useState(false)
  const scene = conversation.scene ?? createDraftScene(conversation.initialMessage || conversation.title, conversation.expert)

  const checkTitleTruncation = () => {
    const title = titleRef.current
    setTitleTruncated(Boolean(title && title.scrollWidth > title.clientWidth))
  }

  return (
    <>
      {/* 移动端 chat-container-header-agent（Figma 2516:59109）：48px 菜单 + 18px 标题 + 新对话 / 更多胶囊 */}
      <header className="flex shrink-0 items-center gap-4 px-4 py-2">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {!isSidebarDocked && <GlassAction label="展开导航" onClick={onOpenSidebar}><Menu /></GlassAction>}
          <Tooltip>
            <TooltipTrigger render={<h1 ref={titleRef} className="min-w-0 flex-1 truncate text-lg leading-7 font-medium tracking-[-0.18px]" onPointerEnter={checkTitleTruncation}>{conversation.title}</h1>} />
            {titleTruncated && <TooltipContent side="bottom" className="max-w-72">{conversation.title}</TooltipContent>}
          </Tooltip>
        </div>
        <GlassActionGroup>
          <Tooltip>
            <TooltipTrigger render={<button type="button" aria-label="新对话" className={glassGroupButtonClass} onClick={onNewChat}><MessageSquarePlus /></button>} />
            <TooltipContent side="bottom">新对话</TooltipContent>
          </Tooltip>
          <GlassGroupDivider />
          <ConversationMoreMenu conversation={conversation} pinned={pinned} onPinnedChange={onPinnedChange} onRename={onRename} />
        </GlassActionGroup>
      </header>

      <ConversationSection
        approvalStatus={conversation.approvalStatus}
        composerExpertOptions={config.composerExpertOptions}
        composerExpertVisualKeys={config.composerExpertVisualKeys}
        composerQuickExpertIds={config.welcome.expertIds}
        scene={scene}
        showConnectorSelect={config.showConnectorSelect ?? true}
        identity={config.identity}
        experts={config.experts}
        renderProductBlock={config.renderProductBlock}
        onApprovalDecision={(status) => onApprovalStatusChange(conversation, status)}
        onOpenArtifact={onOpenArtifact}
      />
    </>
  )
}


function ConversationMoreMenu({ conversation, onPinnedChange, onRename, pinned }: { conversation: Conversation; onPinnedChange: (conversation: Conversation, pinned: boolean) => void; onRename: (conversation: Conversation) => void; pinned: boolean }) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger render={<DropdownMenuTrigger render={<button type="button" aria-label="更多操作" className={glassGroupButtonClass}><MoreHorizontal /></button>} />} />
        <TooltipContent side="bottom">更多操作</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align="end" side="bottom" sideOffset={4} className="w-40">
        <DropdownMenuItem onClick={() => onRename(conversation)}><Pencil />重命名</DropdownMenuItem>
        <DropdownMenuItem onClick={() => onPinnedChange(conversation, !pinned)}>{pinned ? <PinOff /> : <Pin />}{pinned ? "取消置顶" : "置顶"}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive"><Trash2 />删除对话</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
