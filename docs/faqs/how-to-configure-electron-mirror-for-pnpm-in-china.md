### **Q: 如何避免国内网络下 pnpm 安装 Electron 二进制下载失败？**

**A:**
Electron 安装时要经 postinstall 脚本从 GitHub Releases 下载约 100MB 的平台二进制包，国内直连极易超时失败，留下"半成品"（包已装但二进制缺失）。在项目 `.npmrc` 配置国内镜像可预防；若已产生坏缓存，需要连 pnpm store 一起清理后重装。

**问题症状：**
- 首次 `pnpm install` 后 `node_modules/electron/dist/` 不完整、缺 `path.txt`
- 重装时输出 `reused NNN, downloaded 0`——坏包从 pnpm store 缓存原样复用，下载脚本不再重跑
- 仅删 `node_modules` 重装无效

**根本原因：**
两层叠加：(1) Electron 二进制默认从 GitHub 下载，国内网络不稳；(2) pnpm 的 store 缓存会复用上次的坏状态，导致光删 `node_modules` 无法触发重新下载。另外 pnpm 10 默认拦截依赖的构建脚本，electron 必须出现在 `onlyBuiltDependencies` 白名单中，其 postinstall 才会执行。

**解决方案：**
项目 `.npmrc` 配置镜像（一次性预防）：

```ini
# .npmrc
node-linker=hoisted
electron_mirror=https://npmmirror.com/mirrors/electron/
```

`package.json` 确保 electron 在构建脚本白名单：

```json
{
  "pnpm": {
    "onlyBuiltDependencies": ["electron", "esbuild"]
  }
}
```

已有坏缓存时的完整清理重装：

```bash
rm -rf node_modules
pnpm store prune
pnpm install
```

手动补跑下载脚本时（直接 `node` 运行不读 `.npmrc`）需显式传环境变量：

```bash
ELECTRON_MIRROR="https://npmmirror.com/mirrors/electron/" node node_modules/electron/install.js
```

**关键配置要点：**
- `.npmrc` 的 `electron_mirror` 只在经由 pnpm 执行脚本时生效；直接 `node install.js` 要用 `ELECTRON_MIRROR` 环境变量
- 重装时看到 `reused N, downloaded 0` 且问题依旧，就该怀疑 store 缓存，用 `pnpm store prune`
- 下载成功的 zip 缓存在 `~/Library/Caches/electron/`，排查时可先确认 zip 是否完整（`unzip -t`），再判断卡在下载还是解压

**参考文档：**
[npmmirror Electron 镜像](https://npmmirror.com/mirrors/electron/)
