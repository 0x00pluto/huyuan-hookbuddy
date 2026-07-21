import { Bug, Hammer, RefreshCw, Sparkles } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { QUICK_ACTIONS } from '@/data/mock-projects'
import type { QuickAction } from '@/lib/shell-types'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  projectName: string
  onQuickAction: (prompt: string) => void
}

const TONE_CLASS: Record<QuickAction['iconTone'], string> = {
  blue: 'bg-sky-500/15 text-sky-600 dark:text-sky-400',
  orange: 'bg-orange-500/15 text-orange-600 dark:text-orange-400',
  green: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  red: 'bg-red-500/15 text-red-600 dark:text-red-400'
}

function ActionIcon({ tone }: { tone: QuickAction['iconTone'] }): React.JSX.Element {
  const className = 'size-5'
  switch (tone) {
    case 'blue':
      return <Sparkles className={className} />
    case 'orange':
      return <Hammer className={className} />
    case 'green':
      return <RefreshCw className={className} />
    case 'red':
      return <Bug className={className} />
  }
}

export function EmptyState({ projectName, onQuickAction }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-36 pt-10">
      <div
        className="mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary"
        aria-hidden
      >
        <Sparkles className="size-8" />
      </div>

      <h1 className="mb-8 max-w-xl text-center text-2xl font-semibold tracking-tight text-foreground">
        想在 <span className="text-primary">{projectName}</span> 做点什么？
      </h1>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-3 lg:grid-cols-4">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            className="text-left"
            onClick={() => onQuickAction(action.prompt)}
          >
            <Card className="h-full transition-colors hover:bg-muted/50 hover:shadow-sm">
              <CardContent className="flex flex-col gap-3 p-4">
                <span
                  className={cn(
                    'inline-flex size-9 items-center justify-center rounded-lg',
                    TONE_CLASS[action.iconTone]
                  )}
                >
                  <ActionIcon tone={action.iconTone} />
                </span>
                <span className="text-sm font-medium leading-snug text-foreground">
                  {action.label}
                </span>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  )
}
