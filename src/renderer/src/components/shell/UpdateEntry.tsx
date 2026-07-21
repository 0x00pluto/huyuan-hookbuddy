import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { UpdaterStatusPayload } from '../../../../shared/updater-types'
import { cn } from '@/lib/utils'

interface UpdateEntryProps {
  updateStatus: UpdaterStatusPayload
  variant: 'sidebar' | 'titlebar'
}

function getPlatform(): string {
  return window.electron?.process?.platform ?? 'darwin'
}

function getTooltipText(updateStatus: UpdaterStatusPayload, isMac: boolean): string {
  const version = updateStatus.availableVersion ?? ''
  if (isMac) {
    return `发现新版本 v${version}，点击下载`
  }
  return `新版本 v${version} 已就绪`
}

function getAriaLabel(isMac: boolean): string {
  return isMac ? '下载新版本' : '重启并安装更新'
}

export function UpdateEntry({ updateStatus }: UpdateEntryProps): React.JSX.Element | null {
  const [open, setOpen] = useState(false)
  const [hasRunningTask, setHasRunningTask] = useState(false)
  const isMac = getPlatform() === 'darwin'
  const isReady = updateStatus.status === 'readyToInstall'
  const isDownloading = updateStatus.status === 'downloading'
  const version = updateStatus.availableVersion ?? '未知版本'

  useEffect(() => {
    if (!open) return

    void window.electronAPI
      .hasRunningTask()
      .then(setHasRunningTask)
      .catch(() => {
        setHasRunningTask(false)
      })
  }, [open])

  // 仅 readyToInstall 显示向上箭头，其余状态不占位、不可误触发
  if (!isReady) {
    return null
  }

  const handleConfirm = async (): Promise<void> => {
    const result = await window.electronAPI.installUpdate()
    if (result.blockedByTask) {
      toast.error('请先结束当前任务')
      return
    }
    if (!result.ok) {
      return
    }
    if (isMac) {
      setOpen(false)
    }
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className={cn(
              'group/update h-7 min-w-7 gap-0 rounded-full border-0 bg-emerald-500/15 px-1.5',
              'text-emerald-600 transition-all duration-200',
              'hover:bg-emerald-600 hover:px-2.5 hover:text-white',
              'dark:bg-emerald-400/15 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white'
            )}
            aria-label={getAriaLabel(isMac)}
            onClick={() => setOpen(true)}
          >
            <ArrowUp className="size-4 shrink-0 group-hover/update:hidden" />
            <span className="hidden text-xs font-medium group-hover/update:inline">升级</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{getTooltipText(updateStatus, isMac)}</TooltipContent>
      </Tooltip>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isMac ? '下载新版本？' : '安装更新并重启？'}</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm text-muted-foreground">
                {isMac ? (
                  <>
                    <p>
                      将下载 v{version} 的安装包（dmg），完成后会自动打开。请先将 HookBuddy
                      退出，再将应用拖入 Applications 完成更新。
                    </p>
                    <p>
                      若系统提示「无法验证开发者」，请右键 dmg 或应用选择「打开」，或在「系统设置 →
                      隐私与安全性」中允许打开。
                    </p>
                    {isDownloading && <p className="text-foreground">正在下载…</p>}
                  </>
                ) : (
                  <>
                    <p>应用将关闭并安装 v{version}。安装完成后会自动重新启动。</p>
                    <p>若有未发送的草稿，请先保存或发送后再更新。</p>
                    {hasRunningTask && (
                      <p className="text-destructive">当前有运行中的任务，请先结束任务后再更新。</p>
                    )}
                  </>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>稍后</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                disabled={(!isMac && hasRunningTask) || isDownloading}
                onClick={(event) => {
                  event.preventDefault()
                  void handleConfirm()
                }}
              >
                {isMac ? '下载新版本' : '立即重启并更新'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
