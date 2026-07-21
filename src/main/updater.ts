import { app, BrowserWindow, ipcMain, net, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { autoUpdater } from 'electron-updater'
import { createWriteStream, existsSync, statSync } from 'fs'
import { join } from 'path'
import type { UpdateInfo } from 'electron-updater'
import type { InstallUpdateResult, UpdaterStatusPayload } from '../shared/updater-types'

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000
const SILENT_RETRY_DELAY_MS = 5_000
const GITHUB_OWNER = '0x00pluto'
const GITHUB_REPO = 'huyuan-hookbuddy'

const isWin = process.platform === 'win32'
const isMac = process.platform === 'darwin'
const platformFlow = isWin ? 'win-auto' : 'mac-dmg'

let checkTimer: ReturnType<typeof setInterval> | null = null
let silentRetryUsed = false
let pendingUpdateInfo: UpdateInfo | null = null
let macDmgUrl: string | null = null
let macDmgExpectedSize: number | null = null
let macDownloadInProgress = false

function createInitialPayload(): UpdaterStatusPayload {
  return {
    status: 'idle',
    platformFlow,
    currentVersion: app.getVersion()
  }
}

let currentPayload: UpdaterStatusPayload = createInitialPayload()

function shouldSkipScheduledCheck(): boolean {
  return ['downloading', 'readyToInstall', 'installing'].includes(currentPayload.status)
}

function broadcastStatus(): void {
  const snapshot = { ...currentPayload }
  for (const window of BrowserWindow.getAllWindows()) {
    if (!window.isDestroyed()) {
      window.webContents.send('updater:status', snapshot)
    }
  }
}

function setPayload(partial: Partial<UpdaterStatusPayload>): void {
  currentPayload = { ...currentPayload, ...partial }
  broadcastStatus()
}

function resetErrorState(): void {
  silentRetryUsed = false
  if (currentPayload.status === 'error') {
    setPayload({ status: 'idle', errorMessage: undefined })
  }
}

function resolveMacDmgUrl(version: string, fileUrl: string): string {
  if (/^https?:\/\//i.test(fileUrl)) {
    return fileUrl
  }
  return `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/releases/download/v${version}/${fileUrl}`
}

function extractMacDmgInfo(info: UpdateInfo): { url: string; size: number | null } {
  const dmgFile = info.files?.find((file) => file.url.endsWith('.dmg'))
  if (dmgFile) {
    return { url: resolveMacDmgUrl(info.version, dmgFile.url), size: dmgFile.size ?? null }
  }

  const version = info.version
  return {
    url: resolveMacDmgUrl(version, `hookbuddy-${version}.dmg`),
    size: null
  }
}

function getMacDmgLocalPath(version: string): string {
  return join(app.getPath('downloads'), `hookbuddy-${version}.dmg`)
}

function isMacDmgReady(version: string): boolean {
  const localPath = getMacDmgLocalPath(version)
  if (!existsSync(localPath)) return false
  if (macDmgExpectedSize == null) return true
  try {
    return statSync(localPath).size === macDmgExpectedSize
  } catch {
    return false
  }
}

function scheduleSilentRetry(reason: string): void {
  if (silentRetryUsed) {
    setPayload({
      status: 'error',
      errorMessage: reason
    })
    return
  }

  silentRetryUsed = true
  setTimeout(() => {
    if (!shouldSkipScheduledCheck()) {
      void runCheck()
    }
  }, SILENT_RETRY_DELAY_MS)
}

async function runCheck(): Promise<void> {
  if (is.dev || !app.isPackaged) return
  if (shouldSkipScheduledCheck()) return

  resetErrorState()
  setPayload({ status: 'checking' })

  try {
    await autoUpdater.checkForUpdates()
  } catch (error) {
    const message = error instanceof Error ? error.message : '检查更新失败'
    scheduleSilentRetry(message)
  }
}

function downloadMacDmg(version: string, url: string): Promise<void> {
  const localPath = getMacDmgLocalPath(version)

  return new Promise((resolve, reject) => {
    const request = net.request(url)
    request.on('response', (response) => {
      if (response.statusCode && response.statusCode >= 400) {
        reject(new Error(`下载 dmg 失败（HTTP ${response.statusCode}）`))
        return
      }

      const fileStream = createWriteStream(localPath)
      let settled = false

      const fail = (error: Error): void => {
        if (settled) return
        settled = true
        fileStream.destroy()
        reject(error)
      }

      fileStream.on('finish', () => {
        if (settled) return
        settled = true
        resolve()
      })
      fileStream.on('error', fail)

      response.on('data', (chunk) => {
        fileStream.write(chunk)
      })
      response.on('end', () => {
        fileStream.end()
      })
      response.on('error', fail)
    })
    request.on('error', reject)
    request.end()
  })
}

async function openMacDmg(version: string): Promise<void> {
  const localPath = getMacDmgLocalPath(version)
  setPayload({ status: 'installing' })

  const openResult = await shell.openPath(localPath)
  if (openResult) {
    throw new Error(openResult)
  }

  setPayload({ status: 'readyToInstall' })
}

async function installMacUpdate(): Promise<InstallUpdateResult> {
  const version = currentPayload.availableVersion ?? pendingUpdateInfo?.version
  if (!version) {
    setPayload({ status: 'error', errorMessage: '未找到可下载的版本信息' })
    return { ok: false }
  }

  if (isMacDmgReady(version)) {
    try {
      await openMacDmg(version)
      return { ok: true }
    } catch (error) {
      const message = error instanceof Error ? error.message : '打开 dmg 失败'
      setPayload({ status: 'error', errorMessage: message })
      return { ok: false }
    }
  }

  const url = macDmgUrl ?? extractMacDmgInfo(pendingUpdateInfo ?? ({ version } as UpdateInfo)).url
  if (!url) {
    setPayload({ status: 'error', errorMessage: '未找到 dmg 下载地址' })
    return { ok: false }
  }

  if (macDownloadInProgress) {
    return { ok: false }
  }

  macDownloadInProgress = true
  setPayload({ status: 'downloading', availableVersion: version })

  try {
    await downloadMacDmg(version, url)
    macDownloadInProgress = false
    await openMacDmg(version)
    return { ok: true }
  } catch (error) {
    macDownloadInProgress = false
    const message = error instanceof Error ? error.message : '下载 dmg 失败'
    setPayload({ status: 'error', errorMessage: message })
    return { ok: false }
  }
}

function installWinUpdate(): InstallUpdateResult {
  if (hasRunningTask()) {
    return { ok: false, blockedByTask: true }
  }

  setPayload({ status: 'installing' })
  autoUpdater.quitAndInstall(false, true)
  return { ok: true }
}

export function hasRunningTask(): boolean {
  // R0 stub：Agent 任务状态落地前始终返回 false，接口形态固定便于后续接入
  return false
}

function registerAutoUpdaterEvents(): void {
  autoUpdater.on('checking-for-update', () => {
    setPayload({ status: 'checking', lastCheckedAt: new Date().toISOString() })
  })

  autoUpdater.on('update-not-available', () => {
    silentRetryUsed = false
    setPayload({
      status: 'upToDate',
      availableVersion: undefined,
      errorMessage: undefined,
      lastCheckedAt: new Date().toISOString()
    })
  })

  autoUpdater.on('update-available', (info) => {
    silentRetryUsed = false
    pendingUpdateInfo = info

    if (isWin) {
      setPayload({
        status: 'downloading',
        availableVersion: info.version,
        errorMessage: undefined,
        lastCheckedAt: new Date().toISOString()
      })
      return
    }

    if (isMac) {
      const dmgInfo = extractMacDmgInfo(info)
      macDmgUrl = dmgInfo.url
      macDmgExpectedSize = dmgInfo.size
      setPayload({
        status: 'readyToInstall',
        availableVersion: info.version,
        errorMessage: undefined,
        lastCheckedAt: new Date().toISOString()
      })
    }
  })

  autoUpdater.on('update-downloaded', (info) => {
    silentRetryUsed = false
    pendingUpdateInfo = info
    setPayload({
      status: 'readyToInstall',
      availableVersion: info.version,
      errorMessage: undefined
    })
  })

  autoUpdater.on('error', (error) => {
    const message = error.message || '更新失败'
    scheduleSilentRetry(message)
  })
}

function registerIpcHandlers(): void {
  ipcMain.handle('updater:get-status', () => ({ ...currentPayload }))

  ipcMain.handle('updater:retry', async () => {
    silentRetryUsed = false
    setPayload({ status: 'idle', errorMessage: undefined })
    await runCheck()
  })

  ipcMain.handle('updater:install', async (): Promise<InstallUpdateResult> => {
    if (isWin) {
      return installWinUpdate()
    }
    if (isMac) {
      return installMacUpdate()
    }
    return { ok: false }
  })

  ipcMain.handle('tasks:has-running', () => hasRunningTask())
}

export function initUpdater(): void {
  if (is.dev || !app.isPackaged) {
    currentPayload = createInitialPayload()
    registerIpcHandlers()
    return
  }

  autoUpdater.autoDownload = isWin
  autoUpdater.autoInstallOnAppQuit = isWin
  autoUpdater.allowPrerelease = false

  registerAutoUpdaterEvents()
  registerIpcHandlers()

  void runCheck()

  checkTimer = setInterval(() => {
    void runCheck()
  }, CHECK_INTERVAL_MS)

  app.on('before-quit', () => {
    if (checkTimer) {
      clearInterval(checkTimer)
      checkTimer = null
    }
  })

  app.on('browser-window-created', (_, window) => {
    window.webContents.once('did-finish-load', () => {
      if (!window.isDestroyed()) {
        window.webContents.send('updater:status', { ...currentPayload })
      }
    })
  })
}

export function getUpdaterStatusForTest(): UpdaterStatusPayload {
  return { ...currentPayload }
}

export function setUpdaterStatusForTest(payload: Partial<UpdaterStatusPayload>): void {
  currentPayload = { ...currentPayload, ...payload }
  broadcastStatus()
}
