import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, AlertTriangle, FolderKanban,
  TrendingUp, ArrowUpRight, Plus, Calendar, Users, Shield,
  UserCheck, BarChart3, Zap, FileText, CheckCircle2, Activity
} from 'lucide-react';
import { format, isBefore, formatDistanceToNow } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

/* ─── Avatar helpers ─────────────────────────────────────────── */
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#16a34a,#0d9488)',
  'linear-gradient(135deg,#0d9488,#0284c7)',
  'linear-gradient(135deg,#f59e0b,#ef4444)',
  'linear-gradient(135deg,#8b5cf6,#ec4899)',
  'linear-gradient(135deg,#16a34a,#f59e0b)',
];
const getGradient = (name = '') => AVATAR_GRADIENTS[name.charCodeAt(0) % AVATAR_GRADIENTS.length];
const getInitials = (name = '') => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

/* ─── StatCard ───────────────────────────────────────────────── */
const StatCard = ({ label, value, icon: Icon, iconColor, iconBg, accentHex, sub, delay = 0, to }) => {
  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -8, boxShadow: `0 20px 40px ${accentHex}25, 0 8px 16px rgba(0,0,0,0.08)` }}
      className="glass-card card-shine rounded-2xl p-5 cursor-pointer relative overflow-hidden"
      style={{ transition: 'all 0.2s ease', boxShadow: `0 4px 20px ${accentHex}12` }}
    >
      <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accentHex }} />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
            <Icon size={20} className={iconColor} />
          </div>
          <ArrowUpRight size={14} className="text-slate-300" />
        </div>
        <div className="text-3xl font-bold text-slate-900 mb-0.5">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
        {sub && <div className="text-xs mt-1 font-medium" style={{ color: accentHex }}>{sub}</div>}
      </div>
    </motion.div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

/* ─── Circular Progress ──────────────────────────────────────── */
const CircularProgress = ({ percentage }) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
      <defs>
        <linearGradient id="circGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#16a34a" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r={radius} fill="none" stroke="#bbf7d0" strokeWidth="12" />
      <motion.circle
        cx="70" cy="70" r={radius} fill="none"
        stroke="url(#circGrad)" strokeWidth="12" strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, delay: 0.5, ease: 'easeOut' }}
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="65" textAnchor="middle" dominantBaseline="middle"
        fontSize="22" fontWeight="700" fill="#0f172a">{percentage}%</text>
      <text x="70" y="85" textAnchor="middle" dominantBaseline="middle"
        fontSize="10" fill="#64748b">Complete</text>
    </svg>
  );
};

/* ─── ProgressBar ────────────────────────────────────────────── */
const ProgressBar = ({ done, total, delay = 0.5 }) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{done}/{total} done</span>
        <span className="text-xs font-bold gradient-text">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(22,163,74,0.1)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, delay, ease: 'easeOut' }}
          className="h-full progress-bar rounded-full"
        />
      </div>
    </div>
  );
};

/* ─── Panel ──────────────────────────────────────────────────── */
const Panel = ({ children, className = '' }) => (
  <div className={`glass-card rounded-2xl p-5 ${className}`}>{children}</div>
);

const PanelTitle = ({ icon: Icon, iconColor, children, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="text-slate-800 font-semibold flex items-center gap-2">
      <Icon size={16} className={iconColor} /> {children}
    </div>
    {action}
  </div>
);

const ViewAll = ({ to }) => (
  <Link to={to} className="text-xs text-green-600 hover:text-teal-600 flex items-center gap-1 transition-colors">
    View all <ArrowUpRight size={12} />
  </Link>
);

const EmptyState = ({ icon: Icon, text, sub }) => (
  <div className="text-center py-8">
    <Icon size={36} className="mx-auto mb-3 opacity-20 text-green-500" />
    <p className="text-slate-500 text-sm font-medium">{text}</p>
    {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
  </div>
);

/* ─── TaskItem ───────────────────────────────────────────────── */
const TaskItem = ({ task }) => {
  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== 'done';
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl task-priority-${task.priority}`}
      style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
    >
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        task.status === 'done' ? 'bg-teal-500' :
        task.status === 'in-progress' ? 'bg-green-500' :
        task.status === 'review' ? 'bg-amber-500' : 'bg-slate-300'
      }`} />
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-medium truncate ${task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
          {task.title}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
          <span className="truncate">{task.project?.name}</span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 flex-shrink-0 ${isOverdue ? 'text-red-500' : ''}`}>
              <Calendar size={9} />{format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 priority-${task.priority}`}>
        {task.priority}
      </span>
    </div>
  );
};

/* ─── ProjectCard ────────────────────────────────────────────── */
const ProjectCard = ({ project, index }) => {
  const colors = ['#16a34a', '#0d9488', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];
  const color = project.color || colors[index % colors.length];
  const doneTasks = project.taskCount?.done || 0;
  const totalTasks = project.taskCount?.total || 0;
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="glass-card card-shine rounded-2xl overflow-hidden cursor-pointer"
      style={{ transition: 'all 0.2s ease' }}
    >
      <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />
      <div className="p-4">
        <Link to={`/projects/${project._id}`}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
              <FolderKanban size={14} style={{ color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-slate-800 truncate">{project.name}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Users size={9} />{(project.members?.length || 0) + 1} members
              </div>
            </div>
            <span className={`text-xs px-1.5 py-0.5 rounded-full capitalize flex-shrink-0 ${
              project.status === 'active' ? 'status-in-progress' :
              project.status === 'on-hold' ? 'status-review' : 'status-done'
            }`}>{project.status}</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Progress</span><span className="font-medium" style={{ color }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${color}18` }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
};

/* ─── Admin Dashboard ─────────────────────────────────────────── */
function AdminDashboard({ user, stats, recentTasks, projects, onNewTask }) {
  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = user?.name?.split(' ')[0] || 'Admin';

  const activities = recentTasks.slice(0, 5).map(t => ({
    text: t.status === 'done'
      ? `${t.assignedTo?.name || 'Someone'} completed "${t.title}"`
      : t.assignedTo
        ? `"${t.title}" assigned to ${t.assignedTo.name}`
        : `New task added: "${t.title}"`,
    time: t.updatedAt || t.createdAt,
    done: t.status === 'done',
    priority: t.priority,
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── 1. WELCOME ──────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-3xl font-bold" style={{
            background: 'linear-gradient(135deg, #16a34a, #0d9488)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
          }}>
            Good {greeting}, {firstName} 👋
          </h2>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-slate-400 text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}>
              Admin
            </span>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          onClick={onNewTask}
          className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
          <Plus size={15} /> New Task
        </motion.button>
      </motion.div>

      {/* ── 2. FIVE STAT CARDS ──────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard label="Team Members" value={stats.totalUsers || 0} icon={Users}
          iconColor="text-green-600" iconBg="bg-green-500/10"
          accentHex="#16a34a" sub="View all →" to="/team" delay={0.05} />
        <StatCard label="Total Tasks" value={stats.total} icon={CheckSquare}
          iconColor="text-teal-600" iconBg="bg-teal-500/10"
          accentHex="#0d9488" sub={`${completionRate}% done`} to="/tasks" delay={0.1} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock}
          iconColor="text-amber-500" iconBg="bg-amber-500/10"
          accentHex="#f59e0b" sub="Active now" delay={0.15} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle}
          iconColor="text-red-500" iconBg="bg-red-500/10"
          accentHex="#ef4444" sub={stats.overdue > 0 ? 'Needs attention' : 'All on track'} delay={0.2} />
        <StatCard label="Completed" value={stats.done} icon={CheckCircle2}
          iconColor="text-emerald-600" iconBg="bg-emerald-500/10"
          accentHex="#10b981" sub="Tasks done" delay={0.25} />
      </div>

      {/* ── 3. QUICK ACTIONS ────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Panel>
          <PanelTitle icon={Zap} iconColor="text-amber-500">Quick Actions</PanelTitle>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: '+ Assign Task', icon: Plus, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', border: 'rgba(22,163,74,0.2)', action: onNewTask },
              { label: 'View All Tasks', icon: CheckSquare, color: '#0d9488', bg: 'rgba(13,148,136,0.08)', border: 'rgba(13,148,136,0.2)', to: '/tasks' },
              { label: 'Team Members', icon: Users, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', border: 'rgba(139,92,246,0.2)', to: '/team' },
              { label: 'Generate Report', icon: FileText, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', action: () => toast.success('Report feature coming soon!') },
            ].map(({ label, icon: Icon, color, bg, border, to, action }) => {
              const btn = (
                <motion.button
                  key={label}
                  whileHover={{ y: -3, boxShadow: `0 8px 20px ${color}20` }}
                  whileTap={{ scale: 0.97 }}
                  onClick={action}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl text-sm font-medium transition-all w-full"
                  style={{ background: bg, border: `1px solid ${border}`, color }}
                >
                  <Icon size={20} />
                  <span className="text-xs text-center leading-tight">{label}</span>
                </motion.button>
              );
              return to ? <Link key={label} to={to}>{btn}</Link> : <span key={label}>{btn}</span>;
            })}
          </div>
        </Panel>
      </motion.div>

      {/* ── 4. TEAM PROGRESS + ACTIVITY FEED ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Team Progress with circular chart */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Panel className="h-full">
            <PanelTitle icon={BarChart3} iconColor="text-green-600">Team Progress</PanelTitle>
            <div className="flex items-center gap-6">
              <CircularProgress percentage={completionRate} />
              <div className="flex-1 space-y-3">
                {[
                  { label: 'To Do',        value: stats.todo,              color: '#64748b', total: stats.total },
                  { label: 'In Progress',  value: stats.inProgress,        color: '#16a34a', total: stats.total },
                  { label: 'In Review',    value: stats.review || 0,       color: '#f59e0b', total: stats.total },
                  { label: 'Done',         value: stats.done,              color: '#0d9488', total: stats.total },
                ].map(({ label, value, color, total }) => {
                  const pct = total ? Math.round((value / total) * 100) : 0;
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ background: color }} />
                          {label}
                        </span>
                        <span className="font-semibold text-slate-700">{value}</span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ background: `${color}18` }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-1 text-xs text-slate-400">
                  {stats.total} total tasks · {stats.totalUsers || 0} members
                </div>
              </div>
            </div>
          </Panel>
        </motion.div>

        {/* Activity Feed */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Panel className="h-full">
            <PanelTitle icon={Activity} iconColor="text-teal-600">Recent Activity</PanelTitle>
            {activities.length === 0 ? (
              <EmptyState icon={Activity} text="No recent activity" sub="Activity will appear here as tasks are updated" />
            ) : (
              <div className="space-y-3">
                {activities.map((a, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.05 }}
                    className="flex items-start gap-3 p-3 rounded-xl"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`w-2 h-2 rounded-full ${a.done ? 'bg-teal-500' : 'bg-green-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{a.text}</p>
                      {a.time && (
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDistanceToNow(new Date(a.time), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded-md flex-shrink-0 priority-${a.priority}`}>
                      {a.priority}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </Panel>
        </motion.div>
      </div>

      {/* ── 5. MEMBER PERFORMANCE CARDS ─────────────────────────── */}
      {stats.userStats?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Panel>
            <PanelTitle icon={Users} iconColor="text-green-600">
              Member Performance
            </PanelTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {stats.userStats.map((u, i) => (
                <motion.div key={u._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(22,163,74,0.12)' }}
                  className="rounded-2xl p-4 cursor-pointer"
                  style={{
                    background: '#ffffff',
                    border: '1px solid #bbf7d0',
                    borderLeft: '4px solid #16a34a',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ background: getGradient(u.name) }}>
                      {getInitials(u.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-slate-800 truncate">{u.name}</div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(22,163,74,0.08)', color: '#16a34a' }}>
                          member
                        </span>
                        {u.overdue > 0 && (
                          <span className="text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}>
                            {u.overdue} overdue
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg font-bold gradient-text">
                        {u.total ? Math.round((u.done / u.total) * 100) : 0}%
                      </div>
                      <div className="text-xs text-slate-400">{u.done}/{u.total}</div>
                    </div>
                  </div>
                  <ProgressBar done={u.done} total={u.total} delay={0.1 + i * 0.05} />
                </motion.div>
              ))}
            </div>
          </Panel>
        </motion.div>
      )}

      {/* ── 6. RECENT TASKS + ALL PROJECTS ──────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
          <Panel>
            <PanelTitle icon={CheckSquare} iconColor="text-green-600" action={<ViewAll to="/tasks" />}>
              Recent Tasks
            </PanelTitle>
            {recentTasks.length === 0
              ? <EmptyState icon={CheckSquare} text="No tasks yet." sub="Create your first task to get started." />
              : <div className="space-y-2">{recentTasks.map(t => <TaskItem key={t._id} task={t} />)}</div>
            }
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 }}>
          <Panel>
            <PanelTitle icon={FolderKanban} iconColor="text-amber-500" action={<ViewAll to="/projects" />}>
              All Projects
            </PanelTitle>
            {projects.length === 0
              ? <EmptyState icon={FolderKanban} text="No projects yet." />
              : <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {projects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
                </div>
            }
          </Panel>
        </motion.div>
      </div>

    </div>
  );
}

/* ─── Member Dashboard ────────────────────────────────────────── */
function MemberDashboard({ user, stats, recentTasks, projects }) {
  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            Good {greeting},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> ⚡
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} •{' '}
            {stats.overdue > 0
              ? <span className="text-red-500">{stats.overdue} overdue task{stats.overdue !== 1 ? 's' : ''}</span>
              : 'All tasks on track'}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value={stats.total} icon={UserCheck}
          iconColor="text-green-600" iconBg="bg-green-500/10"
          accentHex="#16a34a" delay={0.05} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock}
          iconColor="text-amber-500" iconBg="bg-amber-500/10"
          accentHex="#f59e0b" delay={0.1} />
        <StatCard label="Completed" value={stats.done} icon={TrendingUp}
          iconColor="text-teal-600" iconBg="bg-teal-500/10"
          accentHex="#0d9488" delay={0.15} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle}
          iconColor="text-red-500" iconBg="bg-red-500/10"
          accentHex="#ef4444" delay={0.2} />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Panel>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-slate-800 font-semibold">My Progress</div>
              <div className="text-slate-400 text-xs mt-0.5">{stats.done} of {stats.total} tasks completed</div>
            </div>
            <div className="text-2xl font-bold gradient-text">{completionRate}%</div>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(22,163,74,0.1)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
              className="h-full progress-bar rounded-full" />
          </div>
          <div className="flex gap-4 mt-3 flex-wrap">
            {[
              { label: 'To Do', value: stats.todo, color: '#64748b' },
              { label: 'In Progress', value: stats.inProgress, color: '#16a34a' },
              { label: 'Review', value: stats.review || 0, color: '#f59e0b' },
              { label: 'Done', value: stats.done, color: '#0d9488' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}: <span className="text-slate-700 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Panel>
            <PanelTitle icon={CheckSquare} iconColor="text-green-600" action={<ViewAll to="/tasks" />}>
              My Recent Tasks
            </PanelTitle>
            {recentTasks.length === 0
              ? <EmptyState icon={CheckSquare} text="No tasks assigned to you yet." />
              : <div className="space-y-2">{recentTasks.map(t => <TaskItem key={t._id} task={t} />)}</div>
            }
          </Panel>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Panel>
            <PanelTitle icon={FolderKanban} iconColor="text-amber-500" action={<ViewAll to="/projects" />}>
              My Projects
            </PanelTitle>
            {projects.length === 0
              ? <EmptyState icon={FolderKanban} text="You're not in any projects yet." />
              : <div className="grid grid-cols-2 gap-3">
                  {projects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
                </div>
            }
          </Panel>
        </motion.div>
      </div>
    </div>
  );
}

/* ─── Main ────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, todo: 0, inProgress: 0, review: 0, done: 0, overdue: 0, critical: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          api.get('/tasks/dashboard/stats'),
          api.get('/tasks'),
          api.get('/projects')
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data.slice(0, 6));
        setProjects(projectsRes.data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500/25 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  if (user?.role === 'admin') {
    return (
      <AdminDashboard
        user={user}
        stats={stats}
        recentTasks={recentTasks}
        projects={projects}
        onNewTask={() => window.location.href = '/tasks'}
      />
    );
  }
  return <MemberDashboard user={user} stats={stats} recentTasks={recentTasks} projects={projects} />;
}
