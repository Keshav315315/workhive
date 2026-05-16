import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FolderKanban, CheckSquare, Users,
  LogOut, Menu, X, ChevronRight, Bell, Shield, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const getNavItems = (role) => [
  { path: '/dashboard', icon: LayoutDashboard, label: role === 'admin' ? 'Admin Dashboard' : 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Projects' },
  { path: '/tasks', icon: CheckSquare, label: 'My Tasks' },
  { path: '/team', icon: Users, label: 'Team' },
];

const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#6366f1,#f59e0b)',
  'linear-gradient(135deg,#ec4899,#f43f5e)',
  'linear-gradient(135deg,#10b981,#14b8a6)',
  'linear-gradient(135deg,#f59e0b,#f97316)',
  'linear-gradient(135deg,#38bdf8,#3b82f6)',
];
const getAvatarGrad = (name = '') => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const navItems = getNavItems(user?.role);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const currentNav = navItems.find(n =>
    location.pathname === n.path || (n.path !== '/dashboard' && location.pathname.startsWith(n.path))
  );
  const pageTitle = location.pathname === '/profile' ? 'Profile' : (currentNav?.label || 'WorkHive');

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#050508' }}>
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-20 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ x: sidebarOpen ? 0 : '-100%' }}
        className="fixed lg:relative lg:translate-x-0 z-30 h-full flex flex-col"
        style={{
          width: '260px',
          minWidth: '260px',
          background: '#0a0a16',
          borderRight: '1px solid rgba(99,102,241,0.15)',
          transition: 'transform 0.3s ease',
          boxShadow: '4px 0 30px rgba(0,0,0,0.4)'
        }}
      >
        {/* Logo */}
        <div className="p-5 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(99,102,241,0.12)' }}>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 pulse-glow"
            style={{ background: 'linear-gradient(135deg, #6366f1, #f59e0b)' }}
          >
            🐝
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-lg font-bold gradient-text leading-tight">WorkHive</div>
            <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
              {user?.role === 'admin' && <Shield size={10} className="text-indigo-400" />}
              <span className="capitalize">{user?.role}</span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-600 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          <div className="text-xs text-slate-700 uppercase tracking-widest font-medium mb-3 px-3 pt-1">Navigation</div>
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
            return (
              <Link key={path} to={path} onClick={() => setSidebarOpen(false)}>
                <motion.div
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                  className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active ? 'active text-indigo-300' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                    active ? 'bg-indigo-500/20' : 'bg-white/5'
                  }`}>
                    <Icon size={16} className={active ? 'text-indigo-400' : 'text-slate-500'} />
                  </div>
                  <span>{label}</span>
                  {active && <ChevronRight size={14} className="ml-auto text-indigo-500 opacity-70" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User card */}
        <div className="p-3" style={{ borderTop: '1px solid rgba(99,102,241,0.12)' }}>
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)' }}
          >
            <Link to="/profile" onClick={() => setSidebarOpen(false)}>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0 cursor-pointer hover:scale-105 transition-transform avatar-ring-sm"
                style={{ background: getAvatarGrad(user?.name) }}
              >
                {getInitials(user?.name)}
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-white truncate">{user?.name}</div>
              <div className="text-xs text-slate-600 capitalize">{user?.role}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">

        {/* TOPBAR */}
        <header
          className="flex items-center gap-4 px-6 py-3.5 flex-shrink-0"
          style={{
            background: 'rgba(10,10,20,0.85)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(99,102,241,0.12)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-slate-500 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Page title */}
          <div className="flex-1">
            <div className="text-slate-600 text-xs capitalize">
              {location.pathname === '/profile' ? 'Account' : (currentNav?.label || 'WorkHive')}
            </div>
            <h1 className="text-white font-semibold text-base leading-tight">{pageTitle}</h1>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Search bar */}
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', width: '180px' }}
            >
              <Search size={13} />
              <span className="text-xs">Search...</span>
            </div>

            {/* Bell */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-colors"
              style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              <Bell size={15} />
            </motion.button>

            {/* Avatar */}
            <Link to="/profile">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View profile"
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-all ${
                  location.pathname === '/profile' ? 'avatar-ring' : 'avatar-ring-sm'
                }`}
                style={{ background: getAvatarGrad(user?.name) }}
              >
                {getInitials(user?.name)}
              </motion.div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
