import { useState } from "react";
import { HistoryIcon, MicIcon, CheckIcon } from "lucide-react";
import { Checkbox } from "@base-ui/react/checkbox";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Sheet } from "./components/sheet";
import { HomeSections, type HomeAction } from "./components/home-sections";
import { apps, agents, type Entry } from "./home-data";
import {
  AgentShell,
  type HomePageActions,
} from "./components/agent-layout/agent-shell";
import { appConfig } from "./components/agent-layout/app-config";
import { createDraftScene } from "./components/agent-layout/conversation-data";
import { scenes } from "./components/agent-layout/scenes";

// Agent 模式的会话列表沿用 pangea-design-ai 沉浸式模板示例；审批态由场景末轮自动派生
const initialPinnedConversations = [
  { id: "pinned-1", title: "如果用一个符号元素形容报表，应该用什么最形象" },
];
const initialConversations = [
  { id: "chat-1", title: "帮我写个行业调研报告吧" },
  { id: "chat-2", title: "你能读取飞书文档吗？", loading: true },
  {
    id: "chat-3",
    title: "你是一个挑剔且专业的用户体验专家，帮我评审智能家居 App 的核心页面",
    unread: true,
  },
  { id: "chat-4", title: "整理本周项目进展并生成周报", waitingForReply: true },
  { id: "chat-5", title: "下周去上海出差，帮我发起申请", waitingForReply: true },
];

/** 应用壳层：工作台首页与 Agent 模式（新对话页 / 对话页）共用同一个会话抽屉。 */
export default function App() {
  return (
    <AgentShell
      config={appConfig}
      scenes={scenes}
      initialPinnedConversations={initialPinnedConversations}
      initialConversations={initialConversations}
      createDraftScene={(content, expert, attachments) => ({
        id: `draft-${Date.now()}`,
        ...createDraftScene(content, expert, attachments),
      })}
      renderHome={(actions) => <WorkbenchHome {...actions} />}
    />
  );
}

type Overlay =
  | {
      kind: "list";
      title: string;
      entries: Entry[];
      configure?: "apps" | "agents";
    }
  | { kind: "detail"; entry: Entry }
  | { kind: "notice"; title: string };

function WorkbenchHome({ openSidebar, startNewConversation, hasAttention }: HomePageActions) {
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const [selectedApps, setSelectedApps] = useState(apps.map((e) => e.id)),
    [selectedAgents, setSelectedAgents] = useState(agents.map((e) => e.id));
  const [configuration, setConfiguration] = useState<string[]>([]);
  const action: HomeAction = (title, entries, configure) => {
    if (configure)
      setConfiguration(configure === "apps" ? selectedApps : selectedAgents);
    setOverlay(
      entries
        ? { kind: "list", title, entries, configure }
        : { kind: "notice", title },
    );
  };
  const title =
    overlay?.kind === "detail" ? overlay.entry.title : (overlay?.title ?? "");
  return (
    <div className="mobile-app">
      <HomeSections
        onAction={action}
        onSelect={(entry) => setOverlay({ kind: "detail", entry })}
        selectedApps={selectedApps}
        selectedAgents={selectedAgents}
      />
      <footer className="footer">
        <div className="composer-row">
          <div className="history-wrapper">
            <Button
              variant="ghost"
              className="history-button"
              aria-label={hasAttention ? "历史会话，有需要处理的对话" : "历史会话"}
              onClick={openSidebar}
            >
              <HistoryIcon />
            </Button>
            {/* 设计稿 1958:31374：8px destructive 圆点，位于按钮右上角 */}
            {hasAttention && <span className="history-indicator" aria-hidden="true" />}
          </div>
          <div className="composer">
            {/* 首页只作入口：点击进入 Agent 模式新对话页，不在首页输入或发送 */}
            <Input
              readOnly
              onClick={startNewConversation}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  startNewConversation();
                }
              }}
              aria-label="发消息，进入新对话"
              placeholder="发消息或按住说话"
            />
            <Button
              type="button"
              variant="ghost"
              aria-label="语音输入说明"
              onClick={() => action("语音输入")}
            >
              <MicIcon />
            </Button>
          </div>
        </div>
      </footer>
      {overlay && (
        <Sheet title={title} onClose={() => setOverlay(null)}>
          {overlay.kind === "notice" && (
            <p>
              “{overlay.title}
              ”尚未接入真实平台，当前仅作首页入口演示；不会发起录音、支付或外部跳转。
            </p>
          )}
          {overlay.kind === "detail" && (
            <div className="detail">
              {overlay.entry.image && <img src={overlay.entry.image} alt="" />}
              <p>
                {overlay.entry.description ??
                  "本地示例条目，尚未连接企业系统或实时数据。"}
              </p>
              {overlay.entry.id.startsWith("agent-") && (
                <Button
                  onClick={() => {
                    setOverlay(null);
                    startNewConversation();
                  }}
                >
                  使用此智能体
                </Button>
              )}
              <p className="muted">仅供前端演示</p>
            </div>
          )}
          {overlay.kind === "list" && (
            <>
              <div className="entry-list">
                {overlay.entries.map((e) =>
                  overlay.configure ? (
                    <label className="config-row" key={e.id}>
                      <Checkbox.Root
                        checked={configuration.includes(e.id)}
                        onCheckedChange={(checked) =>
                          setConfiguration((ids) =>
                            checked
                              ? [...ids, e.id]
                              : ids.filter((id) => id !== e.id),
                          )
                        }
                        className="checkbox"
                      >
                        <Checkbox.Indicator>
                          <CheckIcon />
                        </Checkbox.Indicator>
                      </Checkbox.Root>
                      {e.image && <img src={e.image} alt="" />}
                      <span>{e.title}</span>
                    </label>
                  ) : (
                    <Button
                      variant="ghost"
                      className="entry-row"
                      key={e.id}
                      onClick={() => setOverlay({ kind: "detail", entry: e })}
                    >
                      {e.image && <img src={e.image} alt="" />}
                      <span>{e.title}</span>
                    </Button>
                  ),
                )}
              </div>
              {overlay.configure && (
                <Button
                  className="save-config"
                  onClick={() => {
                    if (overlay.configure === "apps")
                      setSelectedApps(configuration);
                    else setSelectedAgents(configuration);
                    setOverlay(null);
                  }}
                >
                  保存配置
                </Button>
              )}
            </>
          )}
        </Sheet>
      )}
    </div>
  );
}
