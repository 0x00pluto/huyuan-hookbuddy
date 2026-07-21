export type NavId = 'new-task' | 'scheduled' | 'plugins' | 'pull-requests'

export type MainView = 'empty' | 'chat'

export type MessageRole = 'user' | 'assistant'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

export interface MockTask {
  id: string
  title: string
}

export interface MockProject {
  id: string
  name: string
  tasks: MockTask[]
}

export interface QuickAction {
  id: string
  label: string
  prompt: string
  iconTone: 'blue' | 'orange' | 'green' | 'red'
}

export const AI_PLACEHOLDER_REPLY = '功能开发中，真实 Agent 能力将在后续版本提供。'

export const FEATURE_WIP_TOAST = '功能开发中'

/** 每个项目默认展示的历史任务条数，超出显示「显示更多」 */
export const DEFAULT_VISIBLE_TASKS = 5
