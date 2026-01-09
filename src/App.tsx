
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Events from './pages/Events';
import Attendance from './pages/Attendance';
import Grades from './pages/Grades';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Announcements from './pages/Announcements';
import FacultyDashboard from './pages/FacultyDashboard';
import FacultyAttendance from './pages/FacultyAttendance';
import FacultySchedule from './pages/FacultySchedule';
import AdminSchedule from './pages/AdminSchedule';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';

const Layout = () => (
  <div className="min-h-screen bg-slate-50 flex">
    <Sidebar />
    <div className="flex-1 ml-64 min-h-screen relative">
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>
      <TopHeader />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const token = localStorage.getItem('id'); // Simplified auth check based on user ID presence
  const role = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/" element={<LandingPage />} />
        {/* Protected Routes */}
        <Route element={<Layout />}>


          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/events" element={
            <ProtectedRoute>
              <Events />
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Attendance />
            </ProtectedRoute>
          } />

          <Route path="/grades" element={
            <ProtectedRoute allowedRoles={['student']}>
              <Grades />
            </ProtectedRoute>
          } />

          <Route path="/announcements" element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Admin />
            </ProtectedRoute>
          } />

          <Route path="/admin/schedule" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminSchedule />
            </ProtectedRoute>
          } />

          <Route path="/faculty/dashboard" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyDashboard />
            </ProtectedRoute>
          } />

          <Route path="/faculty/attendance" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultyAttendance />
            </ProtectedRoute>
          } />

          <Route path="/faculty/schedule" element={
            <ProtectedRoute allowedRoles={['faculty']}>
              <FacultySchedule />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
