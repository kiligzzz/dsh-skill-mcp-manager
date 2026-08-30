// @kiligzzz/dsh-skill-mcp-manager — host half.
//
// Host-plane half of the Capability Manager: owns ALL business logic — MCP
// server mounting (dynamic plugin sandbox has no `ctx.plugin`), `mcp.json`
// (map format) management, skill management over `~/.dsh/skills` (toggle /
// delete / import / folder-sync via symlink), the capability-directory prompt
// section, and the `capabilityManager` service consumed by the browser half.
//
// Loaded as a profile bundle row (cordis.patch.yml, `dsh.bundle.patch`).
// The browser half (lib/client.js) talks to this half over same-origin
// fetch on `/capabilities-api/*`.

import path from 'node:path'
import os from 'node:os'
import fs from 'node:fs'
import { spawn } from 'node:child_process'

export const name = '@kiligzzz/dsh-skill-mcp-manager'

export const inject = ['tools']

export function apply(ctx) {
  const dshHome = process.env.DSH_HOME || path.join(os.homedir(), '.dsh')
  const mcpConfigPath = path.join(dshHome, 'mcp.json')
  const skillsRoot = path.join(dshHome, 'skills')
  const NAME_RE = /^[a-z0-9][a-z0-9-]{0,63}$/

  // ── 子进程助手 ──
  function run(argv) {
    return new Promise((resolve, reject) => {
      const child = spawn(argv[0], argv.slice(1), { stdio: 'ignore' })
      child.on('error', reject)
      child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(argv[0] + ' exit ' + code))))
    })
  }

  // ── skill frontmatter ──
  function parseFrontmatter(text) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    const fm = m ? m[1] : ''
    const body = m ? text.slice(m[0].length) : text
    const get = (k) => {
      const re = new RegExp('^' + k + '\\s*:\\s*(.+?)\\s*$', 'm')
      const r = fm.match(re)
      return r ? r[1].trim() : undefined
    }
    const raw = get('disable-model-invocation')
    const disabled = raw === 'true' || raw === 'yes' || raw === 'on' || raw === '1'
    return { name: get('name'), description: get('description') || '', whenToUse: get('whenToUse') || '', disabled, fm, body }
  }

  // ── skill 发现（软链也跟随识别）──
  function listSkills() {
    if (!fs.existsSync(skillsRoot)) return []
    const out = []
    for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      try {
        const abs = path.join(skillsRoot, entry.name)
        let isDir = entry.isDirectory()
        let isFile = entry.isFile()
        const isLink = entry.isSymbolicLink()
        if (isLink) {
          // Dirent.isDirectory/isFile 对软链为 false，需 follow 判断
          const st = fs.statSync(abs)
          isDir = st.isDirectory()
          isFile = st.isFile()
        }
        let content = null
        let kind = null
        if (isDir) {
          const p = path.join(abs, 'SKILL.md')
          if (fs.existsSync(p)) { content = fs.readFileSync(p, 'utf8'); kind = 'dir' }
        } else if (isFile && entry.name.endsWith('.md')) {
          content = fs.readFileSync(abs, 'utf8')
          kind = 'flat'
        }
        if (content === null) continue
        const parsed = parseFrontmatter(content)
        let syncedSource
        if (isLink) {
          try { syncedSource = path.dirname(fs.readlinkSync(abs)) } catch (e) { syncedSource = undefined }
        }
        out.push({
          name: parsed.name || entry.name.replace(/\.md$/, ''),
          description: parsed.description || '',
          whenToUse: parsed.whenToUse || '',
          enabled: !parsed.disabled,
          kind,
          synced: isLink,
          syncedSource,
          path: entry.name,
        })
      } catch (e) { /* 跳过坏条目 */ }
    }
    return out
  }
  function findSkill(name) { return listSkills().find((s) => s.name === name) || null }

  function setDisabled(text, name, disabled) {
    const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
    const body = m ? text.slice(m[0].length) : text
    let fm = m ? m[1] : ''
    fm = fm.split('\n').filter((l) => !/^[ \t]*disable-model-invocation\s*:/.test(l)).join('\n')
    if (disabled) {
      fm = fm.replace(/\s+$/, '')
      fm = fm + (fm.length ? '\n' : '') + 'disable-model-invocation: true'
    }
    if (!/^name\s*:/m.test(fm)) {
      fm = fm.replace(/\s+$/, '')
      fm = 'name: ' + name + '\n' + (fm.length ? fm + '\n' : '')
    }
    return '---\n' + fm.replace(/\s+$/, '') + '\n---\n' + body
  }

  // ── skill 操作 ──
  async function toggleSkill(name, enabled) {
    const f = findSkill(name)
    if (!f) throw new Error('skill 不存在: ' + name)
    const p = path.join(skillsRoot, f.kind === 'dir' ? name + '/SKILL.md' : name + '.md')
    fs.writeFileSync(p, setDisabled(fs.readFileSync(p, 'utf8'), name, !enabled))
  }
  async function deleteSkill(name) {
    const f = findSkill(name)
    if (!f) throw new Error('skill 不存在: ' + name)
    // 软链：只删链接本身，不追目标；真实条目：删除整个目录或文件
    const target = f.synced
      ? path.join(skillsRoot, f.path)
      : (f.kind === 'dir' ? path.join(skillsRoot, f.name) : path.join(skillsRoot, f.name + '.md'))
    await run(['rm', '-rf', '--', target])
  }
  async function importSkill(name, content) {
    if (!NAME_RE.test(name)) throw new Error('skill 名称需为 kebab-case（小写字母/数字/-）')
    fs.mkdirSync(skillsRoot, { recursive: true })
    fs.writeFileSync(path.join(skillsRoot, name + '.md'), content)
  }
  async function syncSkills(source) {
    if (!source) throw new Error('请填写源文件夹路径')
    if (!fs.existsSync(source) || !fs.statSync(source).isDirectory()) throw new Error('源文件夹不存在: ' + source)
    fs.mkdirSync(skillsRoot, { recursive: true })
    const synced = []
    const skipped = []
    for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      let srcAbs = null
      let dstName = null
      if (entry.isDirectory()) {
        if (fs.existsSync(path.join(source, entry.name, 'SKILL.md'))) { srcAbs = path.join(source, entry.name); dstName = entry.name }
        else continue
      } else if (entry.isFile() && entry.name.endsWith('.md')) { srcAbs = path.join(source, entry.name); dstName = entry.name }
      else continue
      const dstAbs = path.join(skillsRoot, dstName)
      if (fs.existsSync(dstAbs)) { skipped.push(dstName + '（已存在）'); continue }
      try {
        await run(['ln', '-s', srcAbs, dstAbs])
        synced.push(dstName)
      } catch (e) { skipped.push(dstName) }
    }
    return { synced, skipped }
  }

  // 系统编辑器打开；仅 macOS/Linux 支持，其他平台返回 false（UI 提示不支持）
  function openWithSystem(abs) {
    return new Promise((resolve) => {
      const platform = process.platform
      let cmd = null
      if (platform === 'darwin') cmd = 'open'
      else if (platform === 'linux') cmd = 'xdg-open'
      if (!cmd) { resolve(false); return }
      const child = spawn(cmd, [abs], { stdio: 'ignore', detached: true })
      child.on('error', () => resolve(false))
      child.unref()
      resolve(true)
    })
  }

  // ── MCP：map 格式配置（{ "name": { url, description, ... } }）──
  function toMapEntry(s) {
    const e = {}
    if (s.transport === 'stdio') {
      e.command = s.command || 'npx'
      if (s.args && s.args.length) e.args = s.args
      if (s.env && Object.keys(s.env).length) e.env = s.env
      if (s.cwd) e.cwd = s.cwd
    }
    if (s.url) e.url = s.url
    if (s.headers && Object.keys(s.headers).length) e.headers = s.headers
    const desc = s.description || s.purpose
    if (desc) e.description = desc
    if (s.enabled === false) e.enabled = false
    return e
  }
  function fromMapEntry(name, e) {
    return {
      name,
      transport: e.command ? 'stdio' : 'streamable-http',
      command: e.command || 'npx',
      args: e.args || [],
      env: e.env || {},
      cwd: e.cwd || '',
      url: e.url || '',
      headers: e.headers || {},
      enabled: e.enabled !== false,
      description: e.description || '',
    }
  }
  function readServers() {
    try {
      const raw = JSON.parse(fs.readFileSync(mcpConfigPath, 'utf8'))
      if (Array.isArray(raw.servers)) {
        const list = raw.servers.map((s) => Object.assign({}, s, { description: s.description || s.purpose || '' }))
        writeServers(list)
        return list
      }
      if (raw && typeof raw === 'object') {
        return Object.keys(raw).map((n) => fromMapEntry(n, raw[n])).filter((s) => s.name)
      }
    } catch (e) { /* 不存在或损坏 */ }
    return []
  }
  function writeServers(list) {
    const map = {}
    for (const s of list) map[s.name] = toMapEntry(s)
    fs.mkdirSync(dshHome, { recursive: true })
    fs.writeFileSync(mcpConfigPath, JSON.stringify(map, null, 2))
  }

  // ── MCP 挂载 ──
  const fibers = new Map()
  const status = new Map()
  let mcpPlugin = null

  async function getMcpPlugin() {
    if (mcpPlugin) return mcpPlugin
    // 必须用 loader 解析（插件位于 ~/.dsh/plugins，Node 默认解析不到 app 的 node_modules）
    const loader = ctx.get('loader')
    if (loader && typeof loader.import === 'function') {
      const mod = await loader.import('@deepseek-ai/dsh-mcp-client')
      mcpPlugin = (mod && mod.default) || mod
    } else {
      const mod = await import('@deepseek-ai/dsh-mcp-client')
      mcpPlugin = (mod && mod.default) || mod
    }
    return mcpPlugin
  }

  function clientConfig(s) {
    const base = {
      serverName: s.name,
      toolCallTimeoutMs: 60000,
      failOnStartupError: false,
      reconnect: { enabled: true, initialDelayMs: 500, maxDelayMs: 30000, maxAttempts: 10 },
    }
    if (s.transport === 'stdio') {
      return Object.assign({}, base, {
        transport: 'stdio', command: s.command || 'npx',
        args: Array.isArray(s.args) ? s.args : [], env: s.env || {}, cwd: s.cwd || '',
      })
    }
    return Object.assign({}, base, { transport: 'streamable-http', url: s.url || '', headers: s.headers || {} })
  }

  // 实时统计某 server 已注册的工具（去掉 mcp__<name>__ 前缀，带描述）
  function listMcpTools(name) {
    try {
      const prefix = 'mcp__' + name + '__'
      return ctx.tools
        .schemas()
        .filter((t) => typeof t.name === 'string' && t.name.startsWith(prefix))
        .map((t) => ({ name: t.name.slice(prefix.length), description: t.description || '' }))
        .sort((a, b) => a.name.localeCompare(b.name))
    } catch (e) { return [] }
  }

  function unmountServer(name) {
    const fiber = fibers.get(name)
    if (fiber) {
      try { fiber.dispose() } catch (e) { /* ignore */ }
      fibers.delete(name)
    }
    status.delete(name)
  }

  async function mountServer(s) {
    unmountServer(s.name)
    if (!s.enabled) {
      status.set(s.name, { state: 'disabled', error: null })
      return
    }
    status.set(s.name, { state: 'mounting', error: null })
    try {
      const plugin = await getMcpPlugin()
      if (!plugin) throw new Error('无法加载 @deepseek-ai/dsh-mcp-client')
      const fiber = ctx.plugin(plugin, clientConfig(s))
      fibers.set(s.name, fiber)
      try {
        await fiber
        status.set(s.name, { state: 'mounted', error: null })
      } catch (err) {
        status.set(s.name, { state: 'error', error: String((err && err.message) || err) })
      }
    } catch (err) {
      status.set(s.name, { state: 'error', error: String((err && err.message) || err) })
    }
  }

  async function syncAll() {
    for (const s of readServers()) await mountServer(s)
  }

  // ── mcp.json 变更轮询（编辑文件保存后自动重载）──
  let lastVersion = null
  function pollConfig() {
    let v = 'absent'
    try { v = fs.statSync(mcpConfigPath).mtimeMs + ':' + fs.statSync(mcpConfigPath).size } catch (e) { /* ignore */ }
    if (lastVersion === null) { lastVersion = v; return }
    if (v !== lastVersion) {
      lastVersion = v
      syncAll().catch(() => { /* ignore */ })
    }
  }
  const pollTimer = setInterval(pollConfig, 3000)
  ctx.effect(() => () => clearInterval(pollTimer))

  // ── 全局能力清单（每个会话可见）──
  let sectionDispose = null
  function refreshSection() {
    try {
      if (sectionDispose) { sectionDispose(); sectionDispose = null }
      const sys = ctx.get('systemPrompt')
      if (!sys) return
      const servers = readServers()
      const lines = []
      lines.push('Capability directory — MCP servers (managed by ~/.dsh/mcp.json):')
      if (!servers.length) {
        lines.push('- none configured. Configure them in Settings → MCP.')
      } else {
        for (const s of servers) {
          lines.push('- MCP ' + s.name + ': ' + (s.description || s.transport) + ' (tools mcp__' + s.name + '__*, ' + (s.enabled ? 'enabled' : 'disabled') + ')')
        }
      }
      sectionDispose = sys.section({ name: 'capability:mcp', order: 15, text: lines.join('\n') })
    } catch (e) { /* ignore */ }
  }

  // ── 服务：浏览器 half 可经 dynamic plugin 调用；主要入口是 REST ──
  const service = {
    configPath: mcpConfigPath,
    skillsRoot,
    async listSkills() { return listSkills() },
    async toggleSkill(name, enabled) { await toggleSkill(String(name), !!enabled); return { ok: true } },
    async deleteSkill(name) { await deleteSkill(String(name)); return { ok: true } },
    async importSkill(name, content) { await importSkill(String(name), String(content)); return { ok: true } },
    async syncSkills(source) { return syncSkills(String(source || '').trim()) },
    async openSkill(name) {
      const f = findSkill(String(name))
      if (!f) throw new Error('skill 不存在')
      const ok = await openWithSystem(path.join(skillsRoot, f.kind === 'dir' ? f.name + '/SKILL.md' : f.name + '.md'))
      if (!ok) throw new Error('当前平台不支持打开文件（仅 macOS / Linux）')
      return { ok: true }
    },
    async listServers() {
      const servers = readServers().map((s) => {
        const st = status.get(s.name) || { state: 'unknown', error: null }
        const tools = listMcpTools(s.name)
        return Object.assign({}, s, { tools, status: Object.assign({}, st, { tools: tools.length }) })
      })
      return { servers }
    },
    async saveServer(server) {
      const s = server || {}
      if (!s.name || !NAME_RE.test(String(s.name))) throw new Error('server 名称需为 kebab-case')
      const name = String(s.name)
      const clean = {
        name,
        transport: s.transport === 'stdio' ? 'stdio' : 'streamable-http',
        command: s.command || 'npx',
        args: Array.isArray(s.args) ? s.args : [],
        env: s.env || {},
        cwd: s.cwd || '',
        url: s.url || '',
        headers: s.headers || {},
        enabled: !!s.enabled,
        description: s.description || s.purpose || '',
      }
      const list = readServers()
      const i = list.findIndex((x) => x.name === name)
      if (i >= 0) list[i] = clean; else list.push(clean)
      writeServers(list)
      await mountServer(clean)
      refreshSection()
      return { ok: true }
    },
    async removeServer(name) {
      const list = readServers().filter((s) => s.name !== name)
      writeServers(list)
      unmountServer(String(name))
      refreshSection()
      return { ok: true }
    },
    async refreshServer(name) {
      const s = readServers().find((x) => x.name === name)
      if (s) await mountServer(s)
      return { ok: true }
    },
    async openConfig() {
      writeServers(readServers())
      const ok = await openWithSystem(mcpConfigPath)
      if (!ok) throw new Error('当前平台不支持打开文件（仅 macOS / Linux）')
      return { ok: true }
    },
  }

  ctx.provide('capabilityManager', service)

  // ── REST API：浏览器 half 直接 fetch 调用（不依赖动态插件 harness）──
  // webServer 服务可能晚于本插件激活，采用延迟重试注册，规避任何时序问题。
  const send = (res, code, data) => {
    try {
      res.writeHead(code, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify(data))
    } catch (e) { /* ignore */ }
  }
  const readBody = (req) => new Promise((resolve, reject) => {
    let buf = ''
    req.on('data', (c) => { buf += c; if (buf.length > 2e6) { req.destroy(); reject(new Error('body too large')) } })
    req.on('end', () => { try { resolve(buf ? JSON.parse(buf) : {}) } catch (e) { reject(new Error('请求体不是合法 JSON')) } })
    req.on('error', reject)
  })
  const restHandler = async (req, res) => {
    try {
      const pathname = decodeURIComponent((req.url || '/').split('?')[0])
      if (req.method === 'GET' && pathname === '/capabilities-api') {
        const skills = await service.listSkills()
        const servers = await service.listServers()
        return send(res, 200, { ok: true, dshHome, mcpConfigPath, skills: { user: skills }, mcp: servers })
      }
      if (req.method === 'POST') {
        const body = await readBody(req)
        let out
        switch (pathname) {
          case '/capabilities-api/skill/toggle': out = await service.toggleSkill(body.name, body.enabled); break
          case '/capabilities-api/skill/open': out = await service.openSkill(body.name); break
          case '/capabilities-api/skill/delete': out = await service.deleteSkill(body.name); break
          case '/capabilities-api/skill/import': out = await service.importSkill(body.name, body.content); break
          case '/capabilities-api/skill/sync': out = await service.syncSkills(body.source); break
          case '/capabilities-api/mcp/save': out = await service.saveServer(body.server); break
          case '/capabilities-api/mcp/remove': out = await service.removeServer(body.name); break
          case '/capabilities-api/mcp/refresh': out = await service.refreshServer(body.name); break
          case '/capabilities-api/mcp/open-config': out = await service.openConfig(); break
          default: return send(res, 404, { ok: false, error: 'not found: ' + pathname })
        }
        return send(res, 200, Object.assign({ ok: true }, out))
      }
      send(res, 405, { ok: false, error: 'method not allowed' })
    } catch (e) {
      send(res, 400, { ok: false, error: String((e && e.message) || e) })
    }
  }
  let restStopped = false
  const tryRegisterRest = () => {
    if (restStopped) return
    const ws = ctx.get('webServer')
    if (!ws || typeof ws.register !== 'function') return // 未就绪，等下一轮
    try {
      const routeDispose = ws.register({ kind: 'prefix', path: '/capabilities-api', handler: restHandler })
      restStopped = true
      // ctx.effect 的 callback 立即执行，返回值才是清理函数
      ctx.effect(() => () => { try { routeDispose() } catch (e) { /* ignore */ } })
    } catch (e) {
    }
  }
  const restTimer = setInterval(tryRegisterRest, 500)
  // 同上：返回清理函数，不能立即执行
  ctx.effect(() => () => { restStopped = true; clearInterval(restTimer) })
  tryRegisterRest()

  // 启动时同步一次
  syncAll()
    .then(() => refreshSection())
    .catch((e) => console.error('@kiligzzz/dsh-skill-mcp-manager sync:', e))

  // 卸载清理
  ctx.effect(() => () => {
    for (const name of Array.from(fibers.keys())) unmountServer(name)
    if (sectionDispose) { try { sectionDispose() } catch (e) { /* ignore */ } }
  })
}
