import { useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "../components/ui/button";
import { Sheet } from "../components/sheet";
import { assets } from "../assets";
import {
  BACK_STATE,
  HOST_BACK,
  KEY_INPUT,
  KEYBOARD,
  TAB_BAR,
  THEME,
  THEME_STORAGE_KEY,
  isHostBridgeMessage,
  readStoredDarkMode,
  type HostKey,
} from "./host-bridge";
import { HostKeyboard } from "./host-keyboard";
import "./host-preview.css";

/**
 * 飞书底部 Tab 栏分层（原为整张截图 figma-home/53a53.png）：
 * 底色、分隔线、文字、Home Indicator 用主题 Token，图标为从截图抠出的透明 PNG（public/host-tabs）。
 * 位置按截图 1080px 宽换算到 402px 设计宽度。
 */
const tabs = [
  { label: "消息", icon: "message", left: 21.6, top: 8.6, width: 34.2 },
  { label: "工作台", icon: "workbench", left: 89, top: 19.7, width: 23.1, active: true },
  { label: "日历", icon: "calendar", left: 157.1, top: 20.8, width: 20.8 },
  { label: "云文档", icon: "docs", left: 224.1, top: 20.8, width: 22.3 },
  { label: "签到", icon: "checkin", left: 289.2, top: 19, width: 24.6 },
  { label: "更多", icon: "more", left: 357.3, top: 10.1, width: 33.5 },
] as const;
const DESIGN_WIDTH = 402;
const COLUMN = DESIGN_WIDTH / tabs.length;

export function HostPreviewLayout() {
  const [notice, setNotice] = useState<string | null>(null);
  // 产品报告是否有可返回层级；没有时返回按钮保持宿主自身行为
  const [productCanGoBack, setProductCanGoBack] = useState(false);
  // 明暗主题由宿主容器控制：宿主自身切换，并同步给 iframe 内的产品
  const [darkMode, setDarkMode] = useState(readStoredDarkMode);
  // 底部飞书 Tab 栏：产品处于工作台首页时显示，进入新对话 / 对话页后隐藏（只留系统 Home Indicator）
  const [tabBarVisible, setTabBarVisible] = useState(true);
  // 模拟系统键盘：产品 Composer 输入框聚焦时弹出
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const webviewRef = useRef<HTMLIFrameElement>(null);
  const sendKey = (key: HostKey) =>
    webviewRef.current?.contentWindow?.postMessage(
      { type: KEY_INPUT, key },
      window.location.origin,
    );

  const syncTheme = (dark: boolean) =>
    webviewRef.current?.contentWindow?.postMessage(
      { type: THEME, dark },
      window.location.origin,
    );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, darkMode ? "dark" : "light");
    syncTheme(darkMode);
  }, [darkMode]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (
        !isHostBridgeMessage(event) ||
        event.source !== webviewRef.current?.contentWindow
      )
        return;
      if (event.data.type === BACK_STATE)
        setProductCanGoBack(event.data.canGoBack);
      if (event.data.type === TAB_BAR) setTabBarVisible(event.data.visible);
      if (event.data.type === KEYBOARD) setKeyboardOpen(event.data.open);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const goBack = () => {
    const product = webviewRef.current?.contentWindow;
    if (productCanGoBack && product)
      product.postMessage({ type: HOST_BACK }, window.location.origin);
    else setNotice("返回宿主应用");
  };

  const webviewUrl = new URL(window.location.href);
  webviewUrl.searchParams.set("preview", "web");

  return (
    <div className="host-preview">
      <header className="topbar">
        <div className="status-bar" aria-label="系统状态栏示意">
          <span>9:41</span>
          <span className="system-icons">
            <img src={assets.imgCellularConnection} alt="信号" />
            <img src={assets.imgWifi} alt="Wi-Fi" />
            <img src={assets.imgBattery} alt="电量" />
          </span>
        </div>
        <div className="titlebar">
          <Button
            variant="ghost"
            className="titlebar-back"
            aria-label={productCanGoBack ? "返回" : "返回宿主应用说明"}
            onClick={goBack}
          >
            <ChevronLeftIcon />
          </Button>
          <h1>工作台</h1>
          <Button
            variant="ghost"
            className="titlebar-theme"
            aria-label={darkMode ? "切换到浅色模式" : "切换到深色模式"}
            onClick={() => setDarkMode((value) => !value)}
          >
            {darkMode ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </header>
      <iframe
        ref={webviewRef}
        className="host-webview"
        title="HiMate 移动网页"
        src={webviewUrl.href}
        onLoad={() => syncTheme(darkMode)}
      />
      <HostKeyboard open={keyboardOpen} onKey={sendKey} />
      {/* 键盘弹出时覆盖底部区域：隐藏 Tab 栏 / Home Indicator，键盘自带指示条 */}
      <footer className="host-preview-footer" hidden={keyboardOpen}>
        {!tabBarVisible ? (
          <div className="host-home-only" aria-hidden="true">
            <span className="host-home-indicator" />
          </div>
        ) : (
        <nav className="host-nav" aria-label="飞书宿主导航示意">
          {tabs.map((tab, index) => (
            <button
              key={tab.label}
              type="button"
              className="host-tab"
              style={{ left: `${(index * COLUMN * 100) / DESIGN_WIDTH}%`, width: `${(COLUMN * 100) / DESIGN_WIDTH}%` }}
              aria-label={`${tab.label}（宿主导航示意）`}
              aria-current={"active" in tab ? "page" : undefined}
              onClick={() => setNotice(tab.label)}
            >
              <img
                src={`/host-tabs/${tab.icon}.png`}
                alt=""
                style={{
                  left: `${((tab.left - index * COLUMN) * 100) / COLUMN}%`,
                  top: `${(tab.top * 100) / 90}%`,
                  width: `${(tab.width * 100) / COLUMN}%`,
                }}
              />
              <span>{tab.label}</span>
            </button>
          ))}
          <span className="host-home-indicator" aria-hidden="true" />
        </nav>
        )}
      </footer>
      {notice && (
        <Sheet title={notice} onClose={() => setNotice(null)}>
          <p>这是飞书宿主容器的预览示意，尚未接入宿主导航能力。</p>
        </Sheet>
      )}
    </div>
  );
}
