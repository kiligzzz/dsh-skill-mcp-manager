# DSH 插件发布流程（自研插件 → npm + GitHub）

> 本文档沉淀 DSH 自研插件的完整发布 SOP，含踩过的坑。适用对象：
> `~/dsh/plugins/*` 下的双面插件（host + browser half）。参照实现：
> `@kiligzzz/dsh-session-nav`、`@kiligzzz/dsh-session-archive`、`@kiligzzz/dsh-capability-manager`。

---

## 0. 前置判断：这个插件能发布吗？

- **双面插件**（host + client）才需要 bundle 包发布；纯 host 一行 `.cjs` 且强依赖本机路径的
  可以留在 `~/.dsh/cordis.patch.yml`（如 `language-zh.cjs`）。
- 发布前必须确认：无 dsh 源码改动、无私有宿主 API 依赖（只用公开 `ctx.get` 服务、
  `ctx.provide`、`webServer.register`）、浏览器端不依赖动态插件 harness。
- 唯一可接受的外部依赖是 `@deepseek-ai/*` 运行时包（宿主 loader 解析，**不打进发布包**）。

## 1. 建仓与目录结构（标准模板）

```
dsh-capability-manager/
├── package.json        # name: @kiligzzz/dsh-capability-manager, type: module
├── cordis.patch.yml    # bundle insert 行（dsh.bundle.patch 自动发现，无需手动加 insert）
├── index.js            # host half（ESM：export const name / inject / apply）
├── lib/client.js       # browser half（window.__ModuleLoader__.load，id 必须=包名）
├── test/verify.mjs     # 五处一致链 + REST 表面一致性检查
├── README.md / README.zh-CN.md / LICENSE / CHANGELOG.md
└── .gitignore          # node_modules/ pnpm-workspace.yaml .DS_Store
```

**package.json 关键字段**：

```jsonc
{
  "name": "@kiligzzz/dsh-capability-manager",
  "type": "module",
  "main": "index.js",
  "exports": {
    ".": "./index.js",
    "./client": "./lib/client.js",
    "./cordis.patch.yml": "./cordis.patch.yml",
    "./package.json": "./package.json"
  },
  "files": ["index.js", "lib", "cordis.patch.yml", "README.md", "README.zh-CN.md", "LICENSE"],
  "dsh": {
    "bundle": { "patch": "./cordis.patch.yml" },
    "client": { "inject": ["@deepseek-ai/dsh-client-store", "@deepseek-ai/dsh-client-ui-slots"], "platform": "web" }
  }
}
```

## 2. 五处全链路一致（硬规则，任一不一致 → Cannot find package → 整树崩）

包名必须在以下 5 处完全一致（含 `@scope/` 前缀）：

1. `package.json` 的 `name`
2. `cordis.patch.yml` 的 insert `name`
3. `lib/client.js` 的 `window.__ModuleLoader__.load({ id })`
4. `lib/client.js` 的 `module.exports.name` + 样式表 `tag.dataset.plugin` / `cssTagId`
5. profile 的依赖键 + `dsh.profile.bundles` 条目

用 `test/verify.mjs` 自动断言这 5 处（+ host 导出形状 + client 槽位 + REST 端点），
发布前必跑，全绿才发。

## 3. 本地切换安装方式（从 cordis.patch.yml → profile bundle）

发布前先在本地把插件从"机器级 patch insert"切成"标准 bundle 安装"，真机验证通过后再发布：

1. profile `package.json` 加 `"@kiligzzz/dsh-xxx": "link:/Users/ivan/dsh/plugins/dsh-xxx"` +
   `dsh.profile.bundles` 加包名；
2. `~/.dsh/cordis.patch.yml` 删除旧 insert 行（先 `cp` 出 `.bak-capability-publish-<ts>`）；
3. `pnpm install --offline` 更新 lockfile；
4. 手动建软链 `node_modules/@kiligzzz/dsh-xxx -> ~/dsh/plugins/dsh-xxx`（link: 依赖需要）；
5. 删除旧软链 / 旧目录；
6. 检查 `~/Library/Application Support/DSH Desktop/plugin-management/state.json` 的
   `disabledBundles` 不含新包名；
7. **重启 Desktop**，真机验证功能，失败即回滚（恢复 .bak + 移除 bundles）。

> ⚠️ 验证通过前**不要** publish——发布的代码必须经过真机验证。

## 4. git 历史：≥10 commits 门槛（awesome-dsh-plugin 收录）

如果打算投稿 [awesome-dsh-plugin](https://github.com/dsh-external/awesome-dsh-plugin)：

- 仓库必须**创建满 1 天** + **默认分支提交数 ≥10**（CI 用
  `GET /repos/{repo}/commits?per_page=1` 的 `Link: rel=last` 统计，不区分作者/merge）；
- 新仓库直接从**有意义的拆分提交**开始（scaffold → LICENSE → README(中英) →
  feat: host → feat: client → test → docs），别一个 `Initial commit` 了事；
- 已压成 1 个 commit 的旧仓库：孤儿分支重写（reset 到根 → 按功能分组重提 →
  `git push --force-with-lease`），重写前 `cp -r` 备份含 `.git` 到 /tmp；
- 投稿 PR 门禁：CI check + Submission gate 全绿等维护者 review。

## 5. 发布 npm（可选，默认不做）

> 用户约定（2026-08-21）：**自用插件默认不发布 npm**——本地一律 `link:` 安装，
> GitHub 仓库保留即可。仅当要给别人/别的机器 `npm install` 时才走本节。

```bash
cd ~/dsh/plugins/dsh-xxx
npm whoami                    # 确认 kiligzzz（未登录需手动 npm login，AI 不能代输凭证）
npm publish                   # 默认按 files 白名单打包
```

- `npm publish` 用 `files` 白名单，别把 `.git`、`node_modules`、`test` 之外的杂物发上去；
- 版本号：首次 `0.1.0`，破坏性改动升 minor，补丁升 patch。

## 6. 收尾必做（用户硬性规则）

- **备份域**：`~/dsh/backup/backup.sh` 的 `plugins-src` 列表加 `dsh-xxx`，然后跑一次
  `./backup.sh` 触发备份推送（launchd 每 6h 自动跑，但手动先推一次）；
- **记忆体**：发布关键结论/坑写入 Mnemon；
- 若改动涉及 `cordis.patch.yml` / profile / 宿主补丁 → 已含在 backup.sh 的 config 段，
  无需额外处理。

## 7. 回滚速查

| 故障 | 处理 |
|---|---|
| 重启后设置页空白 | host 缓存旧 entry id，重启 Desktop 恢复 |
| Cannot find package | 检查五处一致链 + 软链是否在 node_modules/@kiligzzz/ |
| 工具全崩（依赖 @deepseek-ai/dsh-tools） | 官方 bug #1697/#783，插件别引 dsh-tools |
| 发布版想退回本地 patch | 恢复 cordis.patch.yml .bak + 删 profile bundles + 重启 |
