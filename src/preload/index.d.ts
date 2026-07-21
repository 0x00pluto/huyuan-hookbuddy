import { ElectronAPI } from '@electron-toolkit/preload'

export interface ElectronSkillAPI {
  runSkill: (command: string) => Promise<{ success: boolean; data: string }>
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: ElectronSkillAPI
  }
}
