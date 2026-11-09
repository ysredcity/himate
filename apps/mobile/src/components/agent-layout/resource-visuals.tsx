import { BarChart3, Bot, BriefcaseBusiness, Building2, ChartLine, File, FileChartColumn, FilePen, FileSearch, FileSpreadsheet, FileText, Folder, Palette, Search, Send, Sparkles, type LucideIcon } from "lucide-react"

import { assets } from "@/assets"
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
  travel: { icon: BriefcaseBusiness, className: "bg-sky-500 text-white!" },
  office: { icon: BriefcaseBusiness, className: "bg-blue-500 text-white!" },
  document: { icon: FileText, className: "bg-violet-500 text-white!" },
  data: { icon: BarChart3, className: "bg-emerald-500 text-white!" },
  research: { icon: Search, className: "bg-orange-500 text-white!" },
  campus: { icon: Building2, className: "bg-cyan-500 text-white!" },
  ux: { icon: Palette, className: "bg-pink-500 text-white!" },
  industry: { icon: Sparkles, className: "bg-amber-500 text-white!" },
} satisfies Record<string, { icon: LucideIcon; className: string }>

export type ExpertVisualKey = keyof typeof expertVisuals
export type ProductAvatarKey = "bot" | "himate"

const expertVisualKeys: Record<string, ExpertVisualKey> = {
  差旅助手: "travel",
  日常办公专家: "office",
  文档处理专家: "document",
  数据分析专家: "data",
  市场调研专家: "research",
  园区生活专家: "campus",
  用户体验专家: "ux",
  行业研究专家: "industry",
}

/** 移动端 Composer 快捷专家与已选专家 Chip 使用的线性图标（设计稿 2903:46039），跟随文字颜色 */
const expertLineIcons: Record<ExpertVisualKey, LucideIcon> = {
  office: Folder,
  document: FilePen,
  data: ChartLine,
  research: FileSearch,
  campus: Building2,
  travel: Send,
  ux: Palette,
  industry: Sparkles,
}

export function ExpertLineIcon({ className, expert, visualKey }: { className?: string; expert?: string; visualKey?: ExpertVisualKey }) {
  const resolved = visualKey ?? (expert ? expertVisualKeys[expert] : undefined)
  const Icon = resolved ? expertLineIcons[resolved] : Sparkles
  return <Icon aria-hidden="true" className={cn("size-4 shrink-0", className)} />
}

/** 移动端短名称：去掉「专家」「助手」后缀，如「差旅助手」→「差旅」 */
export function shortExpertLabel(label: string) {
  return label.replace(/(专家|助手)$/, "")
}

const defaultExpertVisual = { icon: Sparkles, className: "bg-primary text-primary-foreground!" }

export function LibraryFileIcon({ className, fileName }: { className?: string; fileName: string }) {
  const FileIcon = fileIcons[fileName.split(".").pop()?.toLowerCase() ?? ""] ?? File
  return <FileIcon aria-hidden="true" className={cn("size-4 shrink-0", className)} />
}

export function ExpertAvatar({ className, expert, visualKey }: { className?: string; expert?: string; visualKey?: ExpertVisualKey }) {
  const resolvedVisualKey = visualKey ?? (expert ? expertVisualKeys[expert] : undefined)
  const visual = resolvedVisualKey ? expertVisuals[resolvedVisualKey] : defaultExpertVisual
  const ExpertIcon = visual.icon
  return <span data-slot="expert-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full shadow-xs ring-1 ring-black/5 transition-none", visual.className, className)}><ExpertIcon className="size-3.5" style={{ stroke: "white" }} /></span>
}

/** 智能体侧头像：指定了专家用专家头像，否则用产品身份头像 */
export function AgentAvatar({ className, expertVisualKey, productAvatar = "bot" }: { className?: string; expertVisualKey?: ExpertVisualKey; productAvatar?: ProductAvatarKey }) {
  if (expertVisualKey) return <ExpertAvatar visualKey={expertVisualKey} className={className} />
  if (productAvatar === "bot") return <span data-slot="agent-avatar" aria-hidden="true" className={cn("grid size-6 shrink-0 place-items-center rounded-full bg-primary shadow-xs ring-1 ring-black/5", className)}><Bot className="size-3.5" style={{ stroke: "white" }} /></span>
  // HiMate 产品头像沿用工作台首页的本地素材，尺寸由调用处 className 控制
  if (productAvatar === "himate") return <img data-slot="agent-avatar" src={assets.imgGuideImg4} alt="" aria-hidden="true" className={cn("size-6 shrink-0 rounded-full object-cover", className)} />
  return null
}
