### **Q: 如何解决 shadcn CLI 在 electron-vite 项目中报 "could not detect a supported framework" 的问题？**

**A:**
在 electron-vite 项目中执行 `shadcn init / apply / add` 时，preflight 检测报错「We could not detect a supported framework」，无法继续。根因是 shadcn CLI 按文件名识别框架，而 electron-vite 的配置文件名不在其识别列表内。在项目根目录放一个 `vite.config.ts` 即可绕过。

**问题症状：**
- 执行 `pnpm dlx shadcn@latest apply --preset xxx` 输出 `✖ Verifying framework.` 并提示 `We could not detect a supported framework at <项目路径>`
- 项目本身 `pnpm dev` 一切正常，只有 shadcn CLI 不认

**根本原因：**
shadcn CLI 的框架检测靠 glob 匹配根目录下的 `vite.config.*`、`next.config.*` 等标志文件；electron-vite 的配置文件叫 `electron.vite.config.ts`，文件名对不上，被判定为「不支持的框架」。这是已知问题（shadcn-ui/ui issue #5005）。

**解决方案：**
在项目根目录额外放一个 `vite.config.ts`（内容与 renderer 配置一致即可）。electron-vite 只认 `electron.vite.config.ts`，这个文件对 `pnpm dev` 和打包完全无影响，纯粹用于让 shadcn CLI 通过框架检测。**不要删除它。**

**正确配置示例：**
```typescript
// vite.config.ts（仅供 shadcn CLI 框架检测使用）
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve('src/renderer/src')
    }
  }
})
```

**关键配置要点：**
- `vite.config.ts` 必须位于仓库根目录（shadcn glob 深度有限）
- `components.json` 中 `tailwind.css` 指向渲染层的真实 CSS 路径（本项目为 `src/renderer/src/assets/main.css`）
- `tsconfig.json` 根文件也要配 `@/*` 别名，shadcn 靠它解析 import alias

**参考文档：**
[shadcn-ui/ui issue #5005: Electron vite init](https://github.com/shadcn-ui/ui/issues/5005)
