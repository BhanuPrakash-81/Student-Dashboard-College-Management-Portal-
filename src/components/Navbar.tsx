
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

import Logo from './Logo';

const Navbar: React.FC = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = localStorage.getItem('role');
  const email = localStorage.getItem('email');

  // ... existing useEffect ...

  useEffect(() => {
    if (email) {
      api.auth.getProfile(email).then(data => {
        if (data.profile_image) {
          setProfileImage(data.profile_image);
        }
      }).catch(err => console.error(err));
    }
  }, [email]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path
    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/30 ring-1 ring-red-500'
    : 'text-slate-600 hover:bg-slate-100 hover:text-red-600';

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20"> {/* Increased height for premium feel */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3">
              <Logo size="sm" />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-slate-800 tracking-tight leading-none">KL University</span>
                <span className="text-[10px] font-bold text-red-600 tracking-widest uppercase">Student Portal</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            {userRole === 'student' && (
              <>
                <Link to="/dashboard" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/dashboard')}`}>
                  <i className="fas fa-home"></i> Dashboard
                </Link>
                <Link to="/events" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/events')}`}>
                  <i className="fas fa-calendar"></i> Events
                </Link>
                <Link to="/attendance" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/attendance')}`}>
                  <i className="fas fa-clipboard-list"></i> Attendance
                </Link>
                <Link to="/grades" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/grades')}`}>
                  <i className="fas fa-book"></i> Grades
                </Link>
                <Link to="/announcements" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/announcements')}`}>
                  <i className="fas fa-bullhorn"></i> Announcements
                </Link>
              </>
            )}

            {userRole === 'admin' && (
              <>
                <Link to="/admin" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/admin')}`}>
                  <i className="fas fa-shield-alt"></i> Admin Panel
                </Link>
                <Link to="/announcements" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${isActive('/announcements')}`}>
                  <i className="fas fa-bullhorn"></i> View Announcements
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <img
                  src={profileImage ? `data:image/jpeg;base64,${profileImage}` : "https://ui-avatars.com/api/?name=User&background=random"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animation-fade-in-down origin-top-right">
                  <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <i className="fas fa-user w-4"></i> Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                    <i className="fas fa-sign-out-alt w-4"></i> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
