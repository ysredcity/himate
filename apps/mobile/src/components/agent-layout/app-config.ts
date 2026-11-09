import { homeRecommendationCategories } from "./recommendation-data"
import type { ProductBlockRenderer } from "./conversation-flow"
import { renderProductBlock } from "./product-block-renderer"
import type { ExpertVisualKey, ProductAvatarKey } from "./resource-visuals"

export type ProductIdentity = {
  name: string
  avatar: ProductAvatarKey
}

export type NavigationItem = {
  id: "new-conversation" | "capability-hub" | "scheduled-task" | "file-library"
  label: string
  visualKey: "newConversation" | "capabilityHub" | "scheduledTask" | "fileLibrary"
}

export type WelcomeExpert = {
  id: string
  label: string
  visualKey: ExpertVisualKey
}

export type WelcomeRecommendation = {
  expertId: string
  prompt: string
}

export type AppConfig = {
  identity: ProductIdentity
  navigation: readonly NavigationItem[]
  experts: readonly WelcomeExpert[]
  showConnectorSelect?: boolean
  welcome: {
    greeting: string
    expertIds: readonly string[]
    recommendations: readonly WelcomeRecommendation[]
    expertRecommendations: Readonly<Record<string, readonly string[]>>
  }
  renderProductBlock?: ProductBlockRenderer
}

export const appConfig = {
  identity: { name: "HiMate", avatar: "himate" },
  navigation: [
    // 移动端抽屉只保留「新对话」，其余能力入口不提供（用户 2026-11-07 确认）
    { id: "new-conversation", label: "新对话", visualKey: "newConversation" },
  ],
  experts: [
    { id: "hr", label: "人事专家", visualKey: "office" },
    { id: "knowledge", label: "知识学习专家", visualKey: "document" },
    { id: "office", label: "日常办公专家", visualKey: "office" },
    { id: "document", label: "文档处理专家", visualKey: "document" },
    { id: "data", label: "数据分析专家", visualKey: "data" },
    { id: "research", label: "市场调研专家", visualKey: "research" },
    { id: "campus", label: "园区生活专家", visualKey: "campus" },
    { id: "travel", label: "差旅专家", visualKey: "travel" },
    { id: "ux", label: "用户体验专家", visualKey: "ux" },
    { id: "industry", label: "行业研究专家", visualKey: "industry" },
  ],
  showConnectorSelect: true,
  renderProductBlock,
  welcome: {
    greeting: "👋 Hey！有什么需要我搞定的？",
    expertIds: homeRecommendationCategories.map(category => category.id),
    /**
     * 推荐语点击后等同于用户输入：命中某个场景的 `trigger.patterns` 才会进入已写剧本，
     * 否则回退成 `createDraftScene` 草稿。想让一条推荐有完整演示效果，
     * 就在 `conversation-data.ts` 里给对应场景配上能被这句话包含的 trigger。
     */
    recommendations: [
      {expertId:"hr",prompt:"我要请假"},
      {expertId:"hr",prompt:"帮我查询一下我上个月的工资单"},
      {expertId:"travel",prompt:"帮我发起一个出差申请"},
      {expertId:"travel",prompt:"查询差旅报销制度，整理申请与报销要点"},
    ],
    expertRecommendations: Object.fromEntries(homeRecommendationCategories.map(category=>[category.id,category.items.map(item=>item.prompt)])),
  },
} satisfies AppConfig
