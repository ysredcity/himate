# 文档索引

## 最小上下文入口

每次换 Agent 从 [AGENTS.md](../AGENTS.md) 开始，再读 [当前上下文](context/current.md) 与 [最近交接](context/handoff.md)。只按任务补充阅读，历史材料不必全部加载。

## 事实与规则

| 文档 | 职责 | 何时更新 |
| --- | --- | --- |
| [当前上下文](context/current.md) | 当前产品状态、边界、最新验证和下一步 | 每次交付或中断 |
| [最近交接](context/handoff.md) | 刚完成的任务、改动入口、可继续操作的信息 | 每次交付或中断，覆盖旧内容 |
| [架构](ARCHITECTURE.md) | 工程边界、数据流、代码入口、命令 | 架构或目录变化 |
| [设计契约](DESIGN.md) | 当前认可的布局、响应式、状态与交互数值 | UI 行为或视觉规则变化 |
| [协作流程](governance/WORKFLOW.md) | 开始、实施、验证、文档更新与交付 | 协作规则变化 |
| [上下文管理](governance/CONTEXT.md) | 事实源、压缩、交接、过期内容处理 | 上下文机制变化 |
| [决策索引](decisions/README.md) | 长期架构决策及原因 | 作出新的持久决策 |
| [变更日志](../CHANGELOG.md) | 实际已实现的变化 | 每个有意义的变更 |

## 模板与计划

- [交接模板](context/handoff-template.md)：交付前复制结构更新最近交接。
- [ADR 模板](decisions/template.md)：记录一个决策，不重写已接受决策的历史原因。
- [治理迁移计划](plans/2026-10-21-project-governance.md)：本次迁移步骤和最终核销。

- [移动端实施记录](plans/2026-10-23-mobile-home.md)：已确认首页方案的实施步骤。

- [专家目录实施计划](plans/2026-11-07-expert-directory.md)：已确认的三Tab、跨页召唤与可调度名单实施步骤。

## 参考与证据

- [原始 UED 文档](reference/UED-员工智能工作台V1.0.md)：上游参考，部分描述早于当前实现。
- [Figma 素材清单](figma/asset-manifest.json)：本地 URL 和原始文件大小；资源在 `apps/desktop-web/public/figma-home/`。
- [Figma 新对话页对照截图](screenshots/new-conversation-figma.png)：设计稿还原阶段的历史截图，晚于它的交互变更以设计契约为准。
- [我的智能体设计稿还原截图](screenshots/my-agents-figma-4995.png)：节点 4995:177428 对应的新区块。
- [推荐分页截图](screenshots/recommendation-pagination.png)：分页交互的验证证据。
- [归档说明](archive/README.md)：旧模板记忆与迁移前 README，禁止当作当前部署或指令事实。

## 维护原则

同一规则只维护一个事实源，其余文档用链接引用。文档缺失或失效链接会被 `npm run check:governance` 拦截；语义一致性仍须 Agent 人工核对。
