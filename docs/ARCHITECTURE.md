# HiMate 架构

## 工程边界

本仓库按 `apps/*` 组织 npm workspace，当前已有桌面网页与独立移动网页应用；桌面应用：`apps/desktop-web/`（包名 `@himate/desktop-web`）。根目录不承载业务源码，也不直接声明应用依赖。唯一 lockfile 位于根目录；依赖由 npm 安装到 workspace 所需位置，通常为根 `node_modules/`。

- `apps/desktop-web/src/`：应用源码。
- `apps/desktop-web/public/`：可直接访问的静态资源，资源 URL 仍从 `/` 开始，目录迁移不会改变浏览器 URL。
- `apps/desktop-web/scripts/agent-ux/`：模板物化的剧本 / Token 检查，工作目录为 `apps/desktop-web/`。
- `apps/desktop-web/dist/`：构建产物，不作为源码维护。
- `docs/` 与 `scripts/governance/`：仓库级文档和治理，与应用实现分离。

采用 Vite 8、React 19、TypeScript、Tailwind CSS v4、shadcn / Base UI 和 lucide-react。状态由 React 内置能力管理；无后端、鉴权、业务持久化或状态管理库。精确依赖版本以 `package-lock.json` 为准。

## 多端边界

独立应用按平台放在 `apps/` 下。独立移动网页位于 `apps/mobile/`，包名 `@himate/mobile`，沿用现有前端栈。它与桌面窄屏适配分别维护，不交叉导入源码。根默认开发/构建命令仍指向桌面，根 gate 覆盖两应用。

## 运行链路

```text
apps/desktop-web/src/App.tsx
  → ImmersiveAgentApp
  → AgentShell（会话、导航、主题与产物生命周期）
  → ExpertPage（专家目录，与对话工作区互斥显示）
  → ChatWorkspace
      ├─ NewConversationPage（新对话入口与首页区块）
      └─ ConversationPage → ConversationSection → ConversationFlow / Composer
  → ArtifactPanel / ImageViewer（按产物类型打开）
```

用户通过推荐或输入发起委托。首句匹配剧本 trigger，命中时播放对应 Mock 场景；未命中时生成任务需求记录，并明确尚未执行业务处理。追问通过相同场景工厂生成，追加到当前对话，并回写壳层内存状态。进度由 `use-demo-playback.ts` 分阶段推进；它不调用真实工具。

产物内容在数据层定义，通过中立 target 路由到面板或图片查看器。同产物再次打开只激活已有 Tab。切换对话清理产物面板；所有会话状态在刷新后恢复初始值。

## 按任务找文件

以下路径相对 `apps/desktop-web/src/components/agent-layout/`：

| 任务 | 入口 |
| --- | --- |
| 专家市场推荐轮播 | `expert-recommendation-banner.tsx`，数据在 `expert-data.ts`的expertRecommendations |
| 专家目录、卡片、详情与筛选 | `expert-page.tsx` |
| 专家资料、来源与演示匹配规则 | `expert-data.ts` |
| 可调度上限、去重与名单内匹配 | `expert-rules.ts`；测试在 `scripts/tests/expert-rules.test.ts` |
| 产品身份、导航与助手菜单 | `app-config.ts` |
| 左侧导航展开态 / 图标栏 / 对话悬停窗口 | `sidebar.tsx`（`AgentSidebar`、`AgentSidebarRail`）；形态切换在 `agent-shell.tsx` |
| 首页布局与推荐预填 | `new-conversation-page.tsx` |
| 首页分类推荐展开 / 收起 | `home-recommendations.tsx` |
| 首页演示条目、素材引用 | `home-data.ts` |
| 首页报表 / 应用 / 智能体 / 课程 / 资讯区块与弹窗 | `home-workspace-sections.tsx` |
| 我的智能体标题右侧平台工具条 | `home-agent-hub.tsx`；数据 / 静态图标引用在 `home-data.ts`，阴影 Token 在 `theme.css` |
| 新增 / 修改 Mock 剧本与自然语言触发 | `conversation-data.ts`、`scenes.ts` |
| 修改产物内容 | `panel-data.ts` |
| 对话追加与页面内存回写 | `conversation-section.tsx`、`agent-shell.tsx` |
| 输入、附件、内联上下文、上传 Tooltip | `composer.tsx` |
| 分阶段演示执行 | `use-demo-playback.ts` |
| 产物 Tab / 容器 / 类型 | `artifact-panel.tsx`、`panel-types.ts`、`panel-registry.ts`、`panel-containers.tsx` |
| 注册图标与资源映射 | `icon-registry.ts`、`resource-visuals.tsx` |

首页和对话页直接复用同一个 `composer.tsx`，视觉默认值集中在 Composer；页面只配置业务状态与菜单方位，避免分别维护外观。

基础组件位于 `apps/desktop-web/src/components/ui/`；物化的共享运行时位于 `apps/desktop-web/src/agent-ui/`，不依赖 Skill 仓库的 workspace 包。主题与 Markdown 排版通过 `apps/desktop-web/src/index.css` 引入。

## 命令与验证

根 `npm run gate` 先运行 [治理检查](../scripts/governance/check.mjs)，再依次运行桌面与移动应用 gate。桌面 gate：lint → 专家规则测试 → 剧本结构 → Token → TypeScript → Vite build。根 `dev` 与 `preview` 将 `--` 后的参数传给应用脚本。

`npm run build` 输出到 `apps/desktop-web/dist/`。部署若在未来引入，必须显式指定该目录；本仓库当前没有有效部署配置，历史模板链接不属于本项目发布事实。

## 决策

工程拆分原因见 [ADR 0001](decisions/0001-repository-governance-and-app-isolation.md)，当前平台命名见 [ADR 0002](decisions/0002-platform-specific-app-directories.md)。

## 独立移动端

入口 `apps/mobile/src/App.tsx` 装配 Agent 壳层 `components/agent-layout/agent-shell.tsx`，并通过 `renderHome` 插槽渲染工作台首页（首页区块在 `components/home-sections.tsx`，配置与详情底部抽屉在 `components/sheet.tsx`）。`home-data.ts` 提供首页示例；静态资源映射在 `assets.ts`，下载清单在 `public/figma-home/manifest.json`。状态只在内存中保存。

根 `npm run dev:mobile` 使用 5174，`npm run build:mobile` 输出 `apps/mobile/dist/`，`npm run preview:mobile` 使用 4174，`npm run gate:mobile` 执行 lint、语义颜色/素材校验、TypeScript 与构建。运行约定见 [ADR 0004](decisions/0004-independent-mobile-web.md)。

## 专家目录与召唤

AgentShell持有页面选择、scheduledExpertIds（默认企业hr / travel，加3位普通示例），数据只在内存中保存。沿用capability-hub导航ID增加专家入口，不扩充共享导航契约。召唤通过homeExpert交接给ChatWorkspace → NewConversationPage → 现有Composer，回首页只预选并聚焦。目录打开清理产物，不创建新会话。

首页发送与后续轮次均通过expert-rules的resolveDelegatedExpert：手动指定优先，无指定只在名单中匹配；无匹配则通用助手。已有Mock剧本被自然语言命中时，壳层使用本轮解析出的专家覆盖剧本身份；历史会话不回写。15条目录为示例，当前10位支持直接召唤，其余5位仅进入；只有可召唤专家可安装并参与名单内匹配演示，“进入”无跳转。边界见[ADR 0005](decisions/0005-expert-directory-and-dispatch.md)。

`npm run test:experts --workspace @himate/desktop-web`使用Node自带测试运行器和类型剥离，无新增测试依赖，根gate已纳入。

专家目录当前不含收藏功能；“已安装”对应内部scheduledExpertIds自动调度名单。卡片与详情共用ExpertActions，当前为底部左右分置独立Button，左安装状态 / 删除，右召唤 / 进入及对应右侧图标。已物化的标准base-nova `components/ui/button-group.tsx`保留为基础组件，目前此处不再使用，不增加依赖。市场与我的专家中已安装按钮禁用；删除安装仅在已安装Tab提供。

企业默认安装与计额见[ADR 0006](decisions/0006-enterprise-default-installations.md)。expert-rules.ts集中规范化安装列表、只统计非enterpriseDefault的20位额度并保护删除入口，企业默认始终可自动匹配。Header计数为总数，列表Alert显示额度说明；默认目录15条、已安装5位（2默认+3普通）。UI Alert从base-nova标准组件物化，复用既有cva / cn，不增加依赖。

## 移动宿主预览边界

`apps/mobile/src/main.tsx` 根据 `preview=web` 选择产品App或默认HostPreviewLayout。`src/preview/host-preview-layout.tsx` 与 `host-preview.css` 管理系统状态栏、工作台导航、飞书Tab栏和宿主说明；通过同源iframe加载纯网页入口，不与产品共享状态。App.tsx只管理HiMate首页、对话、输入与产物弹窗。产品页面不设返回按钮；宿主 header 返回按钮通过 `src/preview/host-bridge.ts` 的同源 postMessage 通知产品逐层返回，产品无可返回层级时宿主显示说明，见 [ADR 0009](decisions/0009-host-back-navigation.md)。底部 Tab 栏显隐由产品经 `himate:tab-bar` 告知宿主（仅首页显示）。明暗主题由宿主 header 切换，经同一协议的 `himate:theme` 下发给产品，宿主内抽屉不再显示切换；飞书 Tab 栏为 Token + `public/host-tabs/` 图标分层，见 [ADR 0010](decisions/0010-host-theme-control.md)。详见 [ADR 0007](decisions/0007-mobile-host-preview-container.md)。Composer 聚焦时产品发 `himate:keyboard`，宿主在网格底部弹出 `host-keyboard.tsx` 模拟键盘（iframe 随之缩短），按键经 `himate:key-input` 回传产品，见 [ADR 0013](decisions/0013-host-simulated-keyboard.md)。

专家能力以canSummon统一约束：expert-data.ts导出summonableExperts供app-config和Composer专家视觉映射使用；桌面Composer专家菜单由AgentShell按installedExpertIds覆盖config.composerExpertOptions，只列已安装专家，并经ChatWorkspace → 首页 / 对话页 → ConversationSection把onBrowseExperts传给Composer，用于“查看更多专家”打开目录。安装规范化、计额和自动匹配过滤不可召唤专家，安装函数额外返回unsupported；界面无安装入口不替代领域校验。初始5位均支持召唤。

## 移动端 Agent 模式

`apps/mobile/src/` 物化了 pangea-design-ai 沉浸式模板：`agent-ui/`（对话运行时、剧本引擎、主题）、`components/agent-layout/`、`components/ui/`（模板 Base UI 基础件，覆盖原 Button/Input 本地副本，内容一致）、`hooks/`。不从 desktop-web 导入。

```text
App.tsx → AgentShell（会话列表、共用抽屉、深浅色、产物生命周期、homeVisible）
  ├─ renderHome → WorkbenchHome（.mobile-app 浅色首页，输入框 → 新对话，历史 → 抽屉）
  ├─ ChatWorkspace → NewConversationPage / ConversationPage（无页内返回按钮）
  └─ ArtifactPanel（<740px 全屏）/ ImageViewer
```

| 任务 | 入口（`components/agent-layout/`） |
| --- | --- |
| 身份、抽屉导航、欢迎语与推荐 | `app-config.ts` |
| 剧本与触发词 | `conversation-data.ts`、`scenes.ts`；初始会话列表在 `App.tsx` |
| 产物内容 | `panel-data.ts`（示例图片在 `public/samples/`） |
| 头像与图标映射 | `resource-visuals.tsx`、`icon-registry.ts` |
| 首页与 Agent 页切换、返回 | `agent-shell.tsx`、`chat-workspace.tsx` |
| 移动端专家列表页、轮播、详情 | `expert-page.tsx`、`expert-recommendation-banner.tsx`；名单状态在 `agent-shell.tsx`，经 `expert-context.ts` 供 Composer 读取 |
| 专家数据与规则（桌面 `expert-data.ts` / `expert-rules.ts` 逐字副本，修改时两端同步） | `expert-data.ts`、`expert-rules.ts`；测试 `apps/mobile/scripts/tests/expert-rules.test.ts`；头像在 `public/figma-home`，Banner 在 `public/generated-banners` |
| 移动端顶栏玻璃按钮 / 胶囊 | `mobile-header.tsx`（新对话页、对话页共用） |
| 移动端 Composer（新对话页与对话页共用） | `mobile-composer.tsx`；接入在 `new-conversation-page.tsx`、`conversation-section.tsx`。模板 `composer.tsx` 只保留类型与 PC 实现，移动端不渲染 |

主题：`index.css` 引入 `agent-ui/immersive/theme.css`（Token 写在 `:root` / `.dark`），首页与宿主壳在 `.mobile-app` / `.host-preview` 上重新声明浅色 Token。移动 gate：lint → `check:scripts`（模板剧本校验）→ `check:tokens` → TypeScript + 构建。边界见 [ADR 0008](decisions/0008-mobile-agent-mode-template.md)。

尺寸缩放：产品页面以 402px 为基准等比缩放。`vite.config.ts` 内联 PostCSS 插件在构建 / 开发时把 CSS 声明中的 px 换成 rem（≤1px 与媒体查询除外），`main.tsx` 只在 `preview=web` 时给 html 加 `design-scale`（根字号 min(100vw,480px)/402×16），行内样式尺寸经 `src/lib/design-scale.ts` 的 `rem()` 输出。未新增依赖，见 [ADR 0012](decisions/0012-mobile-proportional-scaling.md)。
