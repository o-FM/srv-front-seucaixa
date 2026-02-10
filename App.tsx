
import React, { useState, useEffect } from 'react';
import { View, Sale, Product, User, Role } from './types';
import { NAV_ITEMS, INITIAL_PRODUCTS } from './constants';
import Dashboard from './views/Dashboard';
import SalesRegistration from './views/SalesRegistration';
import ProductManagement from './views/ProductManagement';
import History from './views/History';
import UserManagement from './views/UserManagement';
import Login from './views/Login';
import { LayoutDashboard, ShoppingCart, Package, History as HistoryIcon, Users, Settings } from 'lucide-react';

const INITIAL_USERS: User[] = [
  { id: '1', username: 'admin', password: '123', name: 'Administrador Principal', role: 'Admin' },
  { id: '2', username: 'operador', password: '123', name: 'João Operador', role: 'Operador' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('logged_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Define a visualização inicial baseada no cargo do usuário salvo
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('logged_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u.role === 'Operador' ? 'sales' : 'dashboard';
    }
    return 'dashboard';
  });
  
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('pdv_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [salesHistory, setSalesHistory] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
    localStorage.setItem('sales_history', JSON.stringify(salesHistory));
    localStorage.setItem('pdv_users', JSON.stringify(users));
  }, [products, salesHistory, users]);

  const handleLogin = (user: string, pass: string) => {
    const found = users.find(u => u.username === user && u.password === pass);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('logged_user', JSON.stringify(found));
      // Redireciona Operador para Vendas, outros para Dashboard
      setCurrentView(found.role === 'Operador' ? 'sales' : 'dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('logged_user');
    setCurrentView('dashboard');
  };

  const handleCompleteSale = (sale: Sale) => {
    const enrichedSale: Sale = {
      ...sale,
      operator: currentUser?.name || 'Sistema',
      operatorId: currentUser?.id || 'sys'
    };
    
    setSalesHistory(prev => [enrichedSale, ...prev]);
    
    setProducts(prevProducts => prevProducts.map(p => {
      const soldItem = sale.items.find(item => item.id === p.id);
      if (soldItem) return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      return p;
    }));
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.map(p => p.id === product.id ? product : p);
      return [...prev, product];
    });
  };

  const handleSaveUser = (user: User) => {
    setUsers(prev => {
      const exists = prev.find(u => u.id === user.id);
      if (exists) return prev.map(u => u.id === user.id ? user : u);
      return [...prev, user];
    });
  };

  // Filtrar vendas com base no role
  const filteredSales = currentUser?.role === 'Operador' 
    ? salesHistory.filter(s => s.operatorId === currentUser.id)
    : salesHistory;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const renderView = () => {
    // Bloqueio de segurança: Se um operador tentar ver o dashboard, redireciona para vendas
    if (currentView === 'dashboard' && currentUser.role === 'Operador') {
      return <SalesRegistration products={products} onCompleteSale={handleCompleteSale} />;
    }

    switch (currentView) {
      case 'dashboard': return <Dashboard sales={filteredSales} />;
      case 'sales': return <SalesRegistration products={products} onCompleteSale={handleCompleteSale} />;
      case 'products': return (
        <ProductManagement 
          products={products} 
          onSave={handleSaveProduct} 
          onDelete={(id) => confirm("Excluir?") && setProducts(p => p.filter(i => i.id !== id))} 
        />
      );
      case 'history': return <History sales={filteredSales} />;
      case 'users': 
        if (currentUser.role !== 'Admin') return <Dashboard sales={filteredSales} />;
        return <UserManagement users={users} onSaveUser={handleSaveUser} onDeleteUser={(id) => setUsers(u => u.filter(i => i.id !== id))} />;
      case 'settings': return (
        <div className="p-8 space-y-6">
          <header className="space-y-2">
            <h2 className="text-2xl font-black">Configurações</h2>
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center gap-4">
               <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-500 font-black">
                  {currentUser.name.substring(0, 1)}
               </div>
               <div>
                 <p className="font-bold text-white leading-none">{currentUser.name}</p>
                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">{currentUser.role}</p>
               </div>
            </div>
          </header>
          
          <div className="space-y-3">
             <button onClick={handleLogout} className="w-full py-5 bg-red-600/10 text-red-500 rounded-2xl font-black border border-red-500/20 active:scale-95 transition-all">
                SAIR DA CONTA
             </button>
             
             {currentUser.role === 'Admin' && (
                <button 
                   onClick={() => confirm("Deseja resetar TUDO?") && (localStorage.clear(), window.location.reload())}
                   className="w-full py-5 bg-zinc-900 text-zinc-600 rounded-2xl font-black border border-zinc-800 text-xs uppercase"
                >
                  Resetar Fábrica (Limpar Tudo)
                </button>
             )}
          </div>
        </div>
      );
      default: return <Dashboard sales={filteredSales} />;
    }
  };

  const menuItems = [
    // Dashboard (Início) agora visível apenas para Admin e Gerente
    { id: 'dashboard', label: 'Início', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Gerente'] },
    { id: 'sales', label: 'Venda', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
    { id: 'products', label: 'Estoque', icon: <Package size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
    { id: 'history', label: 'Histórico', icon: <HistoryIcon size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
    { id: 'users', label: 'Equipe', icon: <Users size={20} />, roles: ['Admin'] },
    { id: 'settings', label: 'Conta', icon: <Settings size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
  ];

  return (
    <div className="min-h-screen max-w-md mx-auto bg-zinc-950 text-zinc-100 flex flex-col">
      <main className="flex-1 overflow-x-hidden">{renderView()}</main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900/50 px-4 py-3 flex justify-around items-center z-40">
        {menuItems.filter(item => item.roles.includes(currentUser.role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === item.id ? 'text-purple-400 transform scale-105' : 'text-zinc-600'
            }`}
          >
            <div className={`p-1.5 rounded-xl ${currentView === item.id ? 'bg-purple-500/10' : ''}`}>
               {item.icon}
            </div>
            <span className="text-[8px] font-black tracking-tight uppercase">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
