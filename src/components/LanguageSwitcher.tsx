import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faChevronDown } from '@fortawesome/free-solid-svg-icons';

interface Language {
  code: string;
  name: string;
  flag: string;
}

export default function LanguageSwitcher() {
  const languages: Language[] = [
    { code: 'zhcn', name: '中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' }
  ];

  // 获取当前语言
  const [currentLang, setCurrentLang] = useState<string>(
    (localStorage.getItem('lang') || 'zhcn')
  );
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 切换语言函数
  const changeLang = (langCode: string) => {
    localStorage.setItem('lang', langCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    window.location.reload();
  };

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取当前语言对象
  const getCurrentLanguage = () => {
    return languages.find(lang => lang.code === currentLang) || languages[0];
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none group px-2 py-1 rounded-md hover:bg-indigo-50 transition-colors"
      >
        <FontAwesomeIcon icon={faGlobe} className="h-4 w-4 text-indigo-500" />
        <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600">
          {getCurrentLanguage().flag} {getCurrentLanguage().name}
        </span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`h-3 w-3 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {/* 语言下拉菜单 */}
      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-40 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100 overflow-hidden z-50 animate-fadeIn">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors duration-150 ${
                  currentLang === lang.code
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                }`}
                role="menuitem"
              >
                <span className="mr-2">{lang.flag}</span>
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 