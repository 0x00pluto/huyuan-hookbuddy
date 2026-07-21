import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

function App(): React.JSX.Element {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleExecute = async (): Promise<void> => {
    setLoading(true)
    try {
      const response = await window.electronAPI.runSkill('node -v')
      setResult(response.success ? response.data : `执行失败: ${response.data}`)
    } catch (error) {
      setResult(error instanceof Error ? error.message : '未知错误')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dark flex min-h-svh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Hello World</CardTitle>
          <CardDescription>
            Electron 三层架构演示：Renderer → Preload → Main
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            点击下方按钮，通过安全 IPC 在主进程执行 <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">node -v</code>。
          </p>
          {result !== null && (
            <div className="rounded-lg border bg-muted/50 p-3 font-mono text-sm">
              {result}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleExecute} disabled={loading} className="w-full">
            {loading ? '执行中…' : '运行 node -v'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default App
