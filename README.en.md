# dsh-capability-manager

[简体中文](./README.md) | English

**Capability Manager** for [DeepSeek Harness](https://github.com/deepseek-ai/dsh) Desktop —
manage your MCP servers and Skills from a Settings-page UI, no config-file editing or
DSH source changes required.

| Skill page | MCP page |
| --- | --- |
| Toggle / delete / import / folder-sync your skills (`~/.dsh/skills`). | Add / edit / toggle / refresh / remove MCP servers (`~/.dsh/mcp.json`), with live mount state and per-server tool lists. |

Built on the official DSH dual-face plugin mechanism (host + browser half), loaded as a
profile bundle row — survives DSH upgrades and needs no dynamic-plugin activation.

## Features

**Skill management** (`~/.dsh/skills`)
- List every skill with its description, kind (directory `SKILL.md` / flat `.md`),
  and enabled state; search by name or description.
- **Toggle** enable/disable by rewriting the `disable-model-invocation` frontmatter flag.
- **Delete** (real entry → removes the file/dir; symlinked entry → removes only the link).
- **Import** a `.md` file (name normalized to kebab-case).
- **Folder sync** — symlink every skill from a source folder (`ln -s`), so edits in the
  source take effect immediately.
- **Open in editor** (macOS `open` / Linux `xdg-open`; other platforms report unsupported).

**MCP management** (`~/.dsh/mcp.json`, map format)
- Add / edit / remove servers with both transports: `stdio` (command, args, env, cwd)
  and `streamable-http` (url, headers).
- **Live mount/unmount** through `@deepseek-ai/dsh-mcp-client` (resolved from the host
  runtime; no bundled dependency), with reconnect and a 60s tool-call timeout.
- Per-server **live status** (mounted / mounting / error / disabled), per-server
  **tool list** (prefixed `mcp__<name>__`) and error log copy.
- Editing `~/.dsh/mcp.json` on disk is picked up automatically (3s poll) and remounts.
- **Open config** in the system editor (macOS / Linux).

**Capability directory prompt section**
Every session's system prompt gets a `capability:mcp` section listing the configured
servers and their enabled/disabled state, so the model knows what tools are available.

## Install

Requires a DSH profile that loads profile bundle patches. In your profile's
`package.json`:

```json
{
  "dependencies": {
    "@kiligzzz/dsh-capability-manager": "^0.1.0"
  },
  "dsh": {
    "profile": {
      "bundles": ["@kiligzzz/dsh-capability-manager"]
    }
  }
}
```

Then install and restart DSH. The plugin is a bare bundle row (its own
`cordis.patch.yml` is discovered automatically); no manual `cordis.patch.yml` insert is
needed.

## Requirements & notes

- The host half resolves `@deepseek-ai/dsh-mcp-client` from the DSH runtime via the
  `loader` service (fallback `import()`). It is **not** bundled — the runtime provides it.
- Browser half needs the `slots` service (`settings.section` slot) and talks to the host
  over same-origin fetch `/capabilities-api/*` (registered with retry, no race on boot).
- `~/.dsh/mcp.json` is written in **map format** `{ "name": { ... } }`. A legacy
  `{ "servers": [...] }` array is auto-migrated on first read.
- Deleting / toggling skills writes files under `~/.dsh/skills` — destructive actions
  confirm in the UI first.

## Development

No build step: `index.js` (host) and `lib/client.js` (browser half) are plain
JavaScript. The browser half is loaded via `window.__ModuleLoader__.load` with the
plugin id matching the package name.

## License

MIT
