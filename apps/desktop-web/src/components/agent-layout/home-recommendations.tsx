import { useId, useLayoutEffect, useRef, useState } from "react"
import { ChevronDown, X } from "lucide-react"

import { RecommendationList } from "@/agent-ui/conversation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { homeRecommendationCategories } from "./home-data"
import { recommendationIcons } from "./icon-registry"

const categoryClass = "group/category h-11 gap-1.5 rounded-full px-3 font-normal min-[660px]:h-9"

export function HomeRecommendations({ onSelect }: { onSelect: (prompt: string, expert?: string) => void }) {
  const [category, setCategory] = useState<string | null>(null)
  const listId = useId()
  const selected = homeRecommendationCategories.find((item) => item.id === category)

  return <div className="mt-8" aria-label="推荐任务">
    <CategoryChips category={category} listId={listId} onSelect={(id) => setCategory(category === id ? null : id)} />
    <div id={listId}>
      {selected && <div key={selected.id} role="region" aria-label={`${selected.label}推荐指令`} className="motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-200 motion-safe:ease-out motion-reduce:animate-none">
        <RecommendationList
          className="mt-5 max-[659px]:[&_button]:min-h-11 max-[659px]:[&_button>span.flex-1]:whitespace-normal"
          items={selected.items.map((item) => ({ id: item.prompt, label: item.name, content: item.title }))}
          arrowDirection="up-left"
          onSelect={(item) => onSelect(item.id, selected.items.find((candidate) => candidate.prompt === item.id)?.expert)}
        />
      </div>}
    </div>
  </div>
}

function CategoryChips({ category, listId, onSelect }: { category: string | null; listId: string; onSelect: (id: string) => void }) {
  const rowRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(homeRecommendationCategories.length)

  useLayoutEffect(() => {
    const row = rowRef.current
    const measure = measureRef.current
    if (!row || !measure) return
    const update = () => {
      const widths = Array.from(measure.children, (element) => element.getBoundingClientRect().width)
      const chips = widths.slice(0, -1)
      const available = row.clientWidth
      if (chips.reduce((sum, width) => sum + width, 0) + (chips.length - 1) * 8 <= available) {
        setCount(chips.length)
        return
      }
      let used = widths[widths.length - 1]
      let fit = 0
      for (const width of chips) {
        if (used + width + 8 > available) break
        used += width + 8
        fit++
      }
      setCount(fit)
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(row)
    observer.observe(measure)
    return () => observer.disconnect()
  }, [])

  const chip = (item: typeof homeRecommendationCategories[number], measuring = false) => {
    const Icon = recommendationIcons[item.id]
    const active = category === item.id
    return <Button key={item.id} variant={active ? "selected" : "outline"} className={categoryClass} aria-pressed={active} aria-expanded={active} aria-controls={measuring ? undefined : listId} onClick={() => onSelect(item.id)}>
      <span className="relative size-4 shrink-0"><Icon aria-hidden="true" className={active ? "size-4 group-hover/category:invisible group-focus-visible/category:invisible" : "size-4"} />{active && <X aria-hidden="true" className="invisible absolute inset-0 size-4 group-hover/category:visible group-focus-visible/category:visible" />}</span>
      {item.label}
    </Button>
  }
  const hidden = homeRecommendationCategories.slice(count)
  const hiddenSelected = hidden.some((item) => item.id === category)

  return <div className="relative">
    <div ref={measureRef} aria-hidden="true" inert className="pointer-events-none invisible absolute top-0 left-0 flex w-max gap-2">
      {homeRecommendationCategories.map((item) => chip(item, true))}
      <Button variant="outline" className={categoryClass}>更多<ChevronDown className="size-4" /></Button>
    </div>
    <div ref={rowRef} className="flex min-w-0 flex-nowrap justify-center gap-2" role="group" aria-label="推荐指令分类">
      {homeRecommendationCategories.slice(0, count).map((item) => chip(item))}
      {hidden.length > 0 && <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant={hiddenSelected ? "selected" : "outline"} className={categoryClass} />}>更多<ChevronDown className="size-4" /></DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          {hidden.map((item) => {
            const Icon = recommendationIcons[item.id]
            return <DropdownMenuItem key={item.id} onClick={() => onSelect(item.id)}>
              <Icon aria-hidden="true" />{item.label}{item.id === category && <span className="ml-auto text-xs text-muted-foreground">已选</span>}
            </DropdownMenuItem>
          })}
        </DropdownMenuContent>
      </DropdownMenu>}
    </div>
  </div>
}
