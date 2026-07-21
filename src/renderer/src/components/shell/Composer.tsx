import { ArrowUp, CheckCircle2, Folder, Plus } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { FEATURE_WIP_TOAST } from '@/lib/shell-types'
import type { MockProject } from '@/lib/shell-types'
import { cn } from '@/lib/utils'

interface ComposerProps {
  projectName: string
  projects: MockProject[]
  draft: string
  onDraftChange: (value: string) => void
  onSend: () => void
  onSelectProject: (projectId: string) => void
}

export function Composer({
  projectName,
  projects,
  draft,
  onDraftChange,
  onSend,
  onSelectProject
}: ComposerProps): React.JSX.Element {
  const canSend = draft.trim().length > 0

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (canSend) onSend()
    }
  }

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center px-4 pb-4">
      <div
        className={cn(
          'pointer-events-auto w-full max-w-3xl rounded-2xl border border-border bg-card shadow-lg',
          'ring-1 ring-black/5 dark:ring-white/10'
        )}
      >
        <div className="flex items-center gap-2 border-b border-border/60 px-3 pt-3 pb-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/80"
                title={projectName}
              >
                <Folder className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{projectName}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-48">
              {projects.map((project) => (
                <DropdownMenuItem key={project.id} onClick={() => onSelectProject(project.id)}>
                  {project.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Textarea
          value={draft}
          onChange={(event) => onDraftChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="随便写点什么"
          rows={1}
          className="max-h-40 min-h-[44px] resize-none border-0 bg-transparent px-3 py-2 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <div className="flex items-center justify-between gap-2 px-2 pb-2">
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label="添加附件"
              onClick={() => toast.info(FEATURE_WIP_TOAST)}
            >
              <Plus />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-xs">
                  <CheckCircle2 className="size-3.5 text-muted-foreground" />
                  代我审批
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => toast.info(FEATURE_WIP_TOAST)}>
                  始终询问
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(FEATURE_WIP_TOAST)}>
                  代我审批
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                >
                  自定义 · 中等
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => toast.info(FEATURE_WIP_TOAST)}>
                  自定义 · 低
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(FEATURE_WIP_TOAST)}>
                  自定义 · 中等
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info(FEATURE_WIP_TOAST)}>
                  自定义 · 高
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              type="button"
              size="icon-sm"
              className="rounded-full"
              aria-label="发送"
              disabled={!canSend}
              onClick={onSend}
            >
              <ArrowUp />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
