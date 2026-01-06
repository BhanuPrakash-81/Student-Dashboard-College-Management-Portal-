
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface UserProfile {
  id: number;
  first_name: string;
  middle_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_image: string | null;
}

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Edit Details State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: '',
    middle_name: '',
    last_name: ''
  });

  // Password State
  const [passForm, setPassForm] = useState({ old: '', new: '', confirm: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Get email from local storage to fetch fresh data
  const email = localStorage.getItem('email');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    if (email) {
      api.auth.getProfile(email).then(data => {
        setProfile(data);
        // Initialize edit form with fetched data
        setEditForm({
          first_name: data.first_name,
          middle_name: data.middle_name || '',
          last_name: data.last_name
        });

        // Update local storage names to keep navbar synced if needed
        localStorage.setItem('first_name', data.first_name);
        localStorage.setItem('last_name', data.last_name);
      }).catch(err => console.error("Profile load error", err));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    const formData = new FormData();
    formData.append('user_id', String(profile.id));
    formData.append('image', file);

    try {
      setLoading(true);
      await api.auth.updateImage(formData);
      loadProfile(); // Reload to show new image
      window.location.reload(); // Hard reload to update Navbar
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update image' });
    } finally {
      setLoading(false);
    }
  };

  const handleDetailsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      setLoading(true);
      await api.auth.updateDetails({
        user_id: profile.id,
        first_name: editForm.first_name,
        middle_name: editForm.middle_name,
        last_name: editForm.last_name
      });
      setMsg({ type: 'success', text: 'Details updated successfully!' });
      setIsEditing(false);
      loadProfile(); // Refresh data
    } catch (err) {
      setMsg({ type: 'error', text: 'Failed to update details' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (passForm.new !== passForm.confirm) {
      setMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    try {
      setLoading(true);
      const res = await api.auth.changePassword({
        user_id: profile.id,
        old_password: passForm.old,
        new_password: passForm.new
      });

      if (res.error) {
        setMsg({ type: 'error', text: res.error });
      } else {
        setMsg({ type: 'success', text: 'Password changed successfully' });
        setPassForm({ old: '', new: '', confirm: '' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Server connection error' });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-800 mb-8">My Profile</h1>

      {msg.text && (
        <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {msg.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Column: Image & Basic Badge */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 flex flex-col items-center">
            <div className="relative w-40 h-40 mb-6 group">
              <img
                src={profile.profile_image ? `data:image/jpeg;base64,${profile.profile_image}` : "https://ui-avatars.com/api/?name=User&background=random"}
                className="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-md"
                alt="Profile"
              />
              <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-sm">
                <i className="fas fa-camera mr-2"></i> Change
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={loading} />
              </label>
            </div>

            <h2 className="text-2xl font-bold text-slate-800 text-center">{profile.first_name} {profile.last_name}</h2>
            <p className="text-slate-500 mb-4">{profile.email}</p>

            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide ${profile.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
              {profile.role}
            </span>
          </div>
        </div>

        {/* Right Column: Details & Security */}
        <div className="md:col-span-2 space-y-8">

          {/* Personal Information Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-user-circle text-indigo-500"></i> Personal Information
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`text-sm font-semibold px-3 py-1 rounded-lg transition-colors ${isEditing ? 'bg-slate-100 text-slate-600' : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                {isEditing ? 'Cancel' : <><i className="fas fa-edit mr-1"></i> Edit Details</>}
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleDetailsUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.first_name}
                    onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={editForm.middle_name}
                    onChange={e => setEditForm({ ...editForm, middle_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.last_name}
                    onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2 mt-2">
                  <button type="submit" disabled={loading} className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Full Name</span>
                  <span className="text-slate-800 font-medium text-lg">{profile.first_name} {profile.middle_name} {profile.last_name}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Email Address</span>
                  <span className="text-slate-800 font-medium text-lg">{profile.email}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase font-bold mb-1">User ID</span>
                  <span className="text-slate-800 font-medium font-mono text-lg">KL-ST-{profile.id.toString().padStart(4, '0')}</span>
                </div>
                <div>
                  <span className="block text-slate-500 text-xs uppercase font-bold mb-1">Role</span>
                  <span className="text-slate-800 font-medium text-lg capitalize">{profile.role}</span>
                </div>
              </div>
            )}
          </div>

          {/* Security Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
            <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <i className="fas fa-lock text-indigo-500"></i> Security Settings
              </h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={passForm.old}
                  onChange={e => setPassForm({ ...passForm, old: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passForm.new}
                  onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passForm.confirm}
                  onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
