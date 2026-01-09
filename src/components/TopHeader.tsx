import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

interface TopHeaderProps {
    onMenuClick: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({ onMenuClick }) => {
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const firstName = localStorage.getItem('first_name');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    useEffect(() => {
        if (email) {
            api.auth.getProfile(email).then(data => {
                if (data.profile_image) {
                    setProfileImage(data.profile_image);
                }
            }).catch(err => console.error(err));
        }
    }, [email]);

    return (
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-4 md:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
                {/* Mobile Menu Toggle */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-800 hover:bg-slate-200 transition-colors"
                >
                    <i className="fas fa-bars"></i>
                </button>

                <div className="flex flex-col">
                    <h2 className="text-lg md:text-xl font-bold text-slate-800 leading-none capitalize">
                        {role} PORTAL
                    </h2>
                    <span className="text-[9px] md:text-xs text-slate-400 font-bold tracking-widest uppercase mt-1">
                        KLU Digital Campus
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <div className="text-right hidden md:block">
                    <p className="text-sm font-bold text-slate-800 leading-none">{firstName}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{email}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl border-2 border-white shadow-lg overflow-hidden ring-1 ring-slate-200 cursor-pointer hover:scale-105 transition-transform duration-200">
                    <img
                        src={profileImage ? `data:image/jpeg;base64,${profileImage}` : `https://ui-avatars.com/api/?name=${firstName}&background=random`}
                        alt="Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
