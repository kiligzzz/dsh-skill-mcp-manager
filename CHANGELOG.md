# CHANGELOG

All notable changes to this project are documented in this file.

## [0.1.0] - 2026-08-21

Initial release.

- **Skill management** (`~/.dsh/skills`): list / search / toggle
  (`disable-model-invocation` frontmatter) / delete (real entry vs symlink) /
  import (`.md`, kebab-case) / folder-sync (`ln -s`) / open in editor
  (macOS `open`, Linux `xdg-open`; other platforms report unsupported).
- **MCP management** (`~/.dsh/mcp.json`, map format): add / edit / remove
  servers (`stdio` + `streamable-http`), live mount/unmount via
  `@deepseek-ai/dsh-mcp-client` (resolved from host runtime, not bundled),
  per-server status + tool list, 3s file-change poll auto-remount,
  legacy `{ "servers": [...] }` array auto-migration.
- **Capability directory prompt section**: `capability:mcp` system-prompt
  section listing configured servers and their enabled state.
- **Dual-face plugin**: host half (index.js) + browser half (lib/client.js,
  hand-written `window.__ModuleLoader__` bundle), loaded as a profile bundle
  row via its own `cordis.patch.yml`; Settings-page Skill / MCP sections
  talk to the host over same-origin fetch `/capabilities-api/*`.
