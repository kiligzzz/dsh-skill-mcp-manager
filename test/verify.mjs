// Migration / consistency verification for @kiligzzz/dsh-skill-mcp-manager.
//
// Checks that survive future edits:
//  1. package name appears in every place the DSH loader chain needs it
//     (package.json name, bundle patch insert name, client module id,
//     module.exports name, stylesheet tag id) — the "five-point chain" rule.
//  2. Host half exports the expected shape (name / inject / apply).
//  3. Browser half registers both settings.section slots.
//
// Run: node test/verify.mjs   (exit 0 = all green)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const name = pkg.name
const client = fs.readFileSync(path.join(root, 'lib/client.js'), 'utf8')
const host = fs.readFileSync(path.join(root, 'index.js'), 'utf8')
const patch = fs.readFileSync(path.join(root, 'cordis.patch.yml'), 'utf8')

let failed = false
const check = (label, ok, detail) => {
  console.log((ok ? '  PASS ' : '  FAIL ') + label + (detail ? ' — ' + detail : ''))
  if (!ok) failed = true
}

console.log('verify @' + name.replace(/^@/, ''))
console.log('  package:', name + '@' + pkg.version)

// 1. five-point chain
const expect = (label, ok) => check(label, ok, ok ? '' : 'expected to contain "' + name + '"')
expect('package.json name', pkg.name === name)
expect('bundle patch insert name', patch.includes("name: '" + name + "'"))
expect('client module id', client.includes('id: "' + name + '"'))
expect('client module.exports name', client.includes('name: "' + name + '"'))
expect('client stylesheet tag id', client.includes('"@' + name.slice(1) + '/styles"'))
expect('client stylesheet data-plugin', client.includes('tag.dataset.plugin = "' + name + '"'))

// 2. host shape
check('host exports name', /export const name = '@kiligzzz\/dsh-skill-mcp-manager'/.test(host))
check('host exports inject', /export const inject = \['tools'\]/.test(host))
check('host exports apply', /export function apply\(ctx\)/.test(host))

// 3. client slots + 0.1.2 compat
check('client registers Skill section', client.includes('id: "capabilities-skills"'))
check('client registers MCP section', client.includes('id: "capabilities-mcp"'))
check('client exports inject slots', client.includes('inject: ["slots"]'))
check('client apply uses ctx.slots', client.includes('const slots = ctx.slots;'))
check('client has no ctx.get("slots") call', !/const slots = ctx\.get\("slots"\)/.test(client))
check('package inject uses dsh-client-store', !JSON.stringify(pkg.dsh.client.inject).includes('dsh-client-runtime'))

// 4. REST surface used by the client exists in the host
for (const ep of ['/capabilities-api', '/capabilities-api/skill/toggle', '/capabilities-api/skill/open',
  '/capabilities-api/skill/delete', '/capabilities-api/skill/import', '/capabilities-api/skill/sync',
  '/capabilities-api/mcp/save', '/capabilities-api/mcp/remove', '/capabilities-api/mcp/refresh',
  '/capabilities-api/mcp/open-config']) {
  check('host handles ' + ep, host.includes("'" + ep + "'"))
}

if (failed) {
  console.error('\nFAILED — fix the inconsistencies before publishing.')
  process.exit(1)
}
console.log('\nAll checks passed.')
