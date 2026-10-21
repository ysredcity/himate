# ADR 0003：接入 Git 与 GitHub

- 日期：2026-10-21（Asia/Shanghai）
- 状态：已接受并实施
- 依据：用户明确要求将项目代码推送到 `https://github.com/ysredcity/himate`。

## 问题与结论

此前工程未初始化 Git。已核实目标为用户可写入的空私有仓库，默认分支为 main。

初始化本地 Git，以 `main` 为当前分支，设置 `origin` 为指定 HTTPS 仓库；首次提交包含应用、治理、文档和必需的本地设计素材。保留单一根 lockfile，排除 node_modules、dist、日志、本地环境变量及缓存。

根开发与 gate 命令不改变。新增 Git 不代表配置了 CI、部署或发布服务，也不构成未来自动提交、推送或合并的永久授权。

## 授权与凭据

本轮提交和推送由用户明确请求授权。使用已有 Git credential helper；不把 Token、密码或个人凭据写进工程。CLI 网络代理失效时，仅为本次 Git 远端命令覆盖 http.proxy，不修改用户全局配置。

## 验证

2026-10-21 根 `npm run gate` 通过。首次提交成功推送后，通过 GitHub API 读取 main，核对远端提交号与本地一致。实际同步结果见 [最近交接](../context/handoff.md)。
