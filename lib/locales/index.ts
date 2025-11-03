import { uz } from './uz'
import { cyr } from './cyr'
import { ru } from './ru'

export type Language = 'uz' | 'cyr' | 'ru'

export type Translations = typeof uz

export const translations = {
  uz,
  cyr,
  ru,
}

export const defaultLanguage: Language = 'uz'

export const availableLanguages: { code: Language; name: string; nativeName: string }[] = [
  { code: 'uz', name: 'Uzbek (Latin)', nativeName: 'O\'zbekcha' },
  { code: 'cyr', name: 'Uzbek (Cyrillic)', nativeName: 'Ўзбекча' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
]



