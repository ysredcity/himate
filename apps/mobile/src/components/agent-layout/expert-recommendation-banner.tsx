import { useEffect, useRef, useState } from "react"

import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { expertCatalog, expertRecommendations, type Expert } from "./expert-data"

/**
 * 移动端专家推荐轮播：数据、文案、背景与桌面 expert-recommendation-banner 一致。
 * 移动端去掉悬停出现的左右翻页按钮，改为横向滑动；5 秒自动切换，触摸 / 焦点 / 页面隐藏 / 减弱动效时暂停，
 * 手动滑动或点分页后停止自动轮播（与桌面点击翻页后的行为一致）。
 */
export function ExpertRecommendationBanner({ onSelect }: { onSelect: (expert: Expert) => void }) {
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [touching, setTouching] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const swipeStart = useRef<number | null>(null)
  const swiped = useRef(false)
  const count = expertRecommendations.length

  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  useEffect(() => {
    if (!autoPlay || touching || focused || reducedMotion || !visible) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), 5000)
    return () => window.clearInterval(timer)
  }, [autoPlay, touching, focused, reducedMotion, visible, count])

  const go = (next: number) => {
    setIndex((next + count) % count)
    setAutoPlay(false)
  }

  return (
    <section
      aria-label="精选专家推荐"
      aria-roledescription="轮播"
      className="relative touch-pan-y overflow-hidden rounded-2xl bg-success/8"
      onPointerDown={(event) => { swipeStart.current = event.clientX; swiped.current = false; setTouching(true) }}
      onPointerUp={(event) => {
        setTouching(false)
        if (swipeStart.current === null) return
        const delta = event.clientX - swipeStart.current
        swipeStart.current = null
        if (Math.abs(delta) > 40) { swiped.current = true; go(index + (delta < 0 ? 1 : -1)) }
      }}
      onPointerCancel={() => { swipeStart.current = null; setTouching(false) }}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}
    >
      <div className="flex transition-transform duration-300 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
        {expertRecommendations.map((item, slideIndex) => {
          const expert = expertCatalog.find((candidate) => candidate.id === item.id)!
          return (
            <div key={item.id} role="group" aria-roledescription="幻灯片" aria-label={`${slideIndex + 1} / ${count}：${expert.name}`} aria-hidden={slideIndex !== index} inert={slideIndex !== index || undefined} className="relative flex h-[160px] w-full shrink-0 items-end overflow-hidden bg-cover bg-right bg-no-repeat px-5 pt-5 pb-10" style={{ backgroundImage: `url(${item.background})` }}>
              <button type="button" aria-label={`查看${expert.name}详情`} className="absolute inset-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset" onClick={() => { if (!swiped.current) onSelect(expert) }} />
              <div className="pointer-events-none relative z-10 max-w-[78%]">
                <h2 className="text-lg leading-7 font-semibold tracking-tight">{item.title}</h2>
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted-foreground">{item.description}</p>
              </div>
            </div>
          )
        })}
      </div>
      <div role="group" aria-label="推荐分页" className="absolute bottom-1 left-5 z-20 flex items-center">
        {expertRecommendations.map((item, page) => (
          <button key={item.id} type="button" aria-label={`查看第${page + 1}条推荐`} aria-pressed={page === index} className={cn("grid h-8 w-3 place-items-center transition-[width] motion-reduce:transition-none", page === index && "w-5")} onClick={() => go(page)}>
            <span className={cn("h-1.5 w-1.5 rounded-full bg-foreground/20 transition-[width,background-color] motion-reduce:transition-none", page === index && "w-3.5 bg-foreground")} />
          </button>
        ))}
      </div>
    </section>
  )
}
