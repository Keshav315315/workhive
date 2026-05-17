import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, Plus, Search, Users, Calendar, Trash2,
  ChevronRight, X, Loader
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const PROJECT_COLORS = ['#16a34a','#0d9488','#f59e0b','#ec4899','#8b5cf6','#ef4444','#0284c7','#84cc16'];

/* ─── Project Modal ──────────────────────────────────────────── */
function ProjectModal({ onClose, onSave, users }) {
  const [form, setForm] = useState({ name: '', description: '', color: '#16a34a', deadline: '', members: [] });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Project name required');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const labelCls = 'block text-xs font-medium text-slate-500 uppercase tracking-widest mb-2';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
        className="glass-card rounded-2xl p-6 w-full max-w-md"
        style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.15), 0 0 40px rgba(22,163,74,0.1)' }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-900">New Project</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>Project Name *</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="My Awesome Project" className="input-glass w-full rounded-xl px-4 py-3 text-sm" required />
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Brief project description..." rows={3}
              className="input-glass w-full rounded-xl px-4 py-3 text-sm resize-none" />
          </div>

          <div>
            <label className={labelCls}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {PROJECT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                  className="w-8 h-8 rounded-lg transition-all"
                  style={{
                    background: c,
                    outline: form.color === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '3px',
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>

          <div>
            <label className={labelCls}>Deadline</label>
            <input type="date" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })}
              className="input-glass w-full rounded-xl px-4 py-3 text-sm" />
          </div>

          {users.length > 0 && (
            <div>
              <label className={labelCls}>Add Members</label>
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {users.map(u => (
                  <label key={u._id}
                    className="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all hover:bg-green-50"
                    style={{ background: 'rgba(22,163,74,0.04)', border: '1px solid rgba(22,163,74,0.1)' }}
                  >
                    <input type="checkbox" checked={form.members.includes(u._id)}
                      onChange={e => setForm({
                        ...form,
                        members: e.target.checked
                          ? [...form.members, u._id]
                          : form.members.filter(id => id !== u._id)
                      })}
                      className="accent-green-600"
                    />
                    <span className="text-sm text-slate-700">{u.name}</span>
                    <span className="text-xs text-slate-400 capitalize ml-auto">{u.role}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-slate-500 text-sm hover:text-slate-700 transition-all"
              style={{ background: '#f8fafc', border: '1px solid #bbf7d0' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="btn-primary flex-1 py-2.5 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2">
              {saving ? <Loader size={14} className="animate-spin" /> : <><Plus size={14} /> Create</>}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─── Projects Page ──────────────────────────────────────────── */
export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const [pRes, uRes] = await Promise.all([api.get('/projects'), api.get('/users')]);
        setProjects(pRes.data);
        setUsers(uRes.data.filter(u2 => u2._id !== user._id));
      } catch { toast.error('Failed to load projects'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCreate = async (form) => {
    try {
      const res = await api.post('/projects', form);
      setProjects(prev => [res.data, ...prev]);
      toast.success('Project created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
      throw err;
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Failed to delete project'); }
  };

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-green-500/25 border-t-green-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <p className="text-slate-500 text-sm">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..." className="input-glass w-full rounded-xl pl-9 pr-4 py-2.5 text-sm" />
          </div>
          {user?.role === 'admin' && (
            <motion.button
              whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => setShowModal(true)}
              className="btn-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={15} /> New Project
            </motion.button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-64 glass-card rounded-2xl">
          <FolderKanban size={44} className="text-green-500/30 mb-4" />
          <p className="text-slate-500 font-medium">
            {search ? 'No projects match your search' : 'No projects yet'}
          </p>
          <p className="text-slate-400 text-sm mt-1">
            {!search && 'Create your first project to get started'}
          </p>
          {!search && user?.role === 'admin' && (
            <button onClick={() => setShowModal(true)}
              className="mt-4 text-sm text-green-600 hover:text-teal-600 transition-colors">
              + Create project
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((project, i) => {
            const color = project.color || '#16a34a';
            return (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="glass-card card-shine rounded-2xl overflow-hidden group relative card-hover"
                style={{ boxShadow: `0 4px 20px ${color}18, 0 1px 4px rgba(0,0,0,0.05)` }}
              >
                {/* Gradient top accent */}
                <div className="h-1" style={{ background: `linear-gradient(90deg, ${color}, ${color}60, transparent)` }} />

                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${color}18`, border: `1px solid ${color}35` }}>
                      <FolderKanban size={18} style={{ color }} />
                    </div>
                    {project.owner._id === user._id && (
                      <button
                        onClick={e => handleDelete(project._id, e)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <Link to={`/projects/${project._id}`}>
                    <h3 className="text-slate-900 font-semibold text-base mb-1 hover:text-green-700 transition-colors truncate">
                      {project.name}
                    </h3>
                  </Link>
                  {project.description && (
                    <p className="text-slate-400 text-xs line-clamp-2 mb-3">{project.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-3">
                    <div className="flex items-center gap-1">
                      <Users size={11} />
                      <span>{(project.members?.length || 0) + 1} members</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1">
                        <Calendar size={11} />
                        <span>{format(new Date(project.deadline), 'MMM d')}</span>
                      </div>
                    )}
                    <div className={`ml-auto px-2 py-0.5 rounded-full text-xs capitalize ${
                      project.status === 'active' ? 'status-in-progress' :
                      project.status === 'on-hold' ? 'status-review' : 'status-done'
                    }`}>
                      {project.status}
                    </div>
                  </div>

                  <Link to={`/projects/${project._id}`}>
                    <div className="mt-4 pt-3 flex items-center text-xs font-medium transition-colors"
                      style={{ borderTop: '1px solid rgba(22,163,74,0.1)', color }}>
                      View project <ChevronRight size={13} className="ml-auto" />
                    </div>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {showModal && user?.role === 'admin' && (
          <ProjectModal onClose={() => setShowModal(false)} onSave={handleCreate} users={users} />
        )}
      </AnimatePresence>
    </div>
  );
}
