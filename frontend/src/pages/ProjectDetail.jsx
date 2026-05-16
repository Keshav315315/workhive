import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, CheckSquare,
  Clock, AlertCircle, CheckCircle2, X, Loader, Users
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const STATUS_COLS = [
  { id: 'todo',        label: 'To Do',      icon: CheckSquare,  color: '#64748b', bg: 'rgba(100,116,139,0.15)' },
  { id: 'in-progress', label: 'In Progress', icon: Clock,        color: '#6366f1', bg: 'rgba(99,102,241,0.15)'  },
  { id: 'review',      label: 'Review',      icon: AlertCircle,  color: '#f59e0b', bg: 'rgba(245,158,11,0.15)'  },
  { id: 'done',        label: 'Done',        icon: CheckCircle2, color: '#10b981', bg: 'rgba(16,185,129,0.15)'  },
];

const PRIORITY_COLORS = {
  low:      { text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  medium:   { text: 'text-amber-400',   bg: 'bg-amber-400/10'   },
  high:     { text: 'text-orange-400',  bg: 'bg-orange-400/10'  },
  critical: { text: 'text-red-400',     bg: 'bg-red-400/10'     },
};

/* ─── Task Card ──────────────────────────────────────────────── */
function TaskCard({ task, onDelete, onStatusChange, isAdmin, currentUserId }) {
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const pc = PRIORITY_COLORS[task.priority] || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={`rounded-xl p-3 group card-shine cursor-pointer task-priority-${task.priority}`}
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(99,102,241,0.1)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`text-sm font-medium flex-1 leading-snug ${task.status === 'done' ? 'line-through text-slate-600' : 'text-white'}`}>
          {task.title}
        </p>
        {isAdmin && (
          <button onClick={() => onDelete(task._id)}
            className="opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400 transition-all flex-shrink-0 w-5 h-5 flex items-center justify-center rounded">
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {task.description && (
        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{task.description}</p>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${pc.text} ${pc.bg}`}>
          {task.priority}
        </span>
        {task.dueDate && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-600'}`}>
            <Clock size={10} />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
        {task.assignedTo && (
          <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#6366f1,#f59e0b)' }}>
            {task.assignedTo.name?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      {(isAdmin || task.assignedTo?._id === currentUserId) && (
        <select
          value={task.status}
          onChange={e => onStatusChange(task._id, e.target.value)}
          onClick={e => e.stopPropagation()}
          className="mt-2.5 w-full text-xs input-glass rounded-lg px-2 py-1.5"
          style={{ background: '#0f0f1a' }}
        >
          {STATUS_COLS.map(s => <option key={s.id} value={s.id} style={{ background: '#0f0f1a' }}>{s.label}</option>)}
        </select>
      )}
    </motion.div>
  );
}

/* ─── Add Task Modal ─────────────────────────────────────────── */
function AddTaskModal({ projectId, users, onClose, onAdd }) {
  const [form, setForm] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', assignedTo: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/tasks', { ...form, project: projectId, assignedTo: form.assignedTo || undefined });
      onAdd(res.data);
      onClose();
      toast.success('Task created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSaving(false);
    }
  };

  const labelCls = 'block text-xs font-medium text-slate-500 uppercase tracking-widest mb-1.5';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md"
        style={{ boxShadow: '0 0 60px rgba(99,102,241,0.2), 0 20px 40px rgba(0,0,0,0.5)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white">Add Task</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-white hover:bg-white/5 transition-all">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Title *</label>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="Task title..." required className="input-glass w-full rounded-xl px-4 py-2.5 text-sm" />
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Task description..." rows={2} className="input-glass w-full rounded-xl px-4 py-2.5 text-sm resize-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Priority</label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}
                className="input-glass w-full rounded-xl px-3 py-2.5 text-sm">
                {['low','medium','high','critical'].map(p => (
                  <option key={p} value={p} style={{ background: '#0f0f1a' }} className="capitalize">{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                className="input-glass w-full rounded-xl px-3 py-2.5 text-sm">
                {STATUS_COLS.map(s => <option key={s.id} value={s.id} style={{ background: '#0f0f1a' }}>{s.label}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                className="input-glass w-full rounded-xl px-3 py-2.5 text-sm" style={{ colorScheme: 'dark' }} />
            </div>
            <div>
              <label className={labelCls}>Assign To</label>
              <select value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                className="input-glass w-full rounded-xl px-3 py-2.5 text-sm">
                <option value="" style={{ background: '#0f0f1a' }}>Unassigned</option>
                {users.map(u => <option key={u._id} value={u._id} style={{ background: '#0f0f1a' }}>{u.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-slate-400 text-sm hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2">
              {saving ? <Loader size={14} className="animate-spin" /> : <><Plus size={14} /> Add Task</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Project Detail ─────────────────────────────────────────── */
export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, tRes, uRes] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?project=${id}`),
          api.get('/users')
        ]);
        setProject(pRes.data);
        setTasks(tRes.data);
        setUsers(uRes.data);
      } catch {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(prev => prev.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch { toast.error('Failed to delete task'); }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.patch(`/tasks/${taskId}`, { status: newStatus });
      setTasks(prev => prev.map(t => t._id === taskId ? res.data : t));
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-indigo-500/25 border-t-indigo-500 rounded-full animate-spin" />
    </div>
  );

  if (!project) return null;

  const tasksByStatus = STATUS_COLS.reduce((acc, col) => {
    acc[col.id] = tasks.filter(t => t.status === col.id);
    return acc;
  }, {});

  const projectColor = project.color || '#6366f1';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/projects">
          <motion.button whileHover={{ x: -2 }}
            className="mt-1 text-slate-600 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </motion.button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <div className="w-4 h-4 rounded-full" style={{ background: projectColor }} />
            <h1 className="text-2xl font-bold text-white">{project.name}</h1>
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              project.status === 'active' ? 'status-in-progress' :
              project.status === 'on-hold' ? 'status-review' : 'status-done'
            }`}>{project.status}</span>
          </div>
          {project.description && <p className="text-slate-500 text-sm">{project.description}</p>}
          <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center gap-1"><Users size={11} /> {(project.members?.length || 0) + 1} members</span>
            {project.deadline && <span>Due {format(new Date(project.deadline), 'MMM d, yyyy')}</span>}
            <span>{tasks.length} tasks · {tasks.filter(t => t.status === 'done').length} done</span>
          </div>
        </div>
        {user?.role === 'admin' && (
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddTask(true)}
            className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2"
          >
            <Plus size={15} /> Add Task
          </motion.button>
        )}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUS_COLS.map(({ id: colId, label, icon: Icon, color, bg }) => (
          <div key={colId} className="min-w-0">
            <div className="glass-card rounded-2xl p-4">
              {/* Column header */}
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}>
                  <Icon size={14} style={{ color }} />
                </div>
                <span className="text-sm font-semibold text-white">{label}</span>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: bg, color }}>
                  {tasksByStatus[colId]?.length || 0}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-2 min-h-[80px]">
                <AnimatePresence mode="popLayout">
                  {tasksByStatus[colId]?.map(task => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onStatusChange={handleStatusChange}
                      isAdmin={user?.role === 'admin'}
                      currentUserId={user?._id || user?.id}
                    />
                  ))}
                </AnimatePresence>
                {tasksByStatus[colId]?.length === 0 && (
                  <div className="text-center py-6 text-slate-700 text-xs">
                    No {label.toLowerCase()} tasks
                  </div>
                )}
              </div>

              {user?.role === 'admin' && (
                <button
                  onClick={() => setShowAddTask(true)}
                  className="mt-3 w-full py-2 text-xs text-slate-700 hover:text-slate-400 flex items-center justify-center gap-1 rounded-xl hover:bg-white/5 transition-all"
                >
                  <Plus size={11} /> Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAddTask && user?.role === 'admin' && (
          <AddTaskModal
            projectId={id}
            users={users}
            onClose={() => setShowAddTask(false)}
            onAdd={task => setTasks(prev => [task, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
