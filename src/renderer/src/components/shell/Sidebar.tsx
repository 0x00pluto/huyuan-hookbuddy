import {
  ChevronDown,
  ChevronRight,
  Clock,
  GitPullRequest,
  Puzzle,
  Search,
  Settings,
  SquarePen
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { ProjectList } from '@/components/shell/ProjectList'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { MOCK_STANDALONE_TASKS } from '@/data/mock-projects'
import { FEATURE_WIP_TOAST } from '@/lib/shell-types'
import type { MockProject, NavId } from '@/lib/shell-types'
import { cn } from '@/lib/utils'

interface SidebarProps {
  projects: MockProject[]
  currentProjectId: string
  expandedProjectIds: Set<string>
  showMoreByProject: Set<string>
  activeNav: NavId
  onNavSelect: (nav: NavId) => void
  onSelectProject: (projectId: string) => void
  onToggleExpand: (projectId: string) => void
  onShowMore: (projectId: string) => void
  onSelectTask: (projectId: string, taskId: string) => void
  onSettingsClick: () => void
}

const NAV_ITEMS: { id: NavId; label: string; icon: typeof SquarePen }[] = [
  { id: 'new-task', label: '新建任务', icon: SquarePen },
  { id: 'scheduled', label: '定时任务', icon: Clock },
  { id: 'plugins', label: '插件', icon: Puzzle },
  { id: 'pull-requests', label: 'Pull Requests', icon: GitPullRequest }
]

export function Sidebar({
  projects,
  currentProjectId,
  expandedProjectIds,
  showMoreByProject,
  activeNav,
  onNavSelect,
  onSelectProject,
  onToggleExpand,
  onShowMore,
  onSelectTask,
  onSettingsClick
}: SidebarProps): React.JSX.Element {
  const [tasksOpen, setTasksOpen] = useState(true)

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between gap-2 px-3 py-3">
        <span className="truncate text-sm font-semibold tracking-tight">HookBuddy</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="搜索"
          className="text-muted-foreground"
          onClick={() => toast.info(FEATURE_WIP_TOAST)}
        >
          <Search />
        </Button>
      </div>

      <nav className="flex flex-col gap-0.5 px-2">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={cn(
              'flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm transition-colors',
              activeNav === id
                ? 'bg-sidebar-accent font-medium text-sidebar-accent-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
            )}
            onClick={() => onNavSelect(id)}
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{label}</span>
          </button>
        ))}
      </nav>

      <Separator className="my-3 bg-sidebar-border" />

      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="min-h-0 flex-1">
          <p className="mb-1 px-3 text-xs font-medium text-muted-foreground">项目</p>
          <ScrollArea className="h-[calc(100%-1.25rem)]">
            <ProjectList
              projects={projects}
              currentProjectId={currentProjectId}
              expandedProjectIds={expandedProjectIds}
              showMoreByProject={showMoreByProject}
              onSelectProject={onSelectProject}
              onToggleExpand={onToggleExpand}
              onShowMore={onShowMore}
              onSelectTask={onSelectTask}
            />
          </ScrollArea>
        </div>

        <div className="px-2 pb-1">
          <button
            type="button"
            className="mb-1 flex w-full items-center gap-1 rounded-md px-1 py-1 text-xs font-medium text-muted-foreground hover:bg-sidebar-accent/60"
            onClick={() => setTasksOpen((open) => !open)}
          >
            {tasksOpen ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )}
            <span>任务</span>
          </button>
          {tasksOpen && (
            <ul className="flex flex-col gap-0.5 pl-1">
              {MOCK_STANDALONE_TASKS.map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="w-full truncate rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-sidebar-accent/60"
                    title={task.title}
                    onClick={() => toast.info(FEATURE_WIP_TOAST)}
                  >
                    {task.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-sidebar-border px-2 py-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2 text-sidebar-foreground"
          onClick={onSettingsClick}
        >
          <Settings className="size-4" />
          设置
        </Button>
        <span
          className="size-7 rounded-full bg-sidebar-primary/20 ring-1 ring-sidebar-border"
          aria-hidden
          title="头像占位"
        />
      </div>
    </aside>
  )
}
