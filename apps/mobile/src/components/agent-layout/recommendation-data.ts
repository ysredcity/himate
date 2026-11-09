export type HomeRecommendation = { name: string; title: string; category: string; prompt: string; expert?: string }

export const homeRecommendations: HomeRecommendation[] = [
  { name: "请假申请", title: "我要请假", category: "人事服务", prompt: "我要请假", expert: "人事专家" },
  { name: "工资单查询", title: "帮我查询一下我上个月的工资单", category: "人事服务", prompt: "帮我查询一下我上个月的工资单", expert: "人事专家" },
  { name: "考勤核对", title: "帮我核对本月考勤，整理异常记录", category: "人事服务", prompt: "帮我核对本月考勤，整理异常记录", expert: "人事专家" },
  { name: "假期余额", title: "帮我查询可用假期，说明休假规则", category: "人事服务", prompt: "帮我查询可用假期，说明休假规则", expert: "人事专家" },
  { name: "入职准备", title: "帮我整理新员工入职材料和办理清单", category: "人事服务", prompt: "帮我整理新员工入职材料和办理清单", expert: "人事专家" },
  { name: "出差申请", title: "帮我发起一个出差申请", category: "差旅出行", prompt: "帮我发起一个出差申请", expert: "差旅专家" },
  { name: "行程规划", title: "帮我规划三天出差行程和每日安排", category: "差旅出行", prompt: "帮我规划三天出差行程和每日安排", expert: "差旅专家" },
  { name: "差旅预算", title: "帮我估算本次出差的交通和住宿预算", category: "差旅出行", prompt: "帮我估算本次出差的交通和住宿预算", expert: "差旅专家" },
  { name: "报销准备", title: "帮我整理差旅报销材料和注意事项", category: "差旅出行", prompt: "帮我整理差旅报销材料和注意事项", expert: "差旅专家" },
  { name: "差旅制度", title: "查询差旅报销制度，整理申请与报销要点", category: "差旅出行", prompt: "查询差旅报销制度，整理申请与报销要点", expert: "差旅专家" },
  { name: "会议纪要", title: "整理会议纪要，提炼结论和行动项", category: "日常办公", prompt: "整理会议纪要，提炼结论和行动项" },
  { name: "项目周报", title: "生成项目周报，汇总进展与计划", category: "日常办公", prompt: "生成项目周报，汇总进展、风险与计划" },
  { name: "邮件起草", title: "帮我起草一封跨部门项目协调邮件", category: "日常办公", prompt: "帮我起草一封跨部门项目协调邮件" },
  { name: "任务拆解", title: "把项目目标拆解成任务、负责人和时间点", category: "日常办公", prompt: "把项目目标拆解成任务、负责人和时间点" },
  { name: "文案润色", title: "帮我润色工作汇报，让表达清晰简洁", category: "日常办公", prompt: "帮我润色工作汇报，让表达清晰简洁" },
  { name: "业务分析", title: "分析业务数据，找出增长机会", category: "数据分析", prompt: "分析业务数据，找出增长机会" },
  { name: "指标解读", title: "帮我解读经营指标，梳理变化原因", category: "数据分析", prompt: "帮我解读经营指标，梳理变化原因" },
  { name: "销售对比", title: "对比各区域销售表现，整理关键差异", category: "数据分析", prompt: "对比各区域销售表现，整理关键差异" },
  { name: "异常排查", title: "帮我识别数据异常，列出核查步骤", category: "数据分析", prompt: "帮我识别数据异常，列出核查步骤" },
  { name: "分析提纲", title: "围绕业务目标，生成数据分析报告提纲", category: "数据分析", prompt: "围绕业务目标，生成数据分析报告提纲" },
  { name: "制度问答", title: "根据我提供的制度，解答适用范围和要求", category: "知识学习", prompt: "根据我提供的制度，解答适用范围和要求" },
  { name: "资料摘要", title: "帮我提炼资料要点，整理核心结论", category: "知识学习", prompt: "帮我提炼资料要点，整理核心结论" },
  { name: "知识梳理", title: "把零散资料整理成结构化知识提纲", category: "知识学习", prompt: "把零散资料整理成结构化知识提纲" },
  { name: "学习计划", title: "根据学习目标，制定四周学习计划", category: "知识学习", prompt: "根据学习目标，制定四周学习计划" },
  { name: "术语解释", title: "用通俗语言解释专业术语，并举例说明", category: "知识学习", prompt: "用通俗语言解释专业术语，并举例说明" },
]

export const homeRecommendationCategories = [
  { id: "hr", label: "人事服务" },
  { id: "travel", label: "差旅出行" },
  { id: "office", label: "日常办公" },
  { id: "data", label: "数据分析" },
  { id: "knowledge", label: "知识学习" },
].map((category) => ({ ...category, items: homeRecommendations.filter((item) => item.category === category.label) }))

