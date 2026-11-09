import { ConversationPage } from "./conversation-page"
import { NewConversationPage } from "./new-conversation-page"
import type { Conversation } from "./sidebar"
import type { ContextItem } from "./composer"
import type { AppConfig } from "@/agent-ui/immersive/contracts"
import type { ArtifactTarget } from "@/agent-ui/immersive/contracts"
import { cn } from "@/lib/utils"

type ChatWorkspaceProps = {
  onSceneChange: (conversation: Conversation, scene: NonNullable<Conversation["scene"]>) => void
  config: AppConfig
  createDraftScene: import("@/agent-ui/immersive/contracts").ImmersiveDraftSceneFactory
  initialExpert?: string | null
  activeConversation: Conversation | null
  activeConversationPinned: boolean
  isSidebarDocked: boolean
  onNewChat: () => void
  onPinnedChange: (conversation: Conversation, pinned: boolean) => void
  onDelete: (conversation: Conversation) => void
  onRename: (conversation: Conversation) => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onApprovalStatusChange: (conversation: Conversation, status: "approved" | "rejected") => void
  onOpenSidebar: () => void
  onBrowseExperts: () => void
  onStartConversation: (message: string, context: ContextItem[]) => void
  panelOpen: boolean
  panelAtDefaultSplit: boolean
}

export function ChatWorkspace({
  onSceneChange,
  config,
  createDraftScene,
  activeConversation,
  initialExpert,
  activeConversationPinned,
  isSidebarDocked,
  onNewChat,
  onPinnedChange,
  onDelete,
  onRename,
  onOpenArtifact,
  onApprovalStatusChange,
  onOpenSidebar,
  onBrowseExperts,
  onStartConversation,
  panelAtDefaultSplit,
}: ChatWorkspaceProps) {
  return (
    <section className={cn(
      "flex min-w-0 flex-1 flex-col bg-background-desktop min-[660px]:min-w-[420px]",
      // 面板默认分栏：对话区取可用宽度的一半，下限 420px，上限 800px。
      // 上限来自对话内容本身的 max-w-3xl（768px）加左右 padding，超过就是浪费；
      // 富余空间全部留给独立面板，因为网页与文档预览越宽越好读。
      panelAtDefaultSplit && "w-[clamp(420px,50%,800px)] flex-none",
    )}>
      {activeConversation ? (
        <ConversationPage
          onSceneChange={onSceneChange}
          config={config}
          createDraftScene={createDraftScene}
          conversation={activeConversation}
          pinned={activeConversationPinned}
          isSidebarDocked={isSidebarDocked}
          onNewChat={onNewChat}
          onOpenSidebar={onOpenSidebar}
          onBrowseExperts={onBrowseExperts}
          onOpenArtifact={onOpenArtifact}
          onApprovalStatusChange={onApprovalStatusChange}
          onPinnedChange={onPinnedChange}
          onDelete={onDelete} onRename={onRename}
        />
      ) : (
        <NewConversationPage
          initialExpert={initialExpert}
          config={config}
          isSidebarDocked={isSidebarDocked}
          onOpenSidebar={onOpenSidebar}
          onBrowseExperts={onBrowseExperts}
          onStartConversation={onStartConversation}
        />
      )}
    </section>
  )
}
