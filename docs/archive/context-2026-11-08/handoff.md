# 最近交接

- 更新时间：2026-11-08 10:00（Asia/Shanghai）
- 状态：移动端 Agent 模式与独立移动 Composer、新对话页设计稿还原完成；桌面专家页视觉复测仍待补。
- 分支：feat/home-agents-figma；保留全部既有未提交变更，未提交或推送。

## 本轮完成（移动端 Agent 模式）

- 需求文档经用户确认：身份改 HiMate（名称 + 首页头像），其余用 pangea-design-ai 沉浸式模板示例数据；首页输入框点击进新对话页、不聚焦；首页历史按钮打开与 Agent 模式共用的会话抽屉；抽屉能力入口只留「新对话」；深色只覆盖 Agent 模式与抽屉，抽屉内手动切换；同意新增依赖与 ADR 0008。
- 改动入口：`apps/mobile/src/App.tsx`（装配 AgentShell + WorkbenchHome）、`components/agent-layout/agent-shell.tsx`（renderHome、openSidebar、backToHome）、`chat-workspace.tsx` / `new-conversation-page.tsx` / `conversation-page.tsx`（返回工作台）、`app-config.ts`、`resource-visuals.tsx`、`agent-ui/immersive/contracts.ts`（himate 头像）、`index.css`（主题分区）、`scripts/check-tokens.mjs`、`package.json`。
- 删除 `apps/mobile/src/conversation-data.ts` 与 `home-data.ts` 的 `prompts`；「使用此智能体」改为进入新对话页、不再预填。
- 需求文档里的 `next-themes` 模板未使用，未安装；需求文档中的新文件 `mobile-agent-shell.tsx` 改为在模板 `agent-shell.tsx` 上加插槽实现，避免复制 400 行壳层。

## 本轮追加（移动 Composer 与新对话页）

- 新增 `mobile-composer.tsx`（Figma 2903:46039），`new-conversation-page.tsx` 按 Figma 5271:62234 重写，`conversation-section.tsx` 改用移动 Composer 并隐藏 AI 生成提示；`resource-visuals.tsx` 增加专家线性图标与短名称；`chat-workspace.tsx` 移动底色改白；`index.css` 补 `no-scrollbar`。
- 待确认：推荐文案用模板示例还是设计稿的人事示例；对话页顶栏尚未按设计稿调整（未提供对话页设计）。

## 本轮追加（宿主返回）

- 页内「返回工作台」按钮已删除；宿主 header 返回经 `src/preview/host-bridge.ts` 驱动 AgentShell 逐层返回，首页时显示宿主说明。改动：`host-preview-layout.tsx`、`agent-shell.tsx`、`chat-workspace.tsx`、`new-conversation-page.tsx`、`conversation-page.tsx`；ADR 0009。

## 验证

根 `npm run gate`、`git diff --check` 通过；320/375/402px 浏览器链路、深色、首页像素对比、宿主 iframe 检查通过，详见 [当前上下文](current.md)。未做真机验证。

## 下一步

- 预览：宿主 http://127.0.0.1:5175/ ，纯网页 http://127.0.0.1:5175/?preview=web （5174 仍是 AskHR）。
- 可选：模板确认卡「操作人」原文为「智能助手」，按用户要求未改；移动主包 852kB 可考虑按需加载。
- 桌面 http://127.0.0.1:5173/ 仍需复测专家页“已安装”文字、市场筛选深灰反白、页尾移除与 Alert 简化。

## 本轮追加（推荐列表统一）

- `agent-ui/conversation/recommendation-list.tsx` 改为移动设计稿规格；`new-conversation-page.tsx` 专家推荐改用该组件。两页快捷专家按钮本来就是同一组件、样式一致。
- 对话页顶栏已按 Figma 2516:59109 调整（见下）。

## 本轮追加（Composer 过渡与对话页顶栏）

- `mobile-composer.tsx` 改为单一结构 + 高度过渡；新增 `mobile-header.tsx`（GlassAction / GlassActionGroup）；`conversation-page.tsx` 顶栏重写，删除未用的 HeaderAction 与 useMediaQuery。

## 本轮追加（首页输入胶囊）

- `apps/mobile/src/index.css`：`.composer` / `.composer input` 内边距按设计稿调整，新增 `--composer-glass`。历史按钮红点已实现（见下）。

## 桌面端运行（2026-11-08 08:38 Asia/Shanghai）

按用户请求启动 `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`，预览 http://127.0.0.1:5173/ 。HTTP成功，页面标题“HiMate · 企业 AI 工作台”，监听进程工作目录核验为HiMate/apps/desktop-web。根 `npm run gate`本轮通过，双端既有大包提示保留；未修改产品代码，未运行浏览器交互检查。保留既有移动端和桌面待复测记录。

## 本轮追加（历史徽标与图片上传）

- 改动：`agent-shell.tsx`（hasAttention）、`App.tsx` + `index.css`（徽标）、`mobile-composer.tsx`（上传）、新增 `upload-samples.ts`、`conversation-flow.tsx`（图片缩略图、空气泡）、`ui/sheet.tsx`（overlayClassName）、`image-viewer.tsx`（nativeButton 告警）。
- 待确认：示例里「等待回复」状态不会因用户回复而清除，徽标会一直显示；如需回复后清除，需要改会话状态模型。

## 桌面专家推荐Banner（2026-11-08 08:47 Asia/Shanghai）

专家市场筛选器上方新增expert-recommendation-banner.tsx；配置在expert-data.ts的expertRecommendations（人事 / 差旅 / 经营分析3条），点击查看打开原详情。参考用户截图为浅绿底、左文案右视觉，复用HiMate本地6e8e6.png和目录头像；24px下间距，16px圆角，宽 / 窄最小高196 / 208px，窄宽装饰淡化。

每5秒自动切换、300ms水平过渡，循环上下页、分页和暂停按钮。悬停 / 焦点 / 页面不可见暂停，减少动态效果停播并禁过渡，非当前页inert / aria-hidden。数据与呈现分离，无新依赖，其他Tabs和安装逻辑不改。

本轮根 `npm run gate`通过（6项专家测试含推荐数据有效性、治理、双端lint / Token / 类型 / 构建），`git diff --check`通过，桌面预览HTTP200。CUA getTab再次超时，实际轮播计时 / 暂停 / 详情跳转及相关宽度视觉未完成浏览器复测，无本轮截图。大包提示保留，本轮未修改移动源码，既有其他聊天记录保留。

## 桌面专家Banner简化（2026-11-08）

专家导航图标改graduation-cap。Banner仅保留本地4a142.png背景、标题和描述，cover / right center使窄宽裁剪左侧；移除上下页及播放暂停控件、眉题和头像装饰，分页6px圆点置于16px按钮内、零gap。圆点点击选页后停止自动轮播，其他暂停条件保留。改动入口为expert-recommendation-banner.tsx与icon-registry.ts；未改移动源码、未提交或推送。

验证：本轮根npm run gate通过（治理、双端lint / 剧本 / Token / 类型 / 构建、6项专家测试），git diff --check通过，5173预览HTTP200；实际浏览器755px视口下检查侧栏收起 / 展开时Banner布局、分页切换、graduation-cap图标，并确认背景100% 50% / cover。既有双端主包超500kB提示保留；本轮未重复全部专家业务流程。

## 本轮追加（一卡通插图）

- `apps/mobile/src/index.css` `.balance-decoration`：去掉重复的 opacity 0.2，右距 14px。

## 本轮追加（余额默认隐藏）

- `home-sections.tsx` 默认隐藏余额、切换图标；`index.css` `.balance-masked` 与隐藏态图标色。

## 桌面专家Banner主题背景（2026-11-08）

Banner固定180px、标题 / 描述间距4px，分页激活为20×6px胶囊（按钮宽28px，普通16px）；背景按推荐数据background字段选择3张新生成WebP，右对齐cover裁剪。素材及完整生成提示见docs/reference/expert-banner-generation.md。未改移动源码、未提交推送。

验证：本轮根npm run gate通过（含6项专家测试、双端构建），原大包提示保留；逐张检查生成图，浏览器getTab超时，实际页面视觉复测未完成。git diff --check通过；桌面预览保留5173。

## 桌面Banner翻页微调（2026-11-08）

expert-recommendation-banner.tsx分页按钮普通12px / 激活20px、长条14×6px；左右翻页按钮32px圆形、距两侧8px、垂直居中，悬停 / 焦点进入时出现，触屏常显，不透明背景和阴影。点击循环翻页并停止自动轮播。180px高度与主题图保持不变，未改移动源码、未提交推送。

本轮根npm run gate通过（6项专家测试及双端lint / 剧本 / Token / 类型 / 构建），git diff --check通过，5173 HTTP200；原大包警告保留。浏览器getTab超时，实际悬停 / 点击和宽度视觉复测未运行。

## 本轮追加（宿主主题与 Tab 栏）

- 改动：`preview/host-preview-layout.tsx`、`preview/host-preview.css`、`preview/host-bridge.ts`、`agent-shell.tsx`、`sidebar.tsx`（showThemeToggle）、`index.css`（宿主 Token）、新增 `public/host-tabs/`、`scripts/check-tokens.mjs`；ADR 0010。
- 待确认：宿主深色下 Tab 选中蓝为推导色，若有飞书深色稿可替换。


## 移动推荐分类修正（2026-11-08 22:01 Asia/Shanghai）

按用户最新四点要求实现composer-recommendations.tsx，新对话/对话页通过MobileComposer共用：五分类横滑、无更多，列表在标签上方；激活深灰白字+X，再点收起，始终保留标签。分类只改局部状态不改草稿/专家；条目按桌面name/title显示，点击填入prompt和item.expert，无expert时清空专家，等待发送。移除旧按专家推断的两处推荐列表及更多面板，数据副本仍为五类25项，不跨应用导入。此前“选择分类即选专家”的交互已替代。

浏览器验证全部五类各五条、无更多、分类无副作用、X与激活、上方列表、项目周报title/prompt差异、人事/差旅专家归属及无expert条目清除专家、新对话发送/对话页选择、320/375/402px无溢出和无页面错误；截图mobile-category-list.png。根 `npm run gate` 通过，激活样式最后调整后移动gate与浏览器复测再次通过；原大包提示保留，未做真机测试，桌面源码未改，5175服务保留。

## 新对话欢迎区精简（2026-11-08 22:38 Asia/Shanghai）

new-conversation-page.tsx移除猜你想做/换一换，仅保留欢迎语。MobileComposer透传onRecommendationsOpenChange，由composer-recommendations.tsx选择状态通知页面；打开隐藏欢迎语，关闭恢复。列表title单行truncate，gap4px/分隔线左右2px，name固定，点击仍用完整prompt。对话正文不受此回调影响。

浏览器320/375/402px验证欢迎语默认显示、打开隐藏/收起恢复、无猜你想做、单行20px/ellipsis及窄屏实际溢出截断、完整差旅指令与专家填入、无页面溢出和无运行错误。截图mobile-welcome-recommendations.png。本轮根 `npm run gate` 通过（治理、专家测试与双端lint/剧本/Token/类型/构建）；原大包提示及其他未验证事项保留，未做真机测试，5175预览保留。
