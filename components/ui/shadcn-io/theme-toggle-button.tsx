'use client'

import { Moon, Sun, ChevronRight, Check, Sparkles } from 'lucide-react'
import { useCallback, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

type AnimationVariant =
  | 'circle'
  | 'circle-blur'
  | 'gif'
  | 'polygon'

type StartPosition =
  | 'center'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'

export interface ThemeToggleButtonProps {
  theme?: 'light' | 'dark'
  showLabel?: boolean
  variant?: AnimationVariant
  start?: StartPosition
  url?: string // For gif variant
  className?: string
  onClick?: () => void
  disabled?: boolean
  showAnimationMenu?: boolean // Show submenu for animation variants
  asChild?: boolean // Allow using as child component (e.g., in DropdownMenuItem)
  translations?: {
    light?: string
    dark?: string
    animationStyle?: string
    switchTo?: string
    switchToDark?: string
    switchToLight?: string
    animations?: {
      circle?: string
      circleBlur?: string
      polygon?: string
      gif?: string
    }
    animationDescriptions?: {
      circle?: string
      circleBlur?: string
      polygon?: string
      gif?: string
    }
  }
}

const getAnimationVariants = (translations?: ThemeToggleButtonProps['translations']) => {
  return [
    { 
      value: 'circle' as const, 
      label: translations?.animations?.circle || 'Circle', 
      description: translations?.animationDescriptions?.circle || 'Circular expansion animation' 
    },
    { 
      value: 'circle-blur' as const, 
      label: translations?.animations?.circleBlur || 'Circle Blur', 
      description: translations?.animationDescriptions?.circleBlur || 'Circular with blur effect' 
    },
    { 
      value: 'polygon' as const, 
      label: translations?.animations?.polygon || 'Polygon', 
      description: translations?.animationDescriptions?.polygon || 'Wipe animation' 
    },
    { 
      value: 'gif' as const, 
      label: translations?.animations?.gif || 'GIF Mask', 
      description: translations?.animationDescriptions?.gif || 'GIF mask reveal (requires URL)' 
    },
  ]
}

const STORAGE_KEY = 'theme-animation-variant'
const STORAGE_KEY_URL = 'theme-animation-gif-url'

export const ThemeToggleButton = ({
  theme = 'light',
  showLabel = false,
  variant: propVariant,
  start = 'center',
  url,
  className,
  onClick,
  disabled = false,
  showAnimationMenu = false,
  asChild = false,
  translations,
}: ThemeToggleButtonProps) => {
  const ANIMATION_VARIANTS = getAnimationVariants(translations)
  const [selectedVariant, setSelectedVariant] = useState<AnimationVariant>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY) as AnimationVariant
      if (stored && ANIMATION_VARIANTS.some(v => v.value === stored)) {
        return stored
      }
    }
    return propVariant || 'circle-blur'
  })
  const [gifUrl, setGifUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_URL)
      if (stored) {
        return stored
      }
    }
    return url || ''
  })
  const [isAnimationMenuOpen, setIsAnimationMenuOpen] = useState(false)
  const [submenuPosition, setSubmenuPosition] = useState<{ top: number; left: number } | null>(null)
  const animationMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const animationButtonRef = useRef<HTMLDivElement>(null)
  const submenuRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const handleClickRef = useRef<() => void>(() => {})

  // Use propVariant if provided, otherwise use selectedVariant
  const variant = propVariant || selectedVariant
  // Use prop url if provided, otherwise use stored gifUrl
  const currentGifUrl = url || gifUrl


  // Save to localStorage when variant changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !propVariant) {
      localStorage.setItem(STORAGE_KEY, selectedVariant)
    }
  }, [selectedVariant, propVariant])

  // Save gifUrl to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined' && !url && gifUrl) {
      localStorage.setItem(STORAGE_KEY_URL, gifUrl)
    }
  }, [gifUrl, url])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate submenu position
  useEffect(() => {
    if (isAnimationMenuOpen && animationButtonRef.current) {
      const updatePosition = () => {
        if (!animationButtonRef.current) return

        const rect = animationButtonRef.current.getBoundingClientRect()
        const submenuWidth = 200 // approximate width
        const gap = 4
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        
        let left = rect.right + gap
        let top = rect.top
        
        // Check if submenu would overflow to the right
        if (left + submenuWidth > viewportWidth) {
          // Open to the left instead
          left = rect.left - submenuWidth - gap
        }
        
        // Ensure submenu doesn't go off-screen horizontally
        if (left < 0) {
          left = gap
        }
        
        // Check if submenu would overflow vertically
        const submenuHeight = ANIMATION_VARIANTS.length * 60 + 8 // approximate height
        if (top + submenuHeight > viewportHeight) {
          top = viewportHeight - submenuHeight - gap
        }
        
        // Ensure submenu doesn't go off-screen vertically
        if (top < 0) {
          top = gap
        }
        
        setSubmenuPosition({ top, left })
      }

      updatePosition()
      
      // Update position on scroll and resize
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    } else {
      setSubmenuPosition(null)
    }
  }, [isAnimationMenuOpen])
  const handleClick = useCallback(() => {
    if (disabled) return

    // Use current variant (propVariant or selectedVariant)
    const currentVariant = propVariant || selectedVariant
    const currentGifUrlForAnimation = url || gifUrl

    // Inject animation styles for this specific transition
    const styleId = `theme-transition-${Date.now()}`
    const style = document.createElement('style')
    style.id = styleId

    // Generate animation CSS based on current variant
    let css = ''
    const positions = {
      center: 'center',
      'top-left': 'top left',
      'top-right': 'top right',
      'bottom-left': 'bottom left',
      'bottom-right': 'bottom right',
    }

    if (currentVariant === 'circle') {
      const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100'
      const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100'
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-expand 0.4s ease-out;
            transform-origin: ${positions[start]};
          }
          @keyframes circle-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
            }
          }
        }
      `
    } else if (currentVariant === 'circle-blur') {
      const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100'
      const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100'
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `
    } else if (currentVariant === 'gif' && currentGifUrlForAnimation) {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: fade-out 0.4s ease-out;
          }
          ::view-transition-new(root) {
            animation: gif-reveal 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            mask-image: url('${currentGifUrlForAnimation}');
            mask-size: 0%;
            mask-repeat: no-repeat;
            mask-position: center;
          }
          @keyframes fade-out {
            to {
              opacity: 0;
            }
          }
          @keyframes gif-reveal {
            0% {
              mask-size: 0%;
            }
            20% {
              mask-size: 35%;
            }
            60% {
              mask-size: 35%;
            }
            100% {
              mask-size: 300%;
            }
          }
        }
      `
    } else if (currentVariant === 'polygon') {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: ${theme === 'light' ? 'wipe-in-dark' : 'wipe-in-light'} 0.4s ease-out;
          }
          @keyframes wipe-in-light {
            from {
              clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
          @keyframes wipe-in-dark {
            from {
              clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
        }
      `
    }

    style.textContent = css
    document.head.appendChild(style)

    // Start view transition if supported
    if ('startViewTransition' in document) {
      ;(document as any).startViewTransition(() => {
        onClick?.()
      })
    } else {
      onClick?.()
    }

    // Clean up styles after transition
    setTimeout(() => {
      const styleEl = document.getElementById(styleId)
      if (styleEl) {
        styleEl.remove()
      }
    }, 3000)
  }, [onClick, propVariant, selectedVariant, start, url, gifUrl, theme, disabled])

  const handleVariantChange = useCallback((newVariant: AnimationVariant) => {
    // Save variant immediately to localStorage
    if (typeof window !== 'undefined' && !propVariant) {
      localStorage.setItem(STORAGE_KEY, newVariant)
    }
    
    // If switching to gif variant and no URL is set, use the default URL
    let gifUrlToUse = currentGifUrl
    if (newVariant === 'gif' && !currentGifUrl) {
      const defaultUrl = 'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExdWt6a3lhcnQyN3pqbm03ZnBoZnhiamN0MzNpdjR6dGJmbHdvc2hkbyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/x5lIgu2DDtI5IzdtUg/giphy.gif';
      gifUrlToUse = defaultUrl
      setGifUrl(defaultUrl)
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_URL, defaultUrl)
      }
    }
    
    setSelectedVariant(newVariant)
    setIsAnimationMenuOpen(false)
    
    // Immediately trigger theme switch with the new variant
    // Create animation CSS with the new variant
    const styleId = `theme-transition-${Date.now()}`
    const style = document.createElement('style')
    style.id = styleId

    let css = ''
    const positions = {
      center: 'center',
      'top-left': 'top left',
      'top-right': 'top right',
      'bottom-left': 'bottom left',
      'bottom-right': 'bottom right',
    }

    if (newVariant === 'circle') {
      const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100'
      const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100'
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-expand 0.4s ease-out;
            transform-origin: ${positions[start]};
          }
          @keyframes circle-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
            }
          }
        }
      `
    } else if (newVariant === 'circle-blur') {
      const cx = start === 'center' ? '50' : start.includes('left') ? '0' : '100'
      const cy = start === 'center' ? '50' : start.includes('top') ? '0' : '100'
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: circle-blur-expand 0.5s ease-out;
            transform-origin: ${positions[start]};
            filter: blur(0);
          }
          @keyframes circle-blur-expand {
            from {
              clip-path: circle(0% at ${cx}% ${cy}%);
              filter: blur(4px);
            }
            to {
              clip-path: circle(150% at ${cx}% ${cy}%);
              filter: blur(0);
            }
          }
        }
      `
    } else if (newVariant === 'gif' && gifUrlToUse) {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: fade-out 0.4s ease-out;
          }
          ::view-transition-new(root) {
            animation: gif-reveal 2.5s cubic-bezier(0.4, 0, 0.2, 1);
            mask-image: url('${gifUrlToUse}');
            mask-size: 0%;
            mask-repeat: no-repeat;
            mask-position: center;
          }
          @keyframes fade-out {
            to {
              opacity: 0;
            }
          }
          @keyframes gif-reveal {
            0% {
              mask-size: 0%;
            }
            20% {
              mask-size: 35%;
            }
            60% {
              mask-size: 35%;
            }
            100% {
              mask-size: 300%;
            }
          }
        }
      `
    } else if (newVariant === 'polygon') {
      css = `
        @supports (view-transition-name: root) {
          ::view-transition-old(root) {
            animation: none;
          }
          ::view-transition-new(root) {
            animation: ${theme === 'light' ? 'wipe-in-dark' : 'wipe-in-light'} 0.4s ease-out;
          }
          @keyframes wipe-in-light {
            from {
              clip-path: polygon(0 0, 0 0, 0 100%, 0% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
          @keyframes wipe-in-dark {
            from {
              clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%);
            }
            to {
              clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%);
            }
          }
        }
      `
    }

    style.textContent = css
    document.head.appendChild(style)

    // Start view transition if supported
    if ('startViewTransition' in document) {
      ;(document as any).startViewTransition(() => {
        onClick?.()
      })
    } else {
      onClick?.()
    }

    // Clean up styles after transition
    setTimeout(() => {
      const styleEl = document.getElementById(styleId)
      if (styleEl) {
        styleEl.remove()
      }
    }, 3000)
  }, [currentGifUrl, start, theme, onClick, propVariant])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (animationMenuTimeoutRef.current) {
        clearTimeout(animationMenuTimeoutRef.current)
      }
    }
  }, [])

  if (showAnimationMenu) {
    return (
      <div 
        ref={animationButtonRef}
        className="relative"
        onMouseEnter={() => {
          if (animationMenuTimeoutRef.current) {
            clearTimeout(animationMenuTimeoutRef.current)
            animationMenuTimeoutRef.current = null
          }
          setIsAnimationMenuOpen(true)
        }}
        onMouseLeave={() => {
          animationMenuTimeoutRef.current = setTimeout(() => {
            setIsAnimationMenuOpen(false)
          }, 200)
        }}
      >
        <div
          className="relative flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleClick()
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {theme === 'light' ? (
            <Sun className="mr-2 h-4 w-4" />
          ) : (
            <Moon className="mr-2 h-4 w-4" />
          )}
          <span className="flex-1">{theme === 'light' ? (translations?.light || 'Light') : (translations?.dark || 'Dark')}</span>
          <ChevronRight className="ml-auto h-4 w-4" />
        </div>
        
        {/* Submenu Portal */}
        {mounted && isAnimationMenuOpen && submenuPosition && createPortal(
          <div
            ref={submenuRef}
            className="fixed z-[9999] min-w-[200px] rounded-md border bg-popover text-popover-foreground shadow-lg p-1 animate-in fade-in-0 zoom-in-95 duration-200"
            style={{
              top: `${submenuPosition.top}px`,
              left: `${submenuPosition.left}px`,
            }}
            onMouseEnter={() => {
              if (animationMenuTimeoutRef.current) {
                clearTimeout(animationMenuTimeoutRef.current)
                animationMenuTimeoutRef.current = null
              }
              setIsAnimationMenuOpen(true)
            }}
            onMouseLeave={() => {
              animationMenuTimeoutRef.current = setTimeout(() => {
                setIsAnimationMenuOpen(false)
              }, 200)
            }}
          >
            {ANIMATION_VARIANTS.map((animVariant) => (
              <button
                key={animVariant.value}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleVariantChange(animVariant.value)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground cursor-pointer transition-colors"
              >
                <div className="flex flex-col gap-0.5 flex-1 text-left">
                  <span className="text-sm font-medium">{animVariant.label}</span>
                  <span className="text-xs text-muted-foreground">{animVariant.description}</span>
                </div>
                {selectedVariant === animVariant.value && (
                  <Check className="h-4 w-4 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>,
          document.body
        )}
      </div>
    )
  }

  return (
    <Button
      variant="ghost"
      size={showLabel ? 'default' : 'icon'}
      onClick={handleClick}
      disabled={disabled}
      asChild={asChild}
      className={cn(
        'relative overflow-hidden transition-all',
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

// Export a helper hook for using with View Transitions API
export const useThemeTransition = () => {
  const startTransition = useCallback((updateFn: () => void) => {
    if ('startViewTransition' in document) {
      ;(document as any).startViewTransition(updateFn)
    } else {
      updateFn()
    }
  }, [])

  return { startTransition }
}

