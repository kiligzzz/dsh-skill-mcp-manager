# dsh-skill-mcp-manager

[English](./README.en.md) | 简体中文

**DSH Skill MCP Manager**（能力管理器）——为 [DeepSeek Harness](https://github.com/deepseek-ai/dsh) Desktop
提供设置页内的 **MCP server** 与 **Skill** 统一管理界面，无需手改配置文件、无需改动 DSH 源码。

| Skill 管理页 | MCP 管理页 |
| --- | --- |
| 开关 / 删除 / 导入 / 文件夹同步 skill（`~/.dsh/skills`）。 | 增删改 MCP server（`~/.dsh/mcp.json`），通过名称和描述按会话渐进加载工具。 |

基于官方 DSH 双面插件机制（host + 浏览器端），以 profile bundle 行加载——随 DSH 升级存续，
无需动态插件激活。

## 功能

**Skill 管理**（`~/.dsh/skills`）
- 列出所有 skill（名称 / 描述 / 类型：目录 `SKILL.md` 或扁平 `.md` / 启用状态），支持按名称、描述搜索。
- **开关**：改写 frontmatter 的 `disable-model-invocation` 标记实现启用/禁用。
- **删除**：真实条目删除文件/目录；软链条目只删链接本身，不追目标。
- **导入**：上传 `.md` 文件（名称自动规范化为 kebab-case）。
- **文件夹同步**：把源文件夹里的 skill 逐个 `ln -s` 软链进来，源改动实时生效。
- **编辑器打开**：macOS 用 `open`、Linux 用 `xdg-open`；其他平台提示不支持。

**MCP 管理**（`~/.dsh/mcp.json`，map 格式）
- 新增 / 编辑 / 删除 server，支持两种传输：`stdio`（命令/参数/环境变量/工作目录）与
  `streamable-http`（URL/请求头）。
- **按会话渐进加载**：启动时不连接 MCP，也不注入原生工具 Schema；模型命中 Server 描述后调用
  `mcp_session(load)`，再通过 `@deepseek-ai/dsh-mcp-client` 把该 Server 的全部工具加载到当前 Agent。
- `mcp_session` 支持 `load` / `unload` / `status`，不同会话互不影响；Agent 销毁时自动关闭连接并注销工具。
- `enabled` 表示 Server 是否允许被会话加载；直接编辑 `~/.dsh/mcp.json` 后，描述目录会在 3 秒内刷新，且只安全重连已经加载过该 Server 的会话。
- **打开配置文件**（macOS / Linux 系统编辑器）。

**能力清单 prompt 段**
每个会话的系统提示词都会追加紧凑的 `capability:mcp` 段，只列出已配置 Server 的名称、已有
`description` 与是否允许加载。模型需要某项能力时才加载完整工具 Schema。

## 安装

需要支持 profile bundle patch 的 DSH 环境。在 profile 的 `package.json` 里：

```json
{
  "dependencies": {
    "@kiligzzz/dsh-skill-mcp-manager": "^0.3.0"
  },
  "dsh": {
    "profile": {
      "bundles": ["@kiligzzz/dsh-skill-mcp-manager"]
    }
  }
}
```

安装后重启 DSH 即可。插件自带 `cordis.patch.yml`（bundle 自动发现），无需手写
`cordis.patch.yml` insert 行。

## 说明与依赖

- host 半区通过 `loader` 服务（回退 `import()`）从 DSH 运行时解析
  `@deepseek-ai/dsh-mcp-client`，**不随包发布**——由运行时提供。
- 浏览器端依赖 `slots` 服务（`settings.section` 槽位），与 host 通过同源
  fetch `/capabilities-api/*` 通信（带重试注册，规避启动时序）。
- `~/.dsh/mcp.json` 以 **map 格式** `{ "name": { ... } }` 写入；旧版
  `{ "servers": [...] }` 数组首次读取时自动迁移。
- 删除 / 开关 skill 会写 `~/.dsh/skills` 下的文件——破坏性操作 UI 会先确认。

## 开发

无构建步骤：`index.js`（host）与 `lib/client.js`（浏览器端）均为纯 JavaScript。
浏览器端经 `window.__ModuleLoader__.load` 加载，插件 id 与包名一致。

## License

MIT
