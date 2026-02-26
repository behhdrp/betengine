import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, Link as LinkIcon, Wallet, Gift, Menu, X, Hexagon, LogOut, Loader2, ShieldAlert } from 'lucide-react';
import Dashboard from './components/Dashboard';
import MyLinks from './components/MyLinks';
import Financial from './components/Financial';
import Rewards from './components/Rewards';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('betengine_token'));
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('betengine_user') || 'null'));
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAdminImpersonating = !!localStorage.getItem('betengine_admin_token');

  useEffect(() => {
    if (token) {
      fetchMetrics();
    }
  }, [token]);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/user/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.status === 401 || res.status === 403) {
        handleLogout();
        return;
      }
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error("Erro ao buscar métricas", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = (newToken: string, userData: any) => {
    localStorage.setItem('betengine_token', newToken);
    localStorage.setItem('betengine_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('betengine_token');
    localStorage.removeItem('betengine_user');
    setToken(null);
    setUser(null);
    setMetrics(null);
  };

  const handleReturnToAdmin = () => {
    const adminToken = localStorage.getItem('betengine_admin_token');
    const adminUser = localStorage.getItem('betengine_admin_user');
    
    if (adminToken && adminUser) {
      localStorage.setItem('betengine_token', adminToken);
      localStorage.setItem('betengine_user', adminUser);
      localStorage.removeItem('betengine_admin_token');
      localStorage.removeItem('betengine_admin_user');
      
      setToken(adminToken);
      setUser(JSON.parse(adminUser));
      setActiveTab('admin');
    }
  };

  const handleImpersonate = (newToken: string, newUser: any) => {
    const currentToken = localStorage.getItem('betengine_token');
    const currentUser = localStorage.getItem('betengine_user');

    if (currentToken && currentUser) {
      localStorage.setItem('betengine_admin_token', currentToken);
      localStorage.setItem('betengine_admin_user', currentUser);
    }

    localStorage.setItem('betengine_token', newToken);
    localStorage.setItem('betengine_user', JSON.stringify(newUser));
    
    setToken(newToken);
    setUser(newUser);
    setActiveTab('dashboard');
  };

  if (!token) {
    return <Auth onLogin={handleLogin} />;
  }

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard metrics={metrics} />;
      case 'links': return <MyLinks metrics={metrics} />;
      case 'financial': return <Financial metrics={metrics} />;
      case 'rewards': return <Rewards metrics={metrics} />;
      case 'admin': return <AdminPanel onImpersonate={handleImpersonate} />;
      default: return <Dashboard metrics={metrics} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'links', label: 'Meus Links', icon: LinkIcon },
    { id: 'financial', label: 'Financeiro', icon: Wallet },
    { id: 'rewards', label: 'Premiações', icon: Gift },
  ];

  if (user?.is_admin) {
    navItems.push({ id: 'admin', label: 'Admin', icon: ShieldAlert });
  }

  return (
    <div className="min-h-screen text-white overflow-hidden font-sans selection:bg-emerald-500/30">
      {isAdminImpersonating && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center font-bold text-sm z-[100] relative flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 shadow-lg">
          <span>Modo Visualização: Você está acessando a conta de {user?.name}</span>
          <button 
            onClick={handleReturnToAdmin} 
            className="px-4 py-1.5 bg-amber-950 text-amber-50 rounded-lg hover:bg-amber-900 transition-colors shadow-sm"
          >
            Voltar para Admin
          </button>
        </div>
      )}
      
      {/* Immersive Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] rounded-full bg-green-600/5 blur-[100px]" />
      </div>

      <div className="flex h-screen relative z-10">
        {/* Sidebar Desktop */}
        <aside className="hidden md:flex flex-col w-72 bg-[#04120a]/90 backdrop-blur-2xl border-r border-emerald-900/40 relative">
          {/* Sidebar inner glow */}
          <div className="absolute inset-y-0 right-0 w-[1px] bg-gradient-to-b from-transparent via-emerald-500/50 to-transparent" />

          <div className="p-8 flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] relative"
            >
              <div className="absolute inset-0 rounded-xl border border-white/20" />
              <Hexagon className="text-white w-7 h-7" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-emerald-400 animate-pulse drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                BetEngine
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">CPA Network</p>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                    isActive 
                      ? 'text-white' 
                      : 'text-slate-300 hover:text-white hover:bg-emerald-500/10'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-emerald-600/20 to-teal-600/10 border border-emerald-500/40 rounded-2xl"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    >
                      <div className="absolute inset-0 bg-emerald-400/10 blur-md" />
                    </motion.div>
                  )}
                  <Icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${isActive ? 'text-emerald-400 scale-110' : 'group-hover:text-emerald-300 group-hover:scale-110'}`} />
                  <span className="font-bold tracking-wide relative z-10">{item.label}</span>
                  
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute right-3 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-teal-900/20 border border-emerald-500/30 overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors" />
              <div className="relative z-10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center font-black text-sm shadow-[0_0_15px_rgba(16,185,129,0.5)] border border-white/20 uppercase">
                  {user?.name?.substring(0, 2) || 'JD'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user?.name || 'John Doe'}</p>
                  <p className="text-xs text-emerald-300 font-medium truncate">Afiliado Elite</p>
                </div>
                <button onClick={handleLogout} className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors" title="Sair">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center justify-between p-4 bg-[#04120a]/90 backdrop-blur-xl border-b border-emerald-900/40 z-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                <Hexagon className="text-white w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tighter text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]">
                BetEngine
              </h1>
            </div>
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-300 hover:text-white">
              <Menu className="w-7 h-7" />
            </button>
          </header>

          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-10 scroll-smooth z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30, scale: 0.95, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -30, scale: 0.95, filter: 'blur(10px)' }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
                className="max-w-7xl mx-auto h-full"
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-[#020a06]/80 backdrop-blur-md z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed top-0 right-0 bottom-0 w-72 bg-[#04120a] border-l border-emerald-500/40 z-50 p-6 flex flex-col md:hidden shadow-[-20px_0_50px_rgba(16,185,129,0.2)]"
              >
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-black text-white">Menu</h2>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-300 hover:text-white bg-emerald-500/20 rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <nav className="flex-1 space-y-3">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                          isActive 
                            ? 'text-white bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                            : 'text-slate-300 hover:text-white hover:bg-emerald-500/10'
                        }`}
                      >
                        <Icon className={`w-6 h-6 ${isActive ? 'text-emerald-400' : ''}`} />
                        <span className="font-bold text-lg">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
                <button onClick={handleLogout} className="mt-auto w-full flex items-center justify-center gap-2 px-5 py-4 rounded-2xl text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold transition-all border border-red-500/20">
                  <LogOut className="w-5 h-5" />
                  Sair da Conta
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
