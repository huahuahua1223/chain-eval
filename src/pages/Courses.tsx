import { useState, useEffect } from 'react';
import { getCurrentUserInfo, getAllCourses, addCourse, updateCourse } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faStar, 
  faExclamationCircle,
  faPlus, 
  faBook, 
  faEdit,
  faUniversity,
  faSearch,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import AddCourseModal from '../components/AddCourseModal';
import EditCourseModal from '../components/EditCourseModal';

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

// 定义课程结构体类型
interface Course {
  id: number;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

export default function Courses() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  
  // Modal状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 添加Toast状态
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    setShowAnimation(true);
    
    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        console.log("userInfo",userInfo);
        setUser(userInfo);

        // 获取所有课程
        const allCourses = await getAllCourses() as unknown as Course[];
        setCourses(allCourses);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 添加显示Toast的函数
  const showSuccessToast = (message: string) => {
    setToastMessage(message);
    setToastType('success');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setToastType('error');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // 课程添加处理函数
  const handleAddCourse = async (courseName: string, courseCredits: number, teacherAddress: string) => {
    try {
      await addCourse(courseName, courseCredits, teacherAddress);
      
      // 添加成功后刷新课程列表
      const updatedCourses = await getAllCourses() as unknown as Course[];
      setCourses(updatedCourses);
      
      // 显示成功提示
      showSuccessToast('课程添加成功！');
    } catch (err: any) {
      console.error('添加课程失败:', err);
      showErrorToast(err.message || '添加课程失败，请重试');
      throw err;
    }
  };

  // 打开编辑课程弹窗
  const openEditModal = (course: Course) => {
    setSelectedCourse(course);
    setShowEditModal(true);
  };

  // 处理课程更新
  const handleUpdateCourse = async (courseId: number, courseName: string, courseCredits: number, teacherAddress: string) => {
    try {
      await updateCourse(courseId, courseName, courseCredits, teacherAddress);
      
      // 更新成功后刷新课程列表
      const updatedCourses = await getAllCourses() as unknown as Course[];
      setCourses(updatedCourses);
      
      // 显示成功提示
      showSuccessToast('课程修改成功！');
    } catch (err: any) {
      console.error('更新课程失败:', err);
      showErrorToast(err.message || '更新课程失败，请重试');
      throw err;
    }
  };
  
  // 筛选课程
  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faUniversity} className="h-6 w-6 text-indigo-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取课程数据</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-8 py-6 rounded-xl mb-6 shadow-sm max-w-lg">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 p-3 rounded-full">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <h3 className="text-center text-lg font-medium text-red-800 mb-2">访问错误</h3>
          <p className="text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* Toast提示 */}
      {showToast && (
        <div className="fixed top-4 right-4 z-[100] transform transition-all duration-300 ease-out">
          <div className={`${
            toastType === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          } border px-4 py-3 rounded-lg shadow-lg flex items-center animate-fade-in-down`}>
            <FontAwesomeIcon 
              icon={toastType === 'success' ? faCheckCircle : faExclamationCircle} 
              className={`h-5 w-5 ${toastType === 'success' ? 'text-green-500' : 'text-red-500'} mr-2`} 
            />
            <p className="font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        {/* 背景装饰元素 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-blue-100 to-indigo-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-indigo-100 to-blue-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 rounded-xl shadow-md mr-4">
              <FontAwesomeIcon icon={faUniversity} className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">课程管理</h1>
              <p className="text-gray-500">查看和管理系统中的所有课程</p>
            </div>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-sm font-medium text-blue-700 shadow-sm">
            共 {courses.length} 门课程
          </div>
        </div>
      </div>

      {/* 搜索和操作卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              placeholder="搜索课程名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {Number(user?.role) === 2 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2.5 px-4 rounded-lg transition-all duration-200 shadow hover:shadow-md transform hover:scale-105"
            >
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4 mr-2" />
              添加课程
            </button>
          )}
        </div>
      </div>

      {/* 课程列表卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative transition-all duration-300 hover:shadow-lg">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <FontAwesomeIcon icon={faBook} className="h-5 w-5 text-blue-500 mr-2" />
          课程列表
        </h2>
        
        {filteredCourses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    课程名称
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    学分
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    授课教师
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCourses.map((course, index) => (
                  <tr key={index} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="bg-gradient-to-r from-blue-400 to-indigo-500 p-2 rounded-lg shadow-sm">
                            <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-white" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {Array.from({ length: Number(course.credits) }).map((_, i) => (
                          <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 h-4 w-4 mr-0.5" />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100 shadow-sm">
                        {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1.5 inline-flex items-center text-xs leading-5 font-medium rounded-full border ${
                        course.isActive 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                        <span className={`h-2 w-2 rounded-full mr-1.5 ${course.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        {course.isActive ? '激活' : '未激活'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {Number(user?.role) === 2 && (
                        <button
                          onClick={() => openEditModal(course)}
                          className="bg-gradient-to-r from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white py-1.5 px-4 rounded-lg transition-all duration-200 shadow hover:shadow-md flex items-center"
                        >
                          <FontAwesomeIcon icon={faEdit} className="h-3.5 w-3.5 mr-1.5" />
                          修改
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : searchTerm ? (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
              <FontAwesomeIcon icon={faSearch} className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">未找到匹配课程</h3>
            <p className="text-gray-500 max-w-md mx-auto">尝试使用不同的搜索词或浏览完整课程列表</p>
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
            <div className="inline-block bg-white p-6 rounded-full shadow-sm mb-4">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-700 mb-2">暂无课程数据</h3>
            <p className="text-gray-500 max-w-md mx-auto">系统中还没有任何课程，点击"添加课程"按钮创建第一个课程</p>
          </div>
        )}
      </div>

      {/* 添加课程Modal */}
      <AddCourseModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCourse}
      />

      {/* 修改课程Modal */}
      <EditCourseModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCourse(null);
        }}
        onSubmit={handleUpdateCourse}
        course={selectedCourse}
      />
    </div>
  );
} 