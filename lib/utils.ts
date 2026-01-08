import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats phone number to +998 XX XXX XX XX format
 * Always ensures +998 prefix is present
 * @param value - Input value from phone field
 * @returns Formatted phone number string
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters except + at the start
  const cleaned = value.replace(/[^\d+]/g, '')
  
  // If empty or just +, return +998
  if (!cleaned || cleaned === '+') {
    return '+998 '
  }
  
  // Remove + if present and extract digits
  let digits = cleaned.replace(/^\+/, '')
  
  // Remove 998 prefix if user typed it
  if (digits.startsWith('998')) {
    digits = digits.substring(3)
  }
  
  // Limit to 9 digits (operator code + 7 digits)
  digits = digits.substring(0, 9)
  
  // If no digits, return +998 with space
  if (!digits) {
    return '+998 '
  }
  
  // Format: +998 XX XXX XX XX
  // Split into: operator (2), first group (3), second group (2), third group (2)
  let formatted = '+998 '
  
  if (digits.length > 0) {
    formatted += digits.substring(0, 2)
  }
  
  if (digits.length > 2) {
    formatted += ' ' + digits.substring(2, 5)
  }
  
  if (digits.length > 5) {
    formatted += ' ' + digits.substring(5, 7)
  }
  
  if (digits.length > 7) {
    formatted += ' ' + digits.substring(7, 9)
  }
  
  return formatted
}

/**
 * Gets cursor position after formatting
 * @param inputValue - Current input value (raw input, may contain formatting)
 * @param formattedValue - New formatted value
 * @param cursorPos - Current cursor position in input
 * @returns New cursor position in formatted value
 */
export function getPhoneCursorPosition(
  inputValue: string,
  formattedValue: string,
  cursorPos: number
): number {
  // If cursor is at the beginning or before +998, position after +998
  if (cursorPos <= 5) {
    return 5
  }
  
  // Extract all characters before cursor in input value
  const beforeCursor = inputValue.substring(0, cursorPos)
  
  // Count how many digits (excluding +998 prefix) are before cursor
  // Remove +998 prefix and count digits
  const cleanedBefore = beforeCursor.replace(/^\+998\s*/, '').replace(/[^\d]/g, '')
  const digitsBeforeCursor = cleanedBefore.length
  
  // If no digits after +998 prefix, position at start of input area (after +998 )
  if (digitsBeforeCursor === 0) {
    return 5 // Position after "+998 "
  }
  
  // Find position in formatted value where we have the same number of digits after +998
  // Skip the +998 prefix (first 5 characters)
  let digitCount = 0
  for (let i = 5; i < formattedValue.length; i++) {
    if (/\d/.test(formattedValue[i])) {
      digitCount++
      if (digitCount === digitsBeforeCursor) {
        // Position cursor after this digit
        return i + 1
      }
    }
  }
  
  // If we couldn't find exact position, place at end
  return formattedValue.length
}
