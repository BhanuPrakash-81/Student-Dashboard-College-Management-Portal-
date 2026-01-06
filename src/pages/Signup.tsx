import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import Logo from '../components/Logo';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    email: '',
    password: ''
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value as string));
    if (profileImage) data.append('profile_image', profileImage);

    try {
      const res = await api.auth.signup(data);
      if (res.error) {
        setMessage(res.error);
        setIsError(true);
      } else {
        setMessage('Account created! Wait for approval.');
        setIsError(false);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setMessage('Failed to create account');
      setIsError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden py-10">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/20 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[100px]"></div>

      <div className="bg-white/10 backdrop-blur-xl border border-white/20 w-full max-w-lg p-8 rounded-3xl shadow-2xl relative z-10">
        <div className="flex flex-col items-center mb-6">
          <Logo size="md" />
          <h2 className="text-2xl font-bold text-white mt-4">Create Account</h2>
          <p className="text-slate-400">Join the KL University community</p>
        </div>

        {message && (
          <div className={`p-3 rounded-xl mb-6 text-sm text-center font-medium backdrop-blur-sm border ${isError ? 'bg-red-500/20 border-red-500/50 text-red-200' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">First Name</label>
              <input type="text" required onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Last Name</label>
              <input type="text" required onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Middle Name (Optional)</label>
            <input type="text" onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
            <input type="email" required onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
            <input type="password" required onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Profile Picture</label>
            <input type="file" required onChange={(e) => setProfileImage(e.target.files ? e.target.files[0] : null)}
              className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-white hover:file:bg-slate-600 cursor-pointer" />
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-900/40 transform hover:scale-[1.02] mt-2">
            Sign Up
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-red-400 font-bold hover:text-red-300 transition-colors">Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;