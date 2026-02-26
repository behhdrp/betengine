import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, CheckCircle2, ExternalLink, QrCode, Plus, Link2 } from 'lucide-react';

export default function MyLinks({ metrics }: { metrics: any }) {
  const [copied, setCopied] = useState<number | null>(null);
  const user = JSON.parse(localStorage.getItem('betengine_user') || '{}');

  const links = metrics?.custom_link ? [
    { 
      id: 1, 
      name: 'Campanha Principal', 
      url: metrics.custom_link, 
      clicks: metrics?.clicks || 0
    }
  ] : [];

  const handleCopy = (id: number, url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-500/40 text-teal-300 text-xs font-bold uppercase tracking-wider mb-4"
          >
            <Link2 className="w-3 h-3" /> Tracking
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Meus Links</h2>
          <p className="text-slate-300 mt-2 text-lg">Gerencie suas campanhas e maximize suas conversões.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {links.length > 0 ? (
          links.map((link, index) => (
            <motion.div 
              key={link.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, type: "spring" }}
              whileHover={{ scale: 1.01 }}
              className="p-6 md:p-8 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 hover:border-emerald-500/50 transition-all group relative overflow-hidden"
              style={{ boxShadow: 'inset 0 1px 0 0 rgba(255,255,255,0.05)' }}
            >
              {/* Neon side accent */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 opacity-50 group-hover:opacity-100 group-hover:w-2 transition-all shadow-[0_0_10px_rgba(16,185,129,0.8)]" />

              <div className="flex flex-col lg:flex-row justify-between gap-8 pl-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <h3 className="text-2xl font-black text-white tracking-tight">{link.name}</h3>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Ativo
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-[#020a06] border border-emerald-900/60 group-hover:border-emerald-500/40 transition-colors">
                    <div className="flex-1 text-teal-300 font-mono text-sm md:text-base truncate">
                      {link.url}
                    </div>
                    <div className="flex gap-2">
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleCopy(link.id, link.url)}
                        className={`p-3 rounded-xl transition-colors ${copied === link.id ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50' : 'bg-emerald-900/40 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/30'}`}
                        title="Copiar Link"
                      >
                        {copied === link.id ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </motion.button>
                      <motion.a whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} href={link.url} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-emerald-900/40 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-500/30 transition-colors" title="Abrir">
                        <ExternalLink className="w-5 h-5" />
                      </motion.a>
                    </div>
                  </div>
                </div>

                <div className="flex gap-8 lg:border-l border-emerald-900/60 lg:pl-8 items-center">
                  <div>
                    <p className="text-slate-200 text-xs font-bold uppercase tracking-wider mb-1">Cliques</p>
                    <p className="text-3xl font-black text-white">{link.clicks.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-10 rounded-3xl bg-[#04120a]/80 backdrop-blur-xl border border-emerald-900/60 flex flex-col items-center justify-center text-center">
            <Link2 className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum link disponível</h3>
            <p className="text-slate-400">Entre em contato com o suporte para ativar sua campanha.</p>
          </div>
        )}
      </div>
    </div>
  );
}
