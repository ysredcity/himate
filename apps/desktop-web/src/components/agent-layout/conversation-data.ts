import type { FollowUpSuggestionsPayload } from "@/agent-ui/conversation"
import { matchTrigger } from "@/agent-ui/script-engine/match"
import { businessReport, meetingReport, meetingSource, policyReport, policySource, weeklyReport, weeklySource } from "./panel-data"
import type { ArtifactTarget } from "./panel-types"

export type ExecutionStatus = "completed" | "running" | "waiting"

export type ExecutionActionData = {
  label: string
  type: "skill" | "api" | "query" | "script" | "file" | "connector" | "knowledge" | "web"
  target?: ArtifactTarget
}

export type ReasoningData = {
  id: string
  content: string
  running?: boolean
}

export type ExecutionStepData = {
  id: string
  title: string
  detail?: string
  status: "completed" | "running" | "pending"
  actions?: ExecutionActionData[]
  reasoning?: ReasoningData
}

export type ExecutionTaskData = {
  id: string
  title: string
  summary: string
  status: "completed" | "running"
  steps: ExecutionStepData[]
}

export type ExecutionData = {
  status: ExecutionStatus
  summary: string
  duration?: string
  showSummary?: boolean
  flat?: boolean
  steps: ExecutionStepData[]
  reasoning?: ReasoningData
  tasks?: ExecutionTaskData[]
}

/** 用户消息里的本地上传文件，渲染为可打开右侧预览的独立 Attachment */
export type MessageAttachment = { id: string; name: string; size: number; target?: ArtifactTarget }

/** 智能体交付物附件必须带可打开的预览目标。 */
export type AssistantAttachment = MessageAttachment & { target: ArtifactTarget }

export type ClarificationOption = { label: string; value: string }
export type ClarificationFieldValue = string | string[] | { end: string; start: string }

export type ClarificationField =
  | { id: string; label: string; placeholder?: string; required?: boolean; type: "text" | "textarea" }
  | { id: string; label: string; required?: boolean; type: "date-range" }
  | { id: string; label: string; required?: boolean; type: "single-select" | "multi-select"; options: ClarificationOption[] }

export type ClarificationFollowUpData = {
  assistant: AssistantMessageData & { kind: "question" }
  execution: ExecutionData
  id: string
}

/** 智能体向用户补齐关键信息时推送的结构化表单。 */
export type ClarificationFormData = {
  defaultOpen?: boolean
  description?: string
  fields: ClarificationField[]
  followUp?: ClarificationFollowUpData
  id: string
  initialValues?: Record<string, ClarificationFieldValue>
  submitLabel?: string
  title: string
}

/** 产品自定义对话块的中立数据载体；具体渲染由应用配置提供。 */
export type ProductConversationBlock = {
  id: string
  type: string
  data?: unknown
}

export type AssistantMessageData = {
  attachments?: AssistantAttachment[]
  clarification?: ClarificationFormData
  content: string
  timestamp: string
  kind?: "answer" | "question"
}

/** 未指定专家时，智能体侧显示的产品身份 */
export const DEFAULT_AGENT_NAME = "企业工作助手"

export type ApprovalOutcomeData = {
  execution: ExecutionData
  assistant: AssistantMessageData
  /** 审批落地后的产物块（结果卡、后续确认卡等）。审批结果必须留在同一轮，不另起 turn。 */
  productBlock?: ProductConversationBlock
}

export type ConversationTurnData = {
  id: string
  /** 确认待决时，rich Flow 以会话状态驱动审批提示、卡片和 Composer 禁用。 */
  awaitingApproval?: boolean
  approvalOutcomes?: {
    approved: ApprovalOutcomeData
    rejected: ApprovalOutcomeData
  }
  /**
   * 这一轮由哪个专家执行。等于指定了子智能体，因此显示在智能体消息开头，
   * 而不是用户消息上；缺省时显示产品身份 `DEFAULT_AGENT_NAME`。
   */
  expert?: string
  user: {
    /** 可内联的上下文与能力写成 `[[类型:名称]]` 标记，渲染为气泡内的 badge */
    content: string
    attachments?: MessageAttachment[]
    timestamp?: string
  }
  execution: ExecutionData
  assistant?: AssistantMessageData
  productBlock?: ProductConversationBlock
}

/** 生成与场景数据一致的时间戳格式，用于新发送的消息 */
export function formatTimestamp(date: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${pad(date.getMonth() + 1)}月${pad(date.getDate())}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/**
 * `trigger` 让用户用自然语言进入这个已写场景（新对话首句命中即接管），缺省则只能从侧栏点进来。
 * keyword 是子串匹配、**最长命中优先**，所以不要用「出差」「费用」这类宽泛词——
 * 它们会抢占更精确的场景；跨场景重复或互为子串会被 check-scripts 拦下。
 */
export type ConversationScene = { trigger?: { type: "keyword" | "regex"; patterns: string[] }; turns: ConversationTurnData[] }

const step = (id: string, title: string, target?: ArtifactTarget): ExecutionStepData => ({
  id, title, status: "completed",
  ...(target ? { actions: [{ label: target.title, type: "file" as const, target }] } : {}),
})

const followUps = (id: string, suggestions: [string, string]): ProductConversationBlock => ({
  id: `${id}-follow-ups`, type: "follow-up-suggestions",
  data: { suggestions: suggestions.map((content, index) => ({ id: `${id}-${index}`, label: content, content })) } satisfies FollowUpSuggestionsPayload,
})

export const conversationScenes: Record<string, ConversationScene> = {
  "policy": { trigger: { type: "keyword", patterns: ["差旅报销", "报销要点", "差旅检查"] }, turns: [{
    id: "policy-turn", expert: "企业制度助手",
    user: { content: "查询差旅报销制度，整理申请与报销要点", timestamp: "10月21日 09:10" },
    execution: { status: "completed", summary: "已整理申请流程与报销检查清单", duration: "3秒", steps: [step("policy-read", "查阅示例差旅管理办法", policySource), step("policy-extract", "提取申请、凭证与报销要求"), step("policy-deliver", "整理差旅检查清单", policyReport)] },
    assistant: { content: "根据示例制度，差旅报销有三个重点：**先审批再预订、票据与行程对应、返程后分类整理凭证**。完整要点已整理成检查清单。\n\n此处为演示制度，实际金额标准、报销时限请以所在企业规定为准。", timestamp: "10月21日 09:10", attachments: [{ id: "policy-result", name: policyReport.fileName, size: 2410, target: policyReport }] },
    productBlock: followUps("policy", ["把报销要点整理成差旅检查清单", "整理会议纪要，提炼结论和行动项"]),
  }] },
  "meeting": { trigger: { type: "keyword", patterns: ["整理会议", "会议纪要", "会议行动项"] }, turns: [{
    id: "meeting-turn", expert: "会议纪要助手",
    user: { content: "整理会议纪要，提炼结论和行动项", timestamp: "10月21日 14:30" },
    execution: { status: "completed", summary: "已提取 3 项会议结论与 3 项行动项", duration: "3秒", steps: [step("meeting-read", "读取项目推进会示例记录", meetingSource), step("meeting-extract", "提取结论、负责人和截止时间"), step("meeting-deliver", "生成会议纪要与行动项", meetingReport)] },
    assistant: { content: "项目推进会纪要已整理完成：**本轮交付前端演示，周五完成场景验收，下周启动内部试用**。\n\n已提取 3 项行动项，分别对应场景验收、窄屏检查和业务指标口径；负责人、截止时间及验收标准见下方纪要。内容来自示例会议记录。", timestamp: "10月21日 14:30", attachments: [{ id: "meeting-result", name: meetingReport.fileName, size: 3200, target: meetingReport }] },
    productBlock: followUps("meeting", ["提炼会议行动项，按负责人整理", "生成项目周报，汇总进展、风险与计划"]),
  }] },
  "weekly": { trigger: { type: "keyword", patterns: ["项目周报", "生成周报", "周报摘要", "本周工作", "本周项目"] }, turns: [{
    id: "weekly-turn", expert: "项目周报助手",
    user: { content: "生成项目周报，汇总进展、风险与计划", timestamp: "10月21日 16:10" },
    execution: { status: "completed", summary: "已汇总进展、风险与下周计划", duration: "3秒", steps: [step("weekly-read", "读取示例任务清单与会议纪要", weeklySource), step("weekly-group", "归纳已完成事项、风险与协同需求"), step("weekly-deliver", "生成项目周报草稿", weeklyReport)] },
    assistant: { content: "周报草稿已生成。**基础布局、四类场景和产物预览已完成**，响应式检查及场景验收正在推进。\n\n主要依赖为接口权限和业务指标口径；下周计划启动内部试用。完整周报包含进展表、风险应对与协同事项，基于示例项目资料整理。", timestamp: "10月21日 16:10", attachments: [{ id: "weekly-result", name: weeklyReport.fileName, size: 3600, target: weeklyReport }] },
    productBlock: followUps("weekly", ["提炼周报摘要，面向管理层汇报", "整理会议纪要，提炼结论和行动项"]),
  }] },
  "business": { trigger: { type: "keyword", patterns: ["业务数据", "区域业务", "业务指标", "增长机会"] }, turns: [{
    id: "business-turn", expert: "业务分析助手",
    user: { content: "分析业务数据，找出增长机会", timestamp: "10月21日 17:00" },
    execution: { status: "completed", summary: "已完成 3 个区域的季度收入对比", duration: "3秒", steps: [step("business-read", "核对示例收入数据与统计口径"), step("business-calculate", "计算区域环比与增量贡献"), step("business-deliver", "生成分析结论与指标表格", businessReport)] },
    assistant: { content: "示例数据中，Q3 总收入为 **3,400 万元，环比增长 13.3%**。华东贡献了 **60% 的收入增量**，是主要增长来源。\n\n建议进一步拆解华东的渠道结构，并排查华北的转化与留存情况。当前只有收入数据，不能据此判断增长原因或利润表现。完整指标与计算口径见分析报告。", timestamp: "10月21日 17:00", attachments: [{ id: "business-result", name: businessReport.fileName, size: 3400, target: businessReport }] },
    productBlock: followUps("business", ["对比区域业务指标，说明增长差异", "生成项目周报，汇总进展、风险与计划"]),
  }] },
}

export function createDraftScene(message: string, expert?: string, attachments: MessageAttachment[] = []): ConversationScene {
  const available = Object.entries(conversationScenes).map(([id, scene]) => ({ id, ...scene }))
  const matched = matchTrigger(message, available)
  const timestamp = formatTimestamp()
  if (matched) return { turns: matched.turns.map((turn, index) => ({ ...turn, id: `${turn.id}-${Date.now()}`, user: index === 0 ? { content: message, attachments, timestamp } : turn.user, assistant: turn.assistant ? { ...turn.assistant, timestamp } : undefined })) }
  const brief: ArtifactTarget = {
    type: "file-preview", title: "任务需求记录", fileName: "任务需求记录.md", fileType: "Markdown · 任务草稿",
    content: `# 任务需求记录\n\n## 你的目标\n${message}\n\n## 已附资料\n${attachments.length ? attachments.map((file) => `- ${file.name}`).join("\n") : "尚未提供附件。"}\n\n## 下一步\n当前为前端演示，可以体验制度查询、会议纪要、项目周报及业务分析。此记录仅保存任务描述，尚未执行实际业务处理或读取附件内容。`,
  }
  return { turns: [{ id: `draft-turn-${Date.now()}`, expert, user: { content: message, attachments, timestamp }, execution: { status: "completed", summary: "已整理任务描述，尚未执行业务处理", steps: [step("draft-record", "记录目标与附件信息"), step("draft-deliver", "生成任务需求记录", brief)] }, assistant: { content: "已将你的目标整理成任务需求记录。当前是前端演示，支持制度查询、会议纪要、项目周报和业务分析；这条请求尚未进行实际业务处理，附件也尚未解析。可以继续选择下方演示任务。", timestamp, attachments: [{ id: "draft-result", name: "任务需求记录.md", size: new TextEncoder().encode(brief.content).length, target: brief }] }, productBlock: followUps("draft", ["整理会议纪要，提炼结论和行动项", "分析业务数据，找出增长机会"]) }] }
}
