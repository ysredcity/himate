# 当前项目上下文

- 更新时间：2026-11-07 21:44（Asia/Shanghai）
- 状态：桌面专家目录与可调度机制已实现，浏览器验证待补；独立移动端保持原状。
- 当前分支：`feat/home-agents-figma`；已有桌面与治理未提交修改保留，本轮未提交、推送或切分支。

## 当前产品

HiMate 为前端 Mock 工作台。桌面侧栏新增专家目录：市场 / 我的专家 / 已安装，15条跨渠道示例（4条个人发布），详情、最多20位个人安装（另加2位企业默认）名单及召唤；10位支持直接召唤并可安装，其余5位仅进入、不可安装；支持召唤的条目加入名单后可按本地关键词自动匹配，明确指定优先。状态内存保存。桌面端保留四类任务、多轮对话、执行过程与产物查看；首页我的智能体按 Figma 5027:181735，标题右侧三个分段平台入口、八项独立白底卡片，三类内容卡片使用柔和悬停阴影，相关实现与用户原有修改均保留。

移动端为独立 `apps/mobile/` 应用，以 402px 为基准、按最新 Figma 3264:36630 主体实现宣传轮播、信数报表、应用、智能体、海信生活、课程、资讯和底部消息输入。我的智能体现为青绿色宣传头、全景规划单入口和四条纵向专家示例；支持配置、详情、分页、隐藏余额、模拟委托与产物抽屉。用户已在本聊天明确确认需求方案。技术边界见 [架构](../ARCHITECTURE.md) 与 [ADR 0004](../decisions/0004-independent-mobile-web.md)，布局与交互见 [设计契约](../DESIGN.md)。

## 当前工程与运行

根 npm apps/* workspace，唯一 lockfile；React 19 / TypeScript / Vite 8 / Tailwind v4 / Base UI。根默认命令仍针对 desktop-web，根 gate 覆盖治理和双端。

桌面：http://127.0.0.1:5173/；移动：http://127.0.0.1:5174/（`npm run dev:mobile`，strictPort）。origin 沿用现有 GitHub 仓库，未新增 CI 或部署。

## 本轮验证

2026-11-07：专家卡片 / 详情仅canSummon=true时显示安装操作，进入型无安装按钮。安装规则新增unsupported，规范化 / 计额 / 自动匹配过滤不可召唤ID。支持召唤扩至10位，全部5位初始安装均可召唤；app-config和Composer默认选项由summonableExperts派生，选中专家头像同步visualKey。根 `npm run gate`（5规则）和`git diff --check`通过，预览HTTP200；SSR确认10位召唤有安装状态、5位进入无安装入口通过。CUA getTab超时，实际新专家召唤 / Composer选择与UI复测未运行。本轮未改移动源码，保留其他聊天移动记录。

## 限制与下一步

- 全部业务、余额、报表与资讯均为示例；无模型、企业系统、附件解析、支付或宿主平台接入，内存状态刷新重置。
- 移动仅实现原稿浅色主题；后续轮播/应用分页使用示例内容。桌面保留原有大于 500kB 主包提示；移动主包约 307kB。
- 此前 2026-10-23 安装报告 7 项高危依赖；本轮未重新审计或升级，不将历史数字视为当前完整审计结果。
- 未执行真机软键盘、安全区和辅助技术全面测试；桌面本轮未重复完整交互与响应式回归。
- 用户可查看移动预览继续调整；真实平台地址仍待提供。下一位 Agent 先读 [最近交接](handoff.md)。

## 移动端运行地址更正（2026-11-07 19:46 Asia/Shanghai）

5174 实际属于 HR-Portal/hihr-workbench 的 AskHR 服务，此前仅凭 HTTP200 判定为 HiMate 有误。现保留该服务，执行 `npm run dev:mobile -- --port 5175` 启动 HiMate 移动端。正确预览为 http://127.0.0.1:5175/ ，已核验标题“HiMate · 移动工作台”、移动入口 HomeSections/mobile-app，以及监听进程工作目录 HiMate/apps/mobile，并请求在应用内打开。默认脚本仍为5174；占用期间使用上述5175命令。

本次运行请求期间根 `npm run gate` 已通过；本次更正未改产品源码，未重复 gate，浏览器完整交互检查未运行。原桌面待复测事项保留。

## 移动宿主布局分离（2026-11-07 20:02 Asia/Shanghai）

顶部状态栏/导航和底部飞书Tab栏已抽离到apps/mobile/src/preview/host-preview-layout.tsx及host-preview.css。main.tsx默认加载宿主布局，通过iframe加载?preview=web；App不再渲染宿主元素，拥有独立滚动/输入/弹窗和对话返回首页入口。见ADR0007与设计契约。旧App顶部sticky实现已被宿主固定网格替代。

预览：http://127.0.0.1:5175/ 为宿主，http://127.0.0.1:5175/?preview=web 为纯网页；5174仍是AskHR。根npm run gate通过，浏览器验证375/402/900px宿主固定/产品滚动、输入与Tab栏无重叠、两层弹窗、纯网页无宿主、对话/产物/返回首页，无运行错误。截图为docs/screenshots/mobile-host-container.png和mobile-web-only.png；未做真机验证，桌面既有大包提示保留，原桌面待复测事项仍保留。

## 内容区块样式校准（2026-11-07 20:17 Asia/Shanghai）

依据Figma3264:36630读取高保真代码与截图，修改mobile首页组件/数据/样式及本地素材映射（50项清单不变）：报表66px行、应用96px条目、课程自然标题、资讯14px元信息、生活168px头部、智能体单入口和新背景叠色；分页改紧凑视觉+44px循环按钮/左右键，页数按实际数据。宿主布局和5175地址保留。根 `npm run gate` 通过（桌面既有大包提示保留）；浏览器校验402px下报表272px、应用96px、生活头部168px、课程标题内容44px及全部图片成功加载。320/375/390/402px无溢出，轮播/应用/生活切页、余额及宿主隔离回归通过，无页面错误；桌面源码未改，原待复测事项保留。截图docs/screenshots/mobile-blocks-3264.png。金额未提供DINPro字体，使用回退字体；未做真机验证。

## 轮播与输入区批注（2026-11-07 21:29 Asia/Shanghai）

已处理四项批注：footer整片渐变改透明、保留胶囊背景阴影；删除首页底部说明；配置/全部按钮14px/20px中等字重，实测64px；轮播240ms透明度切换及5秒自动切页，悬停/聚焦暂停，隐藏页面/离开视口不推进，减弱动效时停播且无过渡。非当前页inert/aria-hidden，支持横滑与分页。新两页图像由imagegen生成，保存在mobile/public/generated-banners，标题/详情数据在home-data.ts，注明虚构示例。新增生成素材清单并纳入检查，总52项。

本轮根npm run gate通过（桌面原有大包提示保留）；Chrome检查自动播放、暂停、切页、示例详情、减弱动效、图片解码、按钮64px、去遮罩/说明和320/375/402px无溢出通过，无页面错误。截图docs/screenshots/mobile-banner-generated.png。未做真机验证，桌面源码未改；5175预览保留，原桌面待复测事项保留。

## 移动端 Agent 模式（2026-11-07 23:10 Asia/Shanghai）

用户确认需求文档后，按 pangea-design-ai 沉浸式模板物化到 apps/mobile（agent-ui、components/agent-layout、components/ui、hooks、public/samples、剧本校验脚本），示例数据保持模板原文，身份改为 HiMate 与首页头像。AgentShell 新增 renderHome 首页插槽：首页输入框只读、点击进新对话页（不聚焦）；历史按钮打开共用抽屉，抽屉只留「新对话」与会话列表；Agent 页顶栏「返回工作台」。Agent 模式与抽屉支持深色（抽屉底部切换），首页与宿主壳固定浅色。旧首页简易对话与其 Mock 已删除。依赖与边界见 ADR 0008。

验证：根 `npm run gate` 通过（治理、双端 lint / 剧本 / Token / 类型 / 构建；移动主包约 852kB，超 500kB 提示）；`git diff --check` 通过。Chromium 在 320/375/402px 走通：首页 → 抽屉 → 新对话 → 返回 → 输入框进入 → 推荐命中调研剧本 → HTML 报告全屏 → 出差澄清表单 → 置顶会话审批卡 → 深色切换 → 返回首页仍浅色，无横向溢出、无页面错误；首页首屏与改动前截图像素一致。宿主 5175/ 中 iframe 进入新对话页正常。截图 docs/screenshots/mobile-agent-light.png、mobile-agent-dark.png。未做真机、软键盘、辅助技术测试。

## 移动端 Composer 与新对话页（2026-11-07 23:50 Asia/Shanghai）

按 Figma 5271:62234（新对话页四态）与 2903:46039（输入框移动端）新增 `apps/mobile/src/components/agent-layout/mobile-composer.tsx`，新对话页与对话页共用，PC 端 Composer 不再在移动端渲染。新对话页重写为左对齐两行欢迎语、「猜你想做」3 条 +「换一换」、选中专家后底部推荐列表、选中推荐后填入 Composer。移动页面底色改白；补定义模板引用但缺失的 `no-scrollbar` 工具类。推荐文案仍为模板示例，顶栏保留返回工作台按钮（设计稿无），见设计契约。

验证：根 `npm run gate`、`git diff --check` 通过。Chromium 320/375/402px：Composer 默认 56px 全圆角、聚焦/选专家 104px 24px 圆角；快捷专家、更多面板、Chip 移除、换一换、推荐填入、按住说话与切回聚焦、发送进入调研剧本、对话页追问追加并清空、待批准禁用，无溢出、无页面错误；深色截图检查通过。截图 docs/screenshots/mobile-composer-states.png、mobile-composer-voice-conversation.png。未做真机与软键盘验证。

## 宿主返回驱动产品返回（2026-11-08 00:20 Asia/Shanghai）

按用户要求删除新对话页、对话页的页内返回按钮；宿主 header 返回按钮经 `apps/mobile/src/preview/host-bridge.ts`（同源 postMessage）通知 AgentShell 逐层返回：图片查看器 → 产物面板 → 会话抽屉 → 首页；首页时宿主仍显示「返回宿主应用」说明。ADR 0009 部分替代 0007 的返回约定。纯网页入口 `?preview=web` 没有返回入口。

验证：根 `npm run gate`、`git diff --check` 通过；Chromium 375/402px 宿主壳中逐层返回 13 项检查通过，无页面错误。真机未验证。

## 推荐列表样式统一（2026-11-08 00:40 Asia/Shanghai）

用户指出对话页 Composer 上方推荐样式与新对话页不一致。实测两页快捷专家按钮由同一 MobileComposer 渲染，计算样式完全相同；差异来自内容区推荐列表：新对话页专家推荐是手写列表（16px 次要色），对话页跟进建议是模板 `RecommendationList`（14px 正文色）。现新对话页改用 `RecommendationList`，组件按设计稿改为 40px 行、16/24px 次要色、18px 图标。根 gate 通过；375px 实测两处行高、字号、颜色、内边距、图标尺寸一致，无页面错误。

## Composer 过渡与对话页顶栏（2026-11-08 01:10 Asia/Shanghai）

Composer 原先单行用 flex-row、多行用 flex-col，切换时按钮与输入区瞬间换位；现为同一结构，按钮绝对定位在右下角，外框高度由文本高度计算后过渡（200ms ease-out）。逐帧采样：聚焦 56→104px、失焦 104→56px 单调平滑，过渡中麦克风距底部恒为 10px、文本顶部恒为 16px；多行输入 152px。对话页顶栏按 Figma 2516:59109 重写，玻璃按钮抽到 `mobile-header.tsx`。320/375px 实测顶栏 64px、菜单 48px、标题 18/28 Medium、胶囊 107×48，更多菜单与新对话可用，专家 Chip / 语音回归通过，无溢出、无页面错误；根 gate 通过。

## 首页输入胶囊校对（2026-11-08 01:30 Asia/Shanghai）

依据 Figma 1958:31374：原胶囊左内边距 16px 叠加 Base UI Input 自带 10px 内边距，Placeholder 距左缘 27px（设计 19px）。现胶囊内边距 6px、输入区 6/12px，320/375/402px 实测均为 19px，麦克风位置不变；胶囊与历史按钮背景改为 `--composer-glass`（白 65%）。设计稿历史按钮右上角有 8px 红点未读提示，本轮未实现。根 gate 通过。

## 桌面端运行（2026-11-08 08:38 Asia/Shanghai）

按用户请求启动 `npm run dev -- --host 127.0.0.1 --port 5173 --strictPort`，预览 http://127.0.0.1:5173/ 。HTTP成功，页面标题“HiMate · 企业 AI 工作台”，监听进程工作目录核验为HiMate/apps/desktop-web。根 `npm run gate`本轮通过，双端既有大包提示保留；未修改产品代码，未运行浏览器交互检查。保留既有移动端和桌面待复测记录。

## 历史徽标与图片上传（2026-11-08 02:10 Asia/Shanghai）

AgentShell 向首页传 `hasAttention`（待回复 / 待批准 / 已完成未读，与侧栏口径一致），首页历史按钮显示 8px 红点。MobileComposer 新增图片按钮、选择上传方式面板、附件区与模拟上传（`upload-samples.ts` 本地示例图，相册第 2 张首次失败）；用户消息图片附件改为缩略图、只发图片时不渲染空气泡；`ui/sheet.tsx` 增加 `overlayClassName`；修复图片查看器下载按钮的 Base UI nativeButton 控制台告警。验证：320/375/402px 徽标位置 8px@(39,3)、面板、上传中禁用发送、失败重试、拍照追加、移除、只发图片进入对话、缩略图打开查看器、对话页追问带图，有附件时外框 188px、单行文字左距 55px，与设计稿一致；无溢出、无控制台错误；根 gate 通过。徽标在示例数据中常亮：模板「等待回复」会话的状态为静态数据，回复后不会清除（与侧栏一致）。

## 桌面专家推荐Banner（2026-11-08 08:47 Asia/Shanghai）

专家市场筛选器上方新增expert-recommendation-banner.tsx；配置在expert-data.ts的expertRecommendations（人事 / 差旅 / 经营分析3条），点击查看打开原详情。参考用户截图为浅绿底、左文案右视觉，复用HiMate本地6e8e6.png和目录头像；24px下间距，16px圆角，宽 / 窄最小高196 / 208px，窄宽装饰淡化。

每5秒自动切换、300ms水平过渡，循环上下页、分页和暂停按钮。悬停 / 焦点 / 页面不可见暂停，减少动态效果停播并禁过渡，非当前页inert / aria-hidden。数据与呈现分离，无新依赖，其他Tabs和安装逻辑不改。

本轮根 `npm run gate`通过（6项专家测试含推荐数据有效性、治理、双端lint / Token / 类型 / 构建），`git diff --check`通过，桌面预览HTTP200。CUA getTab再次超时，实际轮播计时 / 暂停 / 详情跳转及相关宽度视觉未完成浏览器复测，无本轮截图。大包提示保留，本轮未修改移动源码，既有其他聊天记录保留。

## 桌面专家Banner简化（2026-11-08）

专家导航图标改graduation-cap。Banner仅保留本地4a142.png背景、标题和描述，cover / right center使窄宽裁剪左侧；移除上下页及播放暂停控件、眉题和头像装饰，分页6px圆点置于16px按钮内、零gap。圆点点击选页后停止自动轮播，其他暂停条件保留。改动入口为expert-recommendation-banner.tsx与icon-registry.ts；未改移动源码、未提交或推送。

验证：本轮根npm run gate通过（治理、双端lint / 剧本 / Token / 类型 / 构建、6项专家测试），git diff --check通过，5173预览HTTP200；实际浏览器755px视口下检查侧栏收起 / 展开时Banner布局、分页切换、graduation-cap图标，并确认背景100% 50% / cover。既有双端主包超500kB提示保留；本轮未重复全部专家业务流程。

## 一卡通插图校对（2026-11-08 09:15 Asia/Shanghai）

Figma 3264:36534 的插图素材与本地 `figma-home/d5862.svg` 内容一致（仅渐变 id 不同），SVG 内 `<g opacity="0.2">` 已承担 20% 透明度；`index.css` 的 `.balance-decoration` 又设 `opacity: 0.2`，实际 4% 导致看不清。已删除 CSS 透明度，后置覆盖规则的右距 16px 改回设计稿 14px。375px 实测 opacity 1、右 14px、顶 -0.4px、100×100，截图与设计稿一致；根 gate 通过。

## 余额默认隐藏（2026-11-08 09:30 Asia/Shanghai）

按用户截图：`home-sections.tsx` 余额默认 `balanceVisible=false`，隐藏态 EyeOffIcon（muted-foreground）+ `****`（40px 行内视觉居中），显示态不变；`index.css` 新增 `.balance-masked`。375px 实测隐藏 / 显示两态行高均 40px，aria-label 正确，无页面错误；截图 docs/screenshots/mobile-balance-masked.png；根 gate 通过。

## 桌面专家Banner主题背景（2026-11-08）

Banner固定180px、标题 / 描述间距4px，分页激活为20×6px胶囊（按钮宽28px，普通16px）；背景按推荐数据background字段选择3张新生成WebP，右对齐cover裁剪。素材及完整生成提示见docs/reference/expert-banner-generation.md。未改移动源码、未提交推送。

验证：本轮根npm run gate通过（含6项专家测试、双端构建），原大包提示保留；逐张检查生成图，浏览器getTab超时，实际页面视觉复测未完成。git diff --check通过；桌面预览保留5173。

## 桌面Banner翻页微调（2026-11-08）

expert-recommendation-banner.tsx分页按钮普通12px / 激活20px、长条14×6px；左右翻页按钮32px圆形、距两侧8px、垂直居中，悬停 / 焦点进入时出现，触屏常显，不透明背景和阴影。点击循环翻页并停止自动轮播。180px高度与主题图保持不变，未改移动源码、未提交推送。

本轮根npm run gate通过（6项专家测试及双端lint / 剧本 / Token / 类型 / 构建），git diff --check通过，5173 HTTP200；原大包警告保留。浏览器getTab超时，实际悬停 / 点击和宽度视觉复测未运行。

## 宿主主题切换与 Tab 栏分层（2026-11-08 10:00 Asia/Shanghai）

主题切换移到宿主标题栏右侧（`host-preview-layout.tsx`），经 `host-bridge.ts` 的 `himate:theme` 同步到 AgentShell；宿主内抽屉隐藏切换。飞书 Tab 栏改为分层：6 个图标从原截图抠为透明 PNG（`public/host-tabs/` + manifest，素材检查 58 项），底色 / 分隔线 / 文字 / 指示条走宿主 Token，深色 Token 在 `.dark .host-preview`。验证：402px 浅 / 深切换宿主与 Agent 同步、首页浅色、抽屉无切换、刷新保持、Tab 悬停透明、图标位置与截图一致，无控制台错误；截图 docs/screenshots/mobile-host-theme.png；根 gate 通过。ADR 0010。


## 移动推荐分类修正（2026-11-08 22:01 Asia/Shanghai）

按用户最新四点要求实现composer-recommendations.tsx，新对话/对话页通过MobileComposer共用：五分类横滑、无更多，列表在标签上方；激活深灰白字+X，再点收起，始终保留标签。分类只改局部状态不改草稿/专家；条目按桌面name/title显示，点击填入prompt和item.expert，无expert时清空专家，等待发送。移除旧按专家推断的两处推荐列表及更多面板，数据副本仍为五类25项，不跨应用导入。此前“选择分类即选专家”的交互已替代。

浏览器验证全部五类各五条、无更多、分类无副作用、X与激活、上方列表、项目周报title/prompt差异、人事/差旅专家归属及无expert条目清除专家、新对话发送/对话页选择、320/375/402px无溢出和无页面错误；截图mobile-category-list.png。根 `npm run gate` 通过，激活样式最后调整后移动gate与浏览器复测再次通过；原大包提示保留，未做真机测试，桌面源码未改，5175服务保留。

## 新对话欢迎区精简（2026-11-08 22:38 Asia/Shanghai）

new-conversation-page.tsx移除猜你想做/换一换，仅保留欢迎语。MobileComposer透传onRecommendationsOpenChange，由composer-recommendations.tsx选择状态通知页面；打开隐藏欢迎语，关闭恢复。列表title单行truncate，gap4px/分隔线左右2px，name固定，点击仍用完整prompt。对话正文不受此回调影响。

浏览器320/375/402px验证欢迎语默认显示、打开隐藏/收起恢复、无猜你想做、单行20px/ellipsis及窄屏实际溢出截断、完整差旅指令与专家填入、无页面溢出和无运行错误。截图mobile-welcome-recommendations.png。本轮根 `npm run gate` 通过（治理、专家测试与双端lint/剧本/Token/类型/构建）；原大包提示及其他未验证事项保留，未做真机测试，5175预览保留。
