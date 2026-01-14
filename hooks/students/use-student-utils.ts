"use client"

import { useTranslation } from '@/hooks/use-translation'

export function useStudentUtils() {
    const { t } = useTranslation()

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null
        const date = new Date(dateString)
        const day = date.getDate()
        const month = t.history.dateFormat.months[date.getMonth()]
        const year = date.getFullYear()
        const hours = date.getHours().toString().padStart(2, '0')
        const minutes = date.getMinutes().toString().padStart(2, '0')
        return `${day} ${month} ${year}, ${hours}:${minutes}`
    }

    const getSubscriptionName = (subscription: any) => {
        if (!subscription) return t.students.noSubscription || "Obuna yo'q"

        const name = subscription.name || ''

        // Teacher-specific subscription types
        if (name === 'BASIC_TEACHER') return t.students.subscriptionTeacherBasic || "Asosiy O'qituvchi"
        if (name === 'PRO_TEACHER') return t.students.subscriptionTeacherPro || "Professional O'qituvchi"
        if (name === 'FULL_TEACHER') return t.students.subscriptionTeacherFull || "To'liq O'qituvchi"

        // Student-specific subscription types
        if (name === 'STUDENT_BASIC') return t.students.subscriptionStudentBasic || "Asosiy Talaba"
        if (name === 'STUDENT_PRO') return t.students.subscriptionStudentPro || "Professional Talaba"
        if (name === 'STUDENT_FULL') return t.students.subscriptionStudentFull || "To'liq Talaba"

        // General subscription types
        if (name === 'FULL') return t.students.subscriptionFull || "Yillik obuna"
        if (name === 'PRO') return t.students.subscriptionPro || "Oylik obuna"
        if (name === 'BASIC') return t.students.subscriptionBasic || "Oylik obuna"
        if (name === 'FREE') return t.students.subscriptionFree || "Tekin obuna"

        return name
    }

    const getSubscriptionBadgeClasses = (subscription: any) => {
        if (!subscription) {
            return "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100"
        }

        const name = subscription.name || ''

        // Teacher subscriptions
        if (name === 'BASIC_TEACHER') {
            return "bg-emerald-500 text-white border-2 border-emerald-400"
        }
        if (name === 'PRO_TEACHER') {
            return "bg-purple-500 text-white border-2 border-purple-400"
        }
        if (name === 'FULL_TEACHER') {
            return "bg-rose-500 text-white border-2 border-rose-400"
        }

        // Full/yearly subscriptions
        if (name === 'FULL' || name === 'STUDENT_FULL') {
            return "bg-emerald-500 text-white"
        }

        // Pro subscriptions
        if (name === 'PRO' || name === 'STUDENT_PRO') {
            return "bg-blue-500 text-white"
        }

        // Basic subscriptions
        if (name === 'BASIC' || name === 'STUDENT_BASIC') {
            return "bg-amber-400 text-amber-900"
        }

        // Free subscription
        if (name === 'FREE') {
            return "bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-slate-100"
        }

        return "bg-primary text-primary-foreground"
    }

    const formatStatNumber = (value: number | null | undefined) => {
        return typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : '0.0'
    }

    return {
        formatDate,
        getSubscriptionName,
        getSubscriptionBadgeClasses,
        formatStatNumber
    }
}
