import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Save, Loader2, Search, Link as LinkIcon, Eye, Edit2, X, AlertTriangle } from 'lucide-react';

export default function AdminPanel({ onImpersonate }: { onImpersonate: (token: string, user: any) => void }) {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'metric' | 'link' | 'impersonate' | 'alert';
    userId: number | null;
    title: string;
    value: string;
    metricName?: string;
    message?: string;
  }>({
    isOpen: false,
    type: 'alert',
    userId: null,
    title: '',
    value: ''
  });

  const token = localStorage.getItem('betengine_token');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateMetric = (userId: number, metricName: string, currentValue: number) => {
    let title = `Atualizar ${metricName.toUpperCase()}`;
    if (metricName === 'cpa') title = 'Atualizar CPA (Valor por FTD)';
    if (metricName === 'ftds') title = 'Atualizar FTDs';
    
    setModalState({
      isOpen: true,
      type: 'metric',
      userId,
      title,
      value: currentValue.toString(),
      metricName
    });
  };

  const handleUpdateLink = (userId: number, currentLink: string) => {
    setModalState({
      isOpen: true,
      type: 'link',
      userId,
      title: `Atualizar Link do Usuário`,
      value: currentLink || ''
    });
  };

  const handleImpersonate = (userId: number) => {
    setModalState({
      isOpen: true,
      type: 'impersonate',
      userId,
      title: `Acessar Conta`,
      value: '',
      message: 'Deseja realmente acessar a conta deste usuário?'
    });
  };

  const showAlert = (title: string, message: string) => {
    setModalState({
      isOpen: true,
      type: 'alert',
      userId: null,
      title,
      value: '',
      message
    });
  };

  const submitModal = async () => {
    const { type, userId, value, metricName } = modalState;
    if (!userId && type !== 'alert') return;

    setModalState(prev => ({ ...prev, isOpen: false }));

    if (type === 'metric' && metricName && userId) {
      if (isNaN(Number(value))) return;
      setSavingId(userId);
      try {
        const res = await fetch(`/api/admin/users/${userId}/metrics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ [metricName]: Number(value) })
        });

        if (res.ok) {
          // Refresh users to get the calculated balance
          fetchUsers();
        } else {
          showAlert('Erro', `Erro ao atualizar ${metricName}`);
        }
      } catch (error) {
        console.error("Erro ao atualizar", error);
      } finally {
        setSavingId(null);
      }
    } else if (type === 'link' && userId) {
      setSavingId(userId);
      try {
        const res = await fetch(`/api/admin/users/${userId}/link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ custom_link: value })
        });

        if (res.ok) {
          setUsers(users.map(u => u.id === userId ? { ...u, custom_link: value } : u));
        } else {
          showAlert('Erro', `Erro ao atualizar link`);
        }
      } catch (error) {
        console.error("Erro ao atualizar", error);
      } finally {
        setSavingId(null);
      }
    } else if (type === 'impersonate' && userId) {
      try {
        const res = await fetch(`/api/admin/impersonate/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          onImpersonate(data.token, data.user);
        } else {
          showAlert('Erro', 'Erro ao acessar conta');
        }
      } catch (error) {
        console.error("Erro ao acessar conta", error);
      }
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'approved' } : u));
      } else {
        showAlert('Erro', 'Erro ao aprovar usuário');
      }
    } catch (error) {
      console.error("Erro ao aprovar", error);
    }
  };

  const handleReject = async (userId: number) => {
    if (!confirm('Tem certeza que deseja rejeitar este usuário?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: 'rejected' } : u));
      } else {
        showAlert('Erro', 'Erro ao rejeitar usuário');
      }
    } catch (error) {
      console.error("Erro ao rejeitar", error);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Users className="w-3 h-3" /> Administração
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Painel Admin</h2>
          <p className="text-slate-300 mt-2 text-lg">Gerencie os usuários e controle suas métricas.</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
      >
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="text-2xl font-black text-white tracking-tight">Usuários Cadastrados ({users.length})</h3>
          
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#020a06] border border-emerald-900/60 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>
        
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-emerald-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-4 pl-4">ID</th>
                <th className="pb-4">Usuário</th>
                <th className="pb-4">Email (Login)</th>
                <th className="pb-4 text-center">Status</th>
                <th className="pb-4 text-center">Admin?</th>
                <th className="pb-4 text-center">CPA (R$)</th>
                <th className="pb-4 text-center">Saldo (R$)</th>
                <th className="pb-4 text-center">FTDs</th>
                <th className="pb-4 text-center">Leads</th>
                <th className="pb-4 text-center">Cliques</th>
                <th className="pb-4 text-center">Link</th>
                <th className="pb-4 pr-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {filteredUsers.map((user, i) => (
                <motion.tr 
                  key={user.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ backgroundColor: 'rgba(16,185,129,0.05)' }}
                  className="border-b border-emerald-900/40 transition-colors group"
                >
                  <td className="py-4 pl-4 text-slate-400 font-mono">#{user.id}</td>
                  <td className="py-4 text-white font-bold">{user.name}</td>
                  <td className="py-4 text-emerald-300/80">{user.email}</td>
                  <td className="py-4 text-center">
                    {user.status === 'pending' && (
                      <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs font-bold border border-yellow-500/30">PENDENTE</span>
                    )}
                    {user.status === 'approved' && (
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">APROVADO</span>
                    )}
                    {user.status === 'rejected' && (
                      <span className="px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">RECUSADO</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    {user.is_admin ? (
                      <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">SIM</span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-xs font-bold">NÃO</span>
                    )}
                  </td>
                  <td className="py-4 text-center">
                    <button 
                      onClick={() => handleUpdateMetric(user.id, 'cpa', user.cpa || 0)}
                      className="text-lg font-black text-white hover:text-emerald-400 transition-colors border-b border-dashed border-emerald-500/50"
                      title="Clique para editar CPA"
                    >
                      R$ {(user.cpa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <span className="text-lg font-black text-white/50 cursor-not-allowed" title="Calculado automaticamente (FTDs * CPA)">
                      R$ {(user.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <button 
                      onClick={() => handleUpdateMetric(user.id, 'ftds', user.ftds || 0)}
                      className="text-lg font-black text-white hover:text-emerald-400 transition-colors border-b border-dashed border-emerald-500/50"
                      title="Clique para editar"
                    >
                      {user.ftds || 0}
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <button 
                      onClick={() => handleUpdateMetric(user.id, 'leads', user.leads || 0)}
                      className="text-lg font-black text-white hover:text-emerald-400 transition-colors border-b border-dashed border-emerald-500/50"
                      title="Clique para editar"
                    >
                      {user.leads || 0}
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <button 
                      onClick={() => handleUpdateMetric(user.id, 'clicks', user.clicks || 0)}
                      className="text-lg font-black text-white hover:text-emerald-400 transition-colors border-b border-dashed border-emerald-500/50"
                      title="Clique para editar"
                    >
                      {user.clicks || 0}
                    </button>
                  </td>
                  <td className="py-4 text-center">
                    <button 
                      onClick={() => handleUpdateLink(user.id, user.custom_link)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/50 hover:text-white transition-colors border border-emerald-500/20"
                      title="Editar Link"
                    >
                      <LinkIcon className="w-4 h-4" />
                      <span className="text-xs font-bold">{user.custom_link ? 'Editar' : 'Adicionar'}</span>
                    </button>
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApprove(user.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-xs font-bold"
                            title="Aprovar"
                          >
                            Aprovar
                          </button>
                          <button 
                            onClick={() => handleReject(user.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-xs font-bold"
                            title="Rejeitar"
                          >
                            Rejeitar
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => handleImpersonate(user.id)}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-900/30 text-teal-400 hover:bg-teal-800/50 hover:text-white transition-colors border border-teal-500/20"
                        title="Acessar Conta"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="text-xs font-bold hidden md:inline">Acessar</span>
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400 font-medium">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {filteredUsers.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-6 rounded-2xl bg-[#020a06] border border-emerald-900/40 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-500 font-mono text-xs">#{user.id}</span>
                    {user.is_admin && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">ADMIN</span>
                    )}
                    {user.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400 text-[10px] font-bold">PENDENTE</span>
                    )}
                    {user.status === 'approved' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">APROVADO</span>
                    )}
                    {user.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold">RECUSADO</span>
                    )}
                  </div>
                  <h3 className="text-white font-bold text-lg">{user.name}</h3>
                  <p className="text-emerald-300/80 text-sm">{user.email}</p>
                </div>
                <button 
                  onClick={() => handleImpersonate(user.id)}
                  className="p-2 rounded-lg bg-teal-900/30 text-teal-400 hover:bg-teal-800/50 hover:text-white transition-colors border border-teal-500/20"
                  title="Acessar Conta"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-emerald-900/10 border border-emerald-900/30">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">CPA</p>
                  <button 
                    onClick={() => handleUpdateMetric(user.id, 'cpa', user.cpa || 0)}
                    className="text-white font-bold border-b border-dashed border-emerald-500/50"
                  >
                    R$ {(user.cpa || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/10 border border-emerald-900/30">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Saldo</p>
                  <span className="text-white/70 font-bold">
                    R$ {(user.balance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/10 border border-emerald-900/30">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">FTDs</p>
                  <button 
                    onClick={() => handleUpdateMetric(user.id, 'ftds', user.ftds || 0)}
                    className="text-white font-bold border-b border-dashed border-emerald-500/50"
                  >
                    {user.ftds || 0}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-emerald-900/10 border border-emerald-900/30">
                  <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Leads</p>
                  <button 
                    onClick={() => handleUpdateMetric(user.id, 'leads', user.leads || 0)}
                    className="text-white font-bold border-b border-dashed border-emerald-500/50"
                  >
                    {user.leads || 0}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2 border-t border-emerald-900/30">
                <button 
                  onClick={() => handleUpdateLink(user.id, user.custom_link)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-900/30 text-emerald-400 hover:bg-emerald-800/50 hover:text-white transition-colors border border-emerald-500/20 text-sm font-bold"
                >
                  <LinkIcon className="w-4 h-4" />
                  {user.custom_link ? 'Editar Link' : 'Add Link'}
                </button>
                
                {user.status === 'pending' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApprove(user.id)}
                      className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors text-xs font-bold"
                    >
                      Aprovar
                    </button>
                    <button 
                      onClick={() => handleReject(user.id)}
                      className="px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors text-xs font-bold"
                    >
                      Rejeitar
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && (
            <div className="py-8 text-center text-slate-400 font-medium">
              Nenhum usuário encontrado.
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {modalState.isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#04120a] border border-emerald-900/60 rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {modalState.type === 'alert' && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {modalState.title}
                </h3>
                <button
                  onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalState.message && (
                <p className="text-slate-300 mb-6">{modalState.message}</p>
              )}

              {(modalState.type === 'metric' || modalState.type === 'link') && (
                <div className="mb-6">
                  <input
                    type={modalState.type === 'metric' ? 'number' : 'text'}
                    value={modalState.value}
                    onChange={(e) => setModalState(prev => ({ ...prev, value: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#020a06] border border-emerald-900/60 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50"
                    placeholder="Digite o novo valor..."
                    autoFocus
                  />
                </div>
              )}

              <div className="flex justify-end gap-3">
                {modalState.type !== 'alert' && (
                  <button
                    onClick={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                    className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  onClick={submitModal}
                  className="px-6 py-2 rounded-xl bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors"
                >
                  {modalState.type === 'alert' ? 'OK' : 'Confirmar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
