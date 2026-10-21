# HiMate · 企业 AI 工作台

基于 Pangea 沉浸式模板的独立前端应用，覆盖企业制度查询、会议纪要、项目周报和业务分析。

## 运行

```sh
npm install
npm run dev
```

## 校验与构建

```sh
npm run gate
```

包含 lint、场景结构校验、语义颜色检查、TypeScript 类型检查和生产构建。

## 主要入口

- `src/components/agent-layout/app-config.ts`：产品身份、推荐任务、助手菜单。
- `src/components/agent-layout/conversation-data.ts`：四类任务剧本和未匹配请求的说明。
- `src/components/agent-layout/panel-data.ts`：示例资料、交付文档和业务指标表。
- `src/components/agent-layout/conversation-section.tsx`：多轮对话与当前会话内存状态。
- `src/components/agent-layout/use-demo-playback.ts`：分阶段执行反馈。
- `src/components/agent-layout/agent-shell.tsx`：导航、历史会话和产物面板。

## 演示范围

所有制度、会议、项目资料及经营数字均为示例。任务通过本地剧本响应，未连接真实模型或企业系统；上传附件只展示文件信息，不解析内容。对话仅在当前页面内存中保留，刷新后恢复初始状态。

交付文档可在右侧打开、切换 Tab、全屏查看，并下载为 Markdown。窄屏下产物占满工作区，关闭后回到对话。

技术栈：Vite 8、React 19、TypeScript、Tailwind CSS v4、shadcn / Base UI、lucide-react。

## 依赖检查

运行时依赖审计为 0 个已知漏洞。模板自带的 shadcn CLI 已归入开发依赖，其上游 glob 工具链仍有 7 项高危审计记录；未使用会降级 shadcn 主版本的强制修复。生产构建仍有模板已知的主包超过 500 kB 提示。

## 新对话页

按 Figma 节点 `1971:42117` 调整，包含问候与输入区、三列分页推荐、信数报表、我的应用、我的智能体、学习与成长及资讯。设计素材存放在 `public/figma-home/`，来源清单为 `docs/figma/asset-manifest.json`。

- `home-data.ts`：首页推荐、报表、应用、智能体、课程和资讯的演示数据。
- `home-workspace-sections.tsx`：首页业务区块、配置和详情弹窗。
- `new-conversation-page.tsx`：首页装配和任务输入。

应用、课程与资讯入口使用本地演示详情；请假、工资单等未接入场景会生成需求记录，不会执行真实业务操作。首页配置仅在当前新对话页内生效。

首页卡片按工作区实际可用宽度切换列数：小于 660px 为 2 列，660–899px 为 3 列，900–1099px 为 4 列，1100px 起为 5 列。侧栏展开会自动重新计算；应用图标对应使用 4 / 6 / 8 / 12 列。
