import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faSignOutAlt, 
  faChevronDown,
  faGraduationCap,
  faChalkboardTeacher,
  faStar,
  faHome,
  faList,
  faClipboardList,
  faBook
} from '@fortawesome/free-solid-svg-icons';
import { getCurrentUserInfo } from '../utils/contract';

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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userRole, setUserRole] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const userInfo = await getCurrentUserInfo() as unknown as User;
        setUserRole(Number(userInfo.role));
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
        className="flex items-center text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
      >
        <FontAwesomeIcon icon={link.icon} className="h-4 w-4 mr-2" />
        {link.text}
      </Link>
    ));
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-indigo-600">课链智评</span>
            </Link>
          </div>

          {/* 导航链接 */}
          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            {renderNavLinks()}
          </div>

          {/* 用户头像和下拉菜单 */}
          <div className="flex items-center" ref={dropdownRef}>
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="bg-indigo-50 p-2 rounded-full">
                  <FontAwesomeIcon 
                    icon={userRole === 0 ? faGraduationCap : userRole === 1 ? faChalkboardTeacher : faStar}
                    className="h-6 w-6 text-indigo-600"
                  />
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
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <FontAwesomeIcon icon={faUser} className="h-4 w-4 mr-2 text-gray-400" />
                      个人资料
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
    </nav>
  );
} 