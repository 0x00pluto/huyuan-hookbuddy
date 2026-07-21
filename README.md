# HookBuddy

基于 Electron + React + TypeScript 的 AI 桌面客户端（Codex 风格），支持 Windows / macOS / Linux。

## 推荐 IDE

- [VSCode](https://code.visualstudio.com/) + [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) + [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发

```bash
pnpm dev
```

### 本地打包

```bash
# Windows
pnpm build:win

# macOS
pnpm build:mac

# Linux
pnpm build:linux
```

产物输出到 `dist/`。更多打包细节见 [docs/build-and-release.md](docs/build-and-release.md)。

## 发布

CI 由推送版本标签触发，推送 `main` 不会打包。推荐用 `pnpm version` 同步版本号与 tag：

```bash
pnpm version patch   # 或 minor / major
git push --follow-tags
```

标签推送或在 GitHub Actions 手动运行「Build All Platforms」后，可在对应 Workflow Run 下载各平台 Artifact。完整流程见 [docs/build-and-release.md](docs/build-and-release.md)。

## 文档

- [CHANGELOG.md](CHANGELOG.md)：版本变更记录。
- [docs/doc_index.md](docs/doc_index.md)：文档索引。
- [AGENTS.md](AGENTS.md)：项目架构与协作规范。
