import { ImmersiveAgentApp } from "@/agent-ui/immersive/agent-app"
import { appConfig } from "@/components/agent-layout/app-config"
import { createDraftScene } from "@/components/agent-layout/conversation-data"
import { scenes } from "@/components/agent-layout/scenes"

const pinnedConversations = [{ id: "policy", title: "差旅报销制度与申请要点" }]
const conversations = [
  { id: "weekly", title: "企业工作台项目周报" },
  { id: "meeting", title: "项目推进会 · 纪要与行动项" },
  { id: "business", title: "第三季度区域业务分析" },
]

export default function App() {
  return <ImmersiveAgentApp config={appConfig} scenes={scenes} initialPinnedConversations={pinnedConversations} initialConversations={conversations} createDraftScene={(content, expert, attachments) => ({ id: `draft-${Date.now()}`, ...createDraftScene(content, expert, attachments) })} />
}
