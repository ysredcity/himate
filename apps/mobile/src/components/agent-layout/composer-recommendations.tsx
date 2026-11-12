import { ArrowDownLeft, BookOpen, BriefcaseBusiness, ChartNoAxesCombined, Plane, UsersRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { homeRecommendationCategories, type HomeRecommendation } from "./recommendation-data"

const icons = { hr: UsersRound, travel: Plane, office: BriefcaseBusiness, data: ChartNoAxesCombined, knowledge: BookOpen }
export type RecommendationCategory = (typeof homeRecommendationCategories)[number]

/** 推荐分类标签行：白色填充（2026-11-11），点击只打开蒙层，标签本身不切换选中样式（2026-11-10 用户确认） */
export function ComposerRecommendations({ disabled, onOpen }: { disabled: boolean; onOpen: (category: RecommendationCategory) => void }) {
  return <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 py-1" role="group" aria-label="推荐指令分类">
    {homeRecommendationCategories.map(item => {
      const Icon = icons[item.id as keyof typeof icons]
      return <Button key={item.id} variant="outline" disabled={disabled} aria-haspopup="dialog" onClick={() => onOpen(item)} className="h-10 shrink-0 gap-1.5 rounded-full bg-card px-3.5 text-sm font-medium dark:bg-card"><Icon aria-hidden="true" className="size-[18px]"/>{item.label}</Button>
    })}
  </div>
}

/** 分类下的推荐指令列表：名称 | 标题 + 左下箭头，16/24px（2026-11-10 由 14px 调大两档），点击填入 prompt 与专家 */
export function RecommendationItems({ category, disabled, onSelect }: { category: RecommendationCategory; disabled: boolean; onSelect: (item: HomeRecommendation) => void }) {
  return <div className="flex flex-col">
    {category.items.map(item => <Button key={item.prompt} variant="ghost" disabled={disabled} onClick={() => onSelect(item)} className="flex h-auto min-h-12 w-full justify-start gap-1.5 rounded-[10px] px-3 py-2 text-left text-base leading-6 font-normal whitespace-nowrap">
      <span className="shrink-0 font-medium">{item.name}</span><span aria-hidden="true" className="mx-0.5 h-4 shrink-0 border-l border-border"/><span className="min-w-0 flex-1 truncate text-muted-foreground">{item.title}</span><ArrowDownLeft aria-hidden="true" className="size-[18px] shrink-0 text-muted-foreground"/>
    </Button>)}
  </div>
}
