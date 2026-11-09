import { expertCatalog, summonableExperts } from "./expert-data"
import type { AppConfig } from "@/agent-ui/immersive/contracts"
import { renderProductBlock } from "./product-block-renderer"

export const appConfig = {
  identity: { name: "企业工作助手", avatar: "bot" },
  navigation: [{ id: "new-conversation", label: "首页 · 新对话", visualKey: "newConversation" }, { id: "capability-hub", label: "专家", visualKey: "capabilityHub" }],
  experts: expertCatalog.map((expert) => ({ id: expert.id, label: expert.name, visualKey: expert.visualKey })),
  composerExpertOptions: summonableExperts.map((expert) => expert.name),
  composerExpertVisualKeys: Object.fromEntries(summonableExperts.map((expert) => [expert.name, expert.visualKey])),
  showConnectorSelect: false,
  renderProductBlock,
  welcome: {
    greeting: "把工作目标交给我",
    expertIds: ["hr", "travel"],
    recommendations: [
      { expertId: "hr", prompt: "我要请假" },
      { expertId: "hr", prompt: "帮我查询一下我上个月的工资单" },
      { expertId: "travel", prompt: "帮我发起一个出差申请" },
      { expertId: "travel", prompt: "查询差旅报销制度，整理申请与报销要点" },
    ],
    expertRecommendations: {
      hr: ["我要请假", "帮我查询一下我上个月的工资单", "帮我核对本月考勤，整理异常记录", "帮我查询可用假期，说明休假规则", "帮我整理新员工入职材料和办理清单"],
      travel: ["帮我发起一个出差申请", "帮我规划三天出差行程和每日安排", "帮我估算本次出差的交通和住宿预算", "帮我整理差旅报销材料和注意事项", "查询差旅报销制度，整理申请与报销要点"],
    },
  },
} satisfies AppConfig
