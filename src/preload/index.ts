import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { InstallUpdateResult, UpdaterStatusPayload } from '../shared/updater-types'

const api = {
  runSkill: (command: string): Promise<{ success: boolean; data: string }> =>
    ipcRenderer.invoke('run-skill-command', command),
  getUpdateStatus: (): Promise<UpdaterStatusPayload> => ipcRenderer.invoke('updater:get-status'),
  onUpdateStatus: (callback: (payload: UpdaterStatusPayload) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: UpdaterStatusPayload): void => {
      callback(payload)
    }
    ipcRenderer.on('updater:status', listener)
    return () => {
      ipcRenderer.removeListener('updater:status', listener)
    }
  },
  retryUpdateCheck: (): Promise<void> => ipcRenderer.invoke('updater:retry'),
  installUpdate: (): Promise<InstallUpdateResult> => ipcRenderer.invoke('updater:install'),
  hasRunningTask: (): Promise<boolean> => ipcRenderer.invoke('tasks:has-running')
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.electronAPI = api
}
