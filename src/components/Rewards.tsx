import { motion } from 'motion/react';
import { Trophy, Star, Lock, Gift, Smartphone, Car, Plane, Flame, Laptop } from 'lucide-react';

export default function Rewards({ metrics }: { metrics: any }) {
  const currentFtds = metrics?.ftds || 0;

  const rewards = [
    { 
      id: 1, 
      title: 'MacBook Pro M3', 
      description: 'A ferramenta definitiva para sua produtividade.',
      target: 2500, 
      icon: Laptop, 
      color: 'from-emerald-400 to-emerald-600', 
      shadow: 'rgba(16,185,129,0.5)', 
      achieved: currentFtds >= 2500 
    },
    { 
      id: 2, 
      title: 'Mercedes C180', 
      description: '5.000 FTDs na SuperBet mensal dará o prêmio de uma C180 ou R$150.000,00 no Pix para o primeiro a bater.',
      target: 5000, 
      icon: Car, 
      color: 'from-teal-400 to-cyan-600', 
      shadow: 'rgba(45,212,191,0.5)', 
      achieved: currentFtds >= 5000 
    },
    { 
      id: 3, 
      title: 'Viagem Maldivas', 
      description: '7 dias no paraíso com tudo pago.',
      target: 10000, 
      icon: Plane, 
      color: 'from-cyan-400 to-blue-600', 
      shadow: 'rgba(56,189,248,0.5)', 
      achieved: currentFtds >= 10000 
    },
  ];

  // Find the next target
  const nextTarget = rewards.find(r => !r.achieved) || rewards[rewards.length - 1];

  return (
    <div className="space-y-10 pb-10">
      <div className="text-center max-w-3xl mx-auto mb-16 mt-8">
        <motion.div 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, duration: 1 }}
          className="w-28 h-28 mx-auto bg-gradient-to-br from-teal-500 to-emerald-700 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(16,185,129,0.6)] border border-teal-400/50 transform-gpu"
          style={{ transform: 'rotate(45deg)' }}
        >
          <Trophy className="w-14 h-14 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ transform: 'rotate(-45deg)' }} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-sm font-bold uppercase tracking-widest mb-4">
            <Flame className="w-4 h-4 text-teal-400" /> Elite Rewards
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter drop-shadow-lg">
            Galeria de Conquistas
          </h2>
          <p className="text-slate-300 text-xl font-medium leading-relaxed">
            Desbloqueie prêmios exclusivos atingindo suas metas
          </p>
        </motion.div>
      </div>

      {/* Progress Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="p-10 rounded-[2.5rem] bg-[#04120a]/80 backdrop-blur-2xl border border-emerald-500/40 relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)]"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-900/60">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (currentFtds / nextTarget.target) * 100)}%` }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_20px_rgba(52,211,153,1)] relative"
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)]" />
          </motion.div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-4">
          <div>
            <p className="text-slate-200 font-bold uppercase tracking-widest text-sm mb-2">Seu Progresso Atual</p>
            <div className="flex items-baseline gap-3">
              <h3 className="text-7xl font-black text-white tracking-tighter drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">{currentFtds}</h3>
              <span className="text-2xl font-bold text-teal-400">FTDs</span>
            </div>
          </div>
          <div className="text-center md:text-right p-6 rounded-3xl bg-teal-500/10 border border-teal-500/30">
            <p className="text-teal-300 font-bold uppercase tracking-widest text-sm mb-2">Próximo Prêmio</p>
            <p className="text-2xl font-black text-white">Faltam <span className="text-teal-400">{Math.max(0, nextTarget.target - currentFtds).toLocaleString()}</span> FTDs</p>
          </div>
        </div>
      </motion.div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {rewards.map((reward, index) => {
          const Icon = reward.icon;
          const progress = Math.min(100, (currentFtds / reward.target) * 100);
          const isNextTarget = reward.id === nextTarget.id;
          
          return (
            <motion.div 
              key={reward.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + (index * 0.1) }}
              whileHover={{ y: -10, scale: 1.02 }}
              className={`relative p-8 rounded-3xl border backdrop-blur-xl overflow-hidden group transition-all duration-300 flex flex-col justify-between min-h-[400px] ${
                isNextTarget 
                  ? 'bg-[#04120a] border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.2)]' 
                  : 'bg-[#04120a]/80 border-emerald-900/60 hover:border-emerald-500/50 shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
              }`}
            >
              {isNextTarget && (
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] pointer-events-none" />
              )}
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="text-emerald-400 font-black text-sm tracking-widest uppercase">
                    META {reward.target.toLocaleString()} FTD
                  </div>
                  {isNextTarget ? (
                    <div className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.4)]">
                      <Trophy className="w-4 h-4 text-yellow-500" /> Próximo Alvo
                    </div>
                  ) : reward.achieved ? (
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-500/50 flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                      <Star className="w-3.5 h-3.5 fill-emerald-400" /> Resgatado
                    </div>
                  ) : (
                    <div className="px-4 py-1.5 rounded-full bg-white/10 text-slate-300 text-xs font-black uppercase tracking-wider flex items-center gap-2 border border-white/10">
                      <Lock className="w-4 h-4" /> Bloqueado
                    </div>
                  )}
                </div>
                
                <h4 className="text-4xl font-black text-white mb-4 tracking-tight">{reward.title}</h4>
                <p className="text-slate-300 text-sm font-medium leading-relaxed mb-8">
                  {reward.description}
                </p>
              </div>

              <div className="relative z-10 mt-auto">
                {!reward.achieved && (
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-black uppercase tracking-wider">
                      <span className="text-slate-200">Progresso</span>
                      <span className="text-white">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, delay: 0.8 + (index * 0.1) }}
                        className="h-full bg-emerald-500 relative"
                      />
                    </div>
                    <p className="text-center text-slate-400 text-xs mt-2">
                      Faltam {(reward.target - currentFtds).toLocaleString()} FTDs
                    </p>
                  </div>
                )}

                <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-slate-300 font-bold hover:bg-white/10 hover:text-white transition-colors">
                  VER DETALHES
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
