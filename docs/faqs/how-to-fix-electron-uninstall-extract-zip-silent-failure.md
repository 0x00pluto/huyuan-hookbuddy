### **Q: 如何解决 pnpm dev 报 "Error: Electron uninstall" 且重装 node_modules 无效的问题？**

**A:**
`pnpm dev` 启动时 electron-vite 抛 `Error: Electron uninstall`，直接运行 `./node_modules/.bin/electron --version` 报 `Electron failed to install correctly`。zip 包其实已完整下载到本地缓存，卡住的是解压环节：`extract-zip` 在 Node 26 下静默失败。用系统 `unzip` 手动解压即可修复。

**问题症状：**
- `pnpm dev` 报 `Error: Electron uninstall`（来自 electron-vite 的 `getElectronPath`）
- `node_modules/electron/dist/` 里只有 `LICENSES.chromium.html` 一个文件，没有 `Electron.app`，也没有 `node_modules/electron/path.txt`
- `pnpm install` 时 electron 的 postinstall 秒级"done"（约 200ms，正常下载+解压 100MB 不可能这么快）
- `rm -rf node_modules && pnpm store prune && pnpm install` 重装后依旧复现
- `~/Library/Caches/electron/` 下的 zip 完整且 `unzip -t` 校验通过

**根本原因：**
electron 包的 `install.js` 使用 `extract-zip` 库解压二进制 zip。在 Node v26.3.0 下 `extract-zip` 只解出第一个文件就提前"成功"返回——不报错、不抛异常，导致 `dist/` 不完整且 `path.txt` 未写入。与网络、pnpm、镜像均无关，属于 `extract-zip` 与新版 Node 的兼容性问题。

**解决方案：**
绕过 `extract-zip`，用系统 `unzip` 把缓存里的 zip 手动解到 `dist/` 并补写 `path.txt`：

```bash
cd node_modules/electron && rm -rf dist && mkdir dist \
  && unzip -o -q ~/Library/Caches/electron/*/electron-v39.8.10-darwin-arm64.zip -d dist \
  && printf 'Electron.app/Contents/MacOS/Electron' > path.txt
```

验证（应输出版本号）：

```bash
./node_modules/.bin/electron --version
```

**关键配置要点：**
- zip 文件名随 Electron 版本变化，可用通配 `electron-v*-darwin-arm64.zip`
- macOS 的 `path.txt` 内容固定为 `Electron.app/Contents/MacOS/Electron`（Windows 是 `electron.exe`）
- 每次 `rm -rf node_modules` 重装后会复发，重跑上面命令即可
- 长期方案：等 electron 官方修复 extract-zip 兼容性，或将 Node 降级到 24 LTS

**参考文档：**
[electron/electron issue #44008: Electron failed to install correctly](https://github.com/electron/electron/issues/44008)
