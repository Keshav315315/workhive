import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in to your workspace</p>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="••••••••"
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

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full rounded-xl py-3 text-white font-semibold text-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Sign in <ArrowRight size={16} /></>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-green-600 hover:text-teal-600 font-medium transition-colors duration-200">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 glass rounded-xl p-3 text-center"
        >
          <p className="text-xs text-slate-500">
            Role-based access — Admin has full control, Members collaborate
          </p>
        </motion.div>
      </div>
    </div>
  );
}
