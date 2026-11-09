import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { ArrowDownLeft, ArrowUpLeft } from 'lucide-react'

export type RecommendationListItem = {
  id: string
  content: string
}

export type RecommendationListProps = {
  items: readonly RecommendationListItem[]
  arrowDirection: 'up-left' | 'down-left'
  onSelect: (item: RecommendationListItem) => void
  className?: string
}

const arrowIcons = {
  'up-left': ArrowUpLeft,
  'down-left': ArrowDownLeft,
}

const arrowMotionClasses = {
  'up-left': 'group-hover:-translate-x-0.5 group-focus-visible:-translate-x-0.5',
  'down-left': 'group-hover:translate-y-0.5 group-focus-visible:translate-y-0.5',
}

/**
 * 新对话页专家推荐与完成回复后的跟进建议共用的指令列表。
 * HiMate 移动端按 Figma 5271:62234「Preview Card」：40px 行、16/24px 次要色文字、18px 箭头。
 */
export function RecommendationList({ items, arrowDirection, onSelect, className }: RecommendationListProps) {
  const ArrowIcon = arrowIcons[arrowDirection]

  return (
    <div className={`overflow-hidden rounded-[10px] ${className ?? ''}`}>
      {items.map((item) => (
        <ButtonPrimitive
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="group flex min-h-10 w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-base leading-6 text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <span className="min-w-0 flex-1 truncate">{item.content}</span>
          <ArrowIcon aria-hidden="true" className={`size-[18px] shrink-0 text-muted-foreground opacity-80 transition-transform ${arrowMotionClasses[arrowDirection]}`} />
        </ButtonPrimitive>
      ))}
    </div>
  )
}
