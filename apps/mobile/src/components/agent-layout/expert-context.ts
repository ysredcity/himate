import { createContext, useContext } from "react"

import { expertCatalog, initialScheduledExpertIds, type Expert } from "./expert-data"
import { installedExpertIds } from "./expert-rules"

/**
 * 已安装专家（企业默认 + 个人安装）。状态由 AgentShell 持有，专家页安装 / 删除后
 * Composer「专家」面板通过此 Context 实时读取，与桌面 Composer 口径一致。
 */
const defaultInstalled = expertCatalog.filter((expert) => installedExpertIds(initialScheduledExpertIds, expertCatalog).includes(expert.id))

export type ExpertsContextValue = {
  installed: readonly Expert[]
  /** 打开专家列表页（Composer 专家面板「查看更多专家」使用） */
  openExperts?: () => void
}

export const InstalledExpertsContext = createContext<ExpertsContextValue>({ installed: defaultInstalled })

export function useInstalledExperts() {
  return useContext(InstalledExpertsContext).installed
}

export function useOpenExperts() {
  return useContext(InstalledExpertsContext).openExperts
}
