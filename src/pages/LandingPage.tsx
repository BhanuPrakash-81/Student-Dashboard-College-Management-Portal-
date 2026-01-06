
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

            {/* Navbar */}
            <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Logo size="md" />
                    <span className="text-2xl font-bold tracking-tight">University Portal</span>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all backdrop-blur-sm font-medium"
                    >
                        Sign In
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
                <div className="animate-fade-in-up">
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-white to-blue-200 drop-shadow-sm">
                        Welcome to the Future <br /> of Education
                    </h1>
                    <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Manage your academic journey with ease. Access grades, attendance, events, and announcements in one unified platform designed for students and faculty.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 rounded-full font-bold text-lg shadow-xl shadow-red-900/30 transition-all transform hover:scale-105"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/events')} // Or public info page
                            className="px-8 py-4 bg-transparent border border-white/20 hover:bg-white/5 rounded-full font-semibold text-lg backdrop-blur-sm transition-all"
                        >
                            Learn More
                        </button>
                    </div>
                </div>

                {/* Feature Highlights */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
                    {[
                        { title: 'Academic Tracking', desc: 'Real-time updates on grades and attendance.', icon: 'fa-chart-line' },
                        { title: 'Event Hub', desc: 'Stay updated with the latest workshops and fests.', icon: 'fa-calendar-alt' },
                        { title: 'Secure Access', desc: 'Role-based access for students and administrators.', icon: 'fa-shield-alt' }
                    ].map((feature, idx) => (
                        <div key={idx} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-colors backdrop-blur-md">
                            <i className={`fas ${feature.icon} text-3xl mb-4 text-red-500`}></i>
                            <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                            <p className="text-slate-400">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="relative z-10 text-center py-8 text-slate-500 text-sm">
                © {new Date().getFullYear()} KL University. All rights reserved.
            </footer>
        </div>
    );
};

export default LandingPage;
