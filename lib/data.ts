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
}

// API Response interfaces
export interface LessonApiResponse {
  lessonDescription: string
  lessonIcon: string
  lessonId: number
  lessonName: string
  lessonQuestionCount: number
}

export interface QuestionApiResponse {
  lessonId: number
  lessonName: string
  lessonDescription: string | null
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
    status: number
    answerText: {
      oz: string[]
      uz: string[]
      ru: string[]
    }
  }
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
  try {
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
    
    const response = await fetch(buildApiUrl('/api/v1/lesson'), {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      // Handle 401 errors globally
      if (response.status === 401) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 401 })
        return topicsData // Return fallback data
      }
      
      console.error(`API request failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiData: LessonApiResponse[] = await response.json()
    
    // Map API data to Topic interface
    return apiData.map((lesson): Topic => ({
      id: lesson.lessonId.toString(),
      title: lesson.lessonName,
      description: lesson.lessonDescription,
      questionCount: lesson.lessonQuestionCount,
      icon: lesson.lessonIcon,
    }))
  } catch (error) {
    console.error('Error fetching topics from API:', error)
    // Fallback to static data if API fails
    return topicsData
  }
}

export async function fetchQuestionsByLessonId(lessonId: string): Promise<QuestionApiResponse> {
  try {
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
    
    const response = await fetch(buildApiUrl(`/api/v1/lesson/${lessonId}`), {
      method: 'GET',
      headers,
    })
    
    if (!response.ok) {
      // Handle 401 errors globally
      if (response.status === 401) {
        const { handleApiError } = await import('./api-utils')
        await handleApiError({ status: 401 })
        throw new Error('Authentication required')
      }
      
      console.error(`API request failed with status: ${response.status}`)
      const errorText = await response.text()
      console.error('Error response:', errorText)
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const apiData: QuestionApiResponse = await response.json()
    
    return apiData
  } catch (error) {
    console.error('Error fetching questions from API:', error)
    throw error
  }
}
