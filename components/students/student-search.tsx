"use client"

import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'
import { Button } from '@/components/ui/button'

interface StudentSearchProps {
    searchQuery: string
    onSearchChange: (query: string) => void
    onClearSearch: () => void
}

export function StudentSearch({ searchQuery, onSearchChange, onClearSearch }: StudentSearchProps) {
    const { t } = useTranslation()

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder={t.students.searchPlaceholder || "Qidirish..."}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-10 pr-10"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearSearch}
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    )
}
