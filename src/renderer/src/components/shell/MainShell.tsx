import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ChatView } from '@/components/shell/ChatView'
import { Composer } from '@/components/shell/Composer'
import { EmptyState } from '@/components/shell/EmptyState'
import { Sidebar } from '@/components/shell/Sidebar'
import { TitleBar } from '@/components/shell/TitleBar'
import { DEFAULT_PROJECT_ID, MOCK_PROJECTS } from '@/data/mock-projects'
import { useUpdateStatus } from '@/hooks/useUpdateStatus'
import { AI_PLACEHOLDER_REPLY, FEATURE_WIP_TOAST } from '@/lib/shell-types'
import type { ChatMessage, MainView, NavId } from '@/lib/shell-types'

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function MainShell(): React.JSX.Element {
  const { updateStatus } = useUpdateStatus()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeNav, setActiveNav] = useState<NavId>('new-task')
  const [currentProjectId, setCurrentProjectId] = useState(DEFAULT_PROJECT_ID)
  const [expandedProjectIds, setExpandedProjectIds] = useState<Set<string>>(
    () => new Set([DEFAULT_PROJECT_ID])
  )
  const [showMoreByProject, setShowMoreByProject] = useState<Set<string>>(() => new Set())
  const [view, setView] = useState<MainView>('empty')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [draft, setDraft] = useState('')

  const currentProject = useMemo(
    () => MOCK_PROJECTS.find((project) => project.id === currentProjectId) ?? MOCK_PROJECTS[0],
    [currentProjectId]
  )

  const resetToEmpty = (): void => {
    setView('empty')
    setMessages([])
    setDraft('')
    setActiveNav('new-task')
  }

  const handleNavSelect = (nav: NavId): void => {
    setActiveNav(nav)
    if (nav === 'new-task') {
      resetToEmpty()
      return
    }
    toast.info(FEATURE_WIP_TOAST)
  }

  const handleSelectProject = (projectId: string): void => {
    setCurrentProjectId(projectId)
    setExpandedProjectIds((prev) => {
      const next = new Set(prev)
      next.add(projectId)
      return next
    })
  }

  const handleToggleExpand = (projectId: string): void => {
    setExpandedProjectIds((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }

  const handleShowMore = (projectId: string): void => {
    setShowMoreByProject((prev) => {
      const next = new Set(prev)
      next.add(projectId)
      return next
    })
  }

  const handleSelectTask = (projectId: string): void => {
    handleSelectProject(projectId)
    toast.info(FEATURE_WIP_TOAST)
  }

  const handleSend = (): void => {
    const content = draft.trim()
    if (!content) return

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: 'user',
      content
    }
    const assistantMessage: ChatMessage = {
      id: createMessageId(),
      role: 'assistant',
      content: AI_PLACEHOLDER_REPLY
    }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setView('chat')
    setDraft('')
  }

  return (
    <div className="flex h-svh flex-col overflow-hidden bg-background text-foreground">
      <TitleBar
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen((open) => !open)}
        updateStatus={updateStatus}
      />

      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <Sidebar
            projects={MOCK_PROJECTS}
            currentProjectId={currentProjectId}
            expandedProjectIds={expandedProjectIds}
            showMoreByProject={showMoreByProject}
            activeNav={activeNav}
            onNavSelect={handleNavSelect}
            onSelectProject={handleSelectProject}
            onToggleExpand={handleToggleExpand}
            onShowMore={handleShowMore}
            onSelectTask={handleSelectTask}
            onSettingsClick={() => toast.info(FEATURE_WIP_TOAST)}
            updateStatus={updateStatus}
          />
        )}

        <main className="relative min-w-0 flex-1 bg-background">
          {view === 'empty' ? (
            <EmptyState
              projectName={currentProject.name}
              onQuickAction={(prompt) => setDraft(prompt)}
            />
          ) : (
            <ChatView messages={messages} />
          )}

          <Composer
            projectName={currentProject.name}
            projects={MOCK_PROJECTS}
            draft={draft}
            onDraftChange={setDraft}
            onSend={handleSend}
            onSelectProject={handleSelectProject}
          />
        </main>
      </div>
    </div>
  )
}
