"use client"

import { StudentRow } from './student-row'
import { Loader2, Users } from 'lucide-react'
import { useTranslation } from '@/hooks/use-translation'

interface Subscription {
    name: string
    daysLeft?: number
}

interface Student {
    userId: number
    fullName: string | null
    username: string
    phoneNumber: string | null
    nextPaymentDate: string | null
    subscription: Subscription | null
}

interface StudentsListProps {
    students: Student[]
    isLoading: boolean
    error: string | null
    deletingId: number | null
    onViewResults: (student: Student) => void
    onDelete: (studentId: number) => void
    formatDate: (dateString: string | null) => string | null
    getSubscriptionName: (subscription: Subscription | null) => string
    getSubscriptionBadgeClasses: (subscription: Subscription | null) => string
}

export function StudentsList({
    students,
    isLoading,
    error,
    deletingId,
    onViewResults,
    onDelete,
    formatDate,
    getSubscriptionName,
    getSubscriptionBadgeClasses
}: StudentsListProps) {
    const { t } = useTranslation()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">{t.students.loading}</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center text-red-500">
                    <p>{error}</p>
                </div>
            </div>
        )
    }

    if (!students || students.length === 0) {
        return (
            <div className="text-center py-12">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {t.students.empty}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                    {t.students.emptyDescription}
                </p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {students.map((student) => (
                <StudentRow
                    key={student.userId}
                    student={student}
                    onViewResults={onViewResults}
                    onDelete={onDelete}
                    isDeleting={deletingId === student.userId}
                    formatDate={formatDate}
                    getSubscriptionName={getSubscriptionName}
                    getSubscriptionBadgeClasses={getSubscriptionBadgeClasses}
                />
            ))}
        </div>
    )
}
