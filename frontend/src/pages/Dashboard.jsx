import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckSquare, Clock, AlertTriangle, FolderKanban,
  TrendingUp, ArrowUpRight, Plus, Calendar, Users, Shield,
  UserCheck, BarChart3
} from 'lucide-react';
import { format, isBefore } from 'date-fns';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

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
const StatCard = ({ label, value, icon: Icon, iconColor, iconBg, glowClass, accentHex, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    whileHover={{ y: -8 }}
    className={`glass-card card-shine rounded-2xl p-5 cursor-default relative overflow-hidden ${glowClass}`}
    style={{ transition: 'all 0.2s ease' }}
  >
    {/* Bottom accent line */}
    <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-80" style={{ background: accentHex }} />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon size={20} className={iconColor} />
        </div>
        <ArrowUpRight size={14} className="text-slate-300" />
      </div>
      <div className="text-3xl font-bold text-slate-900 mb-0.5">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  </motion.div>
);

/* ─── TaskItem ───────────────────────────────────────────────── */
const TaskItem = ({ task }) => {
  const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date()) && task.status !== 'done';
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer task-priority-${task.priority}`}
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
        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="truncate">{task.project?.name}</span>
          {task.assignedTo && <span className="text-slate-300">→ {task.assignedTo.name}</span>}
          {task.dueDate && (
            <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500' : ''}`}>
              <Calendar size={10} />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>
      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 priority-${task.priority}`}>
        {task.priority}
      </span>
    </motion.div>
  );
};

/* ─── ProjectCard ────────────────────────────────────────────── */
const ProjectCard = ({ project, index }) => {
  const colors = ['#16a34a', '#0d9488', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6'];
  const color = project.color || colors[index % colors.length];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -4 }}
      className="card-shine glass-card rounded-2xl p-4 cursor-pointer relative overflow-hidden"
      style={{ transition: 'all 0.2s ease' }}
    >
      <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <Link to={`/projects/${project._id}`} className="block">
        <div className="flex items-start gap-3 mt-1">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
            <FolderKanban size={14} style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-slate-800 truncate">{project.name}</div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              <span>{(project.members?.length || 0) + 1} members</span>
              <span>•</span>
              <span className={`capitalize ${
                project.status === 'active' ? 'text-green-600' :
                project.status === 'on-hold' ? 'text-amber-600' : 'text-teal-600'
              }`}>{project.status}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ─── ProgressBar ────────────────────────────────────────────── */
const ProgressBar = ({ done, total, delay = 0.5 }) => {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
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

/* ─── Panel wrapper ──────────────────────────────────────────── */
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

const EmptyState = ({ icon: Icon, text, sub, action }) => (
  <div className="text-center py-8">
    <Icon size={36} className="mx-auto mb-3 opacity-20 text-green-500" />
    <p className="text-slate-500 text-sm font-medium">{text}</p>
    {sub && <p className="text-slate-400 text-xs mt-1">{sub}</p>}
    {action}
  </div>
);

/* ─── Loading spinner ─────────────────────────────────────────── */
const Spinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-green-500/25 border-t-green-500 rounded-full animate-spin" />
  </div>
);

/* ─── Admin Dashboard ─────────────────────────────────────────── */
function AdminDashboard({ user, stats, recentTasks, projects }) {
  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Shield size={20} className="text-green-600" /> Admin Dashboard
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')} • {stats.totalUsers || 0} team members
          </p>
        </div>
        <Link to="/tasks/new">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2">
            <Plus size={15} /> New Task
          </motion.button>
        </Link>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Team Members" value={stats.totalUsers || 0} icon={Users}
          iconColor="text-green-600" iconBg="bg-green-500/10"
          glowClass="stat-glow-indigo" accentHex="#16a34a" delay={0.05} />
        <StatCard label="Total Tasks" value={stats.total} icon={CheckSquare}
          iconColor="text-green-500" iconBg="bg-green-500/08"
          glowClass="stat-glow-indigo" accentHex="#16a34a" delay={0.1} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock}
          iconColor="text-amber-500" iconBg="bg-amber-500/10"
          glowClass="stat-glow-amber" accentHex="#f59e0b" delay={0.15} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle}
          iconColor="text-red-500" iconBg="bg-red-500/10"
          glowClass="stat-glow-red" accentHex="#ef4444" delay={0.2} />
      </div>

      {/* Team progress */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Panel>
          <PanelTitle icon={BarChart3} iconColor="text-green-600">Team Progress</PanelTitle>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <p className="text-slate-400 text-xs mb-2">{stats.done} of {stats.total} tasks completed across all members</p>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(22,163,74,0.1)' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${completionRate}%` }}
                  transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                  className="h-full progress-bar rounded-full" />
              </div>
            </div>
            <div className="text-2xl font-bold gradient-text flex-shrink-0">{completionRate}%</div>
          </div>
          <div className="flex gap-4 flex-wrap mt-3">
            {[
              { label: 'To Do', value: stats.todo, color: '#64748b' },
              { label: 'In Progress', value: stats.inProgress, color: '#16a34a' },
              { label: 'Review', value: stats.review || 0, color: '#f59e0b' },
              { label: 'Done', value: stats.done, color: '#0d9488' },
              { label: 'Critical', value: stats.critical, color: '#ef4444' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                {label}: <span className="text-slate-700 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </Panel>
      </motion.div>

      {/* Member performance */}
      {stats.userStats?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Panel>
            <PanelTitle icon={Users} iconColor="text-green-600">Member Performance</PanelTitle>
            <div className="space-y-3">
              {stats.userStats.map((u, i) => (
                <motion.div key={u._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.1)' }}
                >
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ background: getGradient(u.name) }}>
                    {getInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-800 truncate mb-1">{u.name}</div>
                    <ProgressBar done={u.done} total={u.total} delay={0.1 + i * 0.05} />
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400 flex-shrink-0 text-right">
                    <div><span className="text-slate-700 font-semibold">{u.total}</span><br />total</div>
                    <div><span className="text-teal-600 font-semibold">{u.done}</span><br />done</div>
                    {u.overdue > 0 && <div><span className="text-red-500 font-semibold">{u.overdue}</span><br />overdue</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </Panel>
        </motion.div>
      )}

      {/* Recent tasks + Projects */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
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

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Panel>
            <PanelTitle icon={FolderKanban} iconColor="text-amber-500" action={<ViewAll to="/projects" />}>
              All Projects
            </PanelTitle>
            {projects.length === 0
              ? <EmptyState icon={FolderKanban} text="No projects yet." />
              : <div className="grid grid-cols-2 gap-3">{projects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}</div>
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
      {/* Welcome */}
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

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="My Tasks" value={stats.total} icon={UserCheck}
          iconColor="text-green-600" iconBg="bg-green-500/10"
          glowClass="stat-glow-indigo" accentHex="#16a34a" delay={0.05} />
        <StatCard label="In Progress" value={stats.inProgress} icon={Clock}
          iconColor="text-amber-500" iconBg="bg-amber-500/10"
          glowClass="stat-glow-amber" accentHex="#f59e0b" delay={0.1} />
        <StatCard label="Completed" value={stats.done} icon={TrendingUp}
          iconColor="text-teal-600" iconBg="bg-teal-500/10"
          glowClass="stat-glow-emerald" accentHex="#0d9488" delay={0.15} />
        <StatCard label="Overdue" value={stats.overdue} icon={AlertTriangle}
          iconColor="text-red-500" iconBg="bg-red-500/10"
          glowClass="stat-glow-red" accentHex="#ef4444" delay={0.2} />
      </div>

      {/* Progress */}
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

      {/* Bottom grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Panel>
            <PanelTitle icon={CheckSquare} iconColor="text-green-600" action={<ViewAll to="/tasks" />}>
              My Recent Tasks
            </PanelTitle>
            {recentTasks.length === 0
              ? <EmptyState icon={CheckSquare} text="No tasks assigned to you yet." action={
                  <Link to="/tasks/new"><button className="mt-3 text-xs text-green-600 hover:text-teal-600 transition-colors">+ Add task</button></Link>
                } />
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
              ? <EmptyState icon={FolderKanban} text="You're not in any projects yet." action={
                  <Link to="/projects"><button className="mt-3 text-xs text-green-600 hover:text-teal-600 transition-colors">+ New project</button></Link>
                } />
              : <div className="grid grid-cols-2 gap-3">{projects.map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}</div>
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
        setProjects(projectsRes.data.slice(0, 4));
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
    return <AdminDashboard user={user} stats={stats} recentTasks={recentTasks} projects={projects} />;
  }
  return <MemberDashboard user={user} stats={stats} recentTasks={recentTasks} projects={projects} />;
}
