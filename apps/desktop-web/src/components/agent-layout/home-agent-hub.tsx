import { Button } from "@/components/ui/button"
import { homeAgentHub } from "./home-data"

type Props = { onOpenPlatform: (item: typeof homeAgentHub.platforms[number]) => void }

export function HomeAgentHub({ onOpenPlatform }: Props) {
  return <div role="group" aria-label="智能体平台入口" className="grid w-full grid-cols-1 rounded-xl border border-border bg-background p-0.5 shadow-platform-toolbar @min-[480px]/home:flex @min-[480px]/home:w-auto @min-[480px]/home:rounded-full">
    {homeAgentHub.platforms.map((item, index) => <div key={item.id} className="flex min-w-0 items-center">
      {index > 0 && <span aria-hidden="true" className="hidden h-3 w-px shrink-0 bg-border @min-[480px]/home:block" />}
      <Button variant="ghost" onClick={() => onOpenPlatform(item)} className="h-11 w-full gap-1 rounded-full border-0 px-2.5 text-sm font-medium @min-[660px]/home:h-7">
        <img src={item.image} alt="" aria-hidden="true" className="shrink-0 dark:invert" />
        <span>{item.title}</span>
      </Button>
    </div>)}
  </div>
}
