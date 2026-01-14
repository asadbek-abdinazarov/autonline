"use client"

import { useState, useCallback } from 'react'

export interface QuizSettings {
    showTimer: boolean
    hotkeysEnabled: boolean
    autoAdvance: boolean
    showHints: boolean
}

export interface QuizSettingsHook {
    settings: QuizSettings
    updateSetting: <K extends keyof QuizSettings>(key: K, value: QuizSettings[K]) => void
    toggleSetting: (key: keyof QuizSettings) => void
    resetSettings: () => void
}

const DEFAULT_SETTINGS: QuizSettings = {
    showTimer: true,
    hotkeysEnabled: true,
    autoAdvance: false,
    showHints: false,
}

export function useQuizSettings(initialSettings?: Partial<QuizSettings>): QuizSettingsHook {
    const [settings, setSettings] = useState<QuizSettings>({
        ...DEFAULT_SETTINGS,
        ...initialSettings,
    })

    const updateSetting = useCallback(<K extends keyof QuizSettings>(
        key: K,
        value: QuizSettings[K]
    ) => {
        setSettings(prev => ({
            ...prev,
            [key]: value,
        }))
    }, [])

    const toggleSetting = useCallback((key: keyof QuizSettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key],
        }))
    }, [])

    const resetSettings = useCallback(() => {
        setSettings(DEFAULT_SETTINGS)
    }, [])

    return {
        settings,
        updateSetting,
        toggleSetting,
        resetSettings,
    }
}
