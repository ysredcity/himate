# HiMate · 企业 AI 工作台

基于 Pangea 沉浸式模板的企业 AI 工作台前端 Demo。应用代码位于 **`apps/desktop-web/`**；仓库根目录负责治理、文档与统一命令。

## 开始使用

Node.js 22.12+（22 系列）或 24+，npm 11。当前验证环境为 Node 24 / npm 11。

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 5173
```

打开 [本地预览](http://127.0.0.1:5173/)。所有命令在仓库根目录执行：

| 命令 | 用途 |
| --- | --- |
| `npm run dev` | 启动 `apps/desktop-web/` 的开发服务 |
| `npm run gate` | 治理检查 + 应用完整质量检查与构建 |
| `npm run check:governance` | 文档、链接、工程边界及命令路由检查 |
| `npm run build` | 类型检查和生产构建，输出 `apps/desktop-web/dist/` |
| `npm run preview -- --host 127.0.0.1 --port 4173` | 预览已有生产构建 |

本仓库使用 npm workspaces 和唯一根 `package-lock.json`。在根目录安装依赖，不在 `apps/desktop-web/` 创建第二份 lockfile。需要直接操作应用时，也可 `cd apps/desktop-web` 后运行 `npm run dev` 或 `npm run gate`。

## 目录

```text
HiMate/
├── AGENTS.md                 # 所有 Agent 的统一协作规则
├── CHANGELOG.md              # 已实现的变更历史
├── CLAUDE.md / GEMINI.md     # 共享规则的工具入口指针
├── package.json              # npm workspace 和统一命令
├── package-lock.json         # 唯一依赖锁
├── apps/                     # 按平台组织的独立应用
│   └── desktop-web/          # 当前桌面网页应用
├── docs/                     # 文档、上下文、决策与验证证据
└── scripts/governance/        # 仓库级治理检查
```

未来独立移动端建议放在 `apps/mobile/`，本轮尚未创建或预设技术栈。当前桌面网页的响应式适配继续在 `desktop-web/` 内维护。根命令当前默认针对桌面网页，新增应用后需补充相应命令和质量检查。

## 换一个 Agent 继续工作

将以下内容交给新 Agent：

> 先读取仓库根目录 AGENTS.md，再读取 docs/context/current.md 和 docs/context/handoff.md。按本轮任务查阅架构或设计契约，实施后运行根目录 npm run gate，并更新 changelog 与上下文。

[文档索引](docs/README.md) · [当前状态](docs/context/current.md) · [协作流程](docs/governance/WORKFLOW.md) · [变更日志](CHANGELOG.md)

## 版本管理

代码仓库：[ysredcity/himate](https://github.com/ysredcity/himate)（私有）；默认分支 `main`。根目录为 Git 仓库。提交和推送按用户授权执行，CI、部署及版本发布尚未配置。

## 当前产品范围

支持企业制度查询、会议纪要、项目周报和业务分析四类本地剧本，包含执行反馈、多轮对话和产物预览。新对话页参照 Figma，包含报表、应用、智能体、学习和资讯入口。

所有制度、资料、数字和资讯均为示例，未接真实模型、企业系统或实时资讯；附件仅展示元数据，不解析正文。对话只保留在页面内存中，刷新后重置。已知限制与最近验证结果见 [当前上下文](docs/context/current.md)。
