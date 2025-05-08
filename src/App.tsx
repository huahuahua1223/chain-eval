import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import MarkStudentCourses from './pages/MarkStudentCourses';
import Users from './pages/Users';
import TeacherCourses from './pages/TeacherCourses';
import Courses from './pages/Courses';
import AlreadyCourses from './pages/AlreadyCourses';
import Evaluations from './pages/Evaluations';
import CourseEvaluations from './pages/CourseEvaluations';
import CourseDetail from './pages/CourseDetail';
import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/" element={<Layout><Dashboard /></Layout>} />
        <Route path="/mark-student-courses" element={<Layout><MarkStudentCourses /></Layout>} />
        <Route path="/users" element={<Layout><Users /></Layout>} />
        <Route path="/my-courses" element={<Layout><TeacherCourses /></Layout>} />
        <Route path="/courses" element={<Layout><Courses /></Layout>} />
        <Route path="/already-courses" element={<Layout><AlreadyCourses /></Layout>} />
        <Route path="/evaluations" element={<Layout><Evaluations /></Layout>} />
        <Route path="/course-evaluations" element={<Layout><CourseEvaluations /></Layout>} />
        <Route path="/course/:courseId" element={<Layout><CourseDetail /></Layout>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
