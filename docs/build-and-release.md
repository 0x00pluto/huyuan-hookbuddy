# 打包与发布

HookBuddy 使用 electron-vite + electron-builder 产出桌面安装包，跨平台构建由 GitHub Actions 完成。

## 本地打包

在已安装依赖的前提下：

| 命令 | 说明 |
| --- | --- |
| `pnpm build:mac` | 构建并打包 macOS（dmg 等，见 `electron-builder.yml`） |
| `pnpm build:win` | 构建并打包 Windows |
| `pnpm build:linux` | 构建并打包 Linux |
| `pnpm build:unpack` | 构建后产出未封装的目录（`--dir`），便于本地检查 |

`pnpm build` 仅做 typecheck + `electron-vite build`，不调用 electron-builder。

产物默认落在仓库根目录的 `dist/`。

## CI 自动构建

工作流：[`.github/workflows/build-all-platforms.yml`](../.github/workflows/build-all-platforms.yml)

### 触发条件

1. **推送版本标签**（推荐）：匹配 `v*`，例如 `v1.0.0`、`v1.2.3`。
2. **手动运行**：在 GitHub 仓库的 Actions →「Build All Platforms」→ Run workflow。

推送到 `main` **不会**触发该工作流。

### 发版命令（推荐）

用 `pnpm version` 同步 `package.json` 版本与 git tag（默认前缀 `v`），再推送：

```bash
pnpm version patch   # 或 minor / major：改版本 + commit + 打 v 前缀 tag
git push --follow-tags
```

也可手动 `git tag vX.Y.Z`，但必须与 `package.json` 的 `version` 一致，否则 CI 校验会失败。

### CI 产物

| Job | 平台 | Artifact 名称 | 主要文件 |
| --- | --- | --- | --- |
| Build macOS Universal | macOS | `hookbuddy-macos-universal` | `.dmg`、`-mac.zip`、`latest-mac.yml` 等 |
| Build Windows x64 | Windows | `hookbuddy-windows-x64` | `.exe`、`.yml`、`.blockmap` |
| Build Linux x64 | Linux | `hookbuddy-linux-x64` | `.AppImage`、`.deb`、`.yml` 等 |

Artifact 保留 14 天，可在对应 Workflow Run 页面下载。CI 使用 `--publish never`，不会自动上传到更新服务器。

Linux CI 产出 AppImage + deb（不含 snap，避免 snapcraft 依赖导致失败）。

## 推荐发布流程

1. 确认待发布改动已合入 `main`，工作区干净。
2. 更新 [CHANGELOG.md](../CHANGELOG.md)：把「未发布」内容落到新版本段。
3. 执行 `pnpm version patch`（或 `minor` / `major`）：自动改 [`package.json`](../package.json) 的 `version`、提交并打 `vX.Y.Z` tag。
4. 执行 `git push --follow-tags`：推送 commit 与 tag，触发 CI。
5. 等待 Actions 完成 typecheck（含版本一致性校验）与三端打包。
6. 从 Workflow Run 下载各平台 Artifact，按需分发或挂到 Release / 下载页。

## electron-builder 关键配置

配置文件：[`electron-builder.yml`](../electron-builder.yml)

| 项 | 说明 |
| --- | --- |
| `appId` / `productName` | 应用标识与显示名 |
| `mac` | Universal 由 CI 传 `--universal`；本地签名默认 `identity: null`，`notarize: false` |
| `win` / `nsis` | Windows 可执行名与安装包命名（`${name}-${version}-setup.${ext}`） |
| `linux` | 本地默认 target 含 AppImage / snap / deb；CI 仅打 AppImage + deb |
| `dmg` / `appImage` | 产物文件名模板含 `${name}`、`${version}` |
| `publish` | 当前为 generic 占位 URL，供日后自动更新；CI 不执行发布 |

签名与公证、真实更新源 URL 等上线前再按环境补齐。
