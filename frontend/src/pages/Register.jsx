import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, Shield, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      toast.success('Account created! Welcome aboard!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: '#f0fdf4' }}>
      {/* Animated CSS blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-overlay pointer-events-none" />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 mb-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl pulse-glow"
              style={{ background: 'linear-gradient(135deg, #16a34a, #0d9488)' }}
            >
              ⚡
            </div>
            <span className="text-3xl font-bold gradient-text">NexTask</span>
          </div>
          <p className="text-slate-500 text-sm tracking-wide">Next Level Productivity</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="glass-card rounded-2xl p-8 relative"
          style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.12), 0 10px 25px rgba(22,163,74,0.1)' }}
        >
          <div className="relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
            <p className="text-slate-500 text-sm mb-6">Join your team on NexTask</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Full Name</label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="John Doe"
                    required
                    className="input-glass w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    required
                    className="input-glass w-full rounded-xl pl-10 pr-4 py-3 text-sm"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 6 characters"
                    required
                    className="input-glass w-full rounded-xl pl-10 pr-10 py-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-widest">Role</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'admin', label: 'Admin', icon: Shield, desc: 'Full control' },
                    { value: 'member', label: 'Member', icon: Users, desc: 'Collaborate' }
                  ].map(({ value, label, icon: Icon, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, role: value })}
                      className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                        form.role === value
                          ? 'border-green-500 text-slate-900'
                          : 'border-green-100 text-slate-500 hover:border-green-300'
                      }`}
                      style={form.role === value ? {
                        background: 'rgba(22,163,74,0.08)',
                        boxShadow: '0 0 15px rgba(22,163,74,0.12)'
                      } : { background: '#f8fafc' }}
                    >
                      <Icon size={15} className="mb-1 text-green-600" />
                      <div className="text-xs font-semibold">{label}</div>
                      <div className="text-xs opacity-50">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full rounded-xl py-3 text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Create account <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-green-600 hover:text-teal-600 font-medium transition-colors duration-200">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
