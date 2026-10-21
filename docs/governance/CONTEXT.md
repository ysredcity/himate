# 上下文管理

## 分层与唯一事实源

| 层 | 文件 | 内容 |
| --- | --- | --- |
| 共享契约 | [AGENTS.md](../../AGENTS.md) | 所有 Agent 共同遵循的工作边界和完成条件 |
| 当前快照 | [current.md](../context/current.md) | 现在能做什么、当前任务、验证、限制、下一步 |
| 最近交接 | [handoff.md](../context/handoff.md) | 刚才改了什么、去哪里继续、有哪些中断点 |
| 稳定规则 | [架构](../ARCHITECTURE.md)、[设计](../DESIGN.md) | 目录 / 数据流与交互约束 |
| 决策原因 | [ADR](../decisions/README.md) | 为什么这样设计、替代方案与后果 |
| 变更历史 | [CHANGELOG](../../CHANGELOG.md) | 已实现的变化 |
| 原始参考 | `docs/reference/`、`docs/figma/`、`docs/screenshots/` | 来源与当时的验证证据 |
| 历史归档 | [archive](../archive/README.md) | 过期资料，不作为当前指令或部署事实 |

## 最小加载顺序

1. AGENTS、current、handoff。
2. 任务涉及架构就读架构，涉及 UI 就读设计契约。
3. 只读相关代码、ADR 或引用资料；无须加载所有素材和旧对话。

`CLAUDE.md`、`GEMINI.md` 和 Copilot 入口只指向共享契约，禁止维护独立规则副本。其他 Agent 若不自动加载它们，用户可直接要求读取 AGENTS。

## 更新与压缩

- 每次交付或中断覆盖 current / handoff，写明更新时间（Asia/Shanghai）和状态。
- current 面向“当前事实”，handoff 面向“接手操作”；不要复制对话全文、命令日志或长代码块。
- 稳定结论迁入架构 / 设计，历史变化迁入 changelog，长期取舍迁入 ADR。
- 过期上下文若需要保留，移入 archive 并标明历史来源。禁止删除或悄悄改写用户资料。
- 可用性、构建、审计、部署等时效结论必须带验证日期和范围。旧成功不能代替本次验证。

## 中断时最少保留

记录当前目标、已完成项、未完成项、改动文件、上一个有效检查、确切下一条命令及任何仍需用户决定的事项。状态明确区分“完成 / 进行中 / 阻塞”，不要让下个 Agent 猜测。

## 一致性校验的边界

`npm run check:governance` 自动验证文档是否存在、相对链接是否有效、应用是否独立放置及命令是否正确转发。它不能判断文档叙述是否过时，也不能证明 Agent 实际阅读了文档。交付前必须人工对照代码和用户要求。
