# ADR 0010：明暗主题由宿主容器切换
- 日期：2026-11-08（Asia/Shanghai）
- 状态：已接受并实施
- 替代关系：替代 [ADR 0008](0008-mobile-agent-mode-template.md) 中「切换按钮在抽屉底部」一条；Agent 模式与抽屉支持深色、首页固定浅色的范围不变

## 问题
用户 2026-11-08 要求把明暗切换从会话抽屉移到宿主容器顶部右侧，由容器层切换，宿主容器本身也跟随切换；底部飞书 Tab 栏去掉悬停效果，并分层以支持深色。

## 选项
1. 宿主持有主题状态，通过已有同源 postMessage 协议（ADR 0009）下发 `himate:theme`，iframe 内产品只跟随。代价：协议多一条消息。
2. 宿主与产品各自监听 localStorage `storage` 事件。同源 iframe 可用，但时序依赖浏览器实现，首次加载仍需额外同步。
3. Tab 栏继续使用整张截图，深色时加滤镜。反相会改坏彩色图标与徽标，不可用。

## 结论
采用选项 1。
- `host-bridge.ts` 新增 `THEME` 消息与 `readStoredDarkMode`；宿主 header 右侧 44px 太阳 / 月亮按钮切换，写 localStorage 并下发；iframe `onLoad` 时补发一次。
- AgentShell 在宿主内（`renderHome` 且有父窗口）隐藏抽屉底部切换，只接收消息；纯网页入口 `?preview=web` 仍保留抽屉切换。
- 飞书 Tab 栏拆为：底色、1px 分隔线、文字（13/16px）、Home Indicator 用 Token；6 个图标从原截图抠为透明 PNG（`public/host-tabs/`，清单纳入素材检查），位置按截图 1080px 换算到 402px。Tab 按钮无悬停与点按高亮，点击仍只显示「未接入」说明。
- 宿主深色 Token 写在 `.dark .host-preview` 上；状态栏深色素材在深色下反相。首页 `.mobile-app` 仍固定浅色。

## 后果
- 原整图 `figma-home/53a53.png` 不再被宿主 Tab 栏引用，保留在素材清单中。
- 宿主深色的 Tab 选中蓝 `#6f95ff` 为推导色，非设计稿给定。

## 验证
根 `npm run gate` 通过；Chromium 402px：浅色 / 深色下宿主、Tab 栏、Agent 页随宿主切换，首页保持浅色；抽屉无切换按钮；刷新后主题保持；Tab 悬停背景保持透明；图标位置与截图一致；无控制台错误。真机未验证。
