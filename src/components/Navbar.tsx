import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSignOutAlt, 
  faChevronDown,
  faGraduationCap,
  faChalkboardTeacher,
  faHome,
  faList,
  faClipboardList,
  faBook,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';
import { getCurrentUserInfo } from '../utils/contract';
import LanguageSwitcher from './LanguageSwitcher';

// 定义用户结构体类型
interface User {
    id: string;
    email: string;
    passwordHash: string;
    role: number;
    isRegistered: boolean;
  }

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const [userName, setUserName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userInfo = await getCurrentUserInfo() as unknown as User;
        setUserRole(Number(userInfo.role));
        setUserName(userInfo.id);
      } catch (error) {
        console.error('获取用户角色失败:', error);
      }
    };
    fetchUserRole();
  }, []);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // TODO: 实现登出逻辑
    navigate('/login');
  };

  // 获取角色名称
  const getRoleName = (role: number | null) => {
    switch(role) {
      case 0: return '学生';
      case 1: return '教师';
      case 2: return '管理员';
      default: return '用户';
    }
  };

  // 获取角色图标
  const getRoleIcon = (role: number | null) => {
    switch(role) {
      case 0: return faGraduationCap;
      case 1: return faChalkboardTeacher;
      case 2: return faShieldAlt;
      default: return faUser;
    }
  };

  // 检查链接是否激活
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 根据角色渲染导航链接
  const renderNavLinks = () => {
    if (userRole === null) return null;

    const commonLinks = [
      {
        to: '/dashboard',
        text: '首页',
        icon: faHome
      }
    ];

    const roleSpecificLinks = {
      0: [ // 学生
        {
          to: '/already-courses',
          text: '已修课程',
          icon: faBook
        },
        {
          to: '/evaluations',
          text: '我的评价',
          icon: faClipboardList
        }
      ],
      1: [ // 教师
        {
          to: '/my-courses',
          text: '我的课程',
          icon: faChalkboardTeacher
        },
        {
          to: '/course-evaluations',
          text: '课程评价',
          icon: faClipboardList
        }
      ],
      2: [ // 管理员
        {
          to: '/courses',
          text: '课程管理',
          icon: faList
        },
        {
          to: '/users',
          text: '用户管理',
          icon: faUser
        },
        {
          to: '/mark-student-courses',
          text: '标记学生课程',
          icon: faGraduationCap
        }
      ]
    };

    return [...commonLinks, ...(roleSpecificLinks[userRole as keyof typeof roleSpecificLinks] || [])].map((link) => (
      <Link
        key={link.to}
        to={link.to}
        className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
          isActive(link.to) 
            ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
            : 'text-gray-700 hover:text-indigo-600 hover:bg-indigo-50/50'
        }`}
      >
        <FontAwesomeIcon 
          icon={link.icon} 
          className={`h-4 w-4 mr-2 transition-all duration-200 ${
            isActive(link.to) ? 'text-indigo-500' : 'text-gray-400 group-hover:text-indigo-500'
          }`} 
        />
        {link.text}
        {isActive(link.to) && (
          <span className="absolute bottom-0 left-0 h-0.5 bg-indigo-500 w-full transform origin-left"></span>
        )}
      </Link>
    ));
  };

  return (
    <nav className="bg-white backdrop-blur-sm shadow-sm sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center group">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md shadow-indigo-200 mr-2 transition-transform duration-300 group-hover:scale-110">
                <FontAwesomeIcon icon={faGraduationCap} className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">课链智评</span>
            </Link>
          </div>

          {/* 导航链接 - 桌面版 */}
          <div className="hidden sm:flex sm:items-center sm:space-x-2 relative">
            {renderNavLinks()}
          </div>

          {/* 移动端菜单按钮 */}
          <div className="sm:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* 用户头像和下拉菜单 */}
          <div className="hidden sm:flex items-center space-x-4" ref={dropdownRef}>
            {/* 语言切换器 */}
            <LanguageSwitcher />
            
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-2 rounded-full border border-indigo-100 shadow-sm group-hover:shadow-md transition-all duration-200">
                  <FontAwesomeIcon 
                    icon={getRoleIcon(userRole)}
                    className="h-5 w-5 text-indigo-600"
                  />
                </div>
                <div className="hidden md:block text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors duration-200">
                  {userName || '用户'} ({getRoleName(userRole)})
                </div>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {/* 下拉菜单 */}
              {isDropdownOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 border border-gray-100 overflow-hidden animate-fadeIn">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <div className="px-4 py-2 bg-indigo-50 border-b border-indigo-100">
                      <p className="text-sm font-medium text-indigo-800">{userName}</p>
                      <p className="text-xs text-indigo-600">{getRoleName(userRole)}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-2 text-gray-400" />
                      个人资料
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 mr-2 text-gray-400" />
                      退出登录
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 移动端菜单 */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 animate-fadeIn">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {renderNavLinks()}
            <div className="border-t border-gray-100 mt-2 pt-2">
              <div className="flex items-center px-3 py-2 mb-1">
                <span className="text-sm font-medium text-gray-600 mr-2">语言设置:</span>
                <LanguageSwitcher />
              </div>
              <Link
                to="/profile"
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-2 text-gray-400" />
                个人资料
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-indigo-600 hover:bg-indigo-50"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="h-4 w-4 mr-2 text-gray-400" />
                退出登录
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
} 