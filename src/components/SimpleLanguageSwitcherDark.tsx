import { useState } from 'react';

interface Language {
  code: string;
  name: string;
  flag: string;
}

export default function SimpleLanguageSwitcherDark() {
  const languages: Language[] = [
    { code: 'zhcn', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'EN', flag: '🇺🇸' },
    { code: 'ja', name: 'JP', flag: '🇯🇵' },
    { code: 'ko', name: 'KR', flag: '🇰🇷' }
  ];

  // 获取当前语言
  const [currentLang, setCurrentLang] = useState<string>(
    (localStorage.getItem('lang') || 'zhcn')
  );

  // 切换语言函数
  const changeLang = (langCode: string) => {
    localStorage.setItem('lang', langCode);
    setCurrentLang(langCode);
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center space-x-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => changeLang(lang.code)}
          className={`px-2 py-1 rounded-md transition-colors flex items-center ${
            currentLang === lang.code 
              ? 'bg-indigo-100 text-indigo-700 font-medium' 
              : 'text-gray-600 hover:text-indigo-700 hover:bg-indigo-50'
          }`}
          title={lang.name}
        >
          <span>{lang.flag}</span>
        </button>
      ))}
    </div>
  );
} 