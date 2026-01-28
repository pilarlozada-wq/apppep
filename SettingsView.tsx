
import React, { useState } from 'react';
import { UserProfile } from '../types';

interface Props {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onResetData: () => void;
}

const SettingsView: React.FC<Props> = ({ profile, onUpdateProfile, onResetData }) => {
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    password: ''
  });

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      // Generar una imagen de avatar basada en el nombre para darle un toque premium
      const initials = formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
      const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=137fec&color=fff&size=256&bold=true`;
      
      onUpdateProfile({
        name: formData.name,
        email: formData.email,
        avatarUrl,
        isLoggedIn: true
      });
    }
  };

  const handleSignOut = () => {
    onUpdateProfile({ name: '', email: '', avatarUrl: '', isLoggedIn: false });
  };

  if (!profile.isLoggedIn) {
    return (
      <div className="max-w-md mx-auto py-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-10 flex flex-col gap-8">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-[40px]">key_visualizer</span>
            </div>
            <h1 className="text-3xl font-black dark:text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Create your profile to start managing your advertising ecosystem more effectively.</p>
          </div>

          <form onSubmit={handleSignIn} className="flex flex-col gap-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">person</span>
                  <input 
                    required
                    type="text" 
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">mail</span>
                  <input 
                    required
                    type="email" 
                    placeholder="name@company.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">lock</span>
                  <input 
                    required
                    type="password" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary dark:text-white transition-all"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition-all mt-4"
            >
              Get Started Now
            </button>
          </form>

          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-tighter">
            By joining, you agree to our Terms of Service
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in fade-in slide-in-from-right-12 duration-500 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Everything looks great today, {profile.name.split(' ')[0]}.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center gap-6 shadow-sm sticky top-24">
            <div className="relative group">
              <div className="size-32 rounded-full border-4 border-primary/10 overflow-hidden shadow-2xl">
                <img src={profile.avatarUrl} alt="profile" className="size-full object-cover" />
              </div>
              <button className="absolute bottom-1 right-1 bg-primary text-white size-10 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-all">
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
              </button>
            </div>
            
            <div className="space-y-1">
              <h3 className="text-2xl font-black dark:text-white">{profile.name}</h3>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-widest text-[10px]">{profile.email}</p>
            </div>

            <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-800">
               <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl flex items-center justify-center gap-2 mb-6">
                 <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
                 <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">Active Member</span>
               </div>
               
               <button 
                onClick={handleSignOut}
                className="w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
               >
                 <span className="material-symbols-outlined text-[18px]">logout</span>
                 Sign Out Account
               </button>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">
              <span className="material-symbols-outlined text-primary">person_edit</span>
              <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-400">Edit Personal Information</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
                <input type="text" defaultValue={profile.name} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary dark:text-white" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Work Email</label>
                <input type="email" defaultValue={profile.email} className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary dark:text-white" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">About (Short Bio)</label>
                <textarea 
                  rows={3} 
                  placeholder="Tell us about your role in the campaign ecosystem..."
                  className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl py-3.5 px-4 text-sm focus:ring-2 focus:ring-primary dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
               <button className="bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                 Update Profile
               </button>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
             <div className="flex items-center gap-3 mb-8 border-b border-slate-50 dark:border-slate-800 pb-4">
                <span className="material-symbols-outlined text-rose-500">dangerous</span>
                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-rose-400">Advanced Actions</h4>
              </div>

              <div className="flex items-center justify-between p-4 bg-rose-50/50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                <div>
                  <p className="text-sm font-black text-rose-700 dark:text-rose-400 uppercase tracking-tight">Factory Reset</p>
                  <p className="text-xs text-rose-600/60 dark:text-rose-400/50 font-medium">Deletes all local campaigns and brand data.</p>
                </div>
                <button 
                  onClick={onResetData}
                  className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-700 transition-all shadow-md shadow-rose-200 dark:shadow-none"
                >
                  Reset App
                </button>
              </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
