import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { DollarSign, ArrowDownRight, Clock, CheckCircle2, WalletCards, CreditCard, AlertTriangle, X } from 'lucide-react';

export default function Financial({ metrics }: { metrics: any }) {
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const user = JSON.parse(localStorage.getItem('betengine_user') || '{}');
  const balance = metrics?.balance || 0;
  const ftds = metrics?.ftds || 0;
  const canWithdraw = ftds >= 5;

  const handleWithdrawClick = () => {
    setShowWithdrawModal(true);
  };
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <CreditCard className="w-3 h-3" /> Pagamentos
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Financeiro</h2>
          <p className="text-slate-300 mt-2 text-lg">Controle seus ganhos, saques e histórico de transações.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Premium Balance Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.4 }}
          whileHover={{ y: -10, rotateX: 5, rotateY: -5 }}
          className="p-10 rounded-[2rem] bg-gradient-to-br from-emerald-700 via-teal-800 to-emerald-900 border border-teal-400/40 relative overflow-hidden shadow-[0_20px_50px_rgba(16,185,129,0.5)] transform-gpu"
          style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}
        >
          {/* Glassmorphism overlays */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] mix-blend-overlay" />
          <div className="absolute bottom-[-20%] left-[-10%] w-60 h-60 bg-black/40 rounded-full blur-[60px]" />
          
          {/* Card Chip Simulation */}
          <div className="absolute top-10 right-10 w-14 h-10 rounded-lg bg-gradient-to-br from-yellow-200/50 to-yellow-600/50 border border-yellow-400/60 backdrop-blur-sm" />

          <div className="relative z-10" style={{ transform: 'translateZ(30px)' }}>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xl border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                <WalletCards className="w-7 h-7 text-white" />
              </div>
              <span className="text-emerald-50 font-bold tracking-widest uppercase text-sm">Saldo Disponível</span>
            </div>
            
            <h3 className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-teal-200 font-bold text-sm flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-300 animate-pulse" />
              Chave PIX: {user.pix_key || 'Não cadastrada'}
            </p>

            <div className="mt-10 flex gap-4">
              <motion.button 
                onClick={handleWithdrawClick}
                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255,255,255,0.4)' }}
                whileTap={{ scale: 0.95 }}
                className="flex-1 py-4 rounded-2xl bg-white text-emerald-900 font-black text-lg transition-all shadow-[0_10px_20px_rgba(0,0,0,0.3)] border border-white/50"
              >
                Solicitar Saque
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 flex items-center justify-between group hover:border-teal-500/50 transition-colors shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
          >
            <div>
              <p className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-2">Ganhos Totais</p>
              <p className="text-4xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_10px_rgba(52,211,153,0.3)]">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/40 group-hover:bg-teal-500/30 transition-colors shadow-[0_0_20px_rgba(45,212,191,0.3)]">
              <DollarSign className="w-8 h-8 text-teal-300" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Transaction History */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 mt-8 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]"
      >
        <h3 className="text-2xl font-black text-white mb-8 tracking-tight">Histórico de Saques</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b-2 border-emerald-900/60 text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="pb-4 pl-4 whitespace-nowrap">Data</th>
                <th className="pb-4 whitespace-nowrap">ID Transação</th>
                <th className="pb-4 whitespace-nowrap">Método</th>
                <th className="pb-4 whitespace-nowrap">Status</th>
                <th className="pb-4 pr-4 text-right whitespace-nowrap">Valor</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr className="border-b border-emerald-900/40">
                <td colSpan={5} className="py-8 text-center text-slate-400 font-medium">
                  Nenhum saque realizado ainda.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Withdraw Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWithdrawModal(false)}
              className="absolute inset-0 bg-transparent backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full max-w-md p-8 rounded-3xl bg-emerald-900 border shadow-[0_20px_50px_rgba(0,0,0,0.5)] ${canWithdraw ? 'border-emerald-500/50' : 'border-red-900/40 shadow-[0_0_30px_rgba(239,68,68,0.1)]'}`}
            >
              <button 
                onClick={() => setShowWithdrawModal(false)}
                className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${canWithdraw ? 'text-slate-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20' : 'text-slate-400 hover:text-white bg-red-500/10 hover:bg-red-500/20'}`}
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mb-6">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${canWithdraw ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}>
                  {canWithdraw ? <DollarSign className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  {canWithdraw ? 'Solicitar Saque' : 'Saque Bloqueado'}
                </h3>
              </div>

              {!canWithdraw ? (
                <div className="space-y-4">
                  <p className="text-slate-300 text-center font-medium">
                    Você precisa de no mínimo <span className="text-white font-bold">5 CPAs (FTDs)</span> para realizar o primeiro saque.
                  </p>
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                    Seu progresso atual: <strong className="text-white">{ftds} / 5 FTDs</strong>
                  </div>
                  <button 
                    onClick={() => setShowWithdrawModal(false)}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors"
                  >
                    Entendi
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-slate-300 text-center font-medium">
                    Seu saldo disponível é de <strong className="text-white">R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>.
                  </p>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-sm text-center">
                    O valor será enviado para sua chave PIX:<br/>
                    <strong className="text-white text-lg mt-1 block">{user.pix_key}</strong>
                  </div>
                  <button 
                    onClick={() => {
                      alert('Saque solicitado com sucesso! O valor cairá na sua conta em breve.');
                      setShowWithdrawModal(false);
                    }}
                    className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  >
                    Confirmar Saque
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
