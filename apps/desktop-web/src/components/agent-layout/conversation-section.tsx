import { useState } from "react"

import { ConversationSurface, type ProductBlockAction } from "@/agent-ui/conversation"
import { type AppConfig, type ArtifactTarget, type ConversationScene, type ProductIdentity, type WelcomeExpert } from "@/agent-ui/immersive/contracts"
import { Composer } from "./composer"
import { ConversationFlow, type ProductBlockRenderer } from "./conversation-flow"
import { useDemoPlayback } from "./use-demo-playback"
import { splitSentContext } from "./message-context"

type ConversationSectionProps = {
  createDraftScene: import("@/agent-ui/immersive/contracts").ImmersiveDraftSceneFactory
  approvalStatus?: "pending" | "approved" | "rejected"
  composerExpertOptions?: readonly string[]
  composerExpertVisualKeys?: Readonly<Record<string, WelcomeExpert['visualKey']>>
  experts: readonly WelcomeExpert[]
  identity: ProductIdentity
  initialDraft?: string
  onApprovalDecision?: (status: "approved" | "rejected") => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onProductBlockAction?: (action: ProductBlockAction) => void
  renderProductBlock?: ProductBlockRenderer
  onSceneChange?: (scene: ConversationScene) => void
  scene: ConversationScene
  showConnectorSelect?: boolean
}

/**
 * Agent 与 Copilot 共同使用的完整对话 section。
 * 它统一 rich Flow、rich Composer、消息追加、滚动与 footer；形态壳层只负责 Header、容器和 artifact adapter。
 */
export function ConversationSection({
  createDraftScene,
  onSceneChange,
  approvalStatus,
  composerExpertOptions,
  composerExpertVisualKeys,
  experts,
  identity,
  initialDraft = "",
  onApprovalDecision,
  onOpenArtifact,
  onProductBlockAction,
  renderProductBlock,
  scene,
  showConnectorSelect = true,
}: ConversationSectionProps) {
  const [composerDraft, setComposerDraft] = useState(initialDraft)
  const [currentScene, setCurrentScene] = useState(scene)
  const { scene: playbackScene, running } = useDemoPlayback(currentScene)
  const awaitingApproval = approvalStatus === "pending"

  const handleProductBlockAction = (action: ProductBlockAction) => {
    if (action.type === "follow-up-select") setComposerDraft(action.content)
    if (action.type === "confirm-decision" && awaitingApproval) {
      if (action.decision === "confirm") onApprovalDecision?.("approved")
      if (action.decision === "cancel") onApprovalDecision?.("rejected")
    }
    onProductBlockAction?.(action)
  }

  const guardedRenderer = renderProductBlock
    ? ((block: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[0], context: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[1]) => {
        if (block.type === "follow-up-suggestions" && (!context.isLatestTurn)) return null
        return renderProductBlock(block, context)
      })
    : undefined

  return (
    <ConversationSurface
      scrollKey={`${currentScene.id}-${playbackScene.turns.at(-1)?.execution.status}`}
      disclaimer="演示数据 · 尚未连接企业系统或真实模型"
      footer={
        <Composer
          disabled={awaitingApproval || running}
          expertOptions={composerExpertOptions}
          expertVisualKeys={composerExpertVisualKeys}
          showConnectorSelect={showConnectorSelect}
          draft={composerDraft}
          onDraftChange={setComposerDraft}
          onSend={(message, context) => {
            const { content, attachments, expert } = splitSentContext(message, context)
            const next = createDraftScene(content, expert, attachments)
            const updated = { ...currentScene, id: next.id, turns: [...currentScene.turns, ...next.turns] }
            setCurrentScene(updated)
            onSceneChange?.(updated)
            setComposerDraft("")
          }}
        />
      }
    >
      <p className="sr-only" role="status" aria-live="polite">{playbackScene.turns.at(-1)?.execution.summary}</p>
      <div role="log" aria-label="对话记录" aria-live="polite" aria-busy={running}>
      <ConversationFlow
        key={`${currentScene.id}-${running}`}
        approvalStatus={approvalStatus}
        scene={playbackScene}
        identity={identity}
        experts={experts}
        renderProductBlock={guardedRenderer}
        onProductBlockAction={handleProductBlockAction}
        onOpenArtifact={onOpenArtifact}
      />
      </div>
    </ConversationSurface>
  )
}
