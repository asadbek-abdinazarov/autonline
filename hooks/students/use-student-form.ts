"use client"

import { useState } from 'react'
import { useTranslation } from '@/hooks/use-translation'

export interface StudentFormData {
    fullName: string
    username: string
    password: string
    confirmPassword: string
    phoneNumber: string
    nextPaymentDate: string
}

const INITIAL_FORM_STATE: StudentFormData = {
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "+998 ",
    nextPaymentDate: "",
}

export function useStudentForm() {
    const { t } = useTranslation()
    const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_STATE)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [phoneError, setPhoneError] = useState("")
    const [passwordError, setPasswordError] = useState("")

    // Validate and normalize phone number
    const validateAndNormalizePhone = (phoneNumber: string): { isValid: boolean; normalized: string; error: string } => {
        const cleaned = phoneNumber.replace(/[^\d+]/g, '')
        let digits = cleaned.replace(/^\+/, '')

        if (digits.startsWith('998')) {
            digits = digits.substring(3)
        }

        if (digits.length !== 9) {
            return {
                isValid: false,
                normalized: '',
                error: t.students.phoneError || "Telefon raqami 9 raqamdan iborat bo'lishi kerak"
            }
        }

        const validPrefixes = ['90', '91', '93', '94', '95', '97', '98', '99', '88', '33', '50', '55', '77']
        const prefix = digits.substring(0, 2)

        if (!validPrefixes.includes(prefix)) {
            return {
                isValid: false,
                normalized: '',
                error: t.students.phoneErrorOperator || "Telefon raqami noto'g'ri operator kodi"
            }
        }

        const normalized = `+998${digits}`

        return {
            isValid: true,
            normalized,
            error: ''
        }
    }

    const validateForm = (): boolean => {
        setPhoneError("")
        setPasswordError("")

        // Validate phone number
        const phoneValidation = validateAndNormalizePhone(formData.phoneNumber)
        if (!phoneValidation.isValid) {
            setPhoneError(phoneValidation.error)
            return false
        }

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setPasswordError(t.students.passwordMismatch || t.register.passwordMismatch)
            return false
        }

        return true
    }

    const resetForm = () => {
        setFormData(INITIAL_FORM_STATE)
        setPhoneError("")
        setPasswordError("")
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    const updateFormData = (updates: Partial<StudentFormData>) => {
        setFormData(prev => ({ ...prev, ...updates }))
    }

    return {
        formData,
        setFormData,
        updateFormData,
        showPassword,
        setShowPassword,
        showConfirmPassword,
        setShowConfirmPassword,
        phoneError,
        setPhoneError,
        passwordError,
        setPasswordError,
        validateAndNormalizePhone,
        validateForm,
        resetForm
    }
}
