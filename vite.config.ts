import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// 说明：electron-vite 实际使用的是 electron.vite.config.ts。
// 本文件仅用于让 shadcn CLI 的框架检测识别为 Vite 项目（它按文件名 glob vite.config.*）。
// 对 `pnpm dev` / 打包无任何影响。
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': resolve('src/renderer/src')
    }
  }
})
