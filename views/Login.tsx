
import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShoppingCart } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginProps {
  onLogin: (username: string, pass: string) => boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(username, password);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="text-center space-y-2">
          <div className="w-20 h-20 bg-purple-600/20 rounded-[32px] flex items-center justify-center mx-auto border border-purple-500/30 mb-4 shadow-2xl shadow-purple-600/20">
            <ShoppingCart size={40} className="text-purple-500" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">PDV MÓVEL</h1>
          <p className="text-zinc-500 text-sm font-medium">Acesse sua conta para operar o caixa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Usuário</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="text"
                placeholder="Ex: admin"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-purple-600 outline-none transition-all"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-4">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors" size={20} />
              <input 
                type="password"
                placeholder="••••••••"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:border-purple-600 outline-none transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold p-4 rounded-xl text-center animate-in shake duration-300">
              Credenciais inválidas. Tente novamente.
            </div>
          )}

          <button 
            type="submit"
            className="w-full py-5 bg-purple-600 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-lg shadow-purple-600/30 active:scale-95 transition-all mt-6"
          >
            ENTRAR NO SISTEMA <ArrowRight size={20} />
          </button>
        </form>

        <div className="text-center pt-8">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            V1.5 • MERCADO ONLINE PDV
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
