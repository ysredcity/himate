import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { ArrowDownLeft, ArrowUpLeft } from 'lucide-react'

export type RecommendationListItem = {
  id: string
  content: string
  label?: string
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

// 首页推荐（up-left）悬停时箭头保持原位；对话页跟进建议（down-left）保留轻微下移
const arrowMotionClasses = {
  'up-left': '',
  'down-left': 'group-hover:translate-y-0.5 group-focus-visible:translate-y-0.5',
}

/** 首页专家推荐与完成回复后的跟进建议共用的 36px 指令列表。 */
export function RecommendationList({ items, arrowDirection, onSelect, className }: RecommendationListProps) {
  const ArrowIcon = arrowIcons[arrowDirection]

  return (
    <div className={`overflow-hidden rounded-[10px] ${className ?? ''}`}>
      {items.map((item) => (
        <ButtonPrimitive
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="group flex w-full items-center gap-2 rounded-[10px] px-3 py-2 text-left text-sm leading-5 text-foreground outline-none transition-colors hover:bg-accent focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {item.label && <>
            <span className="shrink-0 font-medium">{item.label}</span>
            <span aria-hidden="true" className="mx-1 h-3.5 shrink-0 border-l border-border" />
          </>}
          <span className={`min-w-0 flex-1 truncate ${item.label ? 'text-muted-foreground' : ''}`}>{item.content}</span>
          <ArrowIcon aria-hidden="true" className={`size-4 shrink-0 text-muted-foreground opacity-80 transition-transform ${arrowMotionClasses[arrowDirection]}`} />
        </ButtonPrimitive>
      ))}
    </div>
  )
}
