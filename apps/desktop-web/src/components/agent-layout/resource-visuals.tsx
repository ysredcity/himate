import { BarChart3, BriefcaseBusiness, Building2, File, FileChartColumn, FileSpreadsheet, FileText, Palette, Search, Sparkles, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/** 文件图标只按类型区分形状，不带彩色前景或背景，跟随所在容器的文字颜色 */
const fileIcons: Record<string, LucideIcon> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  md: FileText,
  txt: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  html: FileText,
  htm: FileText,
  csv: FileSpreadsheet,
  ppt: FileChartColumn,
  pptx: FileChartColumn,
}

const expertVisuals = {
  travel: { icon: BriefcaseBusiness, className: "bg-primary-bg text-primary!" },
  office: { icon: BriefcaseBusiness, className: "bg-primary-bg text-primary!" },
  document: { icon: FileText, className: "bg-primary-bg text-primary!" },
  data: { icon: BarChart3, className: "bg-primary-bg text-primary!" },
  research: { icon: Search, className: "bg-primary-bg text-primary!" },
  campus: { icon: Building2, className: "bg-primary-bg text-primary!" },
  ux: { icon: Palette, className: "bg-primary-bg text-primary!" },
  industry: { icon: Sparkles, className: "bg-primary-bg text-primary!" },
} satisfies Record<string, { icon: LucideIcon; className: string }>

export type ExpertVisualKey = keyof typeof expertVisuals
export type ProductAvatarKey = "bot"

const expertVisualKeys: Record<string, ExpertVisualKey> = {
  人事专家: "office",
  差旅专家: "travel",
  日常办公专家: "office",
  文档处理专家: "document",
  数据分析专家: "data",
  市场调研专家: "research",
  园区生活专家: "campus",
  用户体验专家: "ux",
  行业研究专家: "industry",
}

const defaultExpertVisual = { icon: Sparkles, className: "bg-primary text-primary-foreground!" }

export function LibraryFileIcon({ className, fileName }: { className?: string; fileName: string }) {
  const FileIcon = fileIcons[fileName.split(".").pop()?.toLowerCase() ?? ""] ?? File
  return <FileIcon aria-hidden="true" className={cn("size-4 shrink-0", className)} />
}

/** src 为专家目录里的头像图片；提供时优先显示图片，与专家页卡片保持一致 */
export function ExpertAvatar({ className, expert, visualKey, src }: { className?: string; expert?: string; visualKey?: ExpertVisualKey; src?: string }) {
  if (src) return <img data-slot="expert-avatar" src={src} alt="" aria-hidden="true" className={cn("size-6 shrink-0 rounded-md object-cover", className)} />
  const resolvedVisualKey = visualKey ?? (expert ? expertVisualKeys[expert] : undefined)
  const visual = resolvedVisualKey ? expertVisuals[resolvedVisualKey] : defaultExpertVisual
  const ExpertIcon = visual.icon
  return <span data-slot="expert-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full shadow-xs ring-1 ring-border transition-none", visual.className, className)}><ExpertIcon className="size-3.5"  /></span>
}

/** HiMate 产品标识（对话气泡 + 提示符），来源用户提供的 himate-graph.svg；单色，跟随 currentColor。 */
function HiMateMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M222.636 282.07L169.948 334.758L146.815 311.629L176.373 282.07L146.815 252.512L169.948 229.379L222.636 282.07Z" />
      <path fillRule="evenodd" clipRule="evenodd" d="M384.119 54.2402C429.993 55.4794 466.823 95.5506 466.823 144.8C466.823 171.308 456.15 195.153 439.143 211.719C452.059 231.815 459.554 255.728 459.554 281.392C459.554 328.021 434.822 368.873 397.76 391.547L394.126 393.726C354.97 416.765 267.597 455.569 267.597 455.569C256 461.319 243.278 455.569 243.278 444.81V410.431H174.215C102.949 410.431 45.1763 352.658 45.1763 281.392C45.1763 210.126 102.949 152.354 174.215 152.354H194.508C194.316 149.863 194.207 147.344 194.207 144.8C194.207 94.7695 232.216 54.2118 279.101 54.2118H381.929L384.119 54.2402ZM174.215 192.338C125.031 192.338 85.16 232.209 85.16 281.392C85.16 330.576 125.031 370.447 174.215 370.447H283.261V404.517C289.001 401.863 295.235 398.961 301.716 395.902C329.873 382.613 360.491 367.473 376.895 357.437C402.577 341.726 419.57 313.526 419.57 281.392C419.57 263.16 414.084 246.211 404.682 232.094C398.113 234.04 391.225 235.168 384.119 235.36L381.929 235.388H336.493V259.523L336.468 260.222C335.969 267.321 327.885 270.987 320.494 267.076C320.494 267.076 259.244 238.047 234.861 222.13C224.194 215.167 215.079 205.761 208.2 194.641L206.822 192.338H174.215ZM279.101 94.1956C256.704 94.1956 234.19 114.367 234.19 144.8C234.19 164.238 243.817 180.228 256.717 188.649C265.263 194.229 280.641 202.517 296.509 210.643V195.404H381.929C404.326 195.404 426.84 175.233 426.84 144.8C426.84 114.367 404.326 94.1956 381.929 94.1956H279.101Z" />
    </svg>
  )
}

/** 智能体侧头像：指定了专家用专家头像，否则用产品身份头像 */
export function AgentAvatar({ className, expertVisualKey, productAvatar = "bot" }: { className?: string; expertVisualKey?: ExpertVisualKey; productAvatar?: ProductAvatarKey }) {
  if (expertVisualKey) return <ExpertAvatar visualKey={expertVisualKey} className={className} />
  if (productAvatar === "bot") return <span data-slot="agent-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-xs ring-1 ring-border", className)}><HiMateMark className="size-4" /></span>
  return null
}
