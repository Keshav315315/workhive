import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Lock, Save, Eye, EyeOff, CheckCircle, LogOut } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#f59e0b)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#10b981,#14b8a6)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#38bdf8,#3b82f6)',
];
const getGradient = (name = '') => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const labelCls = 'block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5';

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setSavingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim() });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) return toast.error('All password fields are required');
    if (newPassword !== confirmPassword) return toast.error('New passwords do not match');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setSavingPassword(true);
    try {
      await api.put('/auth/profile', { currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const joinedDate = user?.createdAt ? format(new Date(user.createdAt), 'MMMM d, yyyy') : '—';

  return (
    <div className="max-w-2xl mx-auto space-y-5">

      {/* Profile card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">

        {/* Avatar + identity */}
        <div className="flex items-center gap-5 mb-6 pb-6" style={{ borderBottom: '1px solid rgba(99,102,241,0.1)' }}>
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 avatar-ring"
            style={{ background: getGradient(user?.name) }}
          >
            {getInitials(user?.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user?.name}</h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              {user?.role === 'admin'
                ? <Shield size={13} className="text-indigo-400" />
                : <User size={13} className="text-emerald-400" />
              }
              <span className={`text-sm capitalize font-medium ${user?.role === 'admin' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Info pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[
            { icon: Mail, label: 'Email', value: user?.email },
            { icon: Shield, label: 'Role', value: user?.role, capitalize: true },
            { icon: Calendar, label: 'Joined', value: joinedDate },
          ].map(({ icon: Icon, label, value, capitalize }) => (
            <div key={label} className="rounded-xl p-3.5 flex items-center gap-3"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Icon size={14} className="text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-600 mb-0.5">{label}</div>
                <div className={`text-sm font-medium text-white truncate ${capitalize ? 'capitalize' : ''}`}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Edit name */}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div>
            <label className={labelCls}>Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name" className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={savingProfile || name.trim() === user?.name}
            className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {savingProfile
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={14} />
            }
            Save Profile
          </motion.button>
        </form>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5">
          <Lock size={15} className="text-indigo-400" />
          <h3 className="text-white font-semibold">Change Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className={labelCls}>Current Password</label>
            <div className="relative">
              <input type={showCurrent ? 'text' : 'password'} value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Enter current password" className="input-glass w-full rounded-xl px-4 py-2.5 pr-10 text-sm" />
              <button type="button" onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                {showCurrent ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>New Password</label>
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters" className="input-glass w-full rounded-xl px-4 py-2.5 pr-10 text-sm" />
              <button type="button" onClick={() => setShowNew(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors">
                {showNew ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Confirm New Password</label>
            <div className="relative">
              <input type="password" value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password" className="input-glass w-full rounded-xl px-4 py-2.5 pr-10 text-sm" />
              {confirmPassword && newPassword && (
                <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 ${confirmPassword === newPassword ? 'text-emerald-400' : 'text-red-400'}`}>
                  <CheckCircle size={14} />
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            type="submit" disabled={savingPassword}
            className="btn-primary text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-40"
          >
            {savingPassword
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Lock size={14} />
            }
            Change Password
          </motion.button>
        </form>
      </motion.div>

      {/* Sign Out */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-5"
        style={{ borderColor: 'rgba(239,68,68,0.2)' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold">Sign Out</h3>
            <p className="text-slate-600 text-xs mt-0.5">You'll be redirected to the login page.</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => { logout(); toast.success('Signed out'); navigate('/login'); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 text-sm font-semibold transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <LogOut size={14} /> Sign Out
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
