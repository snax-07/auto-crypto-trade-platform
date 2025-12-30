import React, { useState , useEffect} from 'react';
import { 
  Shield, User, Key, Settings as SettingsIcon, Mail, Smartphone, 
  Lock, Eye, EyeOff, CheckCircle2, Loader2, Save, UserCircle, 
  ShieldCheck, Plus, Trash2, Power, Copy, Check, 
  X
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

type TabType = 'Profile' | 'Security' | 'API Keys';

export const SettingsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('Profile');

  return (
    <div className="w-full h-full bg-[#FCFCFC] flex flex-col lg:flex-row min-h-screen text-slate-900 font-sans border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-full lg:w-64 bg-white border-r border-slate-200 p-6 shrink-0">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="bg-slate-900 p-1.5 rounded-lg text-white">
            <SettingsIcon size={20} />
          </div>
          <span className="font-bold tracking-tight text-lg">Settings Hub</span>
        </div>
        
        <nav className="space-y-1">
          {[
            { id: 'Profile', icon: <UserCircle size={18} /> },
            { id: 'Security', icon: <Shield size={18} /> },
            { id: 'API Keys', icon: <Key size={18} /> }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as TabType)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all ${
                activeTab === item.id 
                ? 'bg-slate-100 text-slate-900 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {item.icon} {item.id}
            </button>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto">
           {activeTab === 'Profile' && <ProfileComponent />}
           {activeTab === 'Security' && <SecurityComponent />}
           {activeTab === 'API Keys' && <APIKeyComponent />}
        </div>
      </main>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 1. PROFILE COMPONENT                              */
/* -------------------------------------------------------------------------- */
const ProfileComponent = () => {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({ fullName: "Swapnil Nade", email: "swapnilnade07@gmail.com", confirmPass: "" });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-500 text-sm">Update your public profile and verified email address.</p>
      </header>

      <section className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputWrapper label="Full Name" value={profile.fullName} onChange={(v : any) => setProfile({...profile, fullName: v})} icon={<User size={16}/>} />
          <InputWrapper label="Email Address" value={profile.email} onChange={(v : any) => setProfile({...profile, email: v})} icon={<Mail size={16}/>} />
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-slate-700 mb-4 font-semibold text-sm">
            <ShieldCheck size={18} /> Sensitive Data Confirmation
          </div>
          <InputWrapper 
            label="Current Password" 
            type="password" 
            placeholder="Confirm password to change email" 
            value={profile.confirmPass} 
            onChange={(v : any) => setProfile({...profile, confirmPass: v})} 
          />
        </div>

        <button className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all ml-auto block">
          Update Info
        </button>
      </section>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. SECURITY COMPONENT                             */
/* -------------------------------------------------------------------------- */
const SecurityComponent = () => {
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [toggles, setToggles] = useState({ email: true, sms: false });

  const handleSave = async () => {
    if (passwords.new !== passwords.confirm) return toast.error("Passwords mismatch");
    setLoading(true);
    setTimeout(() => { // Mock API
      setLoading(false);
      toast.success("Security Updated");
    }, 1000);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <header className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold">Security</h1>
        <p className="text-slate-500 text-sm">Protect your account with 2FA and strong passwords.</p>
      </header>

      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <h3 className="font-bold flex items-center gap-2 text-sm"><Lock size={16}/> Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <SecurityInput label="New Password" value={passwords.new} onChange={(v : any) => setPasswords({...passwords, new: v})} visible={showPass.new} toggle={() => setShowPass({...showPass, new: !showPass.new})} />
           <SecurityInput label="Confirm New Password" value={passwords.confirm} onChange={(v : any) => setPasswords({...passwords, confirm: v})} visible={showPass.confirm} toggle={() => setShowPass({...showPass, confirm: !showPass.confirm})} />
        </div>
        <button onClick={handleSave} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2">
          {loading ? <Loader2 className="animate-spin" size={16}/> : <CheckCircle2 size={16}/>} Save Password
        </button>
      </section>

      <section className="grid gap-4">
        <ToggleRow title="Email 2FA" desc="Verify logins via email codes" active={toggles.email} onToggle={() => setToggles({...toggles, email: !toggles.email})} />
        <ToggleRow title="SMS 2FA" desc="Verify logins via text message" active={toggles.sms} onToggle={() => setToggles({...toggles, sms: !toggles.sms})} />
      </section>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. API KEY COMPONENT (Enhanced with Dialog & Sync Logic)                   */
/* -------------------------------------------------------------------------- */
const APIKeyComponent = () => {
  const [keys, setKeys] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Local form state for new key
  const [formData, setFormData] = useState({
    name: '',
    exchangeName: 'Binance',
    apiKey: '',
    apiSecret: ''
  });

  // Fetch keys on mount
  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      const res = await axios.get('/api/v1/user/credentials');
      // Assuming your backend returns decrypted/masked keys via getDecrypted()
      setKeys(res.data.credentials);
    } catch (err) {
      toast.error("Failed to load keys from cloud");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAddKey = async () => {
    if (!formData.name || !formData.apiKey || !formData.apiSecret) {
      return toast.error("Please fill all fields");
    }

    // 1. Optimistic Update (Non-blocking UI)
    const tempId = Date.now();
    const newLocalKey = {
      _id: tempId,
      label: formData.name, // Mapping 'name' to 'label' as per your schema
      exchangeName: formData.exchangeName,
      isActive: true,
      key: `${formData.apiKey.substring(0, 4)}...${formData.apiKey.slice(-4)}`
    };

    setKeys([...keys, newLocalKey]);
    setShowModal(false);
    toast.success("Adding key...");

    // 2. Background Sync
    try {
      await axios.post('/api/v1/user/add-credential', formData);
      fetchKeys(); // Refresh to get the real MongoDB _id
    } catch (err) {
      // Rollback on failure
      setKeys(prev => prev.filter(k => k._id !== tempId));
      toast.error("Cloud sync failed. Key rolled back.");
    }
  };

  const deleteKey = async (id: string | number) => {
    // Optimistic Delete
    const previousKeys = [...keys];
    setKeys(keys.filter(k => k._id !== id));
    
    try {
      await axios.delete(`/api/v1/user/credential/${id}`);
      toast.success("Key removed");
    } catch (err) {
      setKeys(previousKeys);
      toast.error("Delete failed. Reverting.");
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold">API Management</h1>
          <p className="text-slate-500 text-sm">Manage connection strings for trading.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all"
        >
          <Plus size={16} /> NEW KEY
        </button>
      </header>

      {/* Loading State */}
      {isSyncing && keys.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-400">
          <Loader2 className="animate-spin mb-2" />
          <p className="text-xs uppercase tracking-widest font-bold">Syncing with Exchange...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {keys.map(item => (
            <div key={item._id} className={`flex items-center justify-between p-5 bg-white border-2 rounded-2xl transition-all ${item.isActive ? 'border-slate-200 shadow-sm' : 'opacity-50 grayscale border-slate-100'}`}>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 text-white rounded-xl"><Key size={18}/></div>
                <div>
                  <h4 className="font-bold text-sm flex items-center gap-2">
                      {item.label || item.name} 
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-500">{item.exchangeName}</span>
                  </h4>
                  <code className="text-xs text-slate-400">{item.key || item.apiKeyEncrypted}</code>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Power size={18}/></button>
                <button onClick={() => deleteKey(item._id)} className="p-2 hover:bg-red-50 rounded-lg text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- NEW KEY DIALOG --- */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Add New Exchange Key</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <InputWrapper 
                label="Internal Name (e.g. My Binance Bot)" 
                value={formData.name} 
                onChange={(v:any) => setFormData({...formData, name: v})} 
                placeholder="Give your key a label"
              />
              
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Exchange</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-slate-100 outline-none transition-all"
                  value={formData.exchangeName}
                  onChange={(e) => setFormData({...formData, exchangeName: (e.target as HTMLSelectElement as any).value})}
                >
                  <option value="Binance">Binance</option>
                  <option value="ByBit">ByBit</option>
                  <option value="Kraken">Kraken</option>
                </select>
              </div>

              <InputWrapper 
                label="API Key" 
                value={formData.apiKey} 
                onChange={(v:any) => setFormData({...formData, apiKey: v})} 
                placeholder="Paste your API key here"
              />
              
              <InputWrapper 
                label="API Secret" 
                type="password"
                value={formData.apiSecret} 
                onChange={(v:any) => setFormData({...formData, apiSecret: v})} 
                placeholder="Paste your Secret key here"
              />

              <div className="pt-4 flex gap-3">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddKey}
                  className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all"
                >
                  Confirm & Link
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
/* -------------------------------------------------------------------------- */
/* UI HELPERS                                    */
/* -------------------------------------------------------------------------- */
const InputWrapper = ({ label, value, onChange, icon, type = "text", placeholder = "" }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange((e.target as HTMLInputElement as any).value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-slate-100 outline-none transition-all" />
    </div>
  </div>
);

const SecurityInput = ({ label, value, onChange, visible, toggle }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">{label}</label>
    <div className="relative">
      <input type={visible ? "text" : "password"} value={value} onChange={(e) => onChange((e.target as HTMLInputElement as any).value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-4 focus:ring-slate-100 outline-none transition-all" />
      <button onClick={toggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">{visible ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
    </div>
  </div>
);

const ToggleRow = ({ title, desc, active, onToggle }: any) => (
  <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl">
    <div>
      <h4 className="text-sm font-bold">{title}</h4>
      <p className="text-xs text-slate-500">{desc}</p>
    </div>
    <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-all relative ${active ? 'bg-slate-900' : 'bg-slate-200'}`}>
      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  </div>
);