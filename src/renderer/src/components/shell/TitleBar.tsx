import { ChevronLeft, ChevronRight, LayoutPanelLeft, PanelLeft, PanelLeftClose } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FEATURE_WIP_TOAST } from '@/lib/shell-types'
import { cn } from '@/lib/utils'

interface TitleBarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export function TitleBar({ sidebarOpen, onToggleSidebar }: TitleBarProps): React.JSX.Element {
  const isMac = window.electron?.process?.platform === 'darwin'

  return (
    <header
      className={cn(
        'flex h-11 shrink-0 items-center gap-1 border-b border-border bg-background px-2',
        '[-webkit-app-region:drag]'
      )}
    >
      {/* macOS traffic lights 占位，避免与折叠按钮重叠 */}
      {isMac && <div className="w-[68px] shrink-0" aria-hidden />}

      <div className="flex items-center gap-0.5 [-webkit-app-region:no-drag]">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={sidebarOpen ? '折叠侧栏' : '展开侧栏'}
              onClick={onToggleSidebar}
            >
              {sidebarOpen ? <PanelLeftClose /> : <PanelLeft />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{sidebarOpen ? '折叠侧栏' : '展开侧栏'}</TooltipContent>
        </Tooltip>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="后退"
          disabled
          onClick={() => toast.info(FEATURE_WIP_TOAST)}
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="前进"
          disabled
          onClick={() => toast.info(FEATURE_WIP_TOAST)}
        >
          <ChevronRight />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="[-webkit-app-region:no-drag]">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="布局"
          onClick={() => toast.info(FEATURE_WIP_TOAST)}
        >
          <LayoutPanelLeft />
        </Button>
      </div>
    </header>
  )
}
