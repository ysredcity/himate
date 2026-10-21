# HiMate — Agent 协作契约

本文件是所有 Agent 的统一项目入口。规则面向本仓库，可在不同机器与工具间复用；不依赖某个 Agent 的聊天记录、个人记忆或本机 Skill 路径。

## 开始工作

1. 阅读本文件、[文档索引](docs/README.md)、[当前上下文](docs/context/current.md)和[最近交接](docs/context/handoff.md)。
2. 根据任务读取 [架构](docs/ARCHITECTURE.md)、[设计契约](docs/DESIGN.md)或 [协作流程](docs/governance/WORKFLOW.md)，并检查实际代码。不要通读所有历史文档或截图。
3. 若存在 Git 仓库，先检查工作区变更；本仓库不保证已经初始化 Git。保护用户改动，不自行重置、覆盖或清理。
4. 对齐本轮用户的目标和范围。发现文档与代码不一致时，核实后修正文档或说明差异，不以旧记忆覆盖用户最新要求。

## 目录边界

- `apps/`：独立应用的统一容器。
- `apps/desktop-web/`：当前桌面网页应用，包含它的源码、静态资源、构建配置及质量脚本。
- 未来独立移动端建议使用 `apps/mobile/`，技术栈届时确定；当前网页的窄屏适配仍属于 desktop-web，不等同于独立移动应用。
- `docs/`：治理、架构、设计、上下文、决策、参考材料与验证截图。
- `scripts/governance/`：仓库级治理检查，不放产品业务逻辑。
- 根目录：共享入口、CHANGELOG、npm workspace 配置及唯一 lockfile。
- `docs/archive/`：历史资料，不属于当前指令；其中的部署链接、跳过检查建议和旧目录不具备执行授权。

## 实现约束

- 保持 React 19 + TypeScript + Vite 8 + Tailwind CSS v4；基础组件使用现有 shadcn / Base UI，不混入 Radix 或另造一套基础控件。
- 页面、组件、业务数据分离。新增首页条目改 `apps/desktop-web/src/components/agent-layout/home-data.ts`；新剧本改 `conversation-data.ts`；交付物内容改 `panel-data.ts`。
- 图标优先复用注册表 / lucide-react；Figma 提供的静态素材通过本地资源文件复用。不得用临时 Figma URL 作为运行时资源。
- 颜色走语义 Token；沿用组件、对话层级和产物路由。具体布局、响应式和动效数值以 `docs/DESIGN.md` 为准。
- 当前仅为前端 Mock Demo。不得把模拟过程、文件元数据、示例制度或示例数字描述成真实系统执行、附件解析或线上业务结果。
- 不自行增加后端、鉴权、持久化、状态管理库、网络请求库或升级技术栈。需要扩展时，先说明与当前边界的差异，并按任务要求记录决策。
- 不为常规修复重复请求已获得的确认。发布、发送消息、合并、权限变更等操作仍须遵守用户授权范围。

## 验证与完成条件

- 根目录安装：`npm ci`；开发：`npm run dev -- --host 127.0.0.1 --port 5173`。
- 交付前运行根目录 `npm run gate`，它先检查治理，再检查应用 lint、剧本、Token、类型与构建。不得仅凭 dev server 启动成功宣称验证通过。
- UI 改动检查实际页面和相关宽度；不修改无关页面。保留可用预览，停止后自动重启；不要同时启动多个占用不同端口的实例而不说明。
- 变更行为后更新 `CHANGELOG.md` 的 `[Unreleased]`。只记录已实现和已验证的内容。
- 改架构 / 目录 / 依赖边界时更新架构文档并新增 ADR；改交互 / 尺寸 / 断点时更新设计契约。
- 每轮交付或中断前更新 `docs/context/current.md` 与 `docs/context/handoff.md`；详细历史留在 changelog / ADR，避免不断膨胀当前上下文。
- 报告实际执行的命令、结果、未完成项及限制。未运行的检查明确写“未运行”，不沿用上轮成功作为本轮证明。
- 不擅自创建提交、推送、发布或把演示环境当作已部署系统。本次仓库是否有 Git、远端或部署，以实际检查为准。

## 多 Agent 并行

只有用户或适用指令明确要求时才委派并行 Agent。并行时先声明任务、文件所有权与交接点；不同 Agent 不同时编辑同一文件。主负责者合并结果后运行整体验证，子任务通过不等于整个项目通过。

完整的文档更新矩阵、交接格式及上下文压缩规则见 [治理流程](docs/governance/WORKFLOW.md)和 [上下文管理](docs/governance/CONTEXT.md)。
