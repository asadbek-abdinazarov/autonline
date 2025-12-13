"use client"

import { useEffect, useRef, useState } from "react"
import SockJS from "sockjs-client"
import { Client } from "@stomp/stompjs"
import { getCurrentUser, logout } from "@/lib/auth"
import { getApiBaseUrl } from "@/lib/api-utils"

export function UserBlockListener() {
  const stompClientRef = useRef<Client | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [userKey, setUserKey] = useState<string>("")
  const userKeyRef = useRef<string>("")
  const isConnectingRef = useRef<boolean>(false)
  const shouldReconnectRef = useRef<boolean>(true)

  // User va accessToken o'zgarishlarini kuzatish
  useEffect(() => {
    if (typeof window === "undefined") return

    const checkUser = () => {
      const user = getCurrentUser()
      const accessToken = localStorage.getItem("accessToken")
      const newKey = user && accessToken ? `${user.id}-${accessToken.substring(0, 10)}` : ""
      
      if (newKey !== userKeyRef.current) {
        userKeyRef.current = newKey
        setUserKey(newKey)
      }
    }

    // Dastlabki tekshirish
    checkUser()

    // Har 500ms da tekshirish (login qilgandan keyin tezroq ulanish uchun)
    const interval = setInterval(checkUser, 500)

    // localStorage o'zgarishlarini kuzatish (boshqa tab/window dan)
    const handleStorageChange = () => {
      checkUser()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      clearInterval(interval)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, []) // Faqat bir marta mount bo'lganda

  // WebSocket ulanish funksiyasi
  const connectWebSocket = () => {
    // Faqat client-side da ishlaydi
    if (typeof window === "undefined") return

    // Agar allaqachon ulanayotgan bo'lsa, qayta ulanmaslik
    if (isConnectingRef.current) {
      return
    }

    // Agar userKey bo'sh bo'lsa, WebSocket ulanishini tozalash
    if (!userKey) {
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate()
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error disconnecting WebSocket:", error)
          }
        }
        stompClientRef.current = null
      }
      isConnectingRef.current = false
      return
    }

    const user = getCurrentUser()
    if (!user || !user.id) {
      isConnectingRef.current = false
      return
    }

    const userId = user.id
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      isConnectingRef.current = false
      return
    }

    // Agar allaqachon ulangan va faol bo'lsa, qayta ulanmaslik
    if (stompClientRef.current && stompClientRef.current.connected) {
      isConnectingRef.current = false
      return
    }

    // Eski ulanishni tozalash
    if (stompClientRef.current) {
      try {
        stompClientRef.current.deactivate()
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error disconnecting old WebSocket:", error)
        }
      }
      stompClientRef.current = null
    }

    isConnectingRef.current = true

    // Logout handler funksiyasi
    const handleLogout = async () => {
      try {
        shouldReconnectRef.current = false
        
        // Logout funksiyasini chaqiramiz (bu backend ga ham request yuboradi)
        // User block bo'lgan holat, shuning uchun isManualLogout = false (notification ko'rsatiladi)
        await logout(true, false)
        
        // LocalStorage ni tozalaymiz
        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
          localStorage.removeItem("accessToken")
        }

        // Login page ga redirect qilamiz
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error("Error during logout:", error)
        }
        // Xatolik bo'lsa ham localStorage ni tozalaymiz va redirect qilamiz
        if (typeof window !== "undefined") {
          localStorage.removeItem("user")
          localStorage.removeItem("accessToken")
          window.location.href = "/login"
        }
      }
    }

    // WebSocket URL ni yaratamiz
    // HTTPS sahifadan secure WebSocket (wss://) ishlatish kerak
    const apiBaseUrl = getApiBaseUrl()
    // Sahifa protocol'ini ham tekshiramiz (HTTPS sahifadan HTTP WebSocket ishlatib bo'lmaydi)
    const isPageSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    const isApiSecure = apiBaseUrl.startsWith('https://')
    // Agar sahifa yoki API secure bo'lsa, secure WebSocket ishlatamiz
    const isSecure = isPageSecure || isApiSecure
    const wsBaseUrl = apiBaseUrl.replace(/^https?:\/\//, "").replace(/\/+$/, "")
    const wsProtocol = isSecure ? 'https' : 'http' // SockJS https:// ishlatadi, u o'zi wss:// ga o'tkazadi
    const wsUrl = `${wsProtocol}://${wsBaseUrl}/ws`

    // Qayta ulanish funksiyasi
    const attemptReconnect = () => {
      if (!shouldReconnectRef.current) {
        return
      }

      // User hali ham login qilganligini tekshiramiz
      const currentUser = getCurrentUser()
      const currentToken = localStorage.getItem("accessToken")
      
      if (!currentUser || !currentToken) {
        isConnectingRef.current = false
        return
      }
      
      // 3 soniyadan keyin qayta ulanish
      reconnectTimeoutRef.current = setTimeout(() => {
        if (shouldReconnectRef.current && !stompClientRef.current?.connected) {
          isConnectingRef.current = false
          connectWebSocket()
        }
      }, 3000)
    }

    // SockJS va STOMP client yaratamiz
    const socket = new SockJS(wsUrl)
    const stompClient = new Client({
      webSocketFactory: () => socket as any,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      onConnect: () => {
        isConnectingRef.current = false

        // Userga tegishli kanalni subscribe qilamiz
        stompClient.subscribe(`/topic/user-block/${userId}`, (message) => {
          try {
            const data = JSON.parse(message.body)
            if (process.env.NODE_ENV === 'development') {
              console.warn("⚠️ User blocked:", data)
            }

            // Logout chaqiramiz
            handleLogout()
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.error("Error parsing block message:", error)
            }
          }
        })
      },
      onStompError: (frame) => {
        if (process.env.NODE_ENV === 'development') {
          console.error("STOMP error:", frame)
        }
        isConnectingRef.current = false
        attemptReconnect()
      },
      onWebSocketClose: () => {
        isConnectingRef.current = false
        
        // Qayta ulanishni boshlash
        attemptReconnect()
      },
      onDisconnect: () => {
        isConnectingRef.current = false
        
        // Qayta ulanishni boshlash
        attemptReconnect()
      },
    })

    stompClient.activate()
    stompClientRef.current = stompClient
  }

  useEffect(() => {
    // Faqat client-side da ishlaydi
    if (typeof window === "undefined") return

    shouldReconnectRef.current = true
    connectWebSocket()

    // Page visibility API - page qayta ko'rinishga kelganda tekshirish
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Page qayta ko'rinishga kelganda, agar WebSocket uzilgan bo'lsa qayta ulanamiz
        const user = getCurrentUser()
        const accessToken = localStorage.getItem("accessToken")
        
        if (user && accessToken) {
          const isConnected = stompClientRef.current?.connected
          if (!isConnected && shouldReconnectRef.current) {
            isConnectingRef.current = false
            connectWebSocket()
          }
        }
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Cleanup function
    return () => {
      shouldReconnectRef.current = false
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
        reconnectTimeoutRef.current = null
      }
      if (stompClientRef.current) {
        try {
          stompClientRef.current.deactivate()
        } catch (error) {
          if (process.env.NODE_ENV === 'development') {
            console.error("Error disconnecting WebSocket:", error)
          }
        }
        stompClientRef.current = null
      }
      isConnectingRef.current = false
    }
  }, [userKey]) // userKey o'zgarganda qayta ulanish

  return null // UI ko'rsatilmaydi
}

