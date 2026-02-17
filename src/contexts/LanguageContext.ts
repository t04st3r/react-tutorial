import { createContext } from 'react';

type Language = 'en' | 'it' | 'es';

const LanguageContext = createContext<Language>('en');

export default LanguageContext;
export type { Language };