"use client"

import { memo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Phone, Calendar, Eye, Trash2, Loader2 } from 'lucide-react'
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

interface StudentRowProps {
    student: Student
    onViewResults: (student: Student) => void
    onDelete: (studentId: number) => void
    isDeleting: boolean
    formatDate: (dateString: string | null) => string | null
    getSubscriptionName: (subscription: Subscription | null) => string
    getSubscriptionBadgeClasses: (subscription: Subscription | null) => string
}

export const StudentRow = memo(({
    student,
    onViewResults,
    onDelete,
    isDeleting,
    formatDate,
    getSubscriptionName,
    getSubscriptionBadgeClasses
}: StudentRowProps) => {
    const { t } = useTranslation()

    return (
        <div className="group p-4 sm:p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:shadow-lg transition-all duration-200">
            <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                            {student.fullName || student.username}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 truncate mt-1">
                            @{student.username}
                        </p>
                    </div>
                    <Badge className={getSubscriptionBadgeClasses(student.subscription)}>
                        {getSubscriptionName(student.subscription)}
                    </Badge>
                </div>

                {/* Contact Info */}
                <div className="flex flex-col gap-2 text-sm">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Phone className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{student.phoneNumber || t.students.noPhone}</span>
                    </div>
                    {student.nextPaymentDate && (
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{formatDate(student.nextPaymentDate)}</span>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewResults(student)}
                        className="flex-1 hover:scale-[1.02] transition-transform duration-200"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        {t.students.viewResults}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(student.userId)}
                        disabled={isDeleting}
                        className="hover:scale-[1.02] transition-transform duration-200"
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}, (prevProps, nextProps) => {
    // Only re-render if student data or deleting state changes
    return (
        prevProps.student.userId === nextProps.student.userId &&
        prevProps.student.fullName === nextProps.student.fullName &&
        prevProps.student.subscription?.name === nextProps.student.subscription?.name &&
        prevProps.isDeleting === nextProps.isDeleting
    )
})

StudentRow.displayName = 'StudentRow'
