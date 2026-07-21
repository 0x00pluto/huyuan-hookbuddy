# Changelog

本项目所有值得记录的变更都会写在这里。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

发版方式见 [docs/build-and-release.md](docs/build-and-release.md)：用 `pnpm version` 同步版本与 tag 后 `git push --follow-tags` 触发 CI 打包。

## [未发布]

## [1.1.0] - 2026-07-21

### Added

- Windows 沉浸式标题栏：`titleBarStyle: hidden` + `titleBarOverlay`，消除系统标题栏与自定义顶栏叠加的「双层壳」；原生最小化/最大化/关闭按钮嵌入 44px 自定义标题栏，并随系统明暗主题实时同步配色。

### Changed

- 标题栏更新入口改为药丸样式，悬停展开「升级」文案。
- ESLint 豁免 shadcn 生成物（`components/ui`）的返回类型与 react-refresh 限制，并统一代码风格为单引号；`cn()` 补显式返回类型。

### Removed

- 移除 `tsconfig.web.json` 中已弃用的 `baseUrl`（TypeScript 7.0 将移除），`paths` 改为显式相对路径。

## [1.0.5] - 2026-07-21

### Changed

- 补丁发版，用于验证应用内自动更新（相对 1.0.4 无功能变更）。

## [1.0.4] - 2026-07-21

### Added

- 应用内自动更新 R0（`prd-00002`）：Main 更新状态机 + Preload IPC + 侧栏/标题栏 Ready 箭头与确认框。
- Windows：静默下载安装包，确认后重启安装；稍后路径在正常退出时自动安装。
- macOS 降级：检测新版本后下载 `.dmg` 并自动打开，由用户手动拖入 Applications（未签名期间不走静默安装）。

### Changed

- `appId` 由 `com.electron.app` 改为 `com.huyuan.hybuddy`（自首个正式发布起固定）。
- 自动更新 UX 由系统通知改为应用内箭头入口；关闭 `checkForUpdatesAndNotify` 系统通知。
- 无可用更新时侧栏不显示更新占位圆圈。

## [1.0.0] - 2026-07-21

### Added

- Codex 风格主界面 Shell（R0）。
- Windows / macOS / Linux 多平台 GitHub Actions 构建工作流。
- 打包与发布文档 `docs/build-and-release.md`。

### Fixed

- 构建 macOS universal 包时排除构建期 Tailwind 原生依赖，避免合并失败。

[未发布]: https://github.com/0x00pluto/huyuan-hookbuddy/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/0x00pluto/huyuan-hookbuddy/compare/v1.0.5...v1.1.0
[1.0.5]: https://github.com/0x00pluto/huyuan-hookbuddy/compare/v1.0.4...v1.0.5
[1.0.4]: https://github.com/0x00pluto/huyuan-hookbuddy/compare/v1.0.3...v1.0.4
[1.0.0]: https://github.com/0x00pluto/huyuan-hookbuddy/releases/tag/v1.0.0
