# CHANGELOG

All notable changes to this project are documented in this file.

## [0.2.0] - 2026-09-02

### Changed

- **改名**：`dsh-capability-manager` → **DSH Skill MCP Manager**（仓库 `kiligzzz/dsh-skill-mcp-manager`，包名 `@kiligzzz/dsh-skill-mcp-manager`）。全链路六处包名同步（package.json / cordis.patch.yml / client bundle id + exports + 样式 tag / host export name / verify.mjs），设置页标题与 README 显示名更新；REST 路由 `/capabilities-api/*` 与功能名 `capabilityManager` / `capability:mcp` 保持不变（内部契约，对外兼容）。

## [0.1.4] - 2026-09-02

### Fixed

- **DSH 0.1.2 破坏性变更兼容修复**（client 半此前静默失效，Settings 页 Skill/MCP 两个 section 不显示）：
  - `package.json` `dsh.client.inject`：`@deepseek-ai/dsh-client-runtime` → `@deepseek-ai/dsh-client-store`（0.1.2 起模块改名，旧名不存在导致 client 注入失败）。
  - `lib/client.js`：`module.exports` 增加 `inject: ["slots"]`（slots 为 hardDependency，缺失时 loader 抛 `cannot get property 'slots' without inject`）；`apply` 内 `ctx.get("slots")` → `ctx.slots`（旧式 get 在 0.1.2 fiber 时序下返回 undefined，client 半静默退出）。
  - `peerDependencies` 同步 `dsh-client-runtime` → `dsh-client-store`。
- `test/verify.mjs` 增加 0.1.2 兼容断言（exports.inject / ctx.slots / 无旧模块引用）。

## [0.1.3] - 2026-08-22

### Fixed

- cordis peerDependencies 改为 `^4.0.0-rc.7 || ^4.0.0`：npm 上无 cordis 4.0.0 正式版（latest=4.0.0-rc.8），原 `^4.0.0` 被商店校验判不满足；宿主内置 4.0.1 兼容。

## [0.1.2] - 2026-08-22

### Changed

- README: 默认简体中文（`README.md`），英文切换至 `README.en.md`。
- 新增 peerDependencies（`@deepseek-ai/dsh-mcp-client` / `dsh-client-runtime` / `dsh-client-ui-slots` 覆盖 0.1.1-rc.2 宿主）。
- 提交 1024Store 商店收录（PR imsai-sh/awesome-deepseek-harness-plugins#163）。

## [0.1.1] - 2026-08-21

Dark-theme UI polish (vision-verified on both themes).

- **Switch**: both on/off states now share the identical neutral gray track
  (`--dsw-alias-border-l4`) with a white thumb (`--dsw-static-neutral-bluish-00`);
  state is indicated only by thumb position (left = off, right = on) — no color
  change, no inverted thumb. Consistent with the system-default switch look.
- **Status dot (disabled)**: `--dsw-alias-label-tertiary` neutral gray, no
  opacity hack.
- **Buttons**: border back to `--dsw-alias-border-l2`; primary uses
  `--dsw-alias-state-business-primary` (brand blue) so it stays chromatic in
  both light and dark themes.

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
