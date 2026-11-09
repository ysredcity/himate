import assert from "node:assert/strict"
import { statSync } from "node:fs"
import { test } from "node:test"
import { expertCatalog, expertRecommendations, initialScheduledExpertIds } from "../../src/components/agent-layout/expert-data.ts"
import { addScheduledExpert, installedExpertIds, personalInstallationCount, removeScheduledExpert, resolveDelegatedExpert } from "../../src/components/agent-layout/expert-rules.ts"

const defaults = expertCatalog.filter((expert) => expert.enterpriseDefault)

test("普通安装20上限不计企业默认，去重、删除补位及无效ID", () => {
  const extra = Array.from({ length: 21 }, (_, index) => ({ ...expertCatalog[2], id: `optional-${index}`, enterpriseDefault: false }))
  const catalog = [...defaults, ...extra]
  const twenty = [...defaults.map((expert) => expert.id), ...extra.slice(0, 20).map((expert) => expert.id)]
  assert.equal(personalInstallationCount(twenty, catalog), 20)
  assert.equal(twenty.length, 22)
  assert.equal(addScheduledExpert(twenty, twenty[0], catalog).status, "duplicate")
  const full = addScheduledExpert(twenty, extra[20].id, catalog)
  assert.equal(full.status, "full")
  assert.deepEqual(full.ids, twenty)
  const removed = removeScheduledExpert(twenty, extra[0].id, catalog)
  assert.equal(personalInstallationCount(removed, catalog), 19)
  const added = addScheduledExpert(removed, extra[20].id, catalog)
  assert.equal(added.status, "added")
  assert.equal(added.ids.length, 22)
  assert.equal(addScheduledExpert(twenty, "unknown", catalog).status, "invalid")
})

test("企业默认始终安装、不可删除且不占名额，普通示例预装3位", () => {
  assert.deepEqual(installedExpertIds([], expertCatalog), ["hr", "travel"])
  for (const expert of defaults) {
    const after = removeScheduledExpert(initialScheduledExpertIds, expert.id, expertCatalog)
    assert.ok(after.includes(expert.id))
    assert.equal(addScheduledExpert([], expert.id, expertCatalog).status, "duplicate")
  }
  assert.equal(installedExpertIds(initialScheduledExpertIds, expertCatalog).length, 5)
  assert.equal(personalInstallationCount(initialScheduledExpertIds, expertCatalog), 3)
  assert.equal(personalInstallationCount(["hr", "travel", "finance", "finance"], expertCatalog), 1)
})

test("企业默认可自动匹配，普通只在安装后匹配，手动优先", () => {
  const resolve = (text: string, manual?: string, ids: string[] = []) => resolveDelegatedExpert(text, manual, ids, expertCatalog)
  assert.equal(resolve("我要请假"), "人事专家")
  assert.equal(resolve("整理差旅报销要点"), "差旅专家")
  assert.equal(resolve("整理会议纪要", undefined, ["meeting"]), "会议协作助手")
  assert.equal(resolve("整理会议纪要"), undefined)
  assert.equal(resolve("整理会议纪要", "会议协作助手"), "会议协作助手")
  assert.equal(resolve("我要请假", "差旅专家"), "差旅专家")
  assert.equal(resolve("帮我润色文字"), undefined)
})

test("目录唯一，企业默认及初始安装均支持召唤，角色 / 头像完整", () => {
  assert.equal(new Set(expertCatalog.map((expert) => expert.id)).size, expertCatalog.length)
  assert.ok(expertCatalog.filter((expert) => expert.canSummon).length >= 8)
  assert.ok(initialScheduledExpertIds.every((id) => expertCatalog.some((expert) => expert.id === id && expert.canSummon)))
  assert.deepEqual(defaults.map((expert) => expert.name), ["人事专家", "差旅专家"])
  for (const expert of expertCatalog) {
    assert.ok(expert.name && expert.role && expert.description && expert.source)
    assert.ok(statSync(new URL(`../../public${expert.avatar}`, import.meta.url)).size > 0)
  }
})

test("不支持召唤的专家禁止安装，旧名单残留不占额度且不参与调度", () => {
  const external = expertCatalog.find((expert) => !expert.canSummon)!
  assert.ok(external)
  assert.equal(addScheduledExpert(initialScheduledExpertIds, external.id, expertCatalog).status, "unsupported")
  const legacy = [...initialScheduledExpertIds, external.id]
  assert.ok(!installedExpertIds(legacy, expertCatalog).includes(external.id))
  assert.equal(personalInstallationCount(legacy, expertCatalog), 3)
  assert.equal(resolveDelegatedExpert(external.patterns[0], undefined, [external.id], expertCatalog), undefined)
})

test("推荐轮播引用有效的可召唤专家", () => {
  assert.ok(expertRecommendations.length > 1)
  assert.equal(new Set(expertRecommendations.map((item) => item.id)).size, expertRecommendations.length)
  for (const item of expertRecommendations) assert.ok(item.title && item.description && expertCatalog.some((expert) => expert.id === item.id && expert.canSummon))
})
