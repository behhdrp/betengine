import { motion } from 'motion/react';
import { Users, UserPlus, DollarSign, TrendingUp, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Seg', ftd: 0, reg: 0 },
  { name: 'Ter', ftd: 0, reg: 0 },
  { name: 'Qua', ftd: 0, reg: 0 },
  { name: 'Qui', ftd: 0, reg: 0 },
  { name: 'Sex', ftd: 0, reg: 0 },
  { name: 'Sáb', ftd: 0, reg: 0 },
  { name: 'Dom', ftd: 0, reg: 0 },
];

export default function Dashboard({ metrics }: { metrics: any }) {
  const balance = metrics?.balance || 0;
  const ftds = metrics?.ftds || 0;
  const leads = metrics?.leads || 0;
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Sparkles className="w-3 h-3" /> Visão Geral
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-300 mt-2 text-lg">Acompanhe seus resultados em tempo real com precisão.</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="px-5 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-sm font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] backdrop-blur-md"
        >
          <Activity className="w-4 h-4 animate-pulse" />
          Sincronizado Agora
        </motion.div>
      </div>

      {/* 3D Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative p-8 rounded-3xl bg-gradient-to-br from-[#062e1a] to-[#031c0e] border border-emerald-500/40 overflow-hidden group"
          style={{ boxShadow: '0 20px 40px -10px rgba(16,185,129,0.2), inset 0 1px 0 0 rgba(255,255,255,0.1)' }}
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/20 rounded-full blur-[60px] group-hover:bg-teal-500/30 transition-all duration-500" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-600/20 rounded-full blur-[50px]" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.4)] border border-white/20">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0%
              </div>
            </div>
            <p className="text-emerald-100 text-sm font-bold uppercase tracking-wider mb-1">Saldo Disponível</p>
            <h3 className="text-5xl font-black text-white tracking-tighter drop-shadow-md">
              R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </motion.div>

        {/* FTDs Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 overflow-hidden group hover:border-emerald-500/40 transition-colors"
          style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] group-hover:bg-emerald-500/20 transition-all" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-900/50 flex items-center justify-center border border-emerald-500/30 group-hover:border-emerald-400/60 transition-colors">
                <Users className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0%
              </div>
            </div>
            <p className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-1">Total FTDs</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">{ftds}</h3>
          </div>
        </motion.div>

        {/* Leads Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, scale: 1.02 }}
          className="relative p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 overflow-hidden group hover:border-teal-500/40 transition-colors"
          style={{ boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5), inset 0 1px 0 0 rgba(255,255,255,0.05)' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-[50px] group-hover:bg-teal-500/20 transition-all" />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-900/40 flex items-center justify-center border border-teal-500/30 group-hover:border-teal-400/60 transition-colors">
                <UserPlus className="w-7 h-7 text-teal-400" />
              </div>
              <div className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +0%
              </div>
            </div>
            <p className="text-slate-200 text-sm font-bold uppercase tracking-wider mb-1">Registros (Leads)</p>
            <h3 className="text-5xl font-black text-white tracking-tighter">{leads}</h3>
          </div>
        </motion.div>
      </div>

      {/* Chart Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 relative overflow-hidden"
        style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)' }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-600/5 blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 relative z-10">
          <h3 className="text-2xl font-black text-white tracking-tight">Desempenho Semanal</h3>
          <div className="flex gap-6 mt-4 sm:mt-0 bg-[#020a06] p-2 rounded-xl border border-emerald-900/60">
            <div className="flex items-center gap-2 px-3 py-1">
              <div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <span className="text-sm font-bold text-slate-200">FTDs</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <span className="text-sm font-bold text-slate-200">Registros</span>
            </div>
          </div>
        </div>
        
        <div className="h-[350px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorFtd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#064e3b" vertical={false} opacity={0.5} />
              <XAxis dataKey="name" stroke="#6ee7b7" axisLine={false} tickLine={false} tick={{ fill: '#a7f3d0', fontWeight: 600 }} dy={10} />
              <YAxis stroke="#6ee7b7" axisLine={false} tickLine={false} tick={{ fill: '#a7f3d0', fontWeight: 600 }} dx={-10} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(4, 18, 10, 0.9)', 
                  border: '1px solid rgba(16, 185, 129, 0.4)', 
                  borderRadius: '16px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(10px)'
                }}
                itemStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="reg" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorReg)" />
              <Area type="monotone" dataKey="ftd" stroke="#2dd4bf" strokeWidth={4} fillOpacity={1} fill="url(#colorFtd)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60"
        style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)' }}
      >
        <h3 className="text-xl font-black text-white mb-6 tracking-tight">Atividade Recente</h3>
        <div className="space-y-3">
          <div className="py-8 text-center text-slate-400 font-medium border border-emerald-900/40 rounded-2xl bg-[#020a06]">
            Nenhuma atividade recente encontrada.
          </div>
        </div>
      </motion.div>
    </div>
  );
}
