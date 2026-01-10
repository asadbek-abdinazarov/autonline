'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface ThemeToggleButtonProps {
  theme?: 'light' | 'dark'
  showLabel?: boolean
  className?: string
  onClick?: () => void
  disabled?: boolean
  asChild?: boolean
}

export const ThemeToggleButton = ({
  theme = 'light',
  showLabel = false,
  className,
  onClick,
  disabled = false,
  asChild = false,
}: ThemeToggleButtonProps) => {
  const handleClick = () => {
    if (disabled) return
    onClick?.()
  }

  return (
    <Button
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      onClick={handleClick}
      disabled={disabled}
      asChild={asChild}
      className={cn(
        showLabel && 'gap-2',
        className
      )}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <Sun className="h-[1.2rem] w-[1.2rem]" />
      ) : (
        <Moon className="h-[1.2rem] w-[1.2rem]" />
      )}
      {showLabel && (
        <span className="text-sm">
          {theme === 'light' ? 'Light' : 'Dark'}
        </span>
      )}
    </Button>
  )
}
