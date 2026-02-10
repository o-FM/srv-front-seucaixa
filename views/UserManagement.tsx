
import React, { useState } from 'react';
import { User as UserType, Role } from '../types';
import { UserPlus, Shield, Trash2, Key, X, Check } from 'lucide-react';

interface UserManagementProps {
  users: UserType[];
  onSaveUser: (user: UserType) => void;
  onDeleteUser: (id: string) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onSaveUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<UserType>>({ role: 'Operador' });

  const handleSave = () => {
    if (editingUser.username && editingUser.name && editingUser.password) {
      onSaveUser({
        ...editingUser,
        id: editingUser.id || Math.random().toString(36).substr(2, 9),
      } as UserType);
      setIsModalOpen(false);
      setEditingUser({ role: 'Operador' });
    } else {
      alert("Preencha todos os campos, incluindo a senha.");
    }
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'Admin': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'Gerente': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-zinc-400 bg-zinc-800 border-zinc-700';
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24 min-h-screen bg-black">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Usuários</h1>
          <p className="text-zinc-500 text-sm font-medium">Controle de níveis de acesso</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-purple-600 p-4 rounded-2xl shadow-lg shadow-purple-600/20 active:scale-90 transition-all text-white"
        >
          <UserPlus size={24} strokeWidth={3} />
        </button>
      </header>

      <div className="space-y-3">
        {users.map(u => (
          <div key={u.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-xs text-zinc-400">
                {u.name.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{u.name}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-600">@{u.username}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getRoleColor(u.role)}`}>
                    {u.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingUser(u); setIsModalOpen(true); }}
                className="p-2 text-zinc-600 hover:text-purple-400"
              >
                <Key size={18} />
              </button>
              <button 
                onClick={() => u.username !== 'admin' && onDeleteUser(u.id)}
                className={`p-2 ${u.username === 'admin' ? 'opacity-20 grayscale' : 'text-zinc-600 hover:text-red-500'}`}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 space-y-6 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black text-white">{editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500"><X size={24} /></button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Nome Completo</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-sm outline-none focus:border-purple-600"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Nome de Usuário (Login)</label>
                <input 
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-sm outline-none focus:border-purple-600"
                  value={editingUser.username || ''}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Senha</label>
                <input 
                  type="password"
                  placeholder="Defina uma senha"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-2xl py-4 px-5 text-sm outline-none focus:border-purple-600"
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({ ...editingUser, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase ml-2">Cargo / Permissão</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Admin', 'Gerente', 'Operador'] as Role[]).map(r => (
                    <button 
                      key={r}
                      onClick={() => setEditingUser({ ...editingUser, role: r })}
                      className={`py-3 rounded-xl text-[9px] font-black uppercase border transition-all ${
                        editingUser.role === r ? 'bg-purple-600 border-purple-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-600'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
            >
              <Check size={20} /> SALVAR USUÁRIO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
