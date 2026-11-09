import { useEffect, useRef, useState } from "react";
import { ChevronRightIcon, Settings2Icon, EyeIcon,
  EyeOffIcon } from "lucide-react";
import { Button } from "./ui/button";
import { assets as a } from "../assets";
import {
  apps,
  agents,
  agentPlatforms,
  reports,
  courses,
  news,
  services,
  banners,
  type Entry,
} from "../home-data";
export type HomeAction = (
  title: string,
  entries?: Entry[],
  configure?: "apps" | "agents",
) => void;
function Head({
  title,
  onAll,
  onConfig,
}: {
  title: string;
  onAll?: () => void;
  onConfig?: () => void;
}) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      <div>
        {onConfig && (
          <Button variant="ghost" onClick={onConfig}>
            <Settings2Icon />
            <span>配置</span>
          </Button>
        )}
        {onAll && (
          <Button variant="ghost" onClick={onAll}>
            <span>全部</span>
            <ChevronRightIcon />
          </Button>
        )}
      </div>
    </div>
  );
}
export function Dots({
  count,
  index,
  onChange,
  label,
}: {
  count: number;
  index: number;
  onChange: (n: number) => void;
  label: string;
}) {
  return (
    <div className="dots">
      <Button
        variant="ghost"
        className="pager-hit"
        aria-label={`${label}，第${index + 1}页，共${count}页；切换至第${((index + 1) % count) + 1}页`}
        onClick={() => onChange((index + 1) % count)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            onChange((index + (e.key === "ArrowLeft" ? count - 1 : 1)) % count);
          }
        }}
      >
        <span className="pager-indicators" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className={i === index ? "active" : ""} />
          ))}
        </span>
      </Button>
    </div>
  );
}
function BannerCarousel({ onSelect }: { onSelect: (entry: Entry) => void }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);
  const section = useRef<HTMLElement>(null);
  const touch = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || reduced) return;
    const timer = setInterval(() => {
      const rect = section.current?.getBoundingClientRect();
      if (!document.hidden && rect && rect.bottom > 0 && rect.top < innerHeight)
        setIndex((n) => (n + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [paused, reduced, index]);
  return (
    <section
      ref={section}
      className="banner"
      aria-label="宣传轮播"
      aria-roledescription="轮播"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
      onTouchStart={(e) => {
        touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - touch.current.x,
          dy = e.changedTouches[0].clientY - touch.current.y;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy))
          setIndex(
            (n) => (n + (dx < 0 ? 1 : banners.length - 1)) % banners.length,
          );
        setPaused(false);
      }}
    >
      {banners.map((entry, i) => (
        <Button
          key={entry.id}
          variant="ghost"
          className={`banner-link ${i === index ? "is-active" : ""}`}
          aria-hidden={i !== index}
          inert={i !== index}
          onClick={() => onSelect(entry)}
        >
          {i === 0 && <img src={a.imgAdv} alt="" className="banner-base" />}
          <img src={entry.image} alt="" />
          <span className="banner-caption">
            <span className="clamp-two">{entry.title}</span>
          </span>
        </Button>
      ))}
      <Dots
        count={banners.length}
        index={index}
        onChange={setIndex}
        label="宣传轮播"
      />
    </section>
  );
}
function CardGrid({
  entries,
  onSelect,
  metadata = false,
}: {
  entries: Entry[];
  onSelect: (e: Entry) => void;
  metadata?: boolean;
}) {
  return (
    <div className={`two-grid ${metadata ? "news-grid" : "course-grid"}`}>
      {entries.map((e) => (
        <Button
          key={e.id}
          variant="ghost"
          className="image-card"
          onClick={() => onSelect(e)}
        >
          <img src={e.image} alt="" loading="lazy" />
          <span className="image-content">
            <span className="clamp-two">{e.title}</span>
            {metadata && (
              <span className="metadata">
                <span>{e.source}</span>
                <span>{e.time}</span>
              </span>
            )}
          </span>
        </Button>
      ))}
    </div>
  );
}
export function HomeSections({
  onAction,
  onSelect,
  selectedApps,
  selectedAgents,
}: {
  onAction: HomeAction;
  onSelect: (e: Entry) => void;
  selectedApps: string[];
  selectedAgents: string[];
}) {
  const [appPage, setAppPage] = useState(0),
    [lifePage, setLifePage] = useState(0),
    [balanceVisible, setBalanceVisible] = useState(false);
  const swipe = useRef(0);
  const shownApps = apps.filter((e) => selectedApps.includes(e.id));
  const pageCount = Math.max(1, Math.ceil(shownApps.length / 8));
  const page = Math.min(appPage, pageCount - 1);
  return (
    <main className="home-body">
      <BannerCarousel onSelect={onSelect} />
      <section>
        <Head title="信数报表" onAll={() => onAction("信数报表", reports)} />
        <div className="report-list">
          {reports.map((e) => (
            <Button
              variant="ghost"
              className="report"
              key={e.id}
              onClick={() => onSelect(e)}
            >
              <span className="report-top">
                <span>{e.title}</span>
                <span className="frequency">{e.description}</span>
              </span>
              <span className="metadata">
                <span>{e.source}</span>
                <span>{e.time}</span>
              </span>
            </Button>
          ))}
        </div>
      </section>
      <section>
        <Head
          title="我的应用"
          onAll={() => onAction("全部应用", apps)}
          onConfig={() => onAction("配置我的应用", apps, "apps")}
        />
        <div
          className="app-grid"
          onTouchStart={(e) => {
            swipe.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            const delta = e.changedTouches[0].clientX - swipe.current;
            if (Math.abs(delta) > 40)
              setAppPage((n) =>
                Math.max(0, Math.min(pageCount - 1, n + (delta < 0 ? 1 : -1))),
              );
          }}
        >
          {shownApps.slice(page * 8, page * 8 + 8).map((e) => (
            <Button
              variant="ghost"
              className="app-item"
              key={e.id}
              onClick={() => onSelect(e)}
            >
              <img src={e.image} alt="" />
              <span>{e.title}</span>
            </Button>
          ))}
        </div>
        {!shownApps.length && (
          <Button
            variant="outline"
            onClick={() => onAction("配置我的应用", apps, "apps")}
          >
            尚未选择应用，点击配置
          </Button>
        )}
        {pageCount > 1 && (
          <Dots
            count={pageCount}
            index={page}
            onChange={setAppPage}
            label="应用分页"
          />
        )}
      </section>
      <section>
        <Head
          title="我的智能体"
          onAll={() => onAction("全部智能体", agents)}
          onConfig={() => onAction("配置我的智能体", agents, "agents")}
        />
        <div className="agent-hub">
          <div className="agent-hub-hero">
            <div className="agent-hub-background" aria-hidden="true">
              <img src={a.imgFrame54} alt="" />
            </div>
            <div className="agent-hub-intro">
              <p>
                聚焦用户价值，
                <br />用 <span>AI</span> 重塑增长引擎
              </p>
            </div>
            <div className="two-grid agent-platforms">
              {agentPlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant="ghost"
                  onClick={() => onAction(platform.title)}
                >
                  <img src={platform.image} alt="" />
                  {platform.title}
                </Button>
              ))}
            </div>
          </div>
          <div className="agent-hub-list">
            {agents
              .filter((e) => selectedAgents.includes(e.id))
              .map((e) => (
                <Button
                  variant="ghost"
                  className="agent-row"
                  key={e.id}
                  onClick={() => onSelect(e)}
                >
                  <span className="agent-title">
                    <img src={e.image} alt="" />
                    <span>{e.title}</span>
                  </span>
                  <span className="agent-description">{e.description}</span>
                </Button>
              ))}
            {!selectedAgents.length && (
              <Button
                variant="ghost"
                onClick={() => onAction("配置我的智能体", agents, "agents")}
              >
                尚未选择智能体，点击配置
              </Button>
            )}
          </div>
        </div>
      </section>
      <section>
        <Head title="海信生活" />
        <div className="life-card">
          <div className="balance-card">
            <img className="balance-decoration" src={a.imgBgInset} alt="" />
            <div className="balance-summary">
              <div className="balance-top">
                <span>一卡通余额</span>
                <Button
                  variant="ghost"
                  aria-label={balanceVisible ? "隐藏余额" : "显示余额"}
                  onClick={() => setBalanceVisible((v) => !v)}
                >
                  {balanceVisible ? <EyeIcon /> : <EyeOffIcon />}
                </Button>
              </div>
              <div className="balance-value">
                {/* 默认隐藏：按设计截图显示 4 个星号，读屏只读「已隐藏」 */}
                {balanceVisible ? (
                  <strong>120.54</strong>
                ) : (
                  <strong className="balance-masked" aria-label="余额已隐藏">
                    <span aria-hidden="true">****</span>
                  </strong>
                )}
                <span>元</span>
              </div>
            </div>
            <div className="two-grid">
              <Button variant="outline" onClick={() => onAction("我要充值")}>
                <img src={a.imgPlus} alt="" />
                我要充值
              </Button>
              <Button variant="outline" onClick={() => onAction("门禁二维码")}>
                <img src={a.imgScanLine} alt="" />
                门禁二维码
              </Button>
            </div>
          </div>
          <div className="life-services">
            <Button variant="ghost" onClick={() => onAction("班车预约")}>
              <img src={a.imgIcon6} alt="" />
              <span>班车预约</span>
            </Button>
            {(lifePage === 0 ? services : services.slice(0, 2)).map((e) => (
              <Button variant="ghost" key={e.id} onClick={() => onSelect(e)}>
                <img src={e.image} alt="" />
                <span>{e.title}</span>
              </Button>
            ))}
          </div>
          <Dots
            count={2}
            index={lifePage}
            onChange={setLifePage}
            label="生活服务分页"
          />
        </div>
      </section>
      <section>
        <Head
          title="学习与成长"
          onAll={() => onAction("学习与成长", courses)}
        />
        <CardGrid entries={courses} onSelect={onSelect} />
      </section>
      <section>
        <Head title="资讯" />
        <CardGrid entries={news} onSelect={onSelect} metadata />
      </section>
    </main>
  );
}
