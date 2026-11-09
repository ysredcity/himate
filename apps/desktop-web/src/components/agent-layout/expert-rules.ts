import type { Expert } from "./expert-data"

export const SCHEDULED_EXPERT_LIMIT = 20

export function installedExpertIds(ids: readonly string[], catalog: readonly Expert[]): string[] {
  const selected = new Set(ids)
  return catalog.filter((expert) => expert.canSummon && (expert.enterpriseDefault || selected.has(expert.id))).map((expert) => expert.id)
}

export function personalInstallationCount(ids: readonly string[], catalog: readonly Expert[]): number {
  const selected = new Set(ids)
  return catalog.filter((expert) => expert.canSummon && !expert.enterpriseDefault && selected.has(expert.id)).length
}

export function addScheduledExpert(ids: readonly string[], id: string, catalog: readonly Expert[]): { ids: string[]; status: "added" | "duplicate" | "full" | "invalid" | "unsupported" } {
  const installed = installedExpertIds(ids, catalog)
  const expert = catalog.find((candidate) => candidate.id === id)
  if (!expert) return { ids: installed, status: "invalid" }
  if (!expert.canSummon) return { ids: installed, status: "unsupported" }
  if (installed.includes(id)) return { ids: installed, status: "duplicate" }
  if (personalInstallationCount(installed, catalog) >= SCHEDULED_EXPERT_LIMIT) return { ids: installed, status: "full" }
  return { ids: [...installed, id], status: "added" }
}

export function removeScheduledExpert(ids: readonly string[], id: string, catalog: readonly Expert[]): string[] {
  const remaining = ids.filter((value) => value !== id)
  return installedExpertIds(remaining, catalog)
}

/** 手动指定优先；自动匹配仅使用名单中已提供演示匹配规则的专家。 */
export function resolveDelegatedExpert(content: string, manualExpert: string | undefined, ids: readonly string[], catalog: readonly Expert[]): string | undefined {
  if (manualExpert) return manualExpert
  const candidates = catalog.filter((expert) => expert.canSummon && (expert.enterpriseDefault || ids.includes(expert.id)))
  return candidates.flatMap((expert) => expert.patterns.filter((pattern) => content.includes(pattern)).map((pattern) => ({ expert, length: pattern.length })))
    .sort((a, b) => b.length - a.length)[0]?.expert.name
}
