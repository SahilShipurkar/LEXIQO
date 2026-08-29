import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Palette, 
  Settings as SettingsIcon, 
  Bell, 
  ShieldCheck, 
  UserMinus, 
  LogOut, 
  Camera, 
  Check, 
  ChevronRight, 
  Moon, 
  Sun, 
  Monitor,
  Mail,
  Lock,
  Clock,
  Zap,
  Trash2,
  Save,
  Info,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

const Settings = () => {
  const { user, refreshUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = React.useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    professionalFocus: '',
    bio: ''
  });

  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        professionalFocus: user.professionalFocus || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const menuItems = [
    { id: 'Profile', icon: User, label: 'Identity Protocol' },
    { id: 'Appearance', icon: Palette, label: 'Visual Interface' },
    { id: 'Account', icon: UserMinus, label: 'Account Settings' }
  ];


  const handleSave = async () => {
    setSaving(true);
    try {
      await api.patch('/users/profile', formData);
      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Update failed', err);
    } finally {
      setSaving(false);
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

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match('image.*')) return;
    if (file.size > 2 * 1024 * 1024) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.post('/users/upload-avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshUser();
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      console.error('Upload failed', err);
    } finally {
      setUploading(false);
    }
  };

  const ProfileSection = () => (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col md:flex-row items-center gap-8 pb-8 border-b border-border-subtle">
        <div className="relative group">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleAvatarUpload} 
            className="hidden" 
            accept="image/*"
          />
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-primary/10 flex items-center justify-center border-4 border-border-subtle overflow-hidden relative shadow-inner">
            {user?.picture ? (
              <img src={user.picture} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-bold text-primary">{user?.name ? user.name[0] : 'U'}</span>
            )}
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera className="text-white" size={24} />
            </div>

            {uploading && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center">
                <Loader2 className="text-white animate-spin" size={24} />
              </div>
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-2 -right-2 p-2 bg-primary text-white rounded-xl shadow-main border-4 border-bg-card hover:scale-110 active:scale-90 transition-transform disabled:opacity-50"
          >
            <Camera size={14} />
          </button>
        </div>
        <div className="flex-1 space-y-1 text-center md:text-left">
          <h3 className="text-2xl font-bold text-text-main">{user?.name || 'Authorized Learner'}</h3>
          <p className="text-text-sub flex items-center justify-center md:justify-start gap-2">
            <Mail size={14} /> {user?.email || 'alex@lexiqo.internal'}
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-2">
            {user?.isVerified && (
              <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold uppercase tracking-widest border border-success/20">Verified Protocol</span>
            )}
            {user?.hasAlphaAccess && (
              <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20">Alpha Access</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Display Name</label>
          <input 
            type="text" 
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary transition-all text-text-main outline-none"
            placeholder="Set your public identifier"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Professional Focus</label>
          <select 
            value={formData.professionalFocus}
            onChange={(e) => setFormData({ ...formData, professionalFocus: e.target.value })}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary transition-all text-text-main outline-none appearance-none cursor-pointer"
          >
            <option value="" disabled>Select Specialization</option>
            {focusOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-1">Bio Signature</label>
          <textarea 
            rows={4} 
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-3 text-sm focus:border-primary transition-all text-text-main resize-none outline-none"
            placeholder="Synthesize your professional trajectory..."
          />
        </div>
      </div>
    </div>
  );

  const AppearanceSection = () => (
    <div className="space-y-10 animate-slide-up">
      <div className="space-y-4">
        <h4 className="text-base font-bold text-text-main">Global Interface Theme</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'light', icon: Sun, label: 'Luminous' },
            { id: 'dark', icon: Moon, label: 'Nocturnal' }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`
                p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden group
                ${theme === t.id 
                  ? 'border-primary bg-primary/5 shadow-elevated' 
                  : 'border-border-subtle bg-surface hover:border-border-main'}
              `}
            >
              <t.icon size={24} className={theme === t.id ? 'text-primary' : 'text-text-muted'} />
              <span className={`text-xs font-bold uppercase tracking-widest ${theme === t.id ? 'text-text-main' : 'text-text-sub'}`}>
                {t.label}
              </span>
              {theme === t.id && (
                <div className="absolute top-2 right-2 flex items-center text-primary">
                  <Check size={14} strokeWidth={3} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );







  const AccountSection = () => (
    <div className="space-y-10 animate-slide-up">
      <div className="p-8 rounded-3xl bg-error/[0.03] border-2 border-dashed border-error/20 space-y-8">
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-error flex items-center gap-2">
            <Trash2 size={20} /> Delete Your Account
          </h4>
          <p className="text-sm text-text-muted font-normal max-w-lg">
            This will delete your account and all your data permanently. This action cannot be undone.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => window.confirm('Delete your account permanently?') && logout()}
            className="btn bg-error hover:bg-red-600 text-white border-none px-10 shadow-[0_10px_30px_rgba(239,68,68,0.2)]"
          >
            Delete Account
          </button>
          <button onClick={logout} className="btn btn-secondary px-8 border-border-subtle group">
            Cancel
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 rounded-2xl bg-surface border border-border-subtle">
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-text-main">Log out from all devices</h4>
          <p className="text-xs text-text-muted">Log out from all other devices where you're signed in.</p>
        </div>
        <button className="text-xs font-bold text-error uppercase tracking-widest hover:underline">Log Out Everywhere</button>
      </div>


      <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface/30 border border-border-subtle">
        <Info size={20} className="text-primary shrink-0" />
        <p className="text-xs text-text-muted font-medium leading-relaxed">
          Your account is currently synced via <strong>Firebase Cloud Protocol</strong>. All data encryption handles follow global AES-256 standards.
        </p>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'Profile': return <ProfileSection />;
      case 'Appearance': return <AppearanceSection />;
      case 'Account': return <AccountSection />;
      default: return null;
    }
  };

  return (
    <div className="space-y-10 pb-16 animate-fade-in outline-none max-w-6xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-text-main mb-0 leading-tight">System Settings</h1>
          <p className="text-text-sub font-normal">Manage your account and app preferences.</p>
        </div>
        
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="px-4 py-2 bg-success text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-main flex items-center gap-2"
            >
              <Check size={14} strokeWidth={4} /> Synchronization Complete
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 md:gap-12">
        {/* Left Navigation */}
        <aside className="space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 group
                ${activeTab === item.id 
                  ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' 
                  : 'text-text-sub hover:bg-surface border border-transparent'}
              `}
            >
              <div className="flex items-center gap-4">
                <item.icon size={18} strokeWidth={activeTab === item.id ? 2.5 : 2} className="shrink-0" />
                <span className="text-xs font-bold uppercase tracking-widest">{item.label}</span>
              </div>
              <ChevronRight size={14} className={`transition-transform duration-300 ${activeTab === item.id ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'}`} />
            </button>
          ))}
        </aside>

        {/* Right Content Panel */}
        <div className="glass-card p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.015] blur-[120px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
              <h2 className="text-2xl font-bold text-text-main mb-0">{menuItems.find(m => m.id === activeTab).label}</h2>
              {activeTab !== 'Appearance' && activeTab !== 'Account' && (
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="btn btn-primary px-8 py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {saving ? 'Syncing...' : 'Save Changes'}
                </button>
              )}
            </div>
            
            <div className="min-h-[400px]">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
