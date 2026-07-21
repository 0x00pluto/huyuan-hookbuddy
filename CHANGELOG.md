# Changelog

本项目所有值得记录的变更都会写在这里。

格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

发版方式见 [docs/build-and-release.md](docs/build-and-release.md)：用 `pnpm version` 同步版本与 tag 后 `git push --follow-tags` 触发 CI 打包。

## [未发布]

### Changed

- CI 构建触发条件由推送 `main` 改为推送 `v*` 标签（保留手动运行）。
- 发版流程改为 `pnpm version` 同步 `package.json` 与 git tag；CI 增加 tag 与版本一致性校验。

### Added

- CI 新增 `release` job：`v*` 标签构建完成后自动创建 GitHub Release 并上传各平台安装包为 Assets。

## [1.0.0] - 2026-07-21

### Added

- Codex 风格主界面 Shell（R0）。
- Windows / macOS / Linux 多平台 GitHub Actions 构建工作流。
- 打包与发布文档 `docs/build-and-release.md`。

### Fixed

- 构建 macOS universal 包时排除构建期 Tailwind 原生依赖，避免合并失败。

[未发布]: https://example.com/compare/v1.0.0...HEAD
[1.0.0]: https://example.com/releases/tag/v1.0.0
