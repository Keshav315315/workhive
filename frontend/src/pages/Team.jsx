import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Shield, UserCheck, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16a34a,#0d9488)',
  'linear-gradient(135deg,#0d9488,#0284c7)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#16a34a,#f59e0b)',
  'linear-gradient(135deg,#ec4899,#f59e0b)',
];
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
const getGradient = (name = '') => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

export default function Team() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users')
      .then(res => setUsers(res.data))
      .catch(() => toast.error('Failed to load team'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500/25 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-slate-500 text-sm">{users.length} team member{users.length !== 1 ? 's' : ''}</p>
        <div className="relative w-full sm:w-64">
          <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search members..." className="input-glass w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
        </div>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Members', value: users.length, icon: Users, iconColor: 'text-green-600', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)' },
          { label: 'Admins', value: users.filter(u => u.role === 'admin').length, icon: Shield, iconColor: 'text-amber-500', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
          { label: 'Members', value: users.filter(u => u.role === 'member').length, icon: UserCheck, iconColor: 'text-teal-600', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.2)' },
        ].map(({ label, value, icon: Icon, iconColor, bg, border }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: bg, border: `1px solid ${border}` }}>
              <Icon size={17} className={iconColor} />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{value}</div>
              <div className="text-xs text-slate-400">{label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Members grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 glass-card rounded-2xl">
          <Users size={40} className="text-green-500/25 mb-3" />
          <p className="text-slate-500">No members found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member, i) => (
            <motion.div
              key={member._id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card card-shine card-hover rounded-2xl p-5 relative overflow-hidden"
            >
              {/* You badge */}
              {member._id === user._id && (
                <div className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' }}>
                  You
                </div>
              )}

              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-bold text-white flex-shrink-0 avatar-ring-sm"
                  style={{ background: getGradient(member.name) }}>
                  {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 truncate">{member.name}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {member.role === 'admin'
                      ? <Shield size={11} className="text-green-600" />
                      : <UserCheck size={11} className="text-teal-600" />
                    }
                    <span className={`text-xs capitalize ${member.role === 'admin' ? 'text-green-600' : 'text-teal-600'}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-3" style={{ borderTop: '1px solid rgba(22,163,74,0.08)' }}>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Mail size={11} className="text-slate-300 flex-shrink-0" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="text-xs text-slate-400">
                  Joined {format(new Date(member.createdAt), 'MMM d, yyyy')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
