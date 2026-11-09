import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { expertCatalog, expertRecommendations, type Expert } from "./expert-data"

export function ExpertRecommendationBanner({ onSelect }: { onSelect: (expert: Expert) => void }) {
  const [index, setIndex] = useState(0)
  const [autoPlay, setAutoPlay] = useState(true)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [visible, setVisible] = useState(() => typeof document === "undefined" || !document.hidden)
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const count = expertRecommendations.length

  useEffect(() => {
    const update = () => setVisible(!document.hidden)
    document.addEventListener("visibilitychange", update)
    return () => document.removeEventListener("visibilitychange", update)
  }, [])
  useEffect(() => {
    if (!autoPlay || hovered || focused || reducedMotion || !visible) return
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), 5000)
    return () => window.clearInterval(timer)
  }, [autoPlay, hovered, focused, reducedMotion, visible, count])

  return <section aria-label="精选专家推荐" aria-roledescription="轮播" className="relative mb-6 overflow-hidden rounded-2xl bg-success/8" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false) }}>
    <div className="flex transition-transform duration-300 ease-out motion-reduce:transition-none" style={{ transform: `translateX(-${index * 100}%)` }}>
      {expertRecommendations.map((item, slideIndex) => {
        const expert = expertCatalog.find((candidate) => candidate.id === item.id)!
        return <div key={item.id} aria-label={`${slideIndex + 1} / ${count}：${expert.name}`} aria-roledescription="幻灯片" role="group" aria-hidden={slideIndex !== index} inert={slideIndex !== index || undefined} className="relative flex h-[180px] w-full shrink-0 items-end overflow-hidden bg-cover bg-right bg-no-repeat px-6 pt-6 pb-12 @min-[660px]/experts:px-8" style={{ backgroundImage: `url(${item.background})` }}>
          <Button variant="ghost" aria-label={`查看${expert.name}详情`} className="absolute inset-0 h-full w-full rounded-none hover:bg-transparent focus-visible:ring-inset" onClick={() => onSelect(expert)} />
          <div className="pointer-events-none relative z-10 max-w-full @min-[660px]/experts:max-w-[65%]">
            <h2 className="text-xl font-semibold leading-7 tracking-tight">{item.title}</h2>
            <p className="mt-1 text-sm leading-5 text-muted-foreground">{item.description}</p>
          </div>
        </div>
      })}
    </div>
    {([{ step: -1, label: "上一条推荐", Icon: ChevronLeft }, { step: 1, label: "下一条推荐", Icon: ChevronRight }] as const).map(({ step, label, Icon }) => <Button key={step} variant="outline" size="icon" aria-label={label} className={cn("absolute top-1/2 z-20 -translate-y-1/2 rounded-full border-0 bg-background shadow-md transition-opacity hover:bg-muted motion-reduce:transition-none [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100", step < 0 ? "left-2" : "right-2", hovered || focused ? "opacity-100" : "pointer-events-none opacity-0")} onClick={() => { setIndex((value) => (value + step + count) % count); setAutoPlay(false) }}><Icon /></Button>)}
    <div role="group" aria-label="推荐分页" className="absolute bottom-2 left-6 z-20 flex items-center gap-0 @min-[660px]/experts:left-8">
      {expertRecommendations.map((item, page) => <Button key={item.id} variant="ghost" aria-label={`查看第${page + 1}条推荐`} aria-pressed={page === index} className={cn("h-7 w-3 min-w-0 rounded-full p-0 transition-[width] motion-reduce:transition-none hover:bg-transparent", page === index && "w-5")} onClick={() => { setIndex(page); setAutoPlay(false) }}><span className={cn("h-1.5 w-1.5 rounded-full bg-foreground/20 transition-[width,background-color] motion-reduce:transition-none", page === index && "w-3.5 bg-foreground")} /></Button>)}
    </div>
  </section>
}
