# ADR 0002：按应用平台命名目录

- 日期：2026-10-21（Asia/Shanghai）
- 状态：已接受并实施
- 替代关系：替代 [ADR 0001](0001-repository-governance-and-app-isolation.md) 中 `app/` 和 `@himate/web` 的命名；其治理 / 应用隔离及单 lockfile 原则继续有效。
- 依据：用户指出当前为桌面网页应用，未来可能新增独立移动端应用，要求优化应用目录名称。

## 问题

`app/` 无法表达应用平台，也没有为第二个独立应用提供清晰目录层级。仅以“支持窄屏”区分移动端，会混淆现有网页的响应式适配与未来独立移动产品。

## 选项

1. `desktop-web/` 直接放根目录：含义明确，但多个应用会分散根目录。
2. `apps/desktop-web/`：应用统一归入 apps，目录名同时表达目标终端与交付形式。
3. `apps/web/`：简短，但没有体现当前以桌面网页为主的产品定位。

## 结论

采用 `apps/desktop-web/`，包名 `@himate/desktop-web`。根 npm workspace 使用 `apps/*`，现有根 dev / build / gate / preview 命令默认指向桌面网页应用。

未来独立移动端建议放 `apps/mobile/`，不在本轮创建空工程或预设 React Native / Flutter 等技术栈。需要独立移动网页时，可再采用 `apps/mobile-web/`；届时增加自己的依赖、脚本与决策。现有桌面网页的窄屏适配继续留在 desktop-web 中。

## 后果

- 构建产物路径改为 `apps/desktop-web/dist/`；安装仍在根目录，使用唯一根 lockfile。
- 根命令保持兼容；可显式使用 `npm run dev --workspace @himate/desktop-web`。
- 目录增加一层，应用内工具配置的根 node_modules 相对路径需同步。
- 当前治理检查验证 desktop-web 与根统一命令；新增独立应用时必须补充对应 gate 和文档，不能把桌面 gate 通过当作所有平台通过。
- 历史计划、归档及 changelog 保留当时路径，并通过本 ADR 说明演进，不改写历史。

## 验证

2026-10-21 验证完成：132 个源码 / 资源文件 SHA-256 一致；根干净安装、根 gate、新目录直接 gate 均通过。旧目录 / 旧 lock 条目负向检查通过。5173 预览返回 HTTP 200，浏览器 error 日志为空。既有大包构建提示仍存在；未重新审计依赖，不改变产品 UI。
