# ADR 0013：宿主预览壳模拟系统键盘
- 日期：2026-11-11（Asia/Shanghai）
- 状态：已接受
- 替代关系：无；扩展 [ADR 0009](0009-host-back-navigation.md) 的同源 postMessage 协议

## 问题
用户要求宿主容器增加模拟键盘：Composer 处于键盘输入（聚焦）状态时，从底部弹出键盘。桌面浏览器预览没有系统键盘，无法检查 Composer 在键盘上方的位置与页面可用高度。

## 选项
1. 产品内自绘键盘：键盘属于系统层，放在产品里会让纯网页入口与真机也出现假键盘，不合适。
2. 宿主壳绘制键盘，覆盖在 iframe 上：网页视口高度不变，Composer 会被挡住，与真机不符。
3. 宿主壳绘制键盘，作为网格的一行，iframe 随之缩短：与 iOS / Android WebView 调整视口的效果一致。

## 结论
采用方案 3：
- 产品 → 宿主 `himate:keyboard {open}`：MobileComposer 的 textarea 聚焦 / 失焦 / 卸载时发送；同时给产品 html 加 `data-host-keyboard`，让 `--host-bottom-inset` 归零（键盘自带 Home Indicator 区）。
- 宿主 → 产品 `himate:key-input {key}`：模拟键盘的字母、空格、退格、发送。产品插入到光标位置；发送等同 Enter。不做拼音候选与真实输入法。
- 键盘按键在 pointerdown / mousedown 阻止默认行为，避免点击键盘时 iframe 内输入框失焦。
- 纯网页入口（无父窗口）不发送消息、不显示键盘。

## 后果
- 影响：`src/preview/host-bridge.ts`、`host-preview-layout.tsx`、新增 `host-keyboard.tsx`、`host-preview.css`、`src/index.css`（键盘取色 Token 与 inset 归零）、`mobile-composer.tsx`。
- 键盘高度固定 336px（iOS 402 宽拼音键盘示意），弹出 / 收起 250ms 高度过渡，尊重减弱动效。
- 首页底部「发消息或按住说话」入口与专家搜索框不触发模拟键盘（本次只覆盖 Composer）。
- 2026-11-12 补充：新增 `src/hooks/use-host-keyboard.ts`，普通文本框可通过它接入模拟键盘（目前用于专家「申请权限」抽屉的申请理由）。

## 验证
2026-11-11 Playwright 宿主 402×874：聚焦前 iframe 高 786、键盘 0；聚焦后键盘 336、iframe 450、底部 Tab / Home Indicator 隐藏、产品 inset 为 0；依次点 h、i、空格、大写 + M 得到「hi M」，删除后「hi 」，输入框保持聚焦；点「发送」后消息发出、输入框清空；失焦后键盘收起、iframe 恢复 786。真机未验证。
