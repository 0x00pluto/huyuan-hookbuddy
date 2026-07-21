import { ChevronDown, ChevronRight, Folder } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DEFAULT_VISIBLE_TASKS } from '@/lib/shell-types'
import type { MockProject } from '@/lib/shell-types'
import { cn } from '@/lib/utils'

interface ProjectListProps {
  projects: MockProject[]
  currentProjectId: string
  expandedProjectIds: Set<string>
  showMoreByProject: Set<string>
  onSelectProject: (projectId: string) => void
  onToggleExpand: (projectId: string) => void
  onShowMore: (projectId: string) => void
  onSelectTask: (projectId: string, taskId: string) => void
}

export function ProjectList({
  projects,
  currentProjectId,
  expandedProjectIds,
  showMoreByProject,
  onSelectProject,
  onToggleExpand,
  onShowMore,
  onSelectTask
}: ProjectListProps): React.JSX.Element {
  if (projects.length === 0) {
    return <p className="px-3 py-2 text-xs text-muted-foreground">暂无项目</p>
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2">
      {projects.map((project) => {
        const expanded = expandedProjectIds.has(project.id)
        const selected = project.id === currentProjectId
        const showAll = showMoreByProject.has(project.id)
        const visibleTasks = showAll ? project.tasks : project.tasks.slice(0, DEFAULT_VISIBLE_TASKS)
        const hasMore = project.tasks.length > DEFAULT_VISIBLE_TASKS && !showAll

        return (
          <li key={project.id}>
            <div
              className={cn(
                'flex w-full items-center gap-0.5 rounded-md text-sm',
                selected
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
              )}
            >
              <button
                type="button"
                className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:text-foreground"
                aria-label={expanded ? '折叠项目' : '展开项目'}
                onClick={() => onToggleExpand(project.id)}
              >
                {expanded ? (
                  <ChevronDown className="size-3.5" />
                ) : (
                  <ChevronRight className="size-3.5" />
                )}
              </button>
              <button
                type="button"
                className="flex min-w-0 flex-1 items-center gap-2 py-1.5 pr-2 text-left"
                title={project.name}
                onClick={() => onSelectProject(project.id)}
              >
                <Folder className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{project.name}</span>
              </button>
            </div>

            {expanded && (
              <ul className="ml-4 mt-0.5 flex flex-col gap-0.5 border-l border-sidebar-border pl-2">
                {visibleTasks.map((task) => (
                  <li key={task.id}>
                    <button
                      type="button"
                      className="w-full truncate rounded-md px-2 py-1 text-left text-xs text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
                      title={task.title}
                      onClick={() => onSelectTask(project.id, task.id)}
                    >
                      {task.title}
                    </button>
                  </li>
                ))}
                {hasMore && (
                  <li>
                    <Button
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="h-7 w-full justify-start px-2 text-xs text-muted-foreground"
                      onClick={() => onShowMore(project.id)}
                    >
                      显示更多
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </li>
        )
      })}
    </ul>
  )
}
