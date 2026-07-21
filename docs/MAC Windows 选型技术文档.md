# MAC Windows 选型技术文档

AI 桌面客户端（Codex 风格）最佳实践技术选型与架构方案。

本方案旨在为**单人或极小团队**构建类似 **Codex / Workbody** 风格、支持多端分发（Windows & macOS）的 AI 原生/Agent 桌面客户端提供最稳妥、高效的技术路线选择与架构设计指南。

## 一、 核心技术栈选型 (The Gold Tech Stack)

在综合评估了多端维护成本、开发效率、生态完备度及 AI 原生场景需求后，以下选型组合为目前行业公认的**黄金最佳实践**：

```text
pnpm (包管理器) ──> Electron (桌面底座) ──> electron-vite (构建工具)
                                                │
                                    ┌───────────┴───────────┐
                                    ▼                       ▼
                           React + TypeScript        Tailwind CSS + Shadcn/ui
                              (前端渲染层)                 (现代高质感 UI 库)
```

## 二、 客户端三层进程架构设计

Electron 采用多进程架构。为了同时保证**系统安全性**和**极致的性能**，项目必须遵循以下标准的三层架构：

```text
┌─────────────────────────────────────────────────────────────────┐
│                    1. 前端 UI 层 (Renderer)                      │
│      React App (页面渲染、对话框、Skills 菜单、Markdown 显示)      │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼ [安全的 window.electronAPI 暴露]
┌─────────────────────────────────────────────────────────────────┐
│                     2. 安全桥接层 (Preload)                      │
│   contextBridge.exposeInMainWorld (进程隔离，拦截不安全的前端注入)   │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼ [IPC 双向通信：ipcRenderer <-> ipcMain]
┌─────────────────────────────────────────────────────────────────┐
│                    3. 系统底层进程 (Main)                        │
│      Node.js 环境 (读写本地 config.json、执行 Shell、调 CLI)       │
└─────────────────────────────────────────────────────────────────┘
```

### 前端渲染层 (Renderer Process)

- **职责**：纯 Web 页面渲染，不涉及任何 Node.js 特有 API。

- **开发策略**：把它当做普通的 React Web 单页应用（SPA）来写，使用 `hash` 或 `memory` 路由，完全不考虑 SEO 优化。

### 安全桥接层 (Preload Script)

- **职责**：扮演 UI 与操作系统的“守门人”。

- **开发策略**：在此处定义安全通道，只允许前端调用预设的本地方法（例如 `runShell` 或 `saveConfig`），严禁直接将 `child_process` 或 `fs` 暴露到 `window` 上。

### 主进程 (Main Process)

- **职责**：作为后台 Node.js 服务器，管理应用窗口生命周期、监听前端 IPC 请求、运行底层 Shell。

## 三、 核心工程化最佳实践与避坑

### pnpm 打包黑屏与模块找不到问题 (核心避坑)

由于 pnpm 采用**软链接 (Symlink)** 隔离依赖，打包工具 `electron-builder` 在压缩依赖时可能会遗漏主进程依赖，导致打包后的程序运行时闪退。

- **最佳实践解决方案**：在项目根目录下新建 `.npmrc` 文件，强制将其打平，并配置 Electron 国内镜像（避免二进制从 GitHub 下载失败）。

```ini
# .npmrc
node-linker=hoisted
electron_mirror=https://npmmirror.com/mirrors/electron/
```

### 安全的 IPC 通信机制

严禁在 Electron 配置中开启 `nodeIntegration: true`。必须使用 **上下文隔离 (Context Isolation)** 模式。

- **主进程注册 IPC 监听**：

```ts
// src/main/index.ts
import { ipcMain } from 'electron'
import { exec } from 'child_process'

ipcMain.handle('run-skill-command', async (event, command: string) => {
  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({ success: !error, data: stdout || stderr })
    })
  })
})
```

- **Preload 桥接暴露**：

```ts
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  runSkill: (command: string) => ipcRenderer.invoke('run-skill-command', command)
})
```

- **React 前端安全调用**：

```tsx
// src/renderer/src/App.tsx
const handleExecute = async () => {
  const response = await window.electronAPI.runSkill('node -v')
  console.log('执行结果:', response)
}
```

## 四、 针对 AI / Agent 场景的专项设计

为了承载类似 Codex 的 AI 任务编排与 Skills 功能，架构上需针对性做以下处理：

### 长耗时任务的非阻塞设计 (Non-blocking Streams)

Agent 任务（如代码生成、多步工作流）通常比较耗时。

- **避免使用** `exec` 一次性返回（容易超时或卡死）。

- **推荐使用** `spawn` 建立持久流，在主进程中监听控制台输出，并通过流（Streaming）将日志实时推送到 React 界面。

```ts
// 主进程流式返回日志示例
const { spawn } = require('child_process')
const child = spawn('python', ['agent_runner.py'])

child.stdout.on('data', (data) => {
  mainWindow.webContents.send('agent-log', data.toString())
})
```

### 完美的 Markdown 与代码块渲染

AI 生成的数据本质上是 Markdown。为了达到类似 Cursor 的交互质感：

- **解析库**：使用 `react-markdown` 配合 `remark-gfm` 支持表格。

- **高亮库**：使用 `shiki`（VS Code 同款高亮引擎，质感极佳）或轻量级的 `prismjs`。

- **增强体验**：为每个代码块组件外侧包裹一层“一键复制”和“保存为本地文件”的悬浮按钮。

### 多平台无缝分发流程 (CI/CD)

对于小团队，依靠本地电脑打包 macOS (`.dmg`) 和 Windows (`.exe`) 既慢又容易因为环境问题出错。

- **最佳实践**：使用 **GitHub Actions**。

- **流程**：

    1. 开发者在本地完成功能测试并提交代码。

    2. 在 GitHub 推送带有版本号的 Tag（如 `v1.0.0`）。

    3. GitHub Actions 自动触发多系统构建矩阵（`macos-latest` 和 `windows-latest`）。

    4. 云端自动拉取依赖、编译代码、进行软件签名，并直接发布至 GitHub Releases，同时触发 `electron-updater` 让用户客户端在后台静默更新。

## 五、 项目初始化快速启动路径

如果您准备启动该项目，请在本地终端按以下步骤执行：

1. **一键生成标准骨架**：

```bash
pnpm create @quick-start/electron
```

   根据终端提示：选择 **React**，选择 **TypeScript**。

2. **配置全局打平（必做）**：在项目根目录下新建 `.npmrc`，并写入：

```ini
node-linker=hoisted
electron_mirror=https://npmmirror.com/mirrors/electron/
```

3. **安装依赖并运行开发环境**：

```bash
pnpm install
pnpm dev
```

4. **集成 Tailwind CSS & Shadcn/ui**：在 `electron.vite.config.ts` 的 renderer 配置中加入 `@tailwindcss/vite` 插件，入口 CSS 使用 `@import "tailwindcss"`；再用 shadcn 预设初始化主题与组件：

```bash
pnpm dlx shadcn@latest init --preset b1Z5c9rlI
```

   开始构建精美的 Codex 风格暗黑界面。
