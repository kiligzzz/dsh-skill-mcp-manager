import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const tempHome = fs.mkdtempSync(path.join(os.tmpdir(), 'dsh-lazy-mcp-'))
process.env.DSH_HOME = tempHome
fs.writeFileSync(path.join(tempHome, 'mcp.json'), JSON.stringify({
  'db-mcp': {
    transport: 'streamable-http',
    url: 'http://127.0.0.1:1/mcp',
    description: 'read-only database queries',
    enabled: true
  },
  'off-mcp': {
    transport: 'streamable-http',
    url: 'http://127.0.0.1:1/mcp',
    description: 'disabled server',
    enabled: false
  }
}, null, 2))

const globalTools = new Map()
const scopedTools = new WeakMap()
const events = new Map()
const cleanups = []
let disposedFibers = 0
let pluginCount = 0
let providedManager = null
let promptText = ''

function toolMap(agent) {
  let map = scopedTools.get(agent)
  if (!map) {
    map = new Map()
    scopedTools.set(agent, map)
  }
  return map
}

const fakeMcpPlugin = { name: 'fake-mcp-client' }
const ctx = {
  tools: {
    register(definition) {
      globalTools.set(definition.name, definition)
      return () => globalTools.delete(definition.name)
    },
    schemas(agent) {
      return [...globalTools.values(), ...(agent ? toolMap(agent).values() : [])]
        .map(({ name, description, parameters }) => ({ name, description, parameters }))
    }
  },
  get(name) {
    if (name === 'loader') return { import: async () => ({ default: fakeMcpPlugin }) }
    if (name === 'systemPrompt') return {
      section({ text }) {
        promptText = text
        return () => { promptText = '' }
      }
    }
    return undefined
  },
  provide(name, value) {
    if (name === 'capabilityManager') providedManager = value
  },
  on(name, listener) {
    events.set(name, listener)
    return () => events.delete(name)
  },
  effect(callback) {
    const cleanup = callback()
    if (typeof cleanup === 'function') cleanups.push(cleanup)
    return cleanup
  }
}

function createAgent(id) {
  const session = { id }
  const agent = { id, session }
  agent.ctx = {
    plugin(plugin, config) {
      assert.equal(plugin, fakeMcpPlugin)
      pluginCount += 1
      const name = 'mcp__' + config.serverName + '__query'
      toolMap(agent).set(name, { name, description: 'query tool', parameters: {} })
      let disposed = false
      return {
        then(resolve) { queueMicrotask(resolve) },
        async dispose() {
          if (disposed) return
          await new Promise((resolve) => setTimeout(resolve, 5))
          disposed = true
          disposedFibers += 1
          toolMap(agent).delete(name)
        }
      }
    }
  }
  return agent
}

try {
  const { apply } = await import('../index.js?test=' + Date.now())
  apply(ctx)

  const sessionTool = globalTools.get('mcp_session')
  assert.ok(sessionTool, 'mcp_session should always be registered')
  assert.match(promptText, /db-mcp: read-only database queries/)
  assert.match(promptText, /off-mcp: disabled/)
  assert.equal([...globalTools].some(([name]) => name.startsWith('mcp__')), false, 'no MCP tool is global')

  const agentA = createAgent('agent-a')
  const agentB = createAgent('agent-b')
  const [load1, load2] = await Promise.all([
    sessionTool.execute({ action: 'load', servers: ['db-mcp'] }, { agent: agentA }),
    sessionTool.execute({ action: 'load', servers: ['db-mcp'] }, { agent: agentA })
  ])
  assert.deepEqual(load1.loaded, ['db-mcp'])
  assert.deepEqual(load2.loaded, ['db-mcp'])
  assert.equal(load1.results[0].state, 'mounted')
  assert.equal(load2.results[0].state, 'mounted')
  assert.equal(pluginCount, 1, 'concurrent loads share one Fiber')
  assert.equal(ctx.tools.schemas(agentA).some((tool) => tool.name === 'mcp__db-mcp__query'), true)
  assert.equal(ctx.tools.schemas(agentB).some((tool) => tool.name === 'mcp__db-mcp__query'), false)

  const status = await sessionTool.execute({ action: 'status' }, { agent: agentA })
  assert.deepEqual(status.loaded, ['db-mcp'])
  assert.deepEqual(status.results.map(({ name, state, tools }) => ({ name, state, tools })), [
    { name: 'db-mcp', state: 'mounted', tools: 1 }
  ])

  const disabled = await sessionTool.execute({ action: 'load', servers: ['off-mcp'] }, { agent: agentB })
  assert.equal(disabled.results[0].state, 'disabled')
  assert.deepEqual(disabled.loaded, [])

  const unload = await sessionTool.execute({ action: 'unload', servers: ['db-mcp'] }, { agent: agentA })
  assert.equal(unload.results[0].state, 'unloaded')
  assert.equal(ctx.tools.schemas(agentA).some((tool) => tool.name === 'mcp__db-mcp__query'), false)
  assert.equal(disposedFibers, 1, 'unload awaits async Fiber disposal')

  const reload = await sessionTool.execute({ action: 'load', servers: ['db-mcp'] }, { agent: agentA })
  assert.equal(reload.results[0].state, 'mounted')

  await Promise.all([
    providedManager.refreshServer('db-mcp'),
    sessionTool.execute({ action: 'unload', servers: ['db-mcp'] }, { agent: agentA })
  ])
  assert.equal(ctx.tools.schemas(agentA).some((tool) => tool.name === 'mcp__db-mcp__query'), false, 'refresh must not revive a concurrent unload')

  const loadAgain = await sessionTool.execute({ action: 'load', servers: ['db-mcp'] }, { agent: agentA })
  assert.equal(loadAgain.results[0].state, 'mounted')
  await Promise.all([
    providedManager.refreshServer('db-mcp'),
    providedManager.removeServer('db-mcp')
  ])
  assert.equal(ctx.tools.schemas(agentA).some((tool) => tool.name === 'mcp__db-mcp__query'), false, 'refresh must not revive a deleted server')
  assert.equal((await providedManager.listServers()).servers.some((server) => server.name === 'db-mcp'), false)

  events.get('agent/disposed')({ agent: agentA })
  await new Promise((resolve) => setTimeout(resolve, 10))
  assert.equal(ctx.tools.schemas(agentA).some((tool) => tool.name === 'mcp__db-mcp__query'), false)
  assert.equal(disposedFibers, 4, 'configuration races still await Fiber cleanup')

  console.log('lazy MCP session isolation and lifecycle: PASS')
} finally {
  for (const cleanup of cleanups.reverse()) cleanup()
  fs.rmSync(tempHome, { recursive: true, force: true })
  delete process.env.DSH_HOME
}
