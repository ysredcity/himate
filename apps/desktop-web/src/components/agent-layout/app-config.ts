import type { AppConfig } from "@/agent-ui/immersive/contracts"
import { renderProductBlock } from "./product-block-renderer"

export const appConfig = {
  identity: { name: "企业工作助手", avatar: "bot" },
  navigation: [{ id: "new-conversation", label: "新建对话", visualKey: "newConversation" }],
  experts: [
    { id: "travel", label: "企业制度助手", visualKey: "travel" },
    { id: "document", label: "会议纪要助手", visualKey: "document" },
    { id: "office", label: "项目周报助手", visualKey: "office" },
    { id: "data", label: "业务分析助手", visualKey: "data" },
  ],
  composerExpertOptions: ["企业制度助手", "会议纪要助手", "项目周报助手", "业务分析助手"],
  composerExpertVisualKeys: { "企业制度助手": "travel", "会议纪要助手": "document", "项目周报助手": "office", "业务分析助手": "data" },
  showConnectorSelect: false,
  renderProductBlock,
  welcome: {
    greeting: "把工作目标交给我",
    expertIds: ["travel", "document", "office", "data"],
    recommendations: [
      { expertId: "travel", prompt: "查询差旅报销制度，整理申请与报销要点" },
      { expertId: "document", prompt: "整理会议纪要，提炼结论和行动项" },
      { expertId: "office", prompt: "生成项目周报，汇总进展、风险与计划" },
      { expertId: "data", prompt: "分析业务数据，找出增长机会" },
    ],
    expertRecommendations: {
      travel: ["查询差旅报销制度，整理申请与报销要点", "把报销要点整理成差旅检查清单"],
      document: ["整理会议纪要，提炼结论和行动项", "提炼会议行动项，按负责人整理"],
      office: ["生成项目周报，汇总进展、风险与计划", "提炼周报摘要，面向管理层汇报"],
      data: ["分析业务数据，找出增长机会", "对比区域业务指标，说明增长差异"],
    },
  },
} satisfies AppConfig
