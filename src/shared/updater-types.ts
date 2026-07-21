export type UpdateStatus =
  'idle' | 'checking' | 'upToDate' | 'downloading' | 'readyToInstall' | 'installing' | 'error'

export type PlatformFlow = 'win-auto' | 'mac-dmg'

export interface UpdaterStatusPayload {
  status: UpdateStatus
  platformFlow: PlatformFlow
  currentVersion: string
  availableVersion?: string
  errorMessage?: string
  lastCheckedAt?: string
}

export interface InstallUpdateResult {
  ok: boolean
  blockedByTask?: boolean
}
