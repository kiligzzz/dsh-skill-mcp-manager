window.__ModuleLoader__.load({
  id: "@kiligzzz/dsh-capability-manager",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
    const React = require("react");

    // ── 样式注入 ──
    const CSS =
      ".cm-page{display:flex;flex-direction:column;gap:10px;height:100%;overflow:auto;padding:4px 2px 24px;font-size:13px;color:var(--dsw-alias-label-primary)}" +
      ".cm-head{display:flex;align-items:center;justify-content:space-between;gap:8px}" +
      ".cm-title{font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary)}" +
      ".cm-sub{color:var(--dsw-alias-label-secondary);font-size:12px;margin-top:2px;line-height:1.5}" +
      ".cm-search{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-primary);font-size:12.5px;padding:5px 8px;outline:none;width:100%;box-sizing:border-box}" +
      ".cm-search:focus{border-color:var(--dsw-alias-brand-primary)}" +
      ".cm-btn{background:transparent;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;flex:none}" +
      ".cm-btn:hover{border-color:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary)}" +
      ".cm-btn.primary{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}" +
      ".cm-btn.danger{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary);background:transparent}" +
      ".cm-list{display:flex;flex-direction:column;gap:6px}" +
      ".cm-item{display:flex;flex-direction:column;gap:4px;background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:8px 10px}" +
      ".cm-item-row{display:flex;align-items:center;gap:8px;min-width:0}" +
      ".cm-item-name{font-weight:500;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}" +
      ".cm-item-desc{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:1.4;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}" +
      ".cm-src{color:var(--dsw-alias-label-secondary);font-size:11px;line-height:1.4;word-break:break-all}" +
      ".cm-toolbox{margin-top:2px;border:1px solid var(--dsw-alias-border-l1);border-radius:6px;padding:4px 8px;background:var(--dsw-alias-bg-layer-2)}" +
      ".cm-toolrow{position:relative;display:flex;gap:8px;align-items:baseline;padding:3px 0;border-bottom:1px dashed var(--dsw-alias-border-l1)}" +
      ".cm-toolrow:last-child{border-bottom:none}" +
      ".cm-toolname{font-family:ui-monospace,Menlo,monospace;font-size:11.5px;color:var(--dsw-alias-label-primary);flex:none;min-width:130px}" +
      ".cm-tooldesc{font-size:11.5px;color:var(--dsw-alias-label-secondary);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-width:0}" +
      ".cm-tooltip{position:absolute;left:0;top:100%;background:#ffffff;border:1px solid #d5d5dd;border-radius:6px;padding:8px 10px;max-width:560px;max-height:240px;overflow:auto;font-size:12px;line-height:1.5;color:#33333c;white-space:pre-wrap;word-break:break-all;z-index:60;box-shadow:0 6px 22px rgba(0,0,0,.16), 0 1px 4px rgba(0,0,0,.08);opacity:0;visibility:hidden;transition:opacity .1s ease 0s, visibility 0s linear 0s}" +
      ".cm-toolrow:hover .cm-tooltip, .cm-tooltip:hover{opacity:1;visibility:visible;transition:opacity .12s ease .5s, visibility 0s linear .5s}" +
      ".cm-ico{background:none;border:none;color:var(--dsw-alias-label-secondary);cursor:pointer;font-size:13px;padding:2px 4px;border-radius:4px}" +
      ".cm-ico:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-2)}" +
      ".cm-ico.danger:hover{color:var(--dsw-alias-state-error-primary)}" +
      ".cm-switch{position:relative;width:30px;height:17px;border-radius:9px;background:var(--dsw-alias-border-l4);border:none;cursor:pointer;flex:none;padding:0;transition:background .15s}" +
      ".cm-switch::after{content:\"\";position:absolute;top:2px;left:2px;width:13px;height:13px;border-radius:50%;background:var(--dsw-static-neutral-bluish-00);transition:left .15s}" +
      ".cm-switch.on::after{left:15px}" +
      ".cm-badge{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:10.5px;border-radius:4px;padding:1px 6px;flex:none}" +
      ".cm-badge.link{color:var(--dsw-alias-brand-primary);border:1px solid var(--dsw-alias-brand-primary)}" +
      ".cm-dot{width:8px;height:8px;border-radius:50%;flex:none}" +
      ".cm-dot.on{background:var(--dsw-alias-state-success-primary)}" +
      ".cm-dot.off{background:var(--dsw-alias-label-tertiary)}" +
      ".cm-dot.err{background:var(--dsw-alias-state-warn-primary)}" +
      ".cm-tools{color:var(--dsw-alias-label-secondary);font-size:11.5px;flex:none}" +
      ".cm-err{color:var(--dsw-alias-state-warn-primary);font-size:12px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-state-warn-primary);border-radius:6px;padding:6px 8px;white-space:pre-wrap;word-break:break-all}" +
      ".cm-ok{color:var(--dsw-alias-state-success-primary);font-size:12px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-state-success-primary);border-radius:6px;padding:6px 8px;white-space:pre-wrap;word-break:break-all}" +
      ".cm-form{display:flex;flex-direction:column;gap:8px;background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l1);border-radius:8px;padding:10px}" +
      ".cm-field{display:flex;flex-direction:column;gap:4px}" +
      ".cm-label{font-size:11.5px;color:var(--dsw-alias-label-secondary)}" +
      ".cm-input{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-primary);font-size:12.5px;padding:5px 8px;outline:none}" +
      ".cm-input:focus{border-color:var(--dsw-alias-brand-primary)}" +
      ".cm-select{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-primary);font-size:12.5px;padding:5px 8px;outline:none}" +
      ".cm-select:focus{border-color:var(--dsw-alias-brand-primary)}" +
      ".cm-textarea{background:var(--dsw-alias-bg-base);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;color:var(--dsw-alias-label-primary);font-size:12px;padding:6px 8px;outline:none;font-family:ui-monospace,Menlo,monospace;min-height:60px;resize:vertical}" +
      ".cm-textarea:focus{border-color:var(--dsw-alias-brand-primary)}" +
      ".cm-actions{display:flex;gap:6px;justify-content:flex-end}" +
      ".cm-empty{color:var(--dsw-alias-label-secondary);font-size:12.5px;padding:14px 4px;text-align:center}" +
      ".cm-sync{display:flex;flex-direction:column;gap:6px;background:var(--dsw-alias-bg-layer-2);border:1px dashed var(--dsw-alias-border-l2);border-radius:8px;padding:10px}" +
      ".cm-sync-row{display:flex;gap:6px;align-items:center}" +
      ".cm-sync-row .cm-input{flex:1}" +
      ".cm-modal{position:fixed;inset:0;background:rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;z-index:1000}" +
      ".cm-modal-box{background:var(--dsw-alias-bg-layer-1);border:1px solid var(--dsw-alias-border-l2);border-radius:10px;padding:16px 18px;min-width:320px;max-width:460px;box-shadow:0 8px 30px rgba(0,0,0,.25)}";
    const cssTagId = "@kiligzzz/dsh-capability-manager/styles";
    if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(cssTagId) + "]") === null) {
      const tag = document.createElement("style");
      tag.dataset.plugin = "@kiligzzz/dsh-capability-manager";
      tag.dataset.pluginCss = cssTagId;
      tag.textContent = CSS;
      document.head.appendChild(tag);
    }

    // ── REST API（capability-manager-host 提供）──
    async function apiGet() {
      const r = await fetch("/capabilities-api");
      const d = await r.json();
      if (!d || d.ok !== true) throw new Error((d && d.error) || "请求失败");
      return d;
    }
    async function apiPost(path, body) {
      const r = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {}),
      });
      const d = await r.json();
      if (!d || d.ok !== true) throw new Error((d && d.error) || "请求失败");
      return d;
    }

    function msg(e) { return String((e && e.message) || e); }

    function Switch({ on, onChange }) {
      return React.createElement("button", {
        className: "cm-switch" + (on ? " on" : ""),
        onClick: (ev) => { ev.stopPropagation(); onChange(!on); },
        title: on ? "点击禁用" : "点击启用",
      });
    }

    function ConfirmModal({ title, message, detail, confirmText, onConfirm, onCancel }) {
      return React.createElement("div", { className: "cm-modal", onClick: onCancel },
        React.createElement("div", { className: "cm-modal-box", onClick: (e) => e.stopPropagation() },
          React.createElement("div", { className: "cm-title", style: { marginBottom: 8 } }, title),
          React.createElement("div", { className: "cm-sub", style: { marginBottom: 6 } }, message),
          detail ? React.createElement("div", { className: "cm-src", style: { marginBottom: 14 } }, detail) : React.createElement("div", { style: { marginBottom: 14 } }),
          React.createElement("div", { className: "cm-actions" },
            React.createElement("button", { className: "cm-btn", onClick: onCancel }, "取消"),
            React.createElement("button", { className: "cm-btn danger", onClick: onConfirm }, confirmText || "删除"),
          ),
        ),
      );
    }

    function normalizeName(fname) {
      return String(fname).replace(/\.md$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }

    // ── Skill 管理页 ──
    function SkillPage() {
      const [data, setData] = React.useState(null);
      const [search, setSearch] = React.useState("");
      const [syncSource, setSyncSource] = React.useState("");
      const [syncMsg, setSyncMsg] = React.useState("");
      const [confirmDel, setConfirmDel] = React.useState(null);
      const [err, setErr] = React.useState("");
      const fileRef = React.useRef(null);

      const refresh = () => apiGet().then(setData).catch((e) => setErr(msg(e)));
      React.useEffect(() => { refresh(); }, []);

      const toggle = (name, enabled) =>
        apiPost("/capabilities-api/skill/toggle", { name, enabled }).then(refresh).catch((e) => setErr(msg(e)));
      const openEdit = (name) =>
        apiPost("/capabilities-api/skill/open", { name }).catch((e) => setErr(msg(e)));
      const doDelete = () => {
        const item = confirmDel;
        setConfirmDel(null);
        apiPost("/capabilities-api/skill/delete", { name: item.name }).then(refresh).catch((e) => setErr(msg(e)));
      };
      const onFile = (e) => {
        const f = e.target.files && e.target.files[0];
        e.target.value = "";
        if (!f) return;
        const reader = new FileReader();
        reader.onload = () => {
          const content = String(reader.result || "");
          const name = normalizeName(f.name);
          if (!name) { setErr("文件名无法转为 kebab-case"); return; }
          apiPost("/capabilities-api/skill/import", { name, content }).then(refresh).catch((x) => setErr(msg(x)));
        };
        reader.readAsText(f);
      };
      const doSync = () => {
        const source = syncSource.trim();
        if (!source) { setErr("请填写源文件夹路径"); return; }
        setSyncMsg("同步中…");
        apiPost("/capabilities-api/skill/sync", { source })
          .then((r) => {
            setSyncMsg("已同步: " + (r.synced || []).join(", ") + (r.skipped && r.skipped.length ? "；跳过: " + r.skipped.join(", ") : ""));
            refresh();
          })
          .catch((x) => { setSyncMsg(""); setErr(msg(x)); });
      };

      const all = data ? data.skills.user : [];
      const q = search.trim().toLowerCase();
      const items = q ? all.filter((s) => s.name.toLowerCase().includes(q) || String(s.description || "").toLowerCase().includes(q)) : all;
      const rows = items.map((s) =>
        React.createElement("div", { key: s.name, className: "cm-item" },
          React.createElement("div", { className: "cm-item-row" },
            React.createElement("span", { className: "cm-item-name", title: s.name }, s.name),
            s.synced ? React.createElement("span", { className: "cm-badge link", title: s.syncedSource ? "软链自 " + s.syncedSource : "软链" }, "同步") : null,
            React.createElement("button", { className: "cm-ico", title: "用系统编辑器打开", onClick: () => openEdit(s.name) }, "✎"),
            React.createElement("button", { className: "cm-ico danger", title: "删除", onClick: () => setConfirmDel(s) }, "🗑"),
            React.createElement(Switch, { on: s.enabled, onChange: (v) => toggle(s.name, v) }),
          ),
          s.description ? React.createElement("div", { className: "cm-item-desc" }, s.description) : null,
          s.synced && s.syncedSource ? React.createElement("div", { className: "cm-src" }, "来源: " + s.syncedSource) : null,
        )
      );

      const delMsg = confirmDel
        ? (confirmDel.synced
            ? "「" + confirmDel.name + "」是软链同步的 skill，移除将只删除链接，源文件夹不受影响。"
            : "确定删除 skill「" + confirmDel.name + "」吗？其文件将被永久删除，不可恢复。")
        : "";

      return React.createElement("div", { className: "cm-page" },
        React.createElement("div", { className: "cm-head" },
          React.createElement("div", null,
            React.createElement("div", { className: "cm-title" }, "Skill 管理"),
            React.createElement("div", { className: "cm-sub" }, "统一管理 skill（目录 ~/.dsh/skills）"),
          ),
          React.createElement("button", { className: "cm-btn primary", onClick: () => fileRef.current && fileRef.current.click() }, "+ 导入 Skill"),
        ),
        React.createElement("input", { ref: fileRef, type: "file", accept: ".md,.markdown", style: { display: "none" }, onChange: onFile }),
        React.createElement("input", { className: "cm-search", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "搜索 skill…" }),
        React.createElement("div", { className: "cm-sync" },
          React.createElement("div", { className: "cm-label" }, "从文件夹同步（软链到 ~/.dsh/skills，源目录改动实时生效）"),
          React.createElement("div", { className: "cm-sync-row" },
            React.createElement("input", { className: "cm-input", value: syncSource, onChange: (e) => setSyncSource(e.target.value), placeholder: "/path/to/skills-folder" }),
            React.createElement("button", { className: "cm-btn primary", onClick: doSync }, "同步"),
          ),
          syncMsg ? React.createElement("div", { className: "cm-sub" }, syncMsg) : null,
        ),
        err ? React.createElement("div", { className: "cm-err" }, err) : null,
        rows.length ? React.createElement("div", { className: "cm-list" }, rows)
          : React.createElement("div", { className: "cm-empty" }, data ? (q ? "无匹配 skill。" : "暂无 Skill。点击「+ 导入 Skill」或从文件夹同步。") : "加载中…"),
        confirmDel ? React.createElement(ConfirmModal, {
          title: confirmDel.synced ? "移除同步 Skill" : "删除 Skill",
          message: delMsg,
          detail: confirmDel.synced && confirmDel.syncedSource ? "软链来源: " + confirmDel.syncedSource : undefined,
          confirmText: confirmDel.synced ? "移除链接" : "删除",
          onConfirm: doDelete,
          onCancel: () => setConfirmDel(null),
        }) : null,
      );
    }

    // ── MCP 管理页 ──
    function McpPage() {
      const [data, setData] = React.useState(null);
      const [search, setSearch] = React.useState("");
      const [expanded, setExpanded] = React.useState(null);
      const [form, setForm] = React.useState(null);
      const [confirmDel, setConfirmDel] = React.useState(null);
      const [err, setErr] = React.useState("");

      const refresh = () => apiGet().then(setData).catch((e) => setErr(msg(e)));
      React.useEffect(() => { refresh(); }, []);

      const emptyForm = () => ({ name: "", transport: "stdio", command: "npx", args: "", env: "", url: "", headers: "", description: "", enabled: true });
      const findServer = (name) => data && data.mcp.servers.find((s) => s.name === name);
      const openEdit = (s) => setForm({
        name: s.name, transport: s.transport,
        command: s.command || "", args: (s.args || []).join(", "),
        env: envText(s.env), url: s.url || "", headers: headersText(s.headers),
        description: s.description || "", enabled: !!s.enabled,
      });
      const toggle = (name, enabled) =>
        apiPost("/capabilities-api/mcp/save", { server: findServer(name) ? Object.assign({}, findServer(name), { enabled }) : { name, enabled } })
          .then(refresh).catch((e) => setErr(msg(e)));
      const saveForm = () => {
        const s = form;
        const server = {
          name: s.name.trim(), transport: s.transport, command: s.command.trim(),
          args: s.args.split(",").map((x) => x.trim()).filter(Boolean),
          env: parseKv(s.env, "="), url: s.url.trim(), headers: parseKv(s.headers, ":"),
          description: s.description.trim(), enabled: s.enabled,
        };
        apiPost("/capabilities-api/mcp/save", { server }).then(() => { setForm(null); refresh(); }).catch((e) => setErr(msg(e)));
      };
      const doDelete = () => {
        const name = confirmDel;
        setConfirmDel(null);
        apiPost("/capabilities-api/mcp/remove", { name }).then(refresh).catch((e) => setErr(msg(e)));
      };
      const refreshOne = (name) => apiPost("/capabilities-api/mcp/refresh", { name }).then(refresh).catch((e) => setErr(msg(e)));
      const openConfig = () => apiPost("/capabilities-api/mcp/open-config", {}).catch((e) => setErr(msg(e)));
      const copyLog = (text) => { try { navigator.clipboard.writeText(text); } catch (e) { /* ignore */ } };

      function parseKv(text, sep) {
        const out = {};
        String(text || "").split("\n").forEach((line) => {
          const i = line.indexOf(sep);
          if (i > 0) out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
        });
        return out;
      }
      function envText(env) { return Object.keys(env || {}).map((k) => k + "=" + env[k]).join("\n"); }
      function headersText(headers) { return Object.keys(headers || {}).map((k) => k + ": " + headers[k]).join("\n"); }

      const all = data ? data.mcp.servers : [];
      const q = search.trim().toLowerCase();
      const servers = q ? all.filter((s) => s.name.toLowerCase().includes(q) || String(s.description || "").toLowerCase().includes(q)) : all;
      const rows = servers.map((s) => {
        const st = s.status || {};
        const dot = st.state === "mounted" ? "on" : (st.state === "error" ? "err" : "off");
        const toolList = Array.isArray(s.tools) ? s.tools : [];
        return React.createElement("div", { key: s.name, className: "cm-item" },
          React.createElement("div", { className: "cm-item-row" },
            React.createElement("button", { className: "cm-ico", onClick: () => setExpanded(expanded === s.name ? null : s.name), title: toolList.length ? "展开工具列表" : "展开" }, expanded === s.name ? "▾" : "▸"),
            React.createElement("span", { className: "cm-item-name", title: s.name }, s.name),
            React.createElement("span", { className: "cm-badge" }, "用户"),
            React.createElement("span", { className: "cm-dot " + dot, title: st.state }),
            React.createElement("span", { className: "cm-tools" }, String(toolList.length || st.tools || 0) + " tools"),
            React.createElement("button", { className: "cm-ico", title: "编辑", onClick: () => openEdit(s) }, "✎"),
            React.createElement("button", { className: "cm-ico", title: "刷新", onClick: () => refreshOne(s.name) }, "⟳"),
            React.createElement("button", { className: "cm-ico danger", title: "删除", onClick: () => setConfirmDel(s.name) }, "🗑"),
            React.createElement(Switch, { on: !!s.enabled, onChange: (v) => toggle(s.name, v) }),
          ),
          s.description ? React.createElement("div", { className: "cm-item-desc" }, s.description) : null,
          expanded === s.name && st.error ?
            React.createElement("div", { className: "cm-err" }, String(st.error),
              React.createElement("div", { className: "cm-actions", style: { marginTop: 6 } },
                React.createElement("button", { className: "cm-btn", onClick: () => copyLog(String(st.error)) }, "复制日志"),
              ),
            ) : null,
          expanded === s.name ?
            React.createElement("div", { className: "cm-toolbox" },
              toolList.length
                ? toolList.map((t) => {
                    const tname = typeof t === "string" ? t : t.name;
                    const tdesc = typeof t === "string" ? "" : (t.description || "");
                    return React.createElement("div", { key: tname, className: "cm-toolrow" },
                      React.createElement("span", { className: "cm-toolname" }, tname),
                      tdesc ? React.createElement("span", { className: "cm-tooldesc" }, tdesc) : null,
                      tdesc ? React.createElement("div", { className: "cm-tooltip" }, tdesc) : null,
                    );
                  })
                : React.createElement("div", { className: "cm-src" }, "暂无可展示的工具（server 未连接或无工具）"),
            ) : null,
        );
      });

      const formEl = form ? React.createElement("div", { className: "cm-form" },
        React.createElement("div", { className: "cm-field" },
          React.createElement("span", { className: "cm-label" }, "名称 (kebab-case, 工具前缀 mcp__<name>__)"),
          React.createElement("input", { className: "cm-input", value: form.name, onChange: (e) => setForm(Object.assign({}, form, { name: e.target.value })) }),
        ),
        React.createElement("div", { className: "cm-field" },
          React.createElement("span", { className: "cm-label" }, "传输"),
          React.createElement("select", { className: "cm-select", value: form.transport, onChange: (e) => setForm(Object.assign({}, form, { transport: e.target.value })) },
            React.createElement("option", { value: "stdio" }, "stdio"),
            React.createElement("option", { value: "streamable-http" }, "streamable-http"),
          ),
        ),
        form.transport === "stdio" ?
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "cm-field" },
              React.createElement("span", { className: "cm-label" }, "命令"),
              React.createElement("input", { className: "cm-input", value: form.command, onChange: (e) => setForm(Object.assign({}, form, { command: e.target.value })) }),
            ),
            React.createElement("div", { className: "cm-field" },
              React.createElement("span", { className: "cm-label" }, "参数 (逗号分隔)"),
              React.createElement("input", { className: "cm-input", value: form.args, onChange: (e) => setForm(Object.assign({}, form, { args: e.target.value })) }),
            ),
            React.createElement("div", { className: "cm-field" },
              React.createElement("span", { className: "cm-label" }, "环境变量 (每行 KEY=value)"),
              React.createElement("textarea", { className: "cm-textarea", value: form.env, onChange: (e) => setForm(Object.assign({}, form, { env: e.target.value })) }),
            ),
          ) :
          React.createElement(React.Fragment, null,
            React.createElement("div", { className: "cm-field" },
              React.createElement("span", { className: "cm-label" }, "URL"),
              React.createElement("input", { className: "cm-input", value: form.url, onChange: (e) => setForm(Object.assign({}, form, { url: e.target.value })) }),
            ),
            React.createElement("div", { className: "cm-field" },
              React.createElement("span", { className: "cm-label" }, "请求头 (每行 Name: value，如 Authorization: Bearer xxx)"),
              React.createElement("textarea", { className: "cm-textarea", value: form.headers, onChange: (e) => setForm(Object.assign({}, form, { headers: e.target.value })) }),
            ),
          ),
        React.createElement("div", { className: "cm-field" },
          React.createElement("span", { className: "cm-label" }, "描述 (进入会话能力清单，帮助模型判断)"),
          React.createElement("input", { className: "cm-input", value: form.description, onChange: (e) => setForm(Object.assign({}, form, { description: e.target.value })) }),
        ),
        React.createElement("div", { className: "cm-field" },
          React.createElement("span", { className: "cm-label" }, "启用（挂载到工具目录，所有会话可见）"),
          React.createElement("div", null, React.createElement(Switch, { on: form.enabled, onChange: (v) => setForm(Object.assign({}, form, { enabled: v })) })),
        ),
        React.createElement("div", { className: "cm-actions" },
          React.createElement("button", { className: "cm-btn", onClick: () => setForm(null) }, "取消"),
          React.createElement("button", { className: "cm-btn primary", onClick: saveForm }, "保存"),
        ),
      ) : null;

      return React.createElement("div", { className: "cm-page" },
        React.createElement("div", { className: "cm-head" },
          React.createElement("div", null,
            React.createElement("div", { className: "cm-title" }, "MCP管理"),
            React.createElement("div", { className: "cm-sub" }, "统一管理MCP服务，配置文件：~/.dsh/mcp.json"),
          ),
          React.createElement("div", { className: "cm-actions", style: { gap: 6 } },
            React.createElement("button", { className: "cm-btn", onClick: openConfig }, "打开配置文件"),
            React.createElement("button", { className: "cm-btn primary", onClick: () => setForm(emptyForm()) }, "+ 配置 MCP"),
          ),
        ),
        err ? React.createElement("div", { className: "cm-err" }, err) : null,
        React.createElement("input", { className: "cm-search", value: search, onChange: (e) => setSearch(e.target.value), placeholder: "搜索 MCP server…" }),
        formEl,
        rows.length ? React.createElement("div", { className: "cm-list" }, rows)
          : React.createElement("div", { className: "cm-empty" }, data ? (q ? "无匹配 MCP server。" : "暂无 MCP server。点击「+ 配置 MCP」或编辑 ~/.dsh/mcp.json。") : "加载中…"),
        confirmDel ? React.createElement(ConfirmModal, {
          title: "删除 MCP Server",
          message: "确定删除 MCP server「" + confirmDel + "」吗？将从 ~/.dsh/mcp.json 移除并卸载其工具。",
          confirmText: "删除",
          onConfirm: doDelete,
          onCancel: () => setConfirmDel(null),
        }) : null,
      );
    }

    module.exports = {
      name: "@kiligzzz/dsh-capability-manager",
      apply(ctx) {
        const slots = ctx.get("slots");
        if (!slots) return;
        slots.inject("settings.section", () => {
          slots.register(
            { name: "settings.section", id: "capabilities-skills", order: 40, label: () => "Skill" },
            () => React.createElement(SkillPage),
          );
          slots.register(
            { name: "settings.section", id: "capabilities-mcp", order: 41, label: () => "MCP" },
            () => React.createElement(McpPage),
          );
        });
      },
    };
    return module.exports;
  },
});
