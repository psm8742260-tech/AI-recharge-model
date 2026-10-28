import React, { useState } from 'react';
import { X, User, Image, CheckCircle2, AlertCircle } from 'lucide-react';
import { UserAccount } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onUpdate: (updatedUser: UserAccount) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate,
}) => {
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setError('');
    setSuccess(false);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (user.email) headers['x-user-email'] = user.email;
      if (user.mobile) headers['x-user-mobile'] = user.mobile;

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name, avatar }),
      });

      const data = await res.json();
      if (data.success) {
        onUpdate(data.user);
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(data.message || 'ప్రొఫైల్ అప్‌డేట్ చేయడంలో విఫలమైంది (Failed to update profile).');
      }
    } catch (err) {
      setError('సర్వర్ కనెక్షన్ ఎర్రర్ (Server connection error).');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">ప్రొఫైల్ సెట్టింగ్స్</h2>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Edit Profile Settings</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-600 text-sm animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="font-bold">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-600 text-sm animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p className="font-bold">ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ చేయబడింది!</p>
            </div>
          )}

          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img 
                src={avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
                alt="Profile Preview" 
                className="w-24 h-24 rounded-full border-4 border-slate-100 object-cover shadow-lg"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Image className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase">Avatar Preview</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                మీ పేరు (Display Name)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  placeholder="మీ పేరును నమోదు చేయండి..."
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                ప్రొఫైల్ ఐకాన్ URL (Avatar URL)
              </label>
              <div className="relative">
                <Image className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="url"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400 leading-relaxed px-1">
                మీకు నచ్చిన ఫోటో లింక్ (URL) ఇక్కడ ఇవ్వండి. ఉదాహరణకు Unsplash లేదా ఏదైనా ఇమేజ్ హోస్టింగ్ సైట్ లింక్.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdating}
            className={`w-full py-4 rounded-2xl text-white font-black text-sm uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-2 ${
              isUpdating 
                ? 'bg-slate-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-rose-600 to-rose-500 hover:shadow-rose-500/25 active:scale-[0.98]'
            }`}
          >
            {isUpdating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              'ప్రొఫైల్ సేవ్ చేయండి (Save Profile)'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
