import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AuthRoute from './components/AuthRoute';
import RoleRoute from './components/RoleRoute';
// Public pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import OTPVerify from './pages/OTPVerify';
import SubscriptionActivate from './pages/SubscriptionActivate';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import Profile from './pages/Profile';
// Forgot password
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
// Student
import MyCourses from './pages/student/MyCourses';
import WatchVideo from './pages/student/WatchVideo';
// Teacher
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import UploadVideo from './pages/teacher/UploadVideo';
import UploadDocument from './pages/teacher/UploadDocument';
import AddAnnouncement from './pages/teacher/AddAnnouncement';
import ManageCoursesTeacher from './pages/teacher/ManageCourses';
import TeacherEditTimetable from './pages/teacher/TeacherEditTimetable';
import EditCourse from './pages/teacher/EditCourse';
import EditDocument from './pages/teacher/EditDocument';
import TeacherQuestions from './pages/teacher/TeacherQuestions';
// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCoursesAdmin from './pages/admin/ManageCourses';
import Analytics from './pages/admin/Analytics';
import ManageContacts from './pages/admin/ManageContacts';
import ManageTeachers from './pages/admin/ManageTeachers';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{ className: 'glass-card' }} />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/subscription/activate" element={<AuthRoute><SubscriptionActivate /></AuthRoute>} />
            <Route path="/student/my-courses" element={<ProtectedRoute><RoleRoute allowedRoles={['student']}><MyCourses /></RoleRoute></ProtectedRoute>} />
            <Route path="/watch/:videoId" element={<ProtectedRoute><RoleRoute allowedRoles={['student', 'teacher', 'admin']}><WatchVideo /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/dashboard" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><TeacherDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/upload-video" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><UploadVideo /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/upload-document" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><UploadDocument /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/add-announcement" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><AddAnnouncement /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/courses/:id/manage" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><ManageCoursesTeacher /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/courses/:courseId/edit-timetable" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><TeacherEditTimetable /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/courses/:courseId/edit" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><EditCourse /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/documents/:docId/edit" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher', 'admin']}><EditDocument /></RoleRoute></ProtectedRoute>} />
            <Route path="/teacher/questions" element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><TeacherQuestions /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><AdminDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><ManageUsers /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/courses" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><ManageCoursesAdmin /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><Analytics /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/contacts" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><ManageContacts /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin/teachers" element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><ManageTeachers /></RoleRoute></ProtectedRoute>} />
          </Routes>
          <Footer />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;