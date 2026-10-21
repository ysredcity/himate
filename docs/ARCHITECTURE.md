# HiMate 架构

## 工程边界

本仓库按 `apps/*` 组织 npm workspace，当前已有一个桌面网页应用：`apps/desktop-web/`（包名 `@himate/desktop-web`）。根目录不承载业务源码，也不直接声明应用依赖。唯一 lockfile 位于根目录；依赖由 npm 安装到 workspace 所需位置，通常为根 `node_modules/`。

- `apps/desktop-web/src/`：应用源码。
- `apps/desktop-web/public/`：可直接访问的静态资源，资源 URL 仍从 `/` 开始，目录迁移不会改变浏览器 URL。
- `apps/desktop-web/scripts/agent-ux/`：模板物化的剧本 / Token 检查，工作目录为 `apps/desktop-web/`。
- `apps/desktop-web/dist/`：构建产物，不作为源码维护。
- `docs/` 与 `scripts/governance/`：仓库级文档和治理，与应用实现分离。

采用 Vite 8、React 19、TypeScript、Tailwind CSS v4、shadcn / Base UI 和 lucide-react。状态由 React 内置能力管理；无后端、鉴权、业务持久化或状态管理库。精确依赖版本以 `package-lock.json` 为准。

## 多端边界

独立应用按平台放在 `apps/` 下。未来独立移动端建议使用 `apps/mobile/`，尚未创建工程或选择技术栈；它与桌面网页在窄屏上的响应式适配是两件事。未来新增应用时需补充对应文档和 gate；当前根默认命令只验证桌面网页应用。

## 运行链路

```text
apps/desktop-web/src/App.tsx
  → ImmersiveAgentApp
  → AgentShell（会话、导航、主题与产物生命周期）
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
| 产品身份、导航与助手菜单 | `app-config.ts` |
| 首页布局与推荐翻页 | `new-conversation-page.tsx` |
| 首页演示条目、素材引用 | `home-data.ts` |
| 首页报表 / 应用 / 智能体 / 课程 / 资讯区块与弹窗 | `home-workspace-sections.tsx` |
| 新增 / 修改 Mock 剧本与自然语言触发 | `conversation-data.ts`、`scenes.ts` |
| 修改产物内容 | `panel-data.ts` |
| 对话追加与页面内存回写 | `conversation-section.tsx`、`agent-shell.tsx` |
| 输入、附件、内联上下文、上传 Tooltip | `composer.tsx` |
| 分阶段演示执行 | `use-demo-playback.ts` |
| 产物 Tab / 容器 / 类型 | `artifact-panel.tsx`、`panel-types.ts`、`panel-registry.ts`、`panel-containers.tsx` |
| 注册图标与资源映射 | `icon-registry.ts`、`resource-visuals.tsx` |

基础组件位于 `apps/desktop-web/src/components/ui/`；物化的共享运行时位于 `apps/desktop-web/src/agent-ui/`，不依赖 Skill 仓库的 workspace 包。主题与 Markdown 排版通过 `apps/desktop-web/src/index.css` 引入。

## 命令与验证

根 `npm run gate` 先运行 [治理检查](../scripts/governance/check.mjs)，再转发到应用 gate：lint → 剧本结构 → Token → TypeScript → Vite build。根 `dev` 与 `preview` 将 `--` 后的参数传给应用脚本。

`npm run build` 输出到 `apps/desktop-web/dist/`。部署若在未来引入，必须显式指定该目录；本仓库当前没有有效部署配置，历史模板链接不属于本项目发布事实。

## 决策

工程拆分原因见 [ADR 0001](decisions/0001-repository-governance-and-app-isolation.md)，当前平台命名见 [ADR 0002](decisions/0002-platform-specific-app-directories.md)。
