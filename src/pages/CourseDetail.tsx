import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faStar,
  faUser,
  faComment,
  faExclamationCircle,
  faChalkboardTeacher,
  faUserGraduate,
  faCalendarAlt,
  faArrowLeft,
  faEdit,
} from '@fortawesome/free-solid-svg-icons';
import { getCourseDetail, getCourseStudents, getCourseEvaluations, submitEvaluation, getCurrentUserInfo, updateCourse } from '../utils/contract';
import EvaluationModal from '../components/EvaluationModal';
import EditCourseModal from '../components/EditCourseModal';

interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: number;
  isRegistered: boolean;
}

interface Course {
  id: number;
  name: string;
  credits: number;
  teacher: string;
  isActive: boolean;
}

interface Student {
  id: string;
  email: string;
  address: string;
}

interface Evaluation {
  id: number;
  studentId: string;
  courseId: number;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  timestamp: string;
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAnimation, setShowAnimation] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'evaluations'>('students');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const handleOpenModal = () => {
    if (user && Number(user.role) === 2) {
      setIsEditModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSubmitEvaluation = async (score: number, comment: string, isAnonymous: boolean) => {
    if (!courseId) return;
    
    try {
      await submitEvaluation(Number(courseId), score, comment, isAnonymous);
      
      // 刷新评价列表
      const evaluationList: any[] = await getCourseEvaluations(Number(courseId));
      setEvaluations(evaluationList.map((evaluation) => ({
        id: Math.random(),
        studentId: evaluation.student,
        courseId: Number(courseId),
        rating: Number(evaluation.score),
        comment: evaluation.comment,
        isAnonymous: evaluation.isAnonymous,
        timestamp: new Date(Number(evaluation.timestamp) * 1000).toLocaleDateString()
      })));
      
      // 切换到评价标签页
      setActiveTab('evaluations');
    } catch (err) {
      console.error('评价提交失败:', err);
      throw err;
    }
  };

  const handleUpdateCourse = async (courseId: number, courseName: string, courseCredits: number, teacherAddress: string) => {
    if (!courseId) return;
    
    try {
      await updateCourse(courseId, courseName, courseCredits, teacherAddress);
      
      // 更新课程详情
      const courseData = await getCourseDetail(Number(courseId));
      setCourse({
        id: Number(courseData.id),
        name: courseData.name,
        credits: Number(courseData.credits),
        teacher: courseData.teacher,
        isActive: courseData.isActive
      });
      
    } catch (err) {
      console.error('更新课程失败:', err);
      throw err;
    }
  };

  useEffect(() => {
    setShowAnimation(true);
    const fetchCourseData = async () => {
      if (!courseId) return;
      
      try {
        // 获取当前用户信息
        const userInfo = await getCurrentUserInfo() as unknown as User;
        setUser(userInfo);

        // 获取课程详情
        const courseData = await getCourseDetail(Number(courseId));
        setCourse({
          id: Number(courseData.id),
          name: courseData.name,
          credits: Number(courseData.credits),
          teacher: courseData.teacher,
          isActive: courseData.isActive
        });
        
        // 获取学生名单
        const studentList = await getCourseStudents(Number(courseId));
        setStudents(studentList);
        
        // 获取评价记录
        const evaluationList: any[] = await getCourseEvaluations(Number(courseId));
        setEvaluations(evaluationList.map((evaluation) => ({
          id: Math.random(), // 使用随机ID，因为合约中没有评价ID
          studentId: evaluation.student,
          courseId: Number(courseId),
          rating: Number(evaluation.score),
          comment: evaluation.comment,
          isAnonymous: evaluation.isAnonymous,
          timestamp: new Date(Number(evaluation.timestamp) * 1000).toLocaleDateString()
        })));
        
        setLoading(false);
      } catch (err: any) {
        console.error('获取课程详情失败:', err);
        setError(err.message || '获取课程详情失败');
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-16rem)]">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-green-600 border-r-transparent relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          <p className="mt-4 text-xl font-medium text-gray-700">加载中...</p>
          <p className="text-sm text-gray-500">正在获取课程详情</p>
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

  if (!course) {
    return null;
  }

  return (
    <div className={`space-y-8 transition-opacity duration-700 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}>
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-green-600 transition-colors duration-200"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="h-4 w-4 mr-2" />
        <span>返回上一页</span>
      </button>

      {/* 课程信息卡片 */}
      <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100 overflow-hidden relative">
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 bg-gradient-to-br from-green-100 to-teal-50 w-40 h-40 rounded-full -mr-20 -mt-20 opacity-70"></div>
        <div className="absolute bottom-0 left-0 bg-gradient-to-tr from-teal-100 to-green-50 w-32 h-32 rounded-full -ml-16 -mb-16 opacity-70"></div>
        
        <div className="relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-teal-600 p-4 rounded-xl shadow-md mr-4">
                <FontAwesomeIcon icon={faBook} className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
                <p className="text-gray-500">课程 ID: {course.id}</p>
              </div>
            </div>
            {user && (Number(user.role) === 0 || Number(user.role) === 2) && (
              <button
                onClick={handleOpenModal}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2 px-5 rounded-lg transition-all duration-200 shadow hover:shadow-md transform hover:scale-105 active:scale-100 flex items-center"
              >
                <FontAwesomeIcon icon={faEdit} className="mr-2 h-4 w-4" />
                {Number(user.role) === 0 ? '我要评价' : '修改课程'}
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faStar} className="text-yellow-600 h-4 w-4" />
                </div>
                <span className="ml-2 text-gray-600">学分</span>
              </div>
              <div className="flex items-center">
                {Array.from({ length: course.credits }).map((_, i) => (
                  <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 h-4 w-4 mr-0.5" />
                ))}
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faChalkboardTeacher} className="text-green-600 h-4 w-4" />
                </div>
                <span className="ml-2 text-gray-600">教师地址</span>
              </div>
              <p className="text-sm font-medium text-gray-700 truncate" title={course.teacher}>
                {course.teacher}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 rounded-xl border border-gray-100">
              <div className="flex items-center mb-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <FontAwesomeIcon icon={faUserGraduate} className="text-blue-600 h-4 w-4" />
                </div>
                <span className="ml-2 text-gray-600">学生人数</span>
              </div>
              <p className="text-2xl font-bold text-gray-700">{students.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 标签页切换 */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 px-6 text-sm font-medium focus:outline-none ${
              activeTab === 'students'
                ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('students')}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            学生名单
          </button>
          <button
            className={`flex-1 py-4 px-6 text-sm font-medium focus:outline-none ${
              activeTab === 'evaluations'
                ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('evaluations')}
          >
            <FontAwesomeIcon icon={faComment} className="mr-2" />
            评价记录
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'students' ? (
            <div className="space-y-4">
              {students.length > 0 ? (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <FontAwesomeIcon icon={faUser} className="text-blue-600 h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{student.email}</p>
                          <p className="text-xs text-gray-500">ID: {student.id}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faUserGraduate} className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">暂无学生选修此课程</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.length > 0 ? (
                evaluations.map((evaluation) => (
                  <div
                    key={evaluation.id}
                    className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <FontAwesomeIcon icon={faStar} className="text-yellow-600 h-4 w-4" />
                        </div>
                        <div className="flex space-x-1">
                          {Array.from({ length: evaluation.rating }).map((_, i) => (
                            <FontAwesomeIcon key={i} icon={faStar} className="text-yellow-400 h-4 w-4" />
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FontAwesomeIcon icon={faCalendarAlt} className="h-4 w-4 mr-1" />
                        {evaluation.timestamp}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{evaluation.comment}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      {evaluation.isAnonymous ? '匿名评价' : `学生ID: ${evaluation.studentId}`}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FontAwesomeIcon icon={faComment} className="h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-gray-500">暂无评价记录</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 评价模态框 */}
      {course && (
        <EvaluationModal
          course={course}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitEvaluation}
        />
      )}

      {/* 修改课程模态框 */}
      {course && (
        <EditCourseModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateCourse}
          course={course}
        />
      )}
    </div>
  );
} 