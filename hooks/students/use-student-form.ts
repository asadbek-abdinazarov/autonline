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
    const [usernameError, setUsernameError] = useState("")

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

    const validateUsername = (value: string): string => {
        // Remove spaces
        const trimmed = value.replace(/\s/g, '')
        
        // Check if empty
        if (!trimmed) {
            return "Foydalanuvchi nomi bo'sh bo'lishi mumkin emas"
        }
        
        // Check if contains only lowercase letters and numbers
        if (!/^[a-z0-9]+$/.test(trimmed)) {
            return "Foydalanuvchi nomi faqat kichik harflar va raqamlardan iborat bo'lishi kerak"
        }
        
        return ""
    }

    const validateForm = (): boolean => {
        setPhoneError("")
        setPasswordError("")
        setUsernameError("")

        // Validate username
        const usernameValidationError = validateUsername(formData.username)
        if (usernameValidationError) {
            setUsernameError(usernameValidationError)
            return false
        }

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
        setUsernameError("")
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    const updateFormData = (updates: Partial<StudentFormData>) => {
        setFormData(prev => {
            const newData = { ...prev, ...updates }
            
            // Auto-normalize username: convert to lowercase and remove spaces
            if (updates.username !== undefined) {
                newData.username = updates.username.toLowerCase().replace(/\s/g, '')
                
                // Clear error when user starts typing
                if (usernameError) {
                    setUsernameError("")
                }
                
                // Real-time validation
                if (newData.username) {
                    const error = validateUsername(newData.username)
                    if (error) {
                        setUsernameError(error)
                    }
                }
            }
            
            return newData
        })
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
        usernameError,
        setUsernameError,
        validateAndNormalizePhone,
        validateForm,
        resetForm
    }
}
