import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Save, CheckCircle2, ShieldCheck, Mail, User, Briefcase, FileText, Loader2 } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const ProfileModal = ({ isOpen, onClose }) => {
  const { user, refreshUser } = useAuth();
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    professionalFocus: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setFetching(true);
        try {
          const freshUser = await refreshUser();
          if (freshUser) {
            setFormData({
              name: freshUser.name || '',
              professionalFocus: freshUser.professionalFocus || '',
              bio: freshUser.bio || ''
            });
          }
        } catch (err) {
          console.error('Fetch failed', err);
        } finally {
          setFetching(false);
        }
      };
      
      fetchData();
      setStatus({ type: '', message: '' });
    }
  }, [isOpen]);

  const handleSave = async () => {
    setLoading(true);
    setStatus({ type: '', message: '' });
    try {
      await api.patch('/users/profile', formData);
      await refreshUser();
      setStatus({ type: 'success', message: 'Identity Protocol Synchronized' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Update failed', err);
      setStatus({ type: 'error', message: 'Protocol synchronization failure' });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.match('image.*')) {
      setStatus({ type: 'error', message: 'Invalid file type. Only images allowed.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', message: 'File too large. Max 2MB allowed.' });
      return;
    }

    setUploading(true);
    setStatus({ type: '', message: '' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
      setStatus({ type: 'success', message: 'Avatar Protocol Updated' });
    } catch (err) {
      console.error('Upload failed', err);
      setStatus({ type: 'error', message: 'Avatar upload failure' });
    } finally {
      setUploading(false);
    }
  };

  const focusOptions = [
    "Software Architecture",
    "Data Science",
    "UX/UI Design",
    "Product Management",
    "Cybersecurity",
    "Blockchain Development",
    "AI/ML Engineering",
    "Quantum Computing",
    "DevOps & SRE"
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-bg-page/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-bg-card border border-border-subtle rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header Area */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <h2 className="text-2xl font-black text-text-main tracking-tight">Identity Protocol</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={loading}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all
                  ${loading 
                    ? 'bg-surface-hover text-text-muted cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'}
                `}
              >
                {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                {loading ? 'Processing...' : 'Save Changes'}
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-full text-text-sub transition-colors"
                disabled={loading}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="px-8 pb-10 space-y-8 relative">
            {fetching && (
              <div className="absolute inset-0 bg-bg-card/60 backdrop-blur-[2px] z-[1010] flex items-center justify-center rounded-b-3xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                  <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Authenticating Protocol...</span>
                </div>
              </div>
            )}
            {/* Status Toast */}
            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-center text-[10px] font-black uppercase tracking-[0.2em] border ${
                  status.type === 'success' ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'
                }`}
              >
                {status.message}
              </motion.div>
            )}

            {/* Profile Hero Section */}
            <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
              {/* Avatar Area */}
              <div className="relative group">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                  accept="image/*"
                />
                <div className="w-32 h-32 rounded-3xl bg-surface border border-border-subtle flex items-center justify-center overflow-hidden shadow-inner relative">
                  {user?.picture ? (
                    <img src={user.picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-black text-primary opacity-40">{user?.name ? user.name[0].toUpperCase() : 'U'}</span>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                      <Loader2 className="text-white animate-spin" size={24} />
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute -bottom-2 -right-2 p-2.5 bg-primary text-white rounded-xl shadow-lg border-2 border-bg-card transition-transform hover:scale-110 active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Camera size={14} />
                </button>
              </div>

              {/* Identity Details */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-text-main leading-none">{user?.name}</h3>
                  <div className="flex items-center gap-2 text-text-sub">
                    <Mail size={12} className="opacity-50" />
                    <span className="text-xs font-semibold tracking-wide">{user?.email}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {user?.isVerified && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 border border-success/20 text-success text-[9px] font-black uppercase tracking-widest">
                      <CheckCircle2 size={10} strokeWidth={3} />
                      Verified Protocol
                    </span>
                  )}
                  {user?.hasAlphaAccess && (
                    <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-black uppercase tracking-widest">
                      <ShieldCheck size={10} strokeWidth={3} />
                      Alpha Access
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Display Name */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Display Name</span>
                </div>
                <div className="relative group/input">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub group-focus-within/input:text-primary transition-colors" size={16} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-surface/50 border border-border-subtle rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-text-main placeholder:text-text-muted focus:bg-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                    placeholder="Set your public identifier"
                  />
                </div>
              </div>

              {/* Professional Focus */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Professional Focus</span>
                </div>
                <div className="relative group/input">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-text-sub group-focus-within/input:text-primary transition-colors pointers-events-none" size={16} />
                  <select
                    value={formData.professionalFocus}
                    onChange={(e) => setFormData({ ...formData, professionalFocus: e.target.value })}
                    className="w-full bg-surface/50 border border-border-subtle rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-text-main focus:bg-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select Specialization</option>
                    {focusOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-sub">
                    <motion.div
                      animate={{ y: [0, 2, 0] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <X size={12} className="rotate-45" />
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Bio Signature */}
              <div className="md:col-span-2 space-y-2.5">
                <div className="flex items-center gap-2 px-1">
                  <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Bio Signature</span>
                </div>
                <div className="relative group/input">
                  <FileText className="absolute left-4 top-5 text-text-sub group-focus-within/input:text-primary transition-colors" size={16} />
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                    className="w-full bg-surface/50 border border-border-subtle rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-text-main placeholder:text-text-muted focus:bg-surface focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all outline-none resize-none"
                    placeholder="Synthesize your professional trajectory..."
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileModal;
