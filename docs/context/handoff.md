# 最近交接

- 更新时间：2026-11-09（Asia/Shanghai）
- 状态：完成（桌面左侧导航收起形态改为图标栏）
- 本轮目标：③ Composer 专家菜单只列已安装并加「查看更多专家」。① 增加「专家」入口后，左侧导航收起时不再完全隐藏，改为只保留图标；已置顶、对话各一个图标，悬停在右侧打开对话列表窗口。② 预置对话的 L3 步骤补充过程文本。

## 第七项：Composer 专家头像与专家页一致

- `ExpertAvatar` 新增可选 `src`，有图片时渲染 `<img>`（默认 24px、rounded-md），无图片仍走原图标逻辑。`composer.tsx` 按名称从 `expertCatalog` 取 `avatar`，菜单项与 Chip 均为 20px 圆形（按用户要求由 5px 圆角改为圆形）。
- 实测：菜单 5 张图均加载成功且 src 与专家页一致；选中财税助手后 Chip 为同一图片；无报错。根 `npm run gate` 通过。
- 未改：对话流中由专家执行的轮次开头头像（`AgentAvatar` → `expertVisualKey`）仍是图标头像。

## 第六项：图标栏顶部产品头像

- `sidebar.tsx` 的 `AgentSidebarRail` 顶部改为一个按钮：默认 28px 产品头像，悬停 / focus-visible 时头像淡出、IndentIncrease 淡入（`group/expand` 控制透明度），可访问名与 Tooltip 仍为「展开导航」。
- 实测 1280px：默认透明度 头像 1 / 图标 0，悬停 0 / 1 并出现 Tooltip，点击展开侧栏；无报错。根 `npm run gate` 通过。专家页搜索框白色填充（card）也在本轮。

## 第五项：专家页搜索

- `expert-page.tsx`：Header 右侧搜索框（`role="search"`），`matchesQuery` 匹配名称 / 角色 / 简介 / 场景 / 标签；`baseLists` 为 Tab 原数据，`lists` 为搜索后数据。无结果缺省态与「清空筛选」只在有关键词且原数据非空时出现，否则沿用原空状态。
- 实测（Playwright 1280 / 700px）：市场 15 → “会议” 1 条，Banner 与分类保留；无结果显示缺省态且分类仍在；清空筛选恢复 15 条并聚焦搜索框；已安装“助手” 3 条且 Alert 保留；我的专家“助手” 1 条且说明保留；Esc 清空；700px 无溢出；无报错。根 `npm run gate` 通过。
- 取舍：参考图文案「切换分类、排序」中的“排序”当前没有对应功能，已改写为“切换分类”；关键词跨 Tab 保留。

## 第四项：产品头像换 HiMate 标识

- 源文件 `~/Downloads/himate-graph.svg`（用户提供，白色单色 512×512）内联为 `resource-visuals.tsx` 的 `HiMateMark`，`fill` 改为 currentColor；`AgentAvatar` 的产品头像保留 primary 圆底，只换图标。侧栏顶部与对话身份同步生效。源 SVG 未复制进仓库。
- 按用户要求放大标识：对话头像 14→16px（圆底 24px 不变），侧栏顶部 16→20px（圆底 28px 不变）。
- 实测：浅色 / 深色侧栏与对话头像截图正常；根 `npm run gate` 通过。

## 第三项：Composer 专家菜单只列已安装

- `agent-shell.tsx` 用 `installedExpertIds` 生成 `composerConfig`（覆盖 `composerExpertOptions`）传给 ChatWorkspace；`onBrowseExperts = openExpertDirectory` 经 ChatWorkspace → 首页 / 对话页 → ConversationSection 传到 `composer.tsx`，专家子菜单底部加分隔线与「查看更多专家」（ArrowUpRight）。
- 实测：首页菜单为 5 位初始已安装 + 入口；点入口进入专家市场且侧栏专家激活；安装「会议协作助手」后对话页菜单变为 6 位；无控制台报错。根 `npm run gate` 通过。
- 已知取舍：列表按目录顺序，新安装的专家插在中间而不是追加到末尾；召唤未安装专家的路径不受影响（召唤只对可召唤专家，选中后的 Chip 照常显示）。

## 第二项：L3 过程文本

- `conversation-data.ts` 的 `step()` 改为必填 `detail`，四个预置场景与 `createDraftScene` 的每步都写了过程说明，数字对照 `panel-data.ts` 核过（如 3,000 → 3,400 万元、华东 60% 增量、检查清单 9 项、10 月 21 日为周三）。
- `use-demo-playback.ts`：播放中 `detail` 与 `actions` 一样只在该步完成后显示，避免提前透出结果。
- 实测：区域业务分析展开过程、新发送会议纪要的播放中与完成态截图正常，控制台无报错；根 `npm run gate` 通过。

## 已完成

- `sidebar.tsx` 新增 `AgentSidebarRail`（52px）：展开导航、首页 · 新对话、专家、已置顶（Pin）、对话（MessagesSquare）、深浅色切换。已置顶 / 对话使用 Base UI Popover `openOnHover`，窗口内复用原对话行（Badge、更多菜单）；更多菜单打开期间窗口不关闭，菜单关闭或选中对话后收起。分组有未读 / 等待回复 / 等待批准时显示红点。
- `ConversationMenuItem` 增加可选 `onMenuOpenChange`，展开侧栏行为不变。
- `agent-shell.tsx`：`sidebarDocked` 改为「桌面常驻（展开或图标栏）」，展开 / 图标栏按 `sidebarOpen` 切换，宽度 240 ↔ 52 过渡；拖拽产物面板时扣除实际导航宽度。窄屏抽屉规则不变。
- 页面顶栏「展开导航」「新对话」按钮因 `isSidebarDocked` 语义变化，在图标栏常驻时自动隐藏，抽屉形态下仍显示。
- 文档：DESIGN「首页」「对话与产物」、ARCHITECTURE 文件索引、CHANGELOG、current。

## 验证

| 命令 / 检查 | 日期 | 结果 |
| --- | --- | --- |
| 根 `npm run gate` | 2026-11-09 | 通过（exit 0；主包超 500 kB 提示保留） |
| `git diff --check` | 2026-11-09 | 通过 |
| Playwright 实测（1280 浅 / 深色、700、659px） | 2026-11-09 | 通过：图标栏 52px；悬停打开窗口、移出关闭；更多菜单打开时窗口保持；点击对话后窗口关闭并进入对话、分组图标激活；键盘回车打开；专家 Tooltip 与激活；展开 / 收起切换；700px 有图标栏、659px 退为抽屉，均无横向溢出；控制台无报错 |

未执行：开启产物面板时 980px 两侧的切换、触屏设备上的悬停替代（点击可打开）。

## 运行与下一步

桌面预览运行中：http://127.0.0.1:5173/ 。

剩余桌面待办（需用户确认）：

1. 专家页 / Banner 的浏览器视觉复测（上轮遗留）。本轮深色截图中 Banner 标题文字对比很弱，可能是轮播切换瞬间或深色主题问题，未排查。
2. 专家召唤 → 首页 Composer 预选 → 发送的完整链路复测。
3. 主包超过 500 kB 的代码分割评估。

## 注意事项

- 2026-11-11 按用户要求把第五～七项桌面改动与移动端专家目录（另一对话完成）一起提交，合并到 `main` 并推送两个分支；`.ued-tmp/` 加入 `.gitignore`。
- 2026-11-11 按用户要求把第五～七项桌面改动与移动端专家目录（另一对话完成）一起提交为 `55e93b8`，`main` 与 `feat/home-agents-figma` 同步推送；`.ued-tmp/` 加入 `.gitignore`。
- 2026-11-09 按用户要求提交并推送：`ea0b263` → `origin/feat/home-agents-figma`（新建远端分支）；随后按用户要求快进合并到 `main` 并推送，未走 PR。本机代理 127.0.0.1:7890 不可用，Git 命令临时绕过代理，未改全局配置。`apps/desktop-web/.wbapp_7UjS5tv1ZodAgwr2UUfpui.genie` 为 WorkBuddy 发布配置，用户决定保留，已加 `*.genie` 到 `.gitignore`。
- 原首页左上角带红点的「展开导航」按钮现在只在抽屉形态出现；图标栏上的红点按对话状态显示，并非原设计稿的固定装饰红点。
- 移动端未改动。
- 2026-11-08 23:10 追加（移动端）：关闭 hover 变体与 Tooltip，改动 `apps/mobile/src/index.css`、`components/ui/tooltip.tsx`、`components/ui/field.tsx`、`agent-ui/conversation/conversation-surface.tsx`；402px 浏览器检查 7 处元素悬停前后背景不变、无 Tooltip、更多菜单正常、无控制台告警；移动预览 5175 在运行。
- 2026-11-08 23:40 追加（移动端）：Composer「+」面板新增「专家」二级列表，新增 `apps/mobile/src/components/agent-layout/expert-data.ts`（桌面数据副本）与 4 个头像素材；`app-config.ts` 合入已安装专家。320/375px 浏览器检查列表、搜索、无结果、返回重置、查看更多提示、选中后 Chip 与对话身份，无溢出与告警。**桌面专家数据变动时需同步此副本。**
- 2026-11-10 18:50 追加（移动端）：宿主 Tab 栏仅首页显示，新增 `himate:tab-bar` 消息（`host-bridge.ts`、`agent-shell.tsx`、`host-preview-layout.tsx`、`host-preview.css`）。402px 验证首页 / 首页抽屉显示、新对话 / 对话页隐藏、返回首页恢复、深色与刷新正常，无告警；截图 docs/screenshots/mobile-host-tabbar.png。
- 2026-11-10 19:10 追加（移动端）：Home Indicator 透明叠层（`host-preview.css`），Agent 页底部预留由 `agent-shell.tsx` 设置 `--host-bottom-inset`、`chat-workspace.tsx` 使用。402px 验证 iframe 到底、面板连续无分隔线、输入框距底 46px、深浅色横条颜色、回首页重置为 0。
- 2026-11-10 19:20 追加（移动端）：`mobile-composer.tsx` 按住说话模式显示「+」，添加图片 / 选专家后退出语音模式；375px 验证位置与文字模式一致、两条路径均切回并显示内容，无告警。
- 2026-11-10 21:10 追加（移动端）：按住说话模式内显示图片附件区，不再因添加图片退出该模式（`mobile-composer.tsx` 抽出共享 `attachmentList`）。375px 验证 56→140px、上传 / 失败 / 移除、两模式切换保留图片，无告警。待确认：按住说话模式选专家是否也应保持该模式。
- 2026-11-10 22:30 追加（移动端）：专家列表页完成（ADR 0011），新增 `expert-page.tsx`、`expert-recommendation-banner.tsx`、`expert-context.ts`、`expert-rules.ts`、`ui/alert.tsx`、规则测试，`agent-shell.tsx` / `sidebar.tsx` / `chat-workspace.tsx` / `new-conversation-page.tsx` / `mobile-composer.tsx` / `app-config.ts` / `icon-registry.ts` 接入；截图 docs/screenshots/mobile-expert-directory.png。**桌面专家数据或规则变动时须同步移动副本。**
- 2026-11-10 22:40 追加（移动端）：推荐指令改为蒙层（`composer-recommendations.tsx` 拆为标签行 + `RecommendationItems`，蒙层在 `mobile-composer.tsx`），`new-conversation-page.tsx` 不再隐藏欢迎语。375px 验证三种关闭方式、标签样式不变、输入框在蒙层上可点、选择填入与专家、对话页可用，无告警；截图 docs/screenshots/mobile-recommendation-overlay.png。
- 2026-11-11 07:35 追加（移动端）：`composer-recommendations.tsx` 推荐指令 16/24px、48px 行高、18px 箭头；402px 实测无溢出。
- 2026-11-11 07:50 追加（移动端）：`expert-context.ts` 增加 openExperts，「查看更多专家」进入专家页；推荐箭头 ArrowDownLeft；`mobile-composer.tsx` 分类行仅单行键盘态显示。402px 验证 6 种状态显隐、箭头、从对话页进入专家页并返回，无告警。
- 2026-11-11 09:00 追加（移动端）：欢迎语整页居中已撤回，改为 `pt-36`（144px，原 96px）；402×874 宿主内欢迎语顶部距网页顶 208px，无告警。
- 2026-11-11 09:20 追加（移动端）：标签白底、欢迎语 28px、对话页隐藏分类行（`conversation-section.tsx` 传 `showRecommendations={false}`）、待批准 Composer 去掉 opacity-70 并改占位文案（`mobile-composer.tsx`）。375px 实测三种页面状态符合，无告警。
- 2026-11-11 09:30 补验（移动端）：上一轮误用 375px 视口，已按 402 基准在宿主外壳（402×874）复测：Composer 宽 370px、标签白底、欢迎语 28/36px 顶部 208px、对话页无分类行、待批准不透明且占位提示正确，无溢出无报错。**移动端验证默认以 402×874 宿主外壳为准，320/375 仅作窄屏补充。**
- 2026-11-11 09:45 追加（移动端）：试加的分类标签投影已撤回，回到白色填充 + 描边、无投影。
- 2026-11-11 10:00 追加（移动端）：专家页 Tab 移到底部玻璃栏、Banner 仅专家市场、搜索原位展开（`expert-page.tsx`；`mobile-header.tsx` 导出 `glassSurface` / `glassSurfaceClass`）；推荐箭头同名称色。402×874 宿主内实测 Tab 栏 370×64、模糊 16px、最后一行距栏 44px，搜索 48→310px 并聚焦，无告警；截图更新 docs/screenshots/mobile-expert-directory.png。
- 2026-11-11 10:35 追加（移动端）：专家页底部 Tab 栏 288×56 全圆角居中（`expert-page.tsx`），402×874 实测左右各 57px，Tab 切换正常。
- 2026-11-11 10:45 追加（移动端）：专家市场分类标签栏吸顶（`expert-page.tsx` sticky top-0）。402×874 实测未滚动时距页顶 236px，滚动 600px 后停在滚动区顶部 64px，吸顶时点分类正常。
- 2026-11-11 10:55 追加（移动端）：吸顶修复——列表行按钮 `relative z-10` 压住标签栏，改为外层 sticky `z-20` 白底 + 内层横滑；底部 Tab 栏升到 z-30；滚动区 `overscroll-contain`。402×874 逐帧滚动 0–900px 吸顶位置恒为 64px，吸顶区域点击命中标签栏。
- 2026-11-11 11:10 追加（移动端）：修顶部栏与吸顶标签栏间漏缝——header 原为透明底，改 `bg-background relative z-30`；吸顶层 `-top-px`。402×874 滚动 720px 后 header 底 64、吸顶层顶 63，逐 0.5px 命中测试 header 与标签栏之间无列表元素。
- 2026-11-11 11:30 追加（移动端）：专家市场手势切换分类（Panel 上 touchstart/touchend，`data-swipe-ignore` 排除 Banner 与分类栏）；Tab 栏选中项 `data-active:bg-foreground/8` 全圆角填充、栏 `p-1`。402×874 触摸模拟：左滑 全部→人事服务→差旅出行，右滑回退，40px 短滑、斜向滑、分类栏内滑动均不触发，滑到末项「研发设计」后不再前进且分类栏自动滚到末尾。
- 2026-11-11 11:45 追加（移动端）：Tab 栏选中填充改为 `Tabs.Indicator`（读 `--active-tab-*` 变量，left/width 过渡 300ms）。402×874 实测：切到「已安装」后 120ms 色块 left=231（滑动中），约 520ms 停在 247，与目标 Tab 对齐；切「我的专家」停在 155。
- 2026-11-11 12:00 追加（移动端）：列表行召唤 primary / 进入 secondary；详情 Sheet `data-[side=bottom]:h-[80dvh]`（需带 side 前缀才能覆盖 sheet.tsx 的 h-auto），内容区滚动、DetailActions 固定底部；分类切换方向滑入（`sceneDirection` + key 重播 tw-animate `slide-in-from-right/left-10`），滚动区 `overflow-x-hidden`。402×874 实测：右切 60ms 时列表 left=35、左切 -3，结束回到 16；无横向溢出；两位专家详情高度均 699px。
- 2026-11-11 12:10 追加（移动端）：Tab 栏在 expert-page 内覆盖 `bg-background/45`（共享的 glassSurfaceClass 不改），Indicator `bg-foreground/5`。402×874 计算样式核对为 0.45 / 0.05，列表滚到栏下方时截图文字可透出且 Tab 文字可读。
- 2026-11-11 12:35 追加（移动端）：Tab 选中图标填充方案用户认为效果不好，已撤回，恢复线性图标（Store / UserRound / CircleCheckBig）；保留 45% 背景与 5% 选中填充。截图请写到 `/tmp/himate/`（`.ued-tmp` 会被清掉）。
- 2026-11-11 12:50 追加（移动端）：搜索时保留 Banner；`sidebar.tsx` 导航项 data-active 改 `bg-sidebar-accent`（与对话项一致，影响所有导航项的选中态，当前只有专家入口会被激活）；`mobile-composer.tsx` 已选专家标签按 `expertCatalog` 取头像，`size-5 rounded-full`。402×874 截图核对三处；计算样式：专家入口背景 oklab(0 0 0 / 0.04)、无边框。
