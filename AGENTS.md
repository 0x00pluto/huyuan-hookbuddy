# AGENTS.md

面向 AI coding agent 的项目说明。人类读者请优先看 [README.md](README.md)。

## 项目简介

HookBuddy —— 基于 Electron 的 AI 桌面客户端（Codex 风格），支持 Windows / macOS 双端分发。选型与架构依据 [docs/MAC Windows 选型技术文档.md](docs/MAC%20Windows%20选型技术文档.md)。

团队角色命令（产品经理 / 工程验收官 / 需求探索专家 / 前端工程师 / 测试工程师）见 [`.cursor/commands/team/`](.cursor/commands/team/)；文档地图见 [docs/doc_index.md](docs/doc_index.md)。

## 技术栈

| 层 | 技术 |
| --- | --- |
| 包管理 | pnpm（`node-linker=hoisted`，见 `.npmrc`） |
| 桌面底座 | Electron 39 |
| 构建 | electron-vite 5 + Vite 7 |
| 前端 | React 19 + TypeScript 5 |
| 样式 | Tailwind CSS v4（`@tailwindcss/vite` 插件） |
| 组件 | shadcn/ui，预设码 `b1Z5c9rlI`（style=vega, theme=emerald, baseColor=neutral, icon=lucide, font=inter） |

## 三层进程架构（安全边界，勿破坏）

```
Renderer (src/renderer) --window.electronAPI--> Preload (src/preload) --IPC--> Main (src/main)
```

- **Main** `src/main/index.ts`：Node.js 环境，管理窗口生命周期，用 `ipcMain.handle` 注册命令通道。
- **Preload** `src/preload/index.ts`：唯一的安全桥。用 `contextBridge.exposeInMainWorld` 暴露白名单方法，类型声明同步写入 `src/preload/index.d.ts`。
- **Renderer** `src/renderer/src`：纯 React SPA，只能通过 `window.electronAPI` 调用主进程。

## 目录约定

- UI 组件：`src/renderer/src/components/ui/`（shadcn 生成物）
- 工具函数：`src/renderer/src/lib/utils.ts`（`cn()`）
- 全局样式与主题变量：`src/renderer/src/assets/main.css`
- 路径别名：`@/*` → `src/renderer/src/*`（`electron.vite.config.ts` 与 `tsconfig.web.json` 中已配置，保持两处一致）

## 常用命令

```bash
pnpm dev          # 启动开发环境（electron-vite dev）
pnpm build        # typecheck + 构建
pnpm typecheck    # 仅类型检查（node + web）
pnpm lint         # ESLint
pnpm format       # Prettier
```

改完代码后至少跑 `pnpm typecheck`。

## 硬性规范

1. **IPC 安全**：严禁在 `webPreferences` 开启 `nodeIntegration`，必须保持 `contextIsolation`。绝不把 `child_process` / `fs` 直接暴露到 `window`，只经 Preload 暴露预设方法。
2. **长耗时任务用 `spawn` 流式**：Agent 类任务不要用 `exec` 一次性返回（易超时卡死），改用 `spawn` + `webContents.send` 流式推日志。
3. **新增依赖只给命令**：涉及 `pnpm add` / `pnpm install` 的操作，输出命令让用户在本机执行，不要代跑，也不要直接手改 `package.json` 的依赖字段。
4. **加 shadcn 组件**：`pnpm dlx shadcn@latest add <name>`；组件落到 `@/components/ui`。

## 已知坑（重要）

- **`vite.config.ts` 是给 shadcn 用的幌子**：electron-vite 只认 `electron.vite.config.ts`，但 shadcn CLI 按文件名 glob `vite.config.*` 检测框架。删掉根目录的 `vite.config.ts` 会导致 `shadcn init/apply` 报 "could not detect a supported framework"。它对 `pnpm dev`/打包无影响，勿删。
- **Electron 二进制解压在 Node 26 会静默失败**：`node_modules/electron` 装上后若只有 `dist/LICENSES.chromium.html`、缺 `path.txt`，`pnpm dev` 报 `Error: Electron uninstall`。zip 其实已下载到 `~/Library/Caches/electron/`，是 `extract-zip` 与 Node 26 不兼容。修复：

```bash
cd node_modules/electron && rm -rf dist && mkdir dist \
  && unzip -o -q ~/Library/Caches/electron/*/electron-v*-darwin-arm64.zip -d dist \
  && printf 'Electron.app/Contents/MacOS/Electron' > path.txt
```

  每次 `rm -rf node_modules` 重装后可能复发，重跑上面命令即可。
- **`ELECTRON_RUN_AS_NODE=1` 会导致不弹窗**：若环境注入了该变量，Electron 会退化成纯 Node 进程。启动前 `unset ELECTRON_RUN_AS_NODE`。
- **国内网络**：`.npmrc` 已配 `electron_mirror` 淘宝镜像，避免首次安装从 GitHub 下载 Electron 二进制超时。
