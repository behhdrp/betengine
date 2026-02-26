import { useState, ChangeEvent, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Mail, Lock, User, ArrowRight, Loader2, Phone, CreditCard } from 'lucide-react';

interface AuthProps {
  onLogin: (token: string, user: any) => void;
}

export default function Auth({ onLogin }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsapp: '',
    pix_key: ''
  });

  const formatWhatsApp = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica a máscara: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 6) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else if (numbers.length <= 10) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handleWhatsAppChange = (e: ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value);
    setFormData({ ...formData, whatsapp: formatted });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Get API URL from window object or use default
    const apiUrl = (window as any).API_BASE_URL || 'http://localhost:3000';
    const endpoint = isLogin 
      ? `${apiUrl}/api/auth/login` 
      : `${apiUrl}/api/auth/register`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('❌ Servidor não está respondendo. Verifique se o backend está online em: ' + apiUrl);
      }

      if (!response.ok) {
        if (data.code === 'PENDING_APPROVAL') {
          setIsPending(true);
          return;
        }
        throw new Error(data.error || 'Erro ao autenticar');
      }
      
      // Check if it's a registration that resulted in pending (201 created but pending)
      if (data.code === 'PENDING_APPROVAL') {
        setIsPending(true);
        return;
      }

      // Success
      onLogin(data.token, data.user);
    } catch (err: any) {
      setError(err.message);
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[150px] pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md p-8 rounded-[2.5rem] bg-[#04120a]/80 backdrop-blur-2xl border border-emerald-900/60 text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-yellow-500/20 flex items-center justify-center mb-6 border border-yellow-500/40">
            <Loader2 className="w-10 h-10 text-yellow-500 animate-spin" />
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Conta em Análise</h2>
          <p className="text-slate-300 mb-8">
            Sua conta foi criada com sucesso e está aguardando aprovação da nossa equipe. 
            Você receberá o acesso assim que for aprovado.
          </p>
          <button 
            onClick={() => {
              setIsPending(false);
              setIsLogin(true);
            }}
            className="w-full py-4 rounded-2xl bg-emerald-900/40 hover:bg-emerald-800/40 text-emerald-400 font-bold border border-emerald-500/30 transition-all"
          >
            Voltar para Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020a06] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-600/10 blur-[150px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="p-8 md:p-10 rounded-[2.5rem] bg-[#04120a]/80 backdrop-blur-2xl border border-emerald-900/60 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_0_rgba(255,255,255,0.05)]">
          
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-6 border border-white/20">
              <Hexagon className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">
              {isLogin ? 'Bem-vindo de volta' : 'Criar Conta'}
            </h1>
            <p className="text-emerald-200/60 mt-2 text-center font-medium">
              {isLogin ? 'Acesse seu painel de afiliado BetEngine.' : 'Junte-se à maior rede de CPA do mercado.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="overflow-hidden space-y-5"
                >
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-emerald-500/50" />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      placeholder="Seu nome completo"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-12 pr-4 py-4 bg-[#020a06] border border-emerald-900/60 rounded-2xl text-white placeholder-emerald-700/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-emerald-500/50" />
                    </div>
                    <input
                      type="text"
                      required={!isLogin}
                      placeholder="(XX) XXXXXXXXX"
                      value={formData.whatsapp}
                      onChange={handleWhatsAppChange}
                      maxLength={15}
                      className="w-full pl-12 pr-4 py-4 bg-[#020a06] border border-emerald-900/60 rounded-2xl text-white placeholder-emerald-700/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-2">Chave PIX</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <CreditCard className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type="text"
                        required={!isLogin}
                        placeholder="CPF, Email ou Aleatória"
                        value={formData.pix_key}
                        onChange={(e) => setFormData({...formData, pix_key: e.target.value})}
                        className="w-full pl-12 pr-4 py-4 bg-[#111312] border border-white/5 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-emerald-500/50" />
              </div>
              <input
                type="email"
                required
                placeholder="Seu email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-[#020a06] border border-emerald-900/60 rounded-2xl text-white placeholder-emerald-700/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-emerald-500/50" />
              </div>
              <input
                type="password"
                required
                placeholder="Sua senha"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-12 pr-4 py-4 bg-[#020a06] border border-emerald-900/60 rounded-2xl text-white placeholder-emerald-700/50 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(16,185,129,0.3)' }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              type="submit"
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-lg flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(16,185,129,0.2)] border border-white/20 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Entrar no Painel' : 'Criar minha conta'}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-emerald-400 hover:text-emerald-300 font-bold text-sm transition-colors"
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
