# ADR 0008：移动端 Agent 模式物化沉浸式模板
- 日期：2026-11-07（Asia/Shanghai）
- 状态：已接受并实施；主题切换入口由 [ADR 0010](0010-host-theme-control.md) 替代
- 替代关系：无；扩展 [ADR 0004](0004-independent-mobile-web.md) 的移动端依赖边界

## 问题
移动端只有工作台首页，底部输入只连到一个本地简易对话视图。用户要求从首页进入 Agent 模式的新对话页和对话页，调用 pangea-design-ai，完全遵循其沉浸式 Agent 模板，并直接使用模板示例数据。首页与 Agent 模式是两个独立页面，但共用同一个会话抽屉。

## 选项
1. 把 pangea-design-ai `immersive-starter` 的 `agent-ui/`、`components/agent-layout/`、`components/ui/`、`hooks/` 复制进 `apps/mobile`，在模板壳层加首页插槽。代价：移动端新增 Markdown、日期、Toast、字体依赖，主包变大。
2. 从 desktop-web 导入已物化的模板代码。违反 ADR 0004「两应用不互相导入源码」。
3. 手写一套移动端对话组件。无法满足「完全遵循模板」，且会产生第二套对话结构。

## 结论
采用选项 1（用户 2026-11-07 在本聊天确认需求文档与依赖）。
- 模板代码复制到 `apps/mobile/src/`，路径与模板一致（`@/agent-ui`、`@/components/agent-layout` 等），不从 desktop-web 导入。
- 新增依赖：`@fontsource-variable/geist`、`date-fns`（锁定 4.4.0）、`react-day-picker`（锁定 10.0.1）、`react-markdown`、`remark-gfm`、`sonner`、`tw-animate-css`。需求文档列出的 `next-themes` 在模板运行时未被引用，未安装。
- 模板的定制只有：`agent-shell.tsx` 增加可选 `renderHome` 首页插槽与返回工作台；两个页面顶栏增加返回按钮；`app-config.ts` 身份改为 HiMate、抽屉导航只保留「新对话」；`resource-visuals.tsx` 增加 `himate` 产品头像。剧本、面板、专家与推荐数据保持模板原文。
- 主题：模板 Token 写在 `:root` / `.dark`，Agent 模式与抽屉支持深色，切换按钮在抽屉底部；首页与宿主壳在 `.mobile-app` / `.host-preview` 上重新声明浅色 Token，不随深色变化。

## 后果
- 首页不再有本地简易对话视图，删除旧 `src/conversation-data.ts` 与 `prompts` 示例；首页输入框只读，点击进入新对话页；历史按钮打开共用抽屉；「使用此智能体」进入新对话页（不再预填）。
- 移动 gate 增加 `check:scripts`（模板剧本结构校验）；`check:tokens` 忽略 Tailwind `shadow-[...]` 任意值中的投影色。
- 移动主包约 852 kB（gzip 约 267 kB），超出 500 kB 提示，与桌面及模板已知问题一致，未做代码分割。
- 模板确认卡「操作人」字段原文仍为「智能助手（代表当前用户执行）」，属于示例数据，按用户要求未改。

## 验证
见 [当前上下文](../context/current.md) 2026-11-07 移动 Agent 模式一节：根 `npm run gate`、320 / 375 / 402px 浏览器链路与宿主壳检查。未做真机验证。
