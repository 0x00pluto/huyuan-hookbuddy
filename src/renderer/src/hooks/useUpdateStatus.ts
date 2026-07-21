import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { UpdaterStatusPayload } from '../../../shared/updater-types'

const DEFAULT_STATUS: UpdaterStatusPayload = {
  status: 'idle',
  platformFlow: 'mac-dmg',
  currentVersion: '0.0.0'
}

export function useUpdateStatus(): {
  updateStatus: UpdaterStatusPayload
  retryUpdateCheck: () => Promise<void>
} {
  const [updateStatus, setUpdateStatus] = useState<UpdaterStatusPayload>(DEFAULT_STATUS)
  const lastErrorRef = useRef<string | undefined>(undefined)

  const retryUpdateCheck = useCallback(async (): Promise<void> => {
    await window.electronAPI.retryUpdateCheck()
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    const init = async (): Promise<void> => {
      try {
        const status = await window.electronAPI.getUpdateStatus()
        setUpdateStatus(status)
      } catch {
        // dev 或未注入 preload 时保持默认态
      }

      unsubscribe = window.electronAPI.onUpdateStatus((payload) => {
        setUpdateStatus(payload)
      })
    }

    void init()

    return () => {
      unsubscribe?.()
    }
  }, [])

  useEffect(() => {
    if (updateStatus.status !== 'error') {
      lastErrorRef.current = undefined
      return
    }

    const message = updateStatus.errorMessage ?? '检查或下载更新失败'
    if (lastErrorRef.current === message) return
    lastErrorRef.current = message

    toast.error(message, {
      action: {
        label: '重试',
        onClick: () => {
          void retryUpdateCheck()
        }
      }
    })
  }, [updateStatus.status, updateStatus.errorMessage, retryUpdateCheck])

  return { updateStatus, retryUpdateCheck }
}
