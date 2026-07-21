import { ThemeProvider } from 'next-themes'

import { MainShell } from '@/components/shell/MainShell'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

/**
 * 主题跟随系统：由 next-themes ThemeProvider（defaultTheme=system）驱动 html.dark；
 * 另见 hooks/use-system-theme.ts（无 ThemeProvider 时的兜底方案）。
 */
function App(): React.JSX.Element {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <MainShell />
        <Toaster position="top-center" richColors closeButton />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App
