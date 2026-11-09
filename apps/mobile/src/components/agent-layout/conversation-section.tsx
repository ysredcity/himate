import { useState } from "react"

import { ConversationSurface, type ProductBlockAction } from "@/agent-ui/conversation"
import { formatTimestamp, type AppConfig, type ArtifactTarget, type ConversationScene, type MessageAttachment, type ProductIdentity, type WelcomeExpert } from "@/agent-ui/immersive/contracts"
import type { ComposerInputController, ComposerSendHandler } from "./composer"
import { MobileComposer } from "./mobile-composer"
import { ConversationFlow, UserMessage, type ProductBlockRenderer } from "./conversation-flow"
import { splitSentContext } from "./message-context"

export type ConversationSectionProps = {
  input?: ComposerInputController
  sending?: boolean
  /** Host owns scene/messages when provided; false/rejection preserves input. */
  onSend?: ComposerSendHandler
  approvalStatus?: "pending" | "approved" | "rejected"
  /** PC Composer 参数，移动端 Composer 不使用，保留以兼容公共接口 */
  composerExpertOptions?: readonly string[]
  composerExpertVisualKeys?: Readonly<Record<string, WelcomeExpert['visualKey']>>
  /** HiMate 移动端：Composer 快捷行展示的专家 id */
  composerQuickExpertIds?: readonly string[]
  experts: readonly WelcomeExpert[]
  identity: ProductIdentity
  initialDraft?: string
  onApprovalDecision?: (status: "approved" | "rejected") => void
  onOpenArtifact: (target: ArtifactTarget) => void
  onProductBlockAction?: (action: ProductBlockAction) => void
  renderProductBlock?: ProductBlockRenderer
  scene: ConversationScene
  /** PC Composer 参数，移动端 Composer 不使用，保留以兼容公共接口 */
  showConnectorSelect?: boolean
}

/**
 * Agent 与 Copilot 共同使用的完整对话 section。
 * 它统一 rich Flow、rich Composer、消息追加、滚动与 footer；形态壳层只负责 Header、容器和 artifact adapter。
 */
export function ConversationSection({
  input,
  sending,
  onSend,
  approvalStatus,
  composerQuickExpertIds = [],
  experts,
  identity,
  initialDraft = "",
  onApprovalDecision,
  onOpenArtifact,
  onProductBlockAction,
  renderProductBlock,
  scene,
}: ConversationSectionProps) {
  const [composerDraft, setComposerDraft] = useState(initialDraft)
  const [composerExpert, setComposerExpert] = useState<string | null>(null)
  const draft = input ? input.value.draft : composerDraft
  const setDraft = (value: string) => input ? input.onChange((previous) => ({ ...previous, draft: value })) : setComposerDraft(value)
  const expert = input ? input.value.expert : composerExpert
  const setExpert = (value: string | null) => input ? input.onChange((previous) => ({ ...previous, expert: value })) : setComposerExpert(value)
  const [sentMessages, setSentMessages] = useState<{ content: string; timestamp: string; attachments: MessageAttachment[] }[]>([])
  const awaitingApproval = approvalStatus === "pending"

  const handleProductBlockAction = (action: ProductBlockAction) => {
    if (action.type === "follow-up-select") {
      if (input) input.onChange(previous => ({ ...previous, draft: action.content }))
      else setComposerDraft(action.content)
    }
    if (action.type === "confirm-decision" && awaitingApproval) {
      if (action.decision === "confirm") onApprovalDecision?.("approved")
      if (action.decision === "cancel") onApprovalDecision?.("rejected")
    }
    onProductBlockAction?.(action)
  }

  const guardedRenderer = renderProductBlock
    ? ((block: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[0], context: Parameters<NonNullable<AppConfig["renderProductBlock"]>>[1]) => {
        if (block.type === "follow-up-suggestions" && (!context.isLatestTurn || sentMessages.length > 0)) return null
        return renderProductBlock(block, context)
      })
    : undefined

  return (
    <ConversationSurface
      scrollKey={scene.id}
      // 移动端设计稿隐藏「以上内容由AI生成」
      disclaimer={false}
      footer={
        <>

        <MobileComposer
          experts={experts}
          quickExpertIds={composerQuickExpertIds}
          sending={sending}
          disabled={awaitingApproval}
          draft={draft}
          onDraftChange={setDraft}
          selectedExpert={expert}
          onSelectedExpertChange={setExpert}
          onSend={(message, context) => {
            if (onSend) return onSend(message, context)
            setSentMessages((items) => [...items, { ...splitSentContext(message, context), timestamp: formatTimestamp() }])
            setComposerDraft("")
          }}
        />
        </>
      }
    >
      <ConversationFlow
        key={scene.id}
        approvalStatus={approvalStatus}
        scene={scene}
        identity={identity}
        experts={experts}
        renderProductBlock={guardedRenderer}
        onProductBlockAction={handleProductBlockAction}
        onOpenArtifact={onOpenArtifact}
      />
      {!onSend && sentMessages.length > 0 && (
        <div className="mt-10 space-y-10 text-[15px]">
          {sentMessages.map((message, index) => <UserMessage key={`${message.content}-${index}`} message={message} onOpenArtifact={onOpenArtifact} />)}
        </div>
      )}
    </ConversationSurface>
  )
}
