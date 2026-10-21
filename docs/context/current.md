# 当前项目上下文

- 更新时间：2026-10-21 21:38（Asia/Shanghai）
- 状态：首次 GitHub 同步已完成。
- 当前目标：将完整项目提交并推送到用户指定的私有 GitHub 仓库。

## 当前产品

HiMate 是企业统一 AI 工作台的沉浸式前端 Demo。已具备四类 Mock 任务、多轮对话、阶段执行与产物查看。新对话页按 Figma 实现五个业务区块，支持可配置入口、详情弹窗、容器响应式和推荐滑动分页。

当前已认可的 UI 约束在 [设计契约](../DESIGN.md)，代码入口在 [架构](../ARCHITECTURE.md)。最后一次用户 UI 要求是仅显示可用翻页方向，并增加 240ms 横向滑动；该行为已实现。

## 当前工程

应用位于 `apps/desktop-web/`，包名 `@himate/desktop-web`；根目录使用 `apps/*` npm workspace 编排命令，维护唯一 lockfile。根 `npm run gate` 包含治理检查和应用 gate。

未来独立移动端建议使用 `apps/mobile/`，尚未创建或预设技术栈；当前网页的窄屏适配仍在 desktop-web 内。根默认命令只操作桌面网页，新增应用需补充相应 gate。

已初始化本地 Git，分支 main，origin 为 https://github.com/ysredcity/himate.git；main 已推送并跟踪 origin/main；首次提交通过 GitHub API 核验一致。未配置 CI 或当前项目部署。模板旧 Agent 记忆已归档，其部署链接不属于本项目。

## 最近验证

验证日期：2026-10-21（Asia/Shanghai）。

- 迁移前后及最终复核：132 个源码与公开资源文件的 SHA-256 一致。
- 根 `npm ci --offline --ignore-scripts --no-audit --no-fund` 通过；唯一根 lockfile，无嵌套 lockfile。
- 根 `npm run gate` 通过：治理、lint、剧本、Token、TypeScript 和生产构建。
- 在 `apps/desktop-web/` 内直接运行 `npm run gate` 通过，产物位于 `apps/desktop-web/dist/`。
- 治理负向验证通过：旧 `app/` 目录重新出现、根 lockfile 残留旧 workspace 条目均会被拒绝。
- 根目录启动开发服务通过；`http://127.0.0.1:5173/` 返回 HTTP 200，浏览器首页可见且错误日志为空。
- 本轮重新运行根 `npm run gate` 通过；暂存的 183 个文件不含依赖目录、构建产物、本地环境文件或超过 100 MB 的文件，常见 Token / 私钥特征扫描未命中。
- 首次提交 `5f6843ef1c322b3ecd2ba0dc17cd2168d699eccd` 已推送；GitHub API 返回的 main 提交号与本地一致。
- 本轮未修改 UI 源码，不重复已有全部宽度交互测试；本轮未重新运行依赖安全审计。

## 已知限制

- 所有业务仍为 Mock；未连接真实模型、企业系统、实时资讯或附件正文解析。
- 页面内存状态刷新后重置；首页配置仅在当前新对话页组件生命周期内保留。
- 生产构建存在主 chunk 超过 500 kB 的已知提示。
- 2026-10-21 的早期依赖审计记录显示运行时 0 项、shadcn 开发工具链 7 项高危；本轮未重新审计，不保证该历史数字仍代表当前公告状态。
- 自动治理检查验证文件、链接和结构，不能替代文档语义核对。

## 下一步

等待下一项产品任务。新 Agent 先读 [最近交接](handoff.md)，再按任务查阅设计或架构契约。本轮首次提交、推送及远端 SHA 核验已完成；无待用户确认事项。CI / 部署和真实模型接入不在本轮范围。
