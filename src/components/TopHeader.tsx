import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

const TopHeader: React.FC = () => {
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
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50 px-8 flex justify-between items-center">
            <div className="flex flex-col">
                <h2 className="text-xl font-bold text-slate-800">
                    {role?.toUpperCase()} PORTAL
                </h2>
                <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
                    KL Deemed to be University
                </span>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-800 leading-none">{firstName}</p>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium">{email}</p>
                </div>
                <div className="w-11 h-11 rounded-2xl border-2 border-white shadow-lg overflow-hidden ring-1 ring-slate-200 cursor-pointer hover:scale-105 transition-transform duration-200">
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
