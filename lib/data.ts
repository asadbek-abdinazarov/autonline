import { randomInt } from 'crypto'
import type { Language } from './locales'

// Request deduplication map to prevent multiple simultaneous requests for the same resource
const pendingRequests = new Map<string, Promise<any>>()

export interface NewsItem {
  id: string
  title: string
  description: string
  date: string
  image: string
}

export interface Topic {
  id: string
  title: string
  description: string
  questionCount: number
  icon: string
  lessonViewsCount?: number
  // Localized fields from API
  nameUz?: string
  nameOz?: string
  nameRu?: string
  descriptionUz?: string
  descriptionOz?: string
  descriptionRu?: string
}

// API Response interfaces
export interface LessonApiResponse {
  descriptionUz: string
  descriptionOz: string
  descriptionRu: string
  lessonIcon: string
  lessonId: number
  nameUz: string
  nameOz: string
  nameRu: string
  lessonQuestionCount: number
  lessonViewsCount?: number
}

// New API Response format (localized)
export interface LessonApiResponseNew {
  id: number
  lessonQuestionCount: number
  description: string
  icon: string
  viewCount: number
  name: string
}

export interface QuestionApiResponse {
  lessonId: number
  nameUz: string
  nameOz: string
  nameRu: string
  descriptionUz: string | null
  descriptionOz: string | null
  descriptionRu: string | null
  lessonIcon: string | null
  lessonQuestionCount: number | null
  questions: QuestionData[]
}

export interface QuestionData {
  questionId: number
  photo: string | null
  questionText: {
    oz: string
    uz: string
    ru: string
  }
  answers: {
    answerId: number
    questionId: number
    status?: number // Deprecated, use isCorrect instead
    isCorrect?: boolean[] // Array of boolean values for each answer option
    answerText: {
      oz: string[]
      uz: string[]
      ru: string[]
    }
  }
}

// New API Response format (localized)
export interface QuestionApiResponseNew {
  id: number
  icon: string
  viewsCount: number
  name: string
  description: string
  questions: QuestionDataNew[]
}

export interface QuestionDataNew {
  questionId: number
  photo: string | null
  questionText: string
  variants: VariantNew[]
}

export interface VariantNew {
  variantId: number
  isCorrect: boolean
  text: string
}

export const newsData: NewsItem[] = [
  {
    id: "1",
    title: "Yangi yo'l harakati qoidalari 2024",
    description: "2024 yilda yangi yo'l harakati qoidalari kiritildi. Barcha haydovchilar uchun muhim o'zgarishlar.",
    date: "2024-01-15",
    image: "/traffic-rules.png",
  },
  {
    id: "2",
    title: "Elektromobillar uchun maxsus yo'llar",
    description: "Toshkent shahrida elektromobillar uchun maxsus yo'llar ochildi.",
    date: "2024-01-10",
    image: "/electric-car-road.jpg",
  },
  {
    id: "3",
    title: "Haydovchilik imtihonlari yangilandi",
    description: "Haydovchilik guvohnomasini olish uchun yangi imtihon tizimi joriy etildi.",
    date: "2024-01-05",
    image: "/driving-test.jpg",
  },
]

export const topicsData: Topic[] = [
  {
    id: "1",
    title: "Yo'l belgilari",
    description: "Barcha yo'l belgilari va ularning ma'nolari",
    questionCount: 50,
    icon: "🚦",
  },
  {
    id: "2",
    title: "Yo'l harakati qoidalari",
    description: "Asosiy yo'l harakati qoidalari va tartib-intizom",
    questionCount: 75,
    icon: "📋",
  },
  {
    id: "3",
    title: "Birinchi tibbiy yordam",
    description: "Yo'l-transport hodisalarida birinchi yordam ko'rsatish",
    questionCount: 30,
    icon: "🏥",
  },
  {
    id: "4",
    title: "Avtomobil texnikasi",
    description: "Avtomobil qurilmasi va texnik xizmat ko'rsatish",
    questionCount: 40,
    icon: "🔧",
  },
  {
    id: "5",
    title: "Xavfsizlik choralari",
    description: "Yo'lda xavfsizlik va ehtiyot choralari",
    questionCount: 35,
    icon: "🛡️",
  },
  {
    id: "6",
    title: "Amaliy haydash",
    description: "Amaliy haydash ko'nikmalari va texnikasi",
    questionCount: 45,
    icon: "🚗",
  },
]

export interface Question {
  id: string
  topicId: string
  question: string
  options: string[]
  correctAnswer: number
  image?: string
}

export const questionsData: Question[] = [
  // Yo'l belgilari
  {
    id: "q1",
    topicId: "1",
    question: "Qizil rang svetofor nima bildiradi?",
    options: ["Harakatni davom ettirish mumkin", "To'xtash kerak", "Ehtiyot bo'lish kerak", "Tezlikni oshirish"],
    correctAnswer: 1,
  },
  {
    id: "q2",
    topicId: "1",
    question: "Sariq rang svetofor nima bildiradi?",
    options: ["Tezroq harakatlanish", "Ehtiyot bo'lish, signal o'zgaradi", "To'xtash", "Yo'l yopiq"],
    correctAnswer: 1,
  },
  {
    id: "q3",
    topicId: "1",
    question: "Yashil rang svetofor nima bildiradi?",
    options: ["To'xtash", "Harakatni davom ettirish mumkin", "Ehtiyot bo'lish", "Orqaga qaytish"],
    correctAnswer: 1,
  },
  {
    id: "q4",
    topicId: "1",
    question: "'STOP' belgisi nima bildiradi?",
    options: ["Sekinlashtirish", "To'liq to'xtash kerak", "Ehtiyot bo'lish", "Yo'l yopiq"],
    correctAnswer: 1,
  },
  {
    id: "q5",
    topicId: "1",
    question: "Uchburchak shaklidagi yo'l belgisi odatda nima bildiradi?",
    options: ["Buyruq", "Ogohlantirish", "Ma'lumot", "Taqiq"],
    correctAnswer: 1,
  },
  // Yo'l harakati qoidalari
  {
    id: "q6",
    topicId: "2",
    question: "Shahar ichida maksimal tezlik qancha?",
    options: ["40 km/soat", "60 km/soat", "80 km/soat", "100 km/soat"],
    correctAnswer: 1,
  },
  {
    id: "q7",
    topicId: "2",
    question: "Xavfsizlik kamari taqish majburiyatimi?",
    options: ["Yo'q", "Ha, faqat haydovchi uchun", "Ha, barcha yo'lovchilar uchun", "Faqat tashqi yo'llarda"],
    correctAnswer: 2,
  },
  {
    id: "q8",
    topicId: "2",
    question: "Piyodalar o'tish joyida kim ustunlikka ega?",
    options: ["Avtomobil", "Piyoda", "Kim birinchi kelsa", "Tezroq harakatlanayotgan"],
    correctAnswer: 1,
  },
  {
    id: "q9",
    topicId: "2",
    question: "Mobil telefon bilan gaplashish mumkinmi?",
    options: ["Ha", "Yo'q", "Faqat handsfree bilan", "Faqat to'xtab turganda"],
    correctAnswer: 2,
  },
  {
    id: "q10",
    topicId: "2",
    question: "Qizil svetoforda o'ng tomonga burilish mumkinmi?",
    options: ["Ha, har doim", "Yo'q, hech qachon", "Faqat maxsus belgi bo'lsa", "Faqat piyodalar bo'lmasa"],
    correctAnswer: 2,
  },
  // Birinchi tibbiy yordam
  {
    id: "q11",
    topicId: "3",
    question: "Qon ketishini to'xtatish uchun birinchi navbatda nima qilish kerak?",
    options: ["Suv quyish", "Bosim o'rnatish", "Dori berish", "Kutish"],
    correctAnswer: 1,
  },
  {
    id: "q12",
    topicId: "3",
    question: "Tez yordam raqami qancha?",
    options: ["101", "102", "103", "104"],
    correctAnswer: 2,
  },
  {
    id: "q13",
    topicId: "3",
    question: "Kuygan joyga birinchi yordam qanday ko'rsatiladi?",
    options: ["Sovuq suv quyish", "Moy surtish", "Bint o'rash", "Hech narsa qilmaslik"],
    correctAnswer: 0,
  },
  {
    id: "q14",
    topicId: "3",
    question: "Bosh jarohati bo'lsa nima qilish kerak?",
    options: ["Boshni silkitish", "Sovuq kompres qo'yish", "Darhol harakatlanish", "Issiq kompres"],
    correctAnswer: 1,
  },
  {
    id: "q15",
    topicId: "3",
    question: "Yurak massaji qanday bajariladi?",
    options: ["Ko'krak qafasini bosish", "Orqani urish", "Qo'llarni ko'tarish", "Suv berish"],
    correctAnswer: 0,
  },
]

// Helper functions to get localized name and description
export function getLocalizedName(topic: Topic, language: Language): string {
  switch (language) {
    case 'uz':
      return topic.nameUz || topic.title
    case 'cyr':
      return topic.nameOz || topic.nameUz || topic.title
    case 'ru':
      return topic.nameRu || topic.nameUz || topic.title
    default:
      return topic.title
  }
}

export function getLocalizedDescription(topic: Topic, language: Language): string {
  switch (language) {
    case 'uz':
      return topic.descriptionUz || topic.description
    case 'cyr':
      return topic.descriptionOz || topic.descriptionUz || topic.description
    case 'ru':
      return topic.descriptionRu || topic.descriptionUz || topic.description
    default:
      return topic.description
  }
}

// Helper functions for API response objects
export function getLocalizedLessonName(
  lesson: { nameUz?: string; nameOz?: string; nameRu?: string; name?: string }, 
  language: Language
): string {
  // New format - name is already localized
  if ('name' in lesson && lesson.name) {
    return lesson.name
  }
  
  // Old format - use localized fields
  switch (language) {
    case 'uz':
      return lesson.nameUz || ''
    case 'cyr':
      return lesson.nameOz || lesson.nameUz || ''
    case 'ru':
      return lesson.nameRu || lesson.nameUz || ''
    default:
      return lesson.nameUz || ''
  }
}

export function getLocalizedLessonDescription(
  lesson: { descriptionUz?: string | null; descriptionOz?: string | null; descriptionRu?: string | null; description?: string },
  language: Language
): string {
  // New format - description is already localized
  if ('description' in lesson && lesson.description) {
    return lesson.description
  }
  
  // Old format - use localized fields
  switch (language) {
    case 'uz':
      return lesson.descriptionUz || ''
    case 'cyr':
      return lesson.descriptionOz || lesson.descriptionUz || ''
    case 'ru':
      return lesson.descriptionRu || lesson.descriptionUz || ''
    default:
      return lesson.descriptionUz || ''
  }
}

export interface PaymentHistory {
  id: string
  month: string
  amount: number
  date: string
  status: "paid" | "pending" | "expired"
}

export interface UserProfile {
  name: string
  email: string
  status: "active" | "inactive" | "premium"
  paymentHistory: PaymentHistory[]
}

export const userProfileData: UserProfile = {
  name: "Foydalanuvchi",
  email: "user@example.com",
  status: "premium",
  paymentHistory: [
    {
      id: "1",
      month: "Yanvar 2024",
      amount: 50000,
      date: "2024-01-01",
      status: "paid",
    },
    {
      id: "2",
      month: "Fevral 2024",
      amount: 50000,
      date: "2024-02-01",
      status: "paid",
    },
    {
      id: "3",
      month: "Mart 2024",
      amount: 50000,
      date: "2024-03-01",
      status: "paid",
    },
    {
      id: "4",
      month: "Aprel 2024",
      amount: 50000,
      date: "2024-04-01",
      status: "pending",
    },
  ],
}

// API Functions
export async function fetchTopicsFromApi(): Promise<Topic[]> {
  const requestKey = 'topics'
  
  // Check if there's already a pending request for topics
  if (pendingRequests.has(requestKey)) {
    console.log('Deduplicating topics request - reusing pending request')
    return pendingRequests.get(requestKey)!
  }
  
  const requestPromise = (async () => {
    try {
    // Get access token - only on client side
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken')
    }
    
    // Call backend API through centralized base URL
    const { buildApiUrl, safeJsonParse, getDefaultHeaders } = await import('./api-utils')
    
    const headers: Record<string, string> = {
      ...getDefaultHeaders(),
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(buildApiUrl('/api/v1/lesson'), {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      // Handle server errors (500-599)
      if (response.status >= 500 && response.status < 600) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: response.status })
        return topicsData // Return fallback data
      }
      
      // Handle 401 errors globally
      if (response.status === 401) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 401 })
        return topicsData // Return fallback data
      }
      
      // Handle 429 errors globally
      if (response.status === 429) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 429 })
        return topicsData // Return fallback data
      }
      
      console.error(`API request failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Parse response - try new format first, then fallback to old format
    const responseText = await response.clone().text()
    let parsedData: any = null
    
    try {
      parsedData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      return topicsData
    }
    
    if (!parsedData || !Array.isArray(parsedData) || parsedData.length === 0) {
      console.warn('Invalid response format, returning fallback data')
      return topicsData
    }
    
    // Check if it's new format (has 'id' and 'name' fields)
    const isNewFormat = parsedData[0]?.id !== undefined && parsedData[0]?.name !== undefined
    
    if (isNewFormat) {
      // New format - already localized
      const apiDataNew = parsedData as LessonApiResponseNew[]
      // Filter out lesson with ID 43 (random quiz special ID)
      const filteredData = apiDataNew.filter((lesson) => lesson.id !== 43)
      
      // Map API data to Topic interface
      return filteredData.map((lesson): Topic => ({
        id: lesson.id.toString(),
        title: lesson.name,
        description: lesson.description,
        questionCount: lesson.lessonQuestionCount,
        icon: lesson.icon,
        lessonViewsCount: lesson.viewCount,
      }))
    } else {
      // Old format - backward compatibility
      const apiData = parsedData as LessonApiResponse[]
      // Filter out lesson with ID 43 (random quiz special ID)
      const filteredData = apiData.filter((lesson) => lesson.lessonId !== 43)
      
      // Map API data to Topic interface
      return filteredData.map((lesson): Topic => ({
        id: lesson.lessonId.toString(),
        title: lesson.nameUz, // Default to Uz for backward compatibility
        description: lesson.descriptionUz, // Default to Uz for backward compatibility
        questionCount: lesson.lessonQuestionCount,
        icon: lesson.lessonIcon,
        lessonViewsCount: lesson.lessonViewsCount,
        // Store localized fields
        nameUz: lesson.nameUz,
        nameOz: lesson.nameOz,
        nameRu: lesson.nameRu,
        descriptionUz: lesson.descriptionUz,
        descriptionOz: lesson.descriptionOz,
        descriptionRu: lesson.descriptionRu,
      }))
    }
    } catch (error) {
      console.error('Error fetching topics from API:', error)
      // Check if it's a network error
      const { handleApiError } = await import('./api-utils')
      const isHandled = await handleApiError(error)
      // Fallback to static data if API fails
      return topicsData
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey)
    }
  })()
  
  // Store the promise for deduplication
  pendingRequests.set(requestKey, requestPromise)
  
  return requestPromise
}

// Cache key for lesson data
const getLessonCacheKey = (lessonId: string) => `lesson_data_${lessonId}`

// Cache expiration time (10 minutes)
const CACHE_EXPIRATION_MS = 10 * 60 * 1000

interface CachedLessonData {
  data: QuestionApiResponse
  timestamp: number
}

// Get cached lesson data
function getCachedLessonData(lessonId: string): QuestionApiResponse | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const cacheKey = getLessonCacheKey(lessonId)
    const cached = sessionStorage.getItem(cacheKey)
    
    if (!cached) {
      return null
    }

    const cachedData: CachedLessonData = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is expired
    if (now - cachedData.timestamp > CACHE_EXPIRATION_MS) {
      sessionStorage.removeItem(cacheKey)
      return null
    }

    return cachedData.data
  } catch (error) {
    console.error('Error reading cached lesson data:', error)
    return null
  }
}

// Save lesson data to cache
function setCachedLessonData(lessonId: string, data: QuestionApiResponse): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const cacheKey = getLessonCacheKey(lessonId)
    const cachedData: CachedLessonData = {
      data,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(cacheKey, JSON.stringify(cachedData))
  } catch (error) {
    console.error('Error saving lesson data to cache:', error)
    // If storage is full, try to clear old cache entries
    try {
      clearExpiredLessonCache()
      sessionStorage.setItem(getLessonCacheKey(lessonId), JSON.stringify({
        data,
        timestamp: Date.now(),
      }))
    } catch (retryError) {
      console.error('Failed to save lesson data to cache after cleanup:', retryError)
    }
  }
}

// Clear expired cache entries
function clearExpiredLessonCache(): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    const now = Date.now()
    const keysToRemove: string[] = []

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && key.startsWith('lesson_data_')) {
        try {
          const cached = sessionStorage.getItem(key)
          if (cached) {
            const cachedData: CachedLessonData = JSON.parse(cached)
            if (now - cachedData.timestamp > CACHE_EXPIRATION_MS) {
              keysToRemove.push(key)
            }
          }
        } catch {
          keysToRemove.push(key)
        }
      }
    }

    keysToRemove.forEach(key => sessionStorage.removeItem(key))
  } catch (error) {
    console.error('Error clearing expired cache:', error)
  }
}

// Clear specific lesson cache
export function clearLessonCache(lessonId: string): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    sessionStorage.removeItem(getLessonCacheKey(lessonId))
  } catch (error) {
    console.error('Error clearing lesson cache:', error)
  }
}

export async function fetchQuestionsByLessonId(
  lessonId: string,
  options?: { useCache?: boolean; forceRefresh?: boolean }
): Promise<QuestionApiResponse> {
  const useCache = options?.useCache !== false // Default to true
  const forceRefresh = options?.forceRefresh === true
  const requestKey = `lesson-${lessonId}`

  // Try to get from cache first (if not forcing refresh)
  if (useCache && !forceRefresh) {
    const cachedData = getCachedLessonData(lessonId)
    if (cachedData) {
      console.log(`Using cached data for lesson ${lessonId}`)
      return cachedData
    }
  }

  // Check if there's already a pending request for this lesson
  if (pendingRequests.has(requestKey)) {
    console.log(`Deduplicating lesson ${lessonId} request - reusing pending request`)
    return pendingRequests.get(requestKey)!
  }

  const requestPromise = (async () => {
    try {
    // Get access token - only on client side
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken')
    }
    
    // Call backend API through centralized base URL
    const { buildApiUrl, safeJsonParse, getDefaultHeaders } = await import('./api-utils')
    
    const headers: Record<string, string> = {
      ...getDefaultHeaders(),
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(buildApiUrl(`/api/v1/lesson/${lessonId}`), {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      // Handle server errors (500-599)
      if (response.status >= 500 && response.status < 600) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: response.status })
        throw new Error('Server error')
      }
      
      // Handle 401 errors globally
      if (response.status === 401) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 401 })
        throw new Error('Authentication required')
      }
      
      // Handle 429 errors globally
      if (response.status === 429) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 429 })
        throw new Error('Too many requests')
      }
      
      console.error(`API request failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    // Parse response - try new format first, then fallback to old format
    const responseText = await response.clone().text()
    let parsedData: any = null
    
    try {
      parsedData = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError)
      throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
    }
    
    if (!parsedData) {
      throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
    }
    
    // Check if it's new format (has 'id' and 'name' fields at top level, and 'variants' in questions)
    const isNewFormat = parsedData.id !== undefined && parsedData.name !== undefined && 
                        parsedData.questions?.[0]?.variants !== undefined
    
    let apiData: QuestionApiResponse
    
    if (isNewFormat) {
      // New format - convert to old format for compatibility
      const newData = parsedData as QuestionApiResponseNew
      
      apiData = {
        lessonId: newData.id,
        nameUz: newData.name,
        nameOz: newData.name,
        nameRu: newData.name,
        descriptionUz: newData.description,
        descriptionOz: newData.description,
        descriptionRu: newData.description,
        lessonIcon: newData.icon,
        lessonQuestionCount: newData.questions.length,
        questions: newData.questions.map((q): QuestionData => ({
          questionId: q.questionId,
          photo: q.photo,
          questionText: {
            uz: q.questionText,
            oz: q.questionText,
            ru: q.questionText,
          },
          answers: {
            answerId: q.variants.find(v => v.isCorrect)?.variantId || 0,
            questionId: q.questionId,
            status: q.variants.findIndex(v => v.isCorrect) + 1, // Find index of correct answer (1-based)
            isCorrect: q.variants.map(v => v.isCorrect), // Create isCorrect array from variants
            answerText: {
              uz: q.variants.map(v => v.text),
              oz: q.variants.map(v => v.text),
              ru: q.variants.map(v => v.text),
            },
          },
        })),
      }
    } else {
      // Old format
      apiData = parsedData as QuestionApiResponse
      
      if (!apiData.lessonId || !apiData.questions) {
        throw new Error('Ma\'lumotlar yuklanmadi yoki noto\'g\'ri format')
      }
      
      // Ensure isCorrect array is created for old format if not present
      apiData.questions = apiData.questions.map(q => {
        if (!q.answers.isCorrect && q.answers.status) {
          // Create isCorrect array from status field
          const answerCount = q.answers.answerText.uz?.length || q.answers.answerText.oz?.length || q.answers.answerText.ru?.length || 0
          const correctIndex = q.answers.status - 1 // Convert 1-based to 0-based
          q.answers.isCorrect = Array(answerCount).fill(false).map((_, index) => index === correctIndex)
        }
        return q
      })
    }
    
    // Save to cache
    if (useCache) {
      setCachedLessonData(lessonId, apiData)
    }
    
    return apiData
    } catch (error) {
      console.error('Error fetching questions from API:', error)
      // Check if it's a network error
      const { handleApiError } = await import('./api-utils')
      await handleApiError(error)
      throw error
    } finally {
      // Remove from pending requests when done
      pendingRequests.delete(requestKey)
    }
  })()
  
  // Store the promise for deduplication
  pendingRequests.set(requestKey, requestPromise)
  
  return requestPromise
}

export interface LessonHistoryRequest {
  lessonId: number
  percentage: number
  allQuestionsCount: number
  correctAnswersCount: number
  notCorrectAnswersCount: number
}

export async function submitLessonHistory(data: LessonHistoryRequest): Promise<void> {
  try {
    // Validate data before sending
    if (!data || data.lessonId === undefined || data.lessonId === null) {
      console.error('Invalid lesson history data: lessonId is missing', data)
      return
    }
    
    if (data.allQuestionsCount === undefined || data.allQuestionsCount === null || data.allQuestionsCount === 0) {
      console.error('Invalid lesson history data: allQuestionsCount is missing or zero', data)
      return
    }
    
    // Ensure all values are numbers, not null/undefined
    const lessonId = Number(data.lessonId)
    const percentage = Number(data.percentage)
    const allQuestionsCount = Number(data.allQuestionsCount)
    const correctAnswersCount = Number(data.correctAnswersCount)
    const notCorrectAnswersCount = Number(data.notCorrectAnswersCount)
    
    // Validate that all numbers are valid (not NaN)
    if (isNaN(lessonId) || isNaN(percentage) || isNaN(allQuestionsCount) || isNaN(correctAnswersCount) || isNaN(notCorrectAnswersCount)) {
      console.error('Invalid lesson history data: Some values are NaN', {
        originalData: data,
        lessonId,
        percentage,
        allQuestionsCount,
        correctAnswersCount,
        notCorrectAnswersCount,
      })
      return
    }
    
    // Create request body with explicit number types
    const requestBody = {
      lessonId: lessonId,
      percentage: percentage,
      allQuestionsCount: allQuestionsCount,
      correctAnswersCount: correctAnswersCount,
      notCorrectAnswersCount: notCorrectAnswersCount,
    }
    
    // Validate body is not empty
    const bodyString = JSON.stringify(requestBody)
    if (!bodyString || bodyString === '{}' || bodyString === 'null') {
      console.error('Invalid request body: body is empty or null', requestBody)
      return
    }
    
    // Get access token - only on client side
    let token: string | null = null
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('accessToken')
    }
    
    // Call backend API through centralized base URL
    const { buildApiUrl } = await import('./api-utils')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Add Authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    const response = await fetch(buildApiUrl('/api/v1/lesson-history/add'), {
      method: 'POST',
      headers,
      body: bodyString,
    })
    
    if (!response.ok) {
      // Handle 401 errors globally
      if (response.status === 401) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 401 })
        return
      }
      
      // Handle 429 errors globally
      if (response.status === 429) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 429 })
        return
      }
      
      console.error(`API request failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`)
    }
  } catch (error) {
    console.error('Error submitting lesson history:', error)
    // Don't throw - we don't want to block the UI if history submission fails
  }
}
