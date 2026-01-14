"use client"

import { memo } from 'react'
import { Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QuizTimer } from './quiz-timer'
import type { QuizTimerHook } from '@/hooks/quiz/use-quiz-timer'
import type { QuizSettingsHook } from '@/hooks/quiz/use-quiz-settings'

interface QuizHeaderProps {
    title: string
    timer?: QuizTimerHook
    settings?: QuizSettingsHook
    onExit?: () => void
    showSettings?: boolean
}

export const QuizHeader = memo(({
    title,
    timer,
    settings,
    onExit,
    showSettings = true
}: QuizHeaderProps) => {
    return (
        <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between gap-4">
                {/* Title */}
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate">
                    {title}
                </h1>

                {/* Right Side: Timer + Settings + Exit */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Timer */}
                    {timer && timer.timerEnabled && (
                        <QuizTimer
                            timeLeft={timer.timeLeft}
                            isPaused={timer.isPaused}
                            formatTime={timer.formatTime}
                            onTogglePause={timer.togglePause}
                            showPauseButton={false}
                        />
                    )}

                    {/* Settings */}
                    {showSettings && settings && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Settings className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-2">Sozlamalar</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>Test sozlamalari</DropdownMenuLabel>
                                <DropdownMenuSeparator />

                                <DropdownMenuCheckboxItem
                                    checked={settings.settings.showTimer}
                                    onCheckedChange={(checked) => settings.updateSetting('showTimer', checked)}
                                >
                                    Taymer ko'rsatish
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuCheckboxItem
                                    checked={settings.settings.hotkeysEnabled}
                                    onCheckedChange={(checked) => settings.updateSetting('hotkeysEnabled', checked)}
                                >
                                    Klaviatura tugmalari (1-4)
                                </DropdownMenuCheckboxItem>

                                <DropdownMenuCheckboxItem
                                    checked={settings.settings.autoAdvance}
                                    onCheckedChange={(checked) => settings.updateSetting('autoAdvance', checked)}
                                >
                                    Avtomatik keyingi savol
                                </DropdownMenuCheckboxItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Exit Button */}
                    {onExit && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onExit}
                            className="hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                            <X className="h-4 w-4" />
                            <span className="hidden sm:inline ml-2">Chiqish</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    return (
        prevProps.title === nextProps.title &&
        prevProps.timer?.timeLeft === nextProps.timer?.timeLeft &&
        prevProps.timer?.isPaused === nextProps.timer?.isPaused
    )
})

QuizHeader.displayName = 'QuizHeader'
