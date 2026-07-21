import type { MockProject, QuickAction } from '@/lib/shell-types'

export const MOCK_PROJECTS: MockProject[] = [
  {
    id: 'proj-huyun',
    name: '互运AI技能测试',
    tasks: [
      { id: 't-h1', title: '梳理技能包目录结构' },
      { id: 't-h2', title: '补充 CLI 安装说明' }
    ]
  },
  {
    id: 'proj-donghu',
    name: '东湖高新区拍照项目',
    tasks: [
      { id: 't-d1', title: '整理外景拍摄清单' },
      { id: 't-d2', title: '导出今日样片' },
      { id: 't-d3', title: '对齐甲方修图标准' }
    ]
  },
  {
    id: 'proj-world',
    name: '世界方法论',
    tasks: [{ id: 't-w1', title: '整理章节大纲草稿' }]
  },
  {
    id: 'proj-misc',
    name: '杂七杂八',
    tasks: [
      { id: 't-m1', title: '生成一组产品插画草稿' },
      { id: 't-m2', title: '设计动效标题卡样式' },
      { id: 't-m3', title: '导出社交媒体封面尺寸' },
      { id: 't-m4', title: '调整品牌主色对比度' },
      { id: 't-m5', title: '整理素材命名规范' },
      { id: 't-m6', title: '补齐空状态插画变体' },
      { id: 't-m7', title: '校对中文文案语气' }
    ]
  }
]

export const MOCK_STANDALONE_TASKS = [
  { id: 'st-1', title: '周末整理下载文件夹' },
  { id: 'st-2', title: '更新 README 截图' }
]

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'explore',
    label: '探索并理解代码',
    prompt: '帮我探索并理解这个项目的代码结构',
    iconTone: 'blue'
  },
  {
    id: 'build',
    label: '构建新功能、应用或工具',
    prompt: '帮我构建一个新功能：',
    iconTone: 'orange'
  },
  {
    id: 'review',
    label: '审查代码并提出修改建议',
    prompt: '请审查相关代码并给出修改建议',
    iconTone: 'green'
  },
  {
    id: 'fix',
    label: '修复问题与失败',
    prompt: '帮我排查并修复以下问题：',
    iconTone: 'red'
  }
]

export const DEFAULT_PROJECT_ID = 'proj-misc'
