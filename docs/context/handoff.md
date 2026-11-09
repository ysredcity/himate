# 最近交接

- 更新时间：2026-11-09（Asia/Shanghai）
- 状态：完成（桌面左侧导航收起形态改为图标栏）
- 本轮目标：③ Composer 专家菜单只列已安装并加「查看更多专家」。① 增加「专家」入口后，左侧导航收起时不再完全隐藏，改为只保留图标；已置顶、对话各一个图标，悬停在右侧打开对话列表窗口。② 预置对话的 L3 步骤补充过程文本。

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

- 全部改动未提交；`apps/desktop-web/.wbapp_7UjS5tv1ZodAgwr2UUfpui.genie` 疑似工具残留，待用户确认。
- 原首页左上角带红点的「展开导航」按钮现在只在抽屉形态出现；图标栏上的红点按对话状态显示，并非原设计稿的固定装饰红点。
- 移动端未改动。
