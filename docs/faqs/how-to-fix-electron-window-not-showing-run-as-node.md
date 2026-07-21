### **Q: 为什么 pnpm dev 启动成功但 Electron 窗口不弹出？**

**A:**
构建和 dev server 都正常、日志显示 `starting electron app...`，但桌面上没有窗口。检查环境变量发现 `ELECTRON_RUN_AS_NODE=1` 被注入——该变量会让 Electron 退化成纯 Node.js 进程，不初始化 GUI。

**问题症状：**
- `pnpm dev` 无报错，main / preload / renderer 均构建成功
- 没有任何窗口弹出，也没有 Dock 图标
- `env | grep ELECTRON` 能看到 `ELECTRON_RUN_AS_NODE=1`

**根本原因：**
`ELECTRON_RUN_AS_NODE=1` 是 Electron 的官方开关：设置后 Electron 二进制以普通 Node 运行时启动，跳过 Chromium/GUI 初始化。某些开发工具（IDE 集成终端、AI agent 运行环境等）会向子进程注入该变量，导致从这些终端启动的 Electron 应用永远不弹窗。

**解决方案：**
启动前清掉该变量即可：

```bash
unset ELECTRON_RUN_AS_NODE
pnpm dev
```

或单次启动时剥离：

```bash
env -u ELECTRON_RUN_AS_NODE pnpm dev
```

**关键配置要点：**
- 该变量通常来自终端宿主环境，不在项目文件里，`grep` 代码找不到源头
- 若团队频繁踩坑，可在 `package.json` 的 dev 脚本里防御性处理（macOS/Linux）：`"dev": "env -u ELECTRON_RUN_AS_NODE electron-vite dev"`

**参考文档：**
[Electron 官方文档: ELECTRON_RUN_AS_NODE](https://www.electronjs.org/docs/latest/api/environment-variables#electron_run_as_node)
