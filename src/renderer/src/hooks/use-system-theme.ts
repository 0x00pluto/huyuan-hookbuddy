import { useEffect } from 'react'

/**
 * 将系统浅/深色同步到 <html class="dark">。
 * 若外层已有 next-themes ThemeProvider（attribute=class），则无需调用本 hook。
 */
export function useSystemTheme(): void {
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const apply = (matches: boolean): void => {
      document.documentElement.classList.toggle('dark', matches)
    }

    apply(media.matches)

    const onChange = (event: MediaQueryListEvent): void => {
      apply(event.matches)
    }

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])
}
