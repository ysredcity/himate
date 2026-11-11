# 架构决策记录

ADR 记录长期有效的取舍，不代替短期任务日志。编号递增；已接受的记录不覆写历史原因，改变方向时新增 ADR 并标记替代关系。

| 编号 | 决策 | 状态 |
| --- | --- | --- |
| [0001](0001-repository-governance-and-app-isolation.md) | 根目录治理 + app 应用隔离 + npm workspace | 治理原则有效；应用命名由 0002 替代 |
| [0002](0002-platform-specific-app-directories.md) | apps/desktop-web 平台命名与未来移动端边界 | 已接受并实施 |
| [0003](0003-github-version-control.md) | Git 初始化与指定 GitHub 仓库同步 | 已接受并实施 |

| [0004](0004-independent-mobile-web.md) | 独立移动网页应用与双端质量检查 | 已接受并实施 |

| [0005](0005-expert-directory-and-dispatch.md) | 专家目录、召唤交接与自动调度名单 | 已接受并实施 |

| [0006](0006-enterprise-default-installations.md) | 企业默认安装保护与20个个人安装名额 | 已接受并实施 |

| [0007](0007-mobile-host-preview-container.md) | 移动宿主预览容器与产品网页分离 | 已接受并实施 |
| [0008](0008-mobile-agent-mode-template.md) | 移动端 Agent 模式物化沉浸式模板、共用会话抽屉与深色范围 | 已接受并实施 |
| [0009](0009-host-back-navigation.md) | 宿主 header 返回驱动产品逐层返回（部分替代 0007） | 已接受并实施 |
| [0010](0010-host-theme-control.md) | 明暗主题由宿主容器切换、飞书 Tab 栏分层（部分替代 0008） | 已接受并实施 |
| [0011](0011-mobile-expert-directory.md) | 移动端专家列表页：复制桌面专家数据与规则、抽屉入口、召唤与安装同步 | 已接受并实施 |

新增决策使用 [模板](template.md)。
