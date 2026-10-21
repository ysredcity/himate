export const homeAssets = {
  "img2": "/figma-home/6e8e6.png",
  "imgIcon3": "/figma-home/4f5a0.png",
  "imgIcon4": "/figma-home/e21dd.png",
  "imgIcon5": "/figma-home/6720e.png",
  "imgIcon6": "/figma-home/d9092.png",
  "imgIcon7": "/figma-home/4f96a.png",
  "imgIcon8": "/figma-home/afbe1.png",
  "imgIcon9": "/figma-home/86d3c.png",
  "imgIcon10": "/figma-home/bdf6a.png",
  "imgIcon11": "/figma-home/c7bcf.png",
  "imgGuideImg": "/figma-home/713b5.png",
  "imgGuideImg1": "/figma-home/bb2c3.png",
  "imgGuideImg2": "/figma-home/0542d.png",
  "imgGuideImg3": "/figma-home/f4264.png",
  "imgGuideImg4": "/figma-home/8258e.png",
  "imgGuideImg5": "/figma-home/d548a.png",
  "imgGuideImg6": "/figma-home/f76cf.png",
  "imgGuideImg7": "/figma-home/6588c.png",
  "imgImage": "/figma-home/a7f04.png",
  "imgImage1": "/figma-home/58bb4.png",
  "imgImage2": "/figma-home/8d315.png",
  "imgImage3": "/figma-home/200cc.png",
  "imgImage4": "/figma-home/3d597.png",
  "imgImage5": "/figma-home/5a3cf.png",
  "imgImage6": "/figma-home/8fe09.png",
  "imgImage7": "/figma-home/a4be9.png",
  "imgImage8": "/figma-home/50457.png",
  "imgImage9": "/figma-home/42235.png",
  "imgImage10": "/figma-home/68788.png",
  "imgImage11": "/figma-home/4b793.png",
  "imgImage12": "/figma-home/74f8f.png",
  "imgImage13": "/figma-home/46f43.png",
  "imgImage14": "/figma-home/c4c62.png",
  "imgImage15": "/figma-home/6c649.png",
  "imgIcon": "/figma-home/47e6d.svg",
  "imgIcon1": "/figma-home/c2c7f.svg",
  "imgIcon2": "/figma-home/c07f5.svg",
  "imgSlotPreviewcardItems": "/figma-home/9d103.svg",
  "imgChevronRight": "/figma-home/feb9f.svg",
  "imgIndentIncrease": "/figma-home/a5e49.svg",
  "imgChevronRight1": "/figma-home/7f394.svg",
  "imgCalendarFold": "/figma-home/480a3.svg",
  "imgSettings2": "/figma-home/b55ff.svg",
  "imgCheck": "/figma-home/be471.svg"
} as const

export const homeRecommendations = [
  { title: "我要请假", category: "人资", prompt: "我要请假" },
  { title: "帮我查询一下我上个月的工资单", category: "人资", prompt: "帮我查询一下我上个月的工资单" },
  { title: "帮我发起一个出差申请", category: "差旅", prompt: "帮我发起一个出差申请" },
  { title: "整理会议纪要，提炼结论和行动项", category: "办公", prompt: "整理会议纪要，提炼结论和行动项" },
  { title: "生成项目周报，汇总进展与计划", category: "办公", prompt: "生成项目周报，汇总进展、风险与计划" },
  { title: "分析业务数据，找出增长机会", category: "数据", prompt: "分析业务数据，找出增长机会" },
]

export const homeReports = ["海信全球营销竞争大屏", "数字化门店", "经营指标看板", "海信全球营销竞争大屏", "财数聚", "财数聚", "财数聚", "财数聚", "财数聚", "财数聚"].map((title, index) => ({ id: `report-${index}`, title, category: "销售", updated: "1小时前更新" }))

export const homeApplications = [
  { name: "签到", image: homeAssets.imgIcon3 },
  { name: "信件", image: homeAssets.imgIcon4 },
  { name: "SCM", image: homeAssets.imgIcon5 },
  { name: "信马", image: homeAssets.imgIcon6 },
  { name: "健康打卡", image: homeAssets.imgIcon7 },
  { name: "餐厅满意度", image: homeAssets.imgIcon8 },
  { name: "理发预约", image: homeAssets.imgIcon9 },
  { name: "智造云图", image: homeAssets.imgIcon10 },
  { name: "智慧物流园区", image: homeAssets.imgIcon11 },
  { name: "理发预约", image: homeAssets.imgIcon9 },
  { name: "健康打卡", image: homeAssets.imgIcon7 },
  { name: "智造云图", image: homeAssets.imgIcon10 },
].map((item, index) => ({ ...item, id: `app-${index}` }))

export const homeAgents = [homeAssets.imgGuideImg, homeAssets.imgGuideImg1, homeAssets.imgGuideImg2, homeAssets.imgGuideImg3, homeAssets.imgGuideImg4, homeAssets.imgGuideImg5, homeAssets.imgGuideImg6, homeAssets.imgGuideImg7].map((image, index) => ({
  id: `agent-${index}`, title: "项目推进专家", image, verified: [0, 1, 3, 7].includes(index),
  description: "面向跨部门项目，梳理目标、进度、风险和责任人，输出可执行推进计划。",
  prompt: "生成项目周报，汇总进展、风险与计划",
}))

export const homeCourses = [
  { title: "体验与服务设计", image: homeAssets.imgImage, due: true },
  { title: "AI时代数据治理基础", image: homeAssets.imgImage1 },
  { title: "负责任的AI", image: homeAssets.imgImage2 },
  { title: "Explaining and Clarifying 解释和说明", image: homeAssets.imgImage3 },
]

export const homeNews = [
  { title: "贾少谦董事长印尼座谈：要卖好产品，更要用好独特优势讲好品牌故事，实现价值向上穿透！", image: homeAssets.imgImage4, source: "有信", time: "1小时前", badge: true },
  { title: "拾光而来，翻阅你的2025专属记忆", image: homeAssets.imgImage5, source: "有信", time: "1天前", badge: true },
  { title: "国家主席习近平为特朗普总统举行欢迎宴会，贾少谦董事长等中美企业家代表受邀参加", image: homeAssets.imgImage6, source: "有信", time: "3天前", badge: true },
  { title: "海信与东帝汶战略签约", image: homeAssets.imgImage7, source: "有信", time: "1小时前", badge: true },
  { title: "春风浩荡三十载，青春奋进启新程—海信空调30周年庆典", image: homeAssets.imgImage8, source: "有信", time: "1小时前", badge: true },
  { title: "小满未满，热爱正酣！一颗毛绒足球，将硬核信仰揉进温柔陪伴~", image: homeAssets.imgImage9, source: "国际中心美食广场", time: "1小时前" },
  { title: "海信与泰达控股共识深化多元合作！", image: homeAssets.imgImage10, source: "友商资讯", time: "1天前" },
  { title: "春风浩荡三十载，青春奋进启新程—海信空调30周年庆典", image: homeAssets.imgImage11, source: "HiAI Lab", time: "1天前" },
  { title: "✨每日AI前沿资讯--06-18", image: homeAssets.imgImage12, source: "HiAI Lab", time: "1天前" },
  { title: "计划订单数据质量监控平台", image: homeAssets.imgImage13, source: "海信文创", time: "1小时前" },
  { title: "海信、清华签署深化合作，加快家庭智能产业从设备互联向主动服务转变", image: homeAssets.imgImage14, source: "海信文创", time: "1小时前" },
  { title: "海信集团、上海电气集团签署战略合作！", image: homeAssets.imgImage15, source: "海信文创", time: "1小时前" },
]
