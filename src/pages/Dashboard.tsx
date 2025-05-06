import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserInfo, getAllCourses, getStudentEvaluations, addCourse, updateCourse } from '../utils/contract';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGraduationCap, faChalkboardTeacher, faStar, faExclamationCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [evaluations, setEvaluations] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // 添加课程Modal状态
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCredits, setCourseCredits] = useState<number>(0);
  const [teacherAddress, setTeacherAddress] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);
  const [addCourseError, setAddCourseError] = useState('');
  
  // 修改课程Modal状态
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState<number>(-1);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseCredits, setEditCourseCredits] = useState<number>(0);
  const [editTeacherAddress, setEditTeacherAddress] = useState('');
  const [editingCourse, setEditingCourse] = useState(false);
  const [editCourseError, setEditCourseError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        console.log("userInfo",userInfo);
        setUser(userInfo);

        // 获取所有课程
        const allCourses = await getAllCourses() as unknown as Course[];
        setCourses(allCourses);

        // 如果是学生，获取评价历史
        if (Number(userInfo?.role) === 0) {
          const studentEvals = await getStudentEvaluations() as unknown as number[];
          setEvaluations(studentEvals);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 课程添加处理函数
  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingCourse(true);
    setAddCourseError('');

    try {
      if (!courseName.trim()) {
        throw new Error('课程名称不能为空');
      }
      
      if (courseCredits <= 0 || courseCredits > 10) {
        throw new Error('学分必须在1-10之间');
      }
      
      if (!teacherAddress || !teacherAddress.startsWith('0x') || teacherAddress.length !== 42) {
        throw new Error('请输入有效的教师地址');
      }
      
      await addCourse(courseName, courseCredits, teacherAddress);
      
      // 添加成功后刷新课程列表
      const updatedCourses = await getAllCourses() as unknown as Course[];
      setCourses(updatedCourses);
      
      // 重置表单并关闭模态框
      resetAddForm();
      setShowModal(false);
    } catch (err: any) {
      console.error('添加课程失败:', err);
      setAddCourseError(err.message || '添加课程失败，请重试');
    } finally {
      setAddingCourse(false);
    }
  };

  // 打开编辑课程弹窗
  const openEditModal = (course: Course) => {
    setCurrentCourseId(course.id);
    setEditCourseName(course.name);
    setEditCourseCredits(course.credits);
    setEditTeacherAddress(course.teacher);
    setEditCourseError('');
    setShowEditModal(true);
  };

  // 处理课程更新
  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditingCourse(true);
    setEditCourseError('');

    try {
      if (!editCourseName.trim()) {
        throw new Error('课程名称不能为空');
      }
      
      if (editCourseCredits <= 0 || editCourseCredits > 10) {
        throw new Error('学分必须在1-10之间');
      }
      
      if (!editTeacherAddress || !editTeacherAddress.startsWith('0x') || editTeacherAddress.length !== 42) {
        throw new Error('请输入有效的教师地址');
      }
      
      await updateCourse(currentCourseId, editCourseName, editCourseCredits, editTeacherAddress);
      
      // 更新成功后刷新课程列表
      const updatedCourses = await getAllCourses() as unknown as Course[];
      setCourses(updatedCourses);
      
      // 重置表单并关闭模态框
      resetEditForm();
      setShowEditModal(false);
    } catch (err: any) {
      console.error('更新课程失败:', err);
      setEditCourseError(err.message || '更新课程失败，请重试');
    } finally {
      setEditingCourse(false);
    }
  };

  const resetAddForm = () => {
    setCourseName('');
    setCourseCredits(0);
    setTeacherAddress('');
    setAddCourseError('');
  };

  const resetEditForm = () => {
    setCurrentCourseId(-1);
    setEditCourseName('');
    setEditCourseCredits(0);
    setEditTeacherAddress('');
    setEditCourseError('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          <p className="text-xl font-medium">{error}</p>
        </div>
        <button 
          onClick={() => navigate('/login')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
        >
          返回登录
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 欢迎卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              欢迎回来，{user?.id}
            </h1>
            <p className="mt-1 text-gray-500">
              {Number(user?.role) === 0 ? '学生' : Number(user?.role) === 1 ? '教师' : '管理员'} 控制面板
            </p>
          </div>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon 
              icon={Number(user?.role) === 0 ? faGraduationCap : Number(user?.role) === 1 ? faChalkboardTeacher : faStar} 
              className="h-6 w-6 text-indigo-600" 
            />
          </div>
        </div>
      </div>

      {/* 课程列表卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">课程列表</h2>
          {Number(user?.role) === 2 && (
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md text-sm"
            >
              添加课程
            </button>
          )}
        </div>
        
        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    课程名称
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    学分
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    授课教师
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courses.map((course, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="bg-indigo-50 p-2 rounded-lg">
                            <FontAwesomeIcon icon={faGraduationCap} className="h-6 w-6 text-indigo-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{course.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{course.credits}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                        {course.teacher.substring(0, 6)}...{course.teacher.substring(38)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        course.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {course.isActive ? '激活' : '未激活'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {Number(user?.role) === 0 && (
                        <button
                          onClick={() => navigate(`/evaluate/${course.id}`)}
                          className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-lg transition-colors hover:bg-indigo-100 mr-2"
                        >
                          查看
                        </button>
                      )}
                      {Number(user?.role) === 2 && (
                        <button
                          onClick={() => openEditModal(course)}
                          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded-lg transition-colors hover:bg-blue-100"
                        >
                          修改
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-lg inline-block">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">暂无课程数据</p>
            </div>
          </div>
        )}
      </div>

      {/* 评价历史卡片（仅学生可见） */}
      {/* {Number(user?.role) === 0 && evaluations.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">我的评价历史</h2>
          <div className="space-y-4">
            {evaluations.map((evalId, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="bg-green-50 p-2 rounded-lg mr-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">已评价课程ID: {evalId}</p>
                    <p className="text-xs text-gray-500 mt-1">评价已完成</p>
                  </div>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  已完成
                </span>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* 添加课程Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">添加新课程</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    setShowModal(false);
                    resetAddForm();
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              
              {addCourseError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {addCourseError}
                </div>
              )}
              
              <form onSubmit={handleAddCourse}>
                <div className="mb-4">
                  <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-2">
                    课程名称
                  </label>
                  <input
                    type="text"
                    id="courseName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="请输入课程名称"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="courseCredits" className="block text-sm font-medium text-gray-700 mb-2">
                    学分
                  </label>
                  <input
                    type="number"
                    id="courseCredits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={courseCredits}
                    onChange={(e) => setCourseCredits(Number(e.target.value))}
                    min="1"
                    max="10"
                    placeholder="1-10"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="teacherAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    教师地址
                  </label>
                  <input
                    type="text"
                    id="teacherAddress"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={teacherAddress}
                    onChange={(e) => setTeacherAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      setShowModal(false);
                      resetAddForm();
                    }}
                    disabled={addingCourse}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-75"
                    disabled={addingCourse}
                  >
                    {addingCourse ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </span>
                    ) : "添加课程"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 修改课程Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900">修改课程</h3>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                >
                  <FontAwesomeIcon icon={faTimes} className="h-5 w-5" />
                </button>
              </div>
              
              {editCourseError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
                  {editCourseError}
                </div>
              )}
              
              <form onSubmit={handleUpdateCourse}>
                <div className="mb-4">
                  <label htmlFor="editCourseName" className="block text-sm font-medium text-gray-700 mb-2">
                    课程名称
                  </label>
                  <input
                    type="text"
                    id="editCourseName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editCourseName}
                    onChange={(e) => setEditCourseName(e.target.value)}
                    placeholder="请输入课程名称"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="editCourseCredits" className="block text-sm font-medium text-gray-700 mb-2">
                    学分
                  </label>
                  <input
                    type="number"
                    id="editCourseCredits"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editCourseCredits}
                    onChange={(e) => setEditCourseCredits(Number(e.target.value))}
                    min="1"
                    max="10"
                    placeholder="1-10"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label htmlFor="editTeacherAddress" className="block text-sm font-medium text-gray-700 mb-2">
                    教师地址
                  </label>
                  <input
                    type="text"
                    id="editTeacherAddress"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    value={editTeacherAddress}
                    onChange={(e) => setEditTeacherAddress(e.target.value)}
                    placeholder="0x..."
                    required
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => {
                      setShowEditModal(false);
                      resetEditForm();
                    }}
                    disabled={editingCourse}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-75"
                    disabled={editingCourse}
                  >
                    {editingCourse ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        提交中...
                      </span>
                    ) : "保存修改"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}