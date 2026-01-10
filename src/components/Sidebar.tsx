import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const location = useLocation();
    const userRole = localStorage.getItem('role');

    const isActive = (path: string) => location.pathname === path;

    const getNavItems = () => {
        if (userRole === 'student') {
            return [
                { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-th-large' },
                { path: '/schedule', label: 'Timetable', icon: 'fas fa-calendar-week' },
                { path: '/events', label: 'Events', icon: 'fas fa-calendar-alt' },
                { path: '/attendance', label: 'Attendance', icon: 'fas fa-clipboard-check' },
                { path: '/grades', label: 'Grade Report', icon: 'fas fa-file-invoice' },
                { path: '/announcements', label: 'Notices', icon: 'fas fa-bullhorn' },
            ];
        } else if (userRole === 'faculty') {
            return [
                { path: '/faculty/dashboard', label: 'Dashboard', icon: 'fas fa-columns' },
                { path: '/faculty/schedule', label: 'My Schedule', icon: 'fas fa-calendar-week' },
                { path: '/faculty/attendance', label: 'Take Attendance', icon: 'fas fa-user-check' },
                { path: '/announcements', label: 'Announcements', icon: 'fas fa-bullhorn' },
                { path: '/events', label: 'Events', icon: 'fas fa-calendar-star' },
            ];
        } else if (userRole === 'admin') {
            return [
                { path: '/admin', label: 'Admin Panel', icon: 'fas fa-user-shield' },
                { path: '/admin/schedule', label: 'Schedule Builder', icon: 'fas fa-calendar-alt' },
                { path: '/admin/ai-maker', label: 'AI Strategy', icon: 'fas fa-robot' },
                { path: '/admin/holidays', label: 'Holidays', icon: 'fas fa-calendar-day' },
                { path: '/announcements', label: 'Notices', icon: 'fas fa-edit' },
            ];
        }
        return [];
    };

    const navItems = getNavItems();

    return (
        <>
            {/* Background Overlay for mobile */}
            <div
                className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[55] transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            ></div>

            <div className={`w-64 h-screen bg-slate-900 text-slate-300 flex flex-col fixed left-0 top-0 z-[60] border-r border-slate-800 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="p-6 border-b border-slate-800/50 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-3" onClick={onClose}>
                        <Logo size="sm" />
                        <div className="flex flex-col">
                            <span className="font-bold text-white tracking-tight leading-none">KLU Portal</span>
                            <span className="text-[10px] font-bold text-red-500 tracking-widest uppercase">
                                {userRole === 'faculty' ? 'Faculty' : userRole === 'admin' ? 'Admin' : 'Student'}
                            </span>
                        </div>
                    </Link>
                    <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-white">
                        <i className="fas fa-times text-lg"></i>
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 mt-4 overflow-y-auto">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${isActive(item.path)
                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                : 'hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <i className={`${item.icon} w-5 text-center ${isActive(item.path) ? 'text-white' : 'text-slate-500 group-hover:text-red-400'}`}></i>
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50">
                    <Link
                        to="/profile"
                        onClick={onClose}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${isActive('/profile') ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <i className="fas fa-user-circle w-5 text-center text-slate-500"></i>
                        My Profile
                    </Link>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.href = '#/login';
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-500/5 hover:bg-red-500 hover:text-white transition-all duration-300 mt-2"
                    >
                        <i className="fas fa-sign-out-alt w-5 text-center"></i>
                        Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
