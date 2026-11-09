# 当前项目上下文

- 更新时间：2026-11-09（Asia/Shanghai）
- 状态：移动端阶段性完成；桌面端专项开发中（本轮：左侧导航收起改为图标栏）。
- 当前分支：`feat/home-agents-figma`，已推送到 `origin/feat/home-agents-figma`（2026-11-09 提交 `ea0b263`，含此前全部桌面、移动、治理改动）。2026-11-09 已快进合并到 `main` 并推送，`main` 与 `origin/main` 一致。唯一未提交的是待确认的 `apps/desktop-web/.wbapp_7UjS5tv1ZodAgwr2UUfpui.genie` 残留文件。
- 截至 2026-11-08 22:50 的逐轮完整记录已归档到 [archive/context-2026-11-08](../archive/context-2026-11-08/current.md)，需要追溯细节时再读。

## 当前产品

HiMate 是员工智能工作台的前端 Mock Demo，无后端、鉴权、持久化，状态刷新即重置。

### 桌面端 `apps/desktop-web/`（下一阶段重点）

- 左侧导航：展开 240px / 收起 52px 图标栏（默认图标栏）。已置顶、对话各一个图标，悬停在右侧弹出对话列表窗口；<660px 或开启产物且 <980px 退为抽屉。规则见设计契约「对话与产物」。
- 首页：新对话入口、分类推荐、报表 / 应用 / 智能体 / 课程 / 资讯区块；「我的智能体」按 Figma 5027:181735（标题右侧三个分段平台入口 + 八张白底卡片，悬停柔和阴影）。
- 对话：四类任务剧本（L3 每步含过程说明 `detail`）、多轮对话、L1/L2/L3 执行过程、产物面板与图片查看器（物化的 pangea-design-ai 沉浸式模板）。
- 专家目录（侧栏 graduation-cap 入口）：市场 / 我的专家 / 已安装三个 Tab，15 条示例（4 条个人发布）。10 位可召唤且可安装，5 位仅「进入」不可安装；个人安装上限 20 位，另有 2 位企业默认（不计额、不可删除），初始已安装 5 位。名单内按本地关键词自动匹配，手动指定优先。Composer 专家菜单只列已安装专家，底部「查看更多专家」打开目录。规则在 `expert-rules.ts`，有 6 项 Node 测试。见 ADR 0005、0006。
- 专家推荐 Banner（`expert-recommendation-banner.tsx`）：180px，3 张主题背景 WebP（生成说明 `docs/reference/expert-banner-generation.md`），5 秒自动轮播、分页长条、悬停出现的左右翻页按钮。

### 移动端 `apps/mobile/`（本阶段已完成，暂不改动）

402px 基准的工作台首页（宿主预览壳 + iframe），Agent 模式新对话 / 对话页（独立 MobileComposer：推荐分类、专家、图片上传演示、语音演示），宿主 header 负责返回与明暗切换，飞书 Tab 栏分层。决策见 ADR 0004、0007–0010，规则见 [设计契约](../DESIGN.md)「独立移动端首页」与「移动端 Agent 模式」。

## 工程与运行

- 根 npm workspace（`apps/*`），唯一 lockfile；React 19 / TypeScript / Vite 8 / Tailwind v4 / shadcn + Base UI / lucide-react。两应用不互相导入源码。
- 桌面：`npm run dev -- --host 127.0.0.1 --port 5173 --strictPort` → http://127.0.0.1:5173/ （2026-11-09 已启动运行）。
- 移动：5174 被 HR-Portal 的 AskHR 占用，使用 `npm run dev:mobile -- --port 5175` → http://127.0.0.1:5175/ （宿主）、`?preview=web`（纯网页）。22:50 在运行。
- 交付前运行根 `npm run gate`（治理 → 桌面 lint / 专家测试 / 剧本 / Token / 类型 / 构建 → 移动 gate）。

## 最近验证

| 检查 | 日期 | 结果 |
| --- | --- | --- |
| 根 `npm run gate` | 2026-11-09 | 见 handoff（双端主包均超 500 kB，构建提示保留） |
| 桌面图标栏 / 对话悬停窗口浏览器实测（Playwright，1280 / 700 / 659px，浅色 + 深色） | 2026-11-09 | 通过 |
| `git diff --check` | 2026-11-08 | 通过 |
| 桌面专家页 / Banner 浏览器视觉复测 | 2026-11-07～08 | **大部分未完成**（当时 CUA getTab 超时），仅 755px 下 Banner 布局做过检查 |
| 移动端浏览器链路（320/375/402px） | 2026-11-08 | 通过，见归档记录 |

## 限制

- 所有业务、数字、专家、资讯均为示例；无模型、企业系统、附件解析、支付或宿主平台接入。
- 依赖审计：2026-10-23 报告 7 项高危，此后未重新审计。
- 未做真机、软键盘与辅助技术全面测试。

## 下一步（桌面）

见 [最近交接](handoff.md)。
