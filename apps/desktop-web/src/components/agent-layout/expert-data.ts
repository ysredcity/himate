import type { ExpertVisualKey } from "./resource-visuals"

export type Expert = {
  id: string
  name: string
  role: string
  description: string
  scene: string
  tags: string[]
  source: string
  mine: boolean
  enterpriseDefault?: boolean
  canSummon: boolean
  visualKey: ExpertVisualKey
  avatar: string
  /** false 表示当前用户无使用权限，需要申请授权；缺省为有权限 */
  hasPermission?: boolean
  /** 演示用更新日期，展示在专家详情 */
  updatedAt: string
  patterns: string[]
}

export const expertCatalog: Expert[] = [
  { id: "hr", name: "人事专家", role: "全体员工、人事伙伴", description: "面向全体员工的人事服务智能体，覆盖员工全生命周期的常见人事场景。\n\n制度查询：基于企业人事制度库，解答请假、调休、加班、考勤、薪酬、福利、社保公积金等政策问题，并给出适用条件与办理入口。\n\n数据问数：以自然语言查询个人考勤记录、假期余额、工资条与个税明细，支持按月份、项目维度对比，帮助快速核对异常。\n\n便捷办理：协助发起请假、销假、补卡、入职、转正、离职交接等流程，自动带出必填信息、提醒所需附件与审批节点，减少来回沟通。\n\n成长发展：结合岗位与职级，推荐培训课程、内部晋升与转岗机会，并协助整理述职、绩效面谈材料。\n\n多轮协同：支持在同一对话中连续追问，例如先查询剩余年假，再直接发起请假申请；涉及审批的步骤会明确提示审批人与预计时长，并在结果产生后回写通知。\n\n隐私与权限：仅在你的授权范围内读取个人数据，敏感信息默认脱敏展示，不会向其他同事透露他人的薪酬与绩效信息。\n\n说明：以上为演示描述，具体办理范围与口径以企业人事制度为准。", scene: "人事服务", tags: ["请假休假", "考勤薪酬", "入职办理"], source: "智能体管理平台", mine: true, enterpriseDefault: true, canSummon: true, visualKey: "office", avatar: "/figma-home/713b5.png", updatedAt: "2026-09-11", patterns: ["我要请假", "请假", "工资单", "考勤", "假期", "入职"] },
  { id: "travel", name: "差旅专家", role: "出差员工、差旅专员", description: "协助规划出差行程、估算预算，整理差旅申请与报销要求。", scene: "差旅出行", tags: ["出差申请", "行程预算", "差旅报销"], source: "智能体管理平台", mine: true, enterpriseDefault: true, canSummon: true, visualKey: "travel", avatar: "/figma-home/bb2c3.png", updatedAt: "2026-09-08", patterns: ["出差申请", "出差", "差旅", "报销", "行程"] },
  { id: "project", name: "项目推进专家", role: "项目经理、团队负责人", description: "面向项目经理与团队负责人的项目推进智能体，帮助把分散在会议、文档与任务清单中的信息整理成可执行的推进计划。\n\n目标拆解：根据项目目标与里程碑，梳理关键交付物、依赖关系与责任人，生成按周推进的任务清单。\n\n风险识别：汇总进度偏差、资源冲突与跨部门依赖，按影响程度排序，并给出应对建议与需要协调的对象。\n\n会议跟进：整理项目会议结论与行动项，标注负责人与截止时间，到期前提醒跟进，并同步更新项目周报。\n\n汇报材料：基于最新进展自动生成周报、阶段复盘与管理层汇报摘要，保留数据口径说明，便于追溯。\n\n协同机制：可按项目建立固定的推进节奏，例如每周一同步风险、每周五复盘，自动汇总各责任人的更新并提醒缺失项。\n\n数据来源：支持读取项目任务清单、会议纪要与周报，不同来源口径不一致时会标注差异并提示确认，不会擅自合并。\n\n适用范围：适合中大型跨部门项目的日常推进与复盘，不替代正式的项目管理系统。以上为演示描述。", scene: "日常办公", tags: ["项目管理", "风险识别", "协同推进"], source: "智能体管理平台", mine: true, canSummon: true, visualKey: "office", avatar: "/figma-home/0542d.png", updatedAt: "2026-10-12", patterns: ["项目周报", "项目推进", "项目风险"] },
  { id: "document", name: "文档写作助手", role: "全体员工、文案撰写者", description: "整理工作材料、润色文字表达，协助形成清晰的文档结构。", scene: "日常办公", tags: ["文档整理", "文案润色", "结构提炼"], source: "智能体管理平台", mine: true, canSummon: true, visualKey: "document", avatar: "/figma-home/f4264.png", updatedAt: "2026-09-26", patterns: ["文案润色", "润色文字", "工作材料"] },
  { id: "meeting", name: "会议协作助手", role: "会议组织者、项目成员", description: "归纳会议结论与行动项，帮助团队跟进后续协作事项。", scene: "日常办公", tags: ["会议纪要", "行动清单"], source: "协同办公平台", mine: false, canSummon: true, visualKey: "document", avatar: "/figma-home/8258e.png", updatedAt: "2026-10-09", patterns: ["会议纪要", "会议行动项"] },
  { id: "business", hasPermission: false, name: "经营分析专家", role: "经营管理者、业务分析师", description: "围绕经营目标解读业务指标，梳理变化趋势与分析思路。", scene: "数据分析", tags: ["经营指标", "趋势洞察", "业务分析"], source: "企业数据平台", mine: false, canSummon: true, visualKey: "data", avatar: "/figma-home/d548a.png", updatedAt: "2026-10-15", patterns: ["经营指标", "业务分析"] },
  { id: "sales", name: "销售洞察助手", role: "销售团队、区域负责人", description: "对比区域销售表现，辅助发现差异与增长机会。", scene: "数据分析", tags: ["销售对比", "区域洞察"], source: "营销服务平台", mine: false, canSummon: false, visualKey: "data", avatar: "/figma-home/f76cf.png", updatedAt: "2026-08-30", patterns: ["销售表现", "区域销售"] },
  { id: "research", hasPermission: false, name: "行业研究专家", role: "战略研究员、产品经理", description: "梳理行业资料与竞争信息，辅助形成研究提纲。", scene: "知识学习", tags: ["行业研究", "资料提炼"], source: "企业知识平台", mine: false, canSummon: false, visualKey: "research", avatar: "/figma-home/6588c.png", updatedAt: "2026-09-18", patterns: ["行业资料", "竞争信息"] },
  { id: "learning", name: "学习成长助手", role: "全体员工、培训负责人", description: "围绕岗位能力目标，整理学习路径与阶段行动。", scene: "知识学习", tags: ["学习规划", "能力成长"], source: "企业学习平台", mine: false, canSummon: true, visualKey: "industry", avatar: "/figma-home/713b5.png", updatedAt: "2026-10-03", patterns: ["学习计划", "学习路径"] },
  { id: "campus", name: "园区生活助手", role: "园区员工、行政人员", description: "提供园区服务指引，帮助查找生活服务入口。", scene: "园区生活", tags: ["园区服务", "办事指引"], source: "智慧园区平台", mine: false, canSummon: false, visualKey: "campus", avatar: "/figma-home/bb2c3.png", updatedAt: "2026-08-21", patterns: ["园区服务", "园区生活"] },
  { id: "design", hasPermission: false, name: "体验设计专家", role: "产品经理、体验设计师", description: "梳理体验问题，提供用户旅程与交互设计建议。", scene: "研发设计", tags: ["用户体验", "交互设计"], source: "研发协作平台", mine: false, canSummon: false, visualKey: "ux", avatar: "/figma-home/0542d.png", updatedAt: "2026-09-29", patterns: ["交互设计", "用户旅程"] },
  { id: "engineering", name: "技术知识助手", role: "研发工程师、技术负责人", description: "整理技术资料与工程知识，辅助理解方案和关键概念。", scene: "研发设计", tags: ["技术资料", "方案理解"], source: "研发协作平台", mine: false, canSummon: false, visualKey: "industry", avatar: "/figma-home/f4264.png", updatedAt: "2026-10-17", patterns: ["技术资料", "工程知识"] },
  { id: "finance", name: "财税助手", role: "财务人员、经营管理者", description: "整理财税资料与预算分析思路，辅助理解财务管理要求。", scene: "数据分析", tags: ["财税资料", "预算分析"], source: "财务共享平台", mine: false, canSummon: true, visualKey: "data", avatar: "/figma-home/d548a.png", updatedAt: "2026-10-20", patterns: ["财税资料", "财务预算"] },
  { id: "it-service", name: "IT服务助手", role: "全体员工、IT支持人员", description: "整理常见办公设备与系统问题，提供服务申请和排查指引。", scene: "日常办公", tags: ["IT支持", "故障指引"], source: "IT服务平台", mine: false, canSummon: true, visualKey: "industry", avatar: "/figma-home/6588c.png", updatedAt: "2026-10-06", patterns: ["IT服务", "电脑故障"] },
  { id: "procurement", name: "采购协同助手", role: "采购人员、需求部门", description: "梳理采购需求与协同事项，整理材料清单和跟进要点。", scene: "日常办公", tags: ["采购需求", "协同跟进"], source: "采购服务平台", mine: false, canSummon: true, visualKey: "office", avatar: "/figma-home/f76cf.png", updatedAt: "2026-09-14", patterns: ["采购需求", "采购申请"] },
]

export const expertScenes = [...new Set(expertCatalog.map((expert) => expert.scene))]
export const initialScheduledExpertIds = [...expertCatalog.filter((expert) => expert.enterpriseDefault).map((expert) => expert.id), "finance", "it-service", "procurement"]

export const summonableExperts = expertCatalog.filter((expert) => expert.canSummon)

export const expertRecommendations = [
  { id: "hr", background: "/generated-banners/expert-hr.webp", title: "让人事办理，更轻松一点", description: "请假、考勤、薪酬与入职事项，让人事专家帮你理清。" },
  { id: "travel", background: "/generated-banners/expert-travel.webp", title: "把出差安排，交给差旅专家", description: "从行程规划到申请报销，出发前后的准备都有章可循。" },
  { id: "business", background: "/generated-banners/expert-business.webp", title: "从业务数据，找到下一步方向", description: "梳理经营指标与变化趋势，让分析成为行动的起点。" },
]

/** 演示初始数据：已提交申请、仍在审核中的无权限专家（不会自动通过） */
export const initialPendingPermissionIds = ["design"]
