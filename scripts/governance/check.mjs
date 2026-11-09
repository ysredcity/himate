import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, isAbsolute, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const defaultRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
const args = process.argv.slice(2)
if (args.length && (args.length !== 2 || args[0] !== '--root')) {
  console.error('Usage: node scripts/governance/check.mjs [--root <repository>]')
  process.exit(1)
}
const root = args.length ? resolve(args[1]) : defaultRoot
const issues = []
const required = [
  'AGENTS.md', 'README.md', 'CHANGELOG.md', 'CLAUDE.md', 'GEMINI.md',
  '.github/copilot-instructions.md', 'package.json', 'package-lock.json',
  'docs/README.md', 'docs/ARCHITECTURE.md', 'docs/DESIGN.md',
  'docs/context/current.md', 'docs/context/handoff.md', 'docs/context/handoff-template.md',
  'docs/governance/WORKFLOW.md', 'docs/governance/CONTEXT.md',
  'docs/decisions/README.md', 'docs/decisions/template.md',
  'docs/decisions/0001-repository-governance-and-app-isolation.md',
  'docs/decisions/0002-platform-specific-app-directories.md',
  'docs/archive/README.md', 'docs/reference/UED-员工智能工作台V1.0.md',
  'docs/figma/asset-manifest.json',
  'apps/mobile/package.json', 'apps/mobile/index.html', 'apps/mobile/vite.config.ts',
  'apps/mobile/src/App.tsx', 'apps/mobile/scripts/check-tokens.mjs',
  'apps/desktop-web/package.json', 'apps/desktop-web/index.html', 'apps/desktop-web/vite.config.ts',
  'apps/desktop-web/tsconfig.json', 'apps/desktop-web/components.json', 'apps/desktop-web/src/App.tsx',
  'apps/desktop-web/scripts/agent-ux/check-scripts.mjs', 'apps/desktop-web/scripts/agent-ux/check-tokens.mjs',
]
const fail = (message) => issues.push(message)
for (const path of required) {
  const full = resolve(root, path)
  if (!existsSync(full) || !statSync(full).isFile() || statSync(full).size === 0) fail(`缺少必要文件或文件为空：${path}`)
}

function readJson(path) {
  try { return JSON.parse(readFileSync(resolve(root, path), 'utf8')) }
  catch (error) { fail(`无法解析 ${path}：${error.message}`); return null }
}
const repo = readJson('package.json')
const app = readJson('apps/desktop-web/package.json')
const lock = readJson('package-lock.json')
const mobile = readJson('apps/mobile/package.json')
if (mobile?.name !== '@himate/mobile' || mobile?.private !== true) fail('移动端必须为 private @himate/mobile。')
for (const command of ['dev','build','gate','preview']) {
  if (!repo?.scripts?.[`${command}:mobile`]?.includes(`npm run ${command} --workspace @himate/mobile`)) fail(`缺少移动端 ${command} 转发。`)
}
for (const command of ['lint','check:tokens','build']) {
  if (!mobile?.scripts?.gate?.includes(`npm run ${command}`)) fail(`移动端 gate 未覆盖 ${command}。`)
}
if (lock?.packages?.['apps/mobile']?.name !== '@himate/mobile') fail('移动端 workspace 未进入根 lockfile。')
if (existsSync(resolve(root,'apps/mobile/package-lock.json'))) fail('移动端不得维护独立 lockfile。')

if (repo) {
  if (repo.private !== true || !repo.workspaces?.includes('apps/*')) fail('根 package.json 必须是包含 apps/* 的 private npm workspace。')
  if (Object.keys(repo.dependencies ?? {}).length || Object.keys(repo.devDependencies ?? {}).length) fail('应用依赖应在 apps/desktop-web/package.json 声明，根目录仅负责治理和命令编排。')
  for (const command of ['dev', 'build', 'lint', 'preview']) {
    if (!repo.scripts?.[command]?.includes(`npm run ${command} --workspace @himate/desktop-web`)) fail(`根 ${command} 未转发至 @himate/desktop-web。`)
  }
  if (repo.scripts?.['check:governance'] !== 'node scripts/governance/check.mjs') fail('根 check:governance 入口不一致。')
  if (repo.scripts?.gate !== 'npm run check:governance && npm run gate --workspace @himate/desktop-web && npm run gate:mobile') fail('根 gate 必须先验证治理，再运行桌面网页及移动端 gate。')
}
if (app) {
  if (app.name !== '@himate/desktop-web' || app.private !== true) fail('应用包必须为 private @himate/desktop-web。')
  for (const command of ['dev', 'build', 'lint', 'gate', 'check:scripts', 'check:tokens']) {
    if (!app.scripts?.[command]) fail(`应用缺少 ${command} 脚本。`)
  }
  for (const command of ['lint', 'check:scripts', 'check:tokens', 'build']) {
    if (!app.scripts?.gate?.includes(`npm run ${command}`)) fail(`桌面网页 gate 未覆盖 ${command}。`)
  }
}
if (lock && (lock.packages?.['apps/desktop-web']?.name !== '@himate/desktop-web' || !lock.packages?.['']?.workspaces?.includes('apps/*'))) fail('根 lockfile 与 npm workspace 不一致；请在根目录运行 npm install。')
if (lock && (lock.packages?.app || lock.packages?.['node_modules/@himate/web'])) fail('根 lockfile 残留旧 app workspace 或 @himate/web 链接。')
for (const path of ['src', 'public', 'dist', 'index.html', 'vite.config.ts', 'components.json', 'scripts/agent-ux', 'app', 'apps/desktop-web/package-lock.json', '.workbuddy']) {
  if (existsSync(resolve(root, path))) fail(`目录边界不正确：${path}；应用应在 apps/desktop-web/，旧 Agent 记忆应归档。`)
}

const documents = new Set(required.filter((path) => path.endsWith('.md') && !path.startsWith('docs/reference/')))
for (const folder of ['docs/plans', 'docs/decisions']) {
  const dir = resolve(root, folder)
  if (existsSync(dir)) for (const file of readdirSync(dir)) if (file.endsWith('.md')) documents.add(`${folder}/${file}`)
}
for (const path of documents) {
  if (!existsSync(resolve(root, path))) continue
  const source = readFileSync(resolve(root, path), 'utf8')
  for (const [, raw] of source.matchAll(/!?\[[^\]]*\]\(([^)\n]+)\)/g)) {
    let target = raw.trim().replace(/^<|>$/g, '')
    if (/^(?:https?:|mailto:|#)/i.test(target)) continue
    target = target.split('#')[0]
    try { target = decodeURIComponent(target) } catch { fail(`${path}：链接编码无效：${raw}`); continue }
    const absolute = resolve(dirname(resolve(root, path)), target)
    if (isAbsolute(target) || relative(root, absolute).startsWith('..')) fail(`${path}：使用了不可移植的仓库外链接：${raw}`)
    else if (!existsSync(absolute)) fail(`${path}：失效本地链接：${raw}`)
  }
}
for (const path of ['CLAUDE.md', 'GEMINI.md', '.github/copilot-instructions.md']) {
  if (existsSync(resolve(root, path)) && !readFileSync(resolve(root, path), 'utf8').includes('AGENTS.md')) fail(`${path} 必须指向唯一的 AGENTS.md。`)
}
if (existsSync(resolve(root, 'CHANGELOG.md')) && !readFileSync(resolve(root, 'CHANGELOG.md'), 'utf8').includes('## [Unreleased]')) fail('CHANGELOG.md 缺少 [Unreleased] 节点。')

if (issues.length) {
  console.error(`[governance] 发现 ${issues.length} 处问题：\n${issues.map((issue) => `  - ${issue}`).join('\n')}`)
  process.exit(1)
}
console.log(`[governance] 通过：${required.length} 个必要文件、${documents.size} 份治理文档链接、workspace 边界和统一命令。`)
