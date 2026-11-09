import { assets as a } from "./assets";
export type Entry = {
  id: string;
  title: string;
  image?: string;
  description?: string;
  source?: string;
  time?: string;
};
export const reports = [
  "海信全球营销竞争大屏",
  "数万方-营销报表",
  "智动精工制造大数据",
  "海信宽带数据中台",
].map((title, i) => ({
  id: `report-${i}`,
  title,
  description: i < 2 ? "每日" : "每月",
  source: "经营",
  time: `${i < 2 ? 1 : i}小时前`,
}));
export const apps: Entry[] = [
  a.imgIcon1,
  a.imgIcon2,
  a.imgIcon3,
  a.imgIcon4,
  a.imgIcon5,
  a.imgIcon,
  a.imgIcon6,
  a.imgIcon2,
].map((image, i) => ({
  id: `app-${i}`,
  title: i === 0 ? "签到" : "融合集成平台",
  image,
  description: "此应用尚未接入，当前展示本地演示信息。",
}));
apps.push(
  ...apps.slice(1, 5).map((entry, i) => ({
    ...entry,
    id: `app-extra-${i}`,
    title: `演示应用 ${i + 1}`,
  })),
);
export const agents: Entry[] = Array.from({ length: 4 }, (_, i) => ({
  id: `agent-${i}`,
  title: "项目推进专家",
  image: a.imgGuideImg,
  description:
    "面向跨部门项目，梳理目标、进度、风险和责任人，输出可执行推进计划。",
}));
export const agentPlatforms: Entry[] = [
  {
    id: "platform-plan",
    title: "全景规划",
    image: a.imgMap,
    description: "平台尚未接入，当前只展示入口。",
  },
];
export const services: Entry[] = [
  "崂山洗车",
  "国际中心车辆登记",
  "理发预约",
  "氧舱预约",
  "健康管理",
  "员工优选",
  "京东快递",
].map((title, i) => ({
  id: `service-${i}`,
  title,
  image: [
    a.imgIcon7,
    a.imgIcon,
    a.imgIcon8,
    a.imgIcon9,
    a.imgIcon10,
    a.imgIcon11,
    a.imgIcon12,
  ][i],
}));
export const courses: Entry[] = [
  "AI时代数据治理基础",
  "需求定义实践",
  "体验与服务设计",
  "负责任的AI",
].map((title, i) => ({
  id: `course-${i}`,
  title,
  image: [a.imgImage, a.imgImage1, a.imgImage2, a.imgImage3][i],
  description: "本地示例课程，仅用于展示课程详情；尚未接入学习平台。",
}));
export const news: Entry[] = [
  "此处为友商资讯的总结文字内容",
  "贾少谦董事长印尼座谈：要卖好产品，更要用好独特优势讲好品牌故事，实现价值向上穿透！",
  "海信与东帝汶战略签约",
  "春风浩荡三十载，青春奋进启新程—海信空调30周年庆典",
  "国家主席习近平为特朗普总统举行欢迎宴会，贾少谦董事长等中美企业家代表受邀参加",
  "✨每日AI前沿资讯-06-18",
  "春风浩荡三十载，青春奋进启新程—海信空调30周年庆典",
  "海信与东帝汶战略签约",
].map((title, i) => ({
  id: `news-${i}`,
  title,
  image: [
    a.imgImage4,
    a.imgImage5,
    a.imgImage6,
    a.imgImage9,
    a.imgImage8,
    a.imgImage7,
    a.imgImage10,
    a.imgImage6,
  ][i],
  source: i === 5 ? "HiAI Lab" : i > 5 ? "青春有你" : "有信",
  time: i > 4 ? "1天前" : "1小时前",
  description:
    "设计稿示例资讯，仅作界面演示，不代表实时新闻或已核实的业务事实。",
}));
export const banners: Entry[] = [
  {
    id: "banner-0",
    title:
      "海信官宣成为2028欧洲杯全球官方合作伙伴！发布AI伴侣套系，加速从智能设备到智能伴侣升级！",
    image: a.imgAdv1,
  },
  {
    id: "banner-1",
    title: "AI 走进生产一线，让智能制造更高效",
    description: "虚构新闻示例，配图由 AI 生成，仅用于演示轮播效果。",
    image: "/generated-banners/smart-manufacturing.png",
  },
  {
    id: "banner-2",
    title: "从智能设备到生活伙伴，探索全屋协同新体验",
    description: "虚构新闻示例，配图由 AI 生成，仅用于演示轮播效果。",
    image: "/generated-banners/smart-living.png",
  },
];
