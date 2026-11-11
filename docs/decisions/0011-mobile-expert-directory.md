# ADR 0011：移动端专家列表页
- 日期：2026-11-10（Asia/Shanghai）
- 状态：已接受并实施
- 替代关系：无；沿用 [ADR 0005](0005-expert-directory-and-dispatch.md)、[ADR 0006](0006-enterprise-default-installations.md) 的规则，扩展到移动端

## 问题
用户要求移动端开发与桌面功能、交互一致的专家列表页，从会话抽屉进入；界面参考用户提供的「AI 智能体」列表截图，顶部头像区替换为桌面同款推荐轮播。

## 选项
1. 把桌面的 `expert-data.ts`、`expert-rules.ts` 及规则测试逐字复制到移动端，移动端只重写页面呈现。代价：两份数据需人工同步。
2. 抽共享包供两端导入。违反 ADR 0004「不为此创建共享包、不互相导入」，需另行决策。

## 结论
采用选项 1，用户 2026-11-10 确认四项取舍：按钮文案按 PC（召唤 / 进入）；安装与删除只在详情面板；「进入」不跳转；移动端新增搜索。
- 抽屉导航新增「专家」（沿用 `capability-hub` ID，graduation-cap 图标）；AgentShell 持有安装名单、页面可见性与返回来源，通过 `InstalledExpertsContext` 供 Composer「专家」面板实时读取。
- 召唤回到新对话页并预选专家（不自动发送）；发送时手动指定优先，否则按已安装名单自动匹配，命中已有剧本时覆盖首轮身份，与桌面一致。
- 宿主返回从专家页回到来源页（首页或 Agent 页）；专家页不显示宿主 Tab 栏。
- 移动 gate 纳入复制的 6 项专家规则测试（含头像与 Banner 背景存在性）。

## 后果
- 新增 `apps/mobile/src/components/agent-layout/expert-page.tsx`、`expert-recommendation-banner.tsx`、`expert-context.ts`、`expert-rules.ts`、`ui/alert.tsx`、`scripts/tests/expert-rules.test.ts`；`expert-data.ts` 改为桌面完整副本。
- 素材：7 个专家头像（`public/figma-home`）与 3 张 Banner 背景（`public/generated-banners`）复制自桌面并登记清单。
- Banner 去掉桌面悬停出现的左右翻页按钮，改为横向滑动 + 分页点。
- 安装名单只在内存中，刷新恢复初始 5 位（与桌面一致）。

## 验证
根 `npm run gate` 通过；Chromium 320 / 375 / 402px 宿主壳内验证抽屉入口、三 Tab 与计数、场景筛选、Banner 自动轮播 / 分页 / 详情、安装 / 企业默认锁定 / 删除、我的专家、进入不跳转、搜索与无结果、宿主返回、召唤预选、Composer 名单同步与自动匹配，无溢出与控制台告警。真机未验证。
