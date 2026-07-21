import { ElectronAPI } from '@electron-toolkit/preload'
import type { InstallUpdateResult, UpdaterStatusPayload } from '../shared/updater-types'

export interface ElectronSkillAPI {
  runSkill: (command: string) => Promise<{ success: boolean; data: string }>
  getUpdateStatus: () => Promise<UpdaterStatusPayload>
  onUpdateStatus: (callback: (payload: UpdaterStatusPayload) => void) => () => void
  retryUpdateCheck: () => Promise<void>
  installUpdate: () => Promise<InstallUpdateResult>
  hasRunningTask: () => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: ElectronSkillAPI
  }
}
