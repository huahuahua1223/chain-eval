import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { getAllCourses, markStudentCourse, getCurrentUserInfo } from '../utils/contract';

// 定义课程结构体类型
interface Course {
  id: string;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

// 定义用户结构体类型
interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

export default function MarkStudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<number | null>(null);
  const [studentAddress, setStudentAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userInfo = await getCurrentUserInfo() as unknown as User;
        if (Number(userInfo.role) !== 2) {
          setError('只有管理员可以访问此页面');
          return;
        }

        const allCourses = await getAllCourses() as unknown as Course[];
        console.log(allCourses)
        setCourses(allCourses);
      } catch (err) {
        console.error('获取数据失败:', err);
        setError('获取数据失败，请确保已连接钱包');
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCourse === null || !studentAddress) {
      console.log(selectedCourse,studentAddress)
      setError('请选择课程并输入学生地址');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log(selectedCourse, studentAddress)
      await markStudentCourse(selectedCourse, studentAddress);
      setSuccess('成功标记学生课程');
      setStudentAddress('');
    } catch (err) {
      console.error('标记学生课程失败:', err);
      setError('标记学生课程失败，请确保输入正确的学生地址');
    } finally {
      setLoading(false);
    }
  };

  if (error && error.includes('只有管理员可以访问')) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          <p className="text-xl font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 标题卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">标记学生课程</h1>
          <div className="bg-indigo-50 p-3 rounded-full">
            <FontAwesomeIcon icon={faStar} className="h-6 w-6 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* 表单卡片 */}
      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              选择课程
            </label>
            <select
              value={selectedCourse ?? ''}
              onChange={(e) => setSelectedCourse(Number(e.target.value))}
              className="form-select w-full"
            >
              <option value="">请选择课程</option>
              {courses.map((course, index) => (
                <option key={index} value={index}>
                  {course.name} - {course.credits}学分
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              学生钱包地址
            </label>
            <input
              type="text"
              value={studentAddress}
              onChange={(e) => setStudentAddress(e.target.value)}
              placeholder="请输入学生的钱包地址"
              className="form-input w-full"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center">
              <FontAwesomeIcon icon={faExclamationCircle} className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center">
              <FontAwesomeIcon icon={faCheckCircle} className="h-5 w-5 mr-2" />
              <p>{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                处理中...
              </>
            ) : (
              '标记课程'
            )}
          </button>
        </form>
      </div>
    </div>
  );
} 