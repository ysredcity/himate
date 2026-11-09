import { useId, useState } from "react"
import { ArrowUpLeft, BookOpen, BriefcaseBusiness, ChartNoAxesCombined, Plane, UsersRound, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { homeRecommendationCategories, type HomeRecommendation } from "./recommendation-data"

const icons = { hr: UsersRound, travel: Plane, office: BriefcaseBusiness, data: ChartNoAxesCombined, knowledge: BookOpen }

export function ComposerRecommendations({ disabled, onSelect, onOpenChange }: { disabled: boolean; onOpenChange?: (open: boolean) => void; onSelect: (item: HomeRecommendation) => void }) {
  const [category, setCategory] = useState<string | null>(null)
  const listId = useId()
  const selected = homeRecommendationCategories.find(item => item.id === category)
  return <div className="flex min-w-0 flex-col gap-2">
    {selected && <section id={listId} aria-label={`${selected.label}推荐指令`} className="max-h-[40dvh] overflow-y-auto rounded-[10px]">
      {selected.items.map(item => <Button key={item.prompt} variant="ghost" disabled={disabled} onClick={() => onSelect(item)} className="flex h-auto min-h-11 w-full justify-start gap-1 rounded-[10px] px-3 py-2 text-left text-sm leading-5 font-normal whitespace-nowrap">
        <span className="shrink-0 font-medium">{item.name}</span><span aria-hidden="true" className="mx-0.5 h-3.5 shrink-0 border-l border-border"/><span className="min-w-0 flex-1 truncate text-muted-foreground">{item.title}</span><ArrowUpLeft aria-hidden="true" className="size-4 shrink-0 text-muted-foreground"/>
      </Button>)}
    </section>}
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1" role="group" aria-label="推荐指令分类">
      {homeRecommendationCategories.map(item => {
        const active = item.id === category
        const Icon = active ? X : icons[item.id as keyof typeof icons]
        return <Button key={item.id} variant="outline" disabled={disabled} aria-pressed={active} aria-expanded={active} aria-controls={selected ? listId : undefined} onClick={() => { const next = active ? null : item.id; setCategory(next); onOpenChange?.(next !== null) }} className={cn("h-9 shrink-0 gap-1.5 rounded-full px-3 text-sm font-normal", active && "bg-foreground text-background hover:bg-foreground hover:text-background aria-expanded:bg-foreground aria-expanded:text-background disabled:opacity-100 transition-none")}><Icon aria-hidden="true" className="size-4"/>{item.label}</Button>
      })}
    </div>
  </div>
}
