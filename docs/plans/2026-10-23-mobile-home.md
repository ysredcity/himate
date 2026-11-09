# 独立移动端首页实施记录

目标：在 apps/mobile 独立实现用户已确认的 Figma 1931:24400 首页及必要 Mock 交互。
架构：React 19 / TypeScript / Vite 8 / Tailwind v4 / Base UI；桌面与移动无源码交叉导入，根 npm workspace 与唯一 lockfile 统一管理。

1. 在 apps/mobile 建立 Vite、TypeScript 和包命令；复用现有 Button、Input 和工具函数的本地副本。
2. 将 Figma 素材下载到 public/figma-home，assets.ts 映射素材，home-data.ts 管理首页条目，conversation-data.ts 管理模拟过程与示例产物。
3. 在 components/home-sections.tsx 实现首页区块、轮播、应用分页、生活服务与可见余额；App.tsx 管理会话和配置；components/sheet.tsx 基于 Base UI 实现底部抽屉。
4. 新增移动端 Token 与素材检查，补齐根命令和治理边界；运行 npm run gate，浏览器验证手机宽度、配置、详情、模拟对话与示例产物。
5. 更新 ADR、架构、设计、README、changelog、current 与 handoff；保留已有桌面修改，不提交、不推送。

用户已在本聊天确认前一轮界面需求。未另外创建 worktree，按用户要求在现有分支推进。
