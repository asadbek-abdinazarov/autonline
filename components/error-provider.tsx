"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { ServerError } from "./server-error"
import { setGlobalServerErrorHandler } from "@/lib/api-utils"

interface ErrorContextType {
  setServerError: (error: boolean) => void
  clearServerError: () => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [hasServerError, setHasServerError] = useState(false)

  const setServerError = useCallback((error: boolean) => {
    setHasServerError(error)
  }, [])

  const clearServerError = useCallback(() => {
    setHasServerError(false)
  }, [])

  // Register global error handler
  useEffect(() => {
    setGlobalServerErrorHandler(setServerError)
  }, [setServerError])

  if (hasServerError) {
    return <ServerError />
  }

  return (
    <ErrorContext.Provider value={{ setServerError, clearServerError }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider")
  }
  return context
}

