
import React, { useState, useEffect } from 'react';
import { View, Sale, Product, User, Role } from './types';
import { INITIAL_PRODUCTS } from './constants';
import Dashboard from './views/Dashboard';
import SalesRegistration from './views/SalesRegistration';
import ProductManagement from './views/ProductManagement';
import History from './views/History';
import UserManagement from './views/UserManagement';
import Login from './views/Login';
import InstallPrompt from './components/InstallPrompt';
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

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard sales={salesHistory} />;
      case 'sales': return <SalesRegistration products={products} onCompleteSale={handleCompleteSale} />;
      case 'products': return <ProductManagement products={products} onSave={(p) => setProducts(prev => prev.map(i => i.id === p.id ? p : i))} onDelete={(id) => setProducts(p => p.filter(i => i.id !== id))} />;
      case 'history': return <History sales={salesHistory} />;
      case 'users': return <UserManagement users={users} onSaveUser={(u) => setUsers(prev => [...prev, u])} onDeleteUser={(id) => setUsers(u => u.filter(i => i.id !== id))} />;
      case 'settings': return <div className="p-8"><button onClick={handleLogout} className="w-full py-4 bg-red-600 rounded-2xl font-black">SAIR</button></div>;
      default: return <Dashboard sales={salesHistory} />;
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'INÍCIO', icon: <LayoutDashboard size={20} />, roles: ['Admin', 'Gerente'] },
    { id: 'sales', label: 'VENDA', icon: <ShoppingCart size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
    { id: 'products', label: 'ESTOQUE', icon: <Package size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
    { id: 'history', label: 'HISTÓRICO', icon: <HistoryIcon size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
    { id: 'users', label: 'EQUIPE', icon: <Users size={20} />, roles: ['Admin'] },
    { id: 'settings', label: 'CONTA', icon: <Settings size={20} />, roles: ['Admin', 'Gerente', 'Operador'] },
  ];

  return (
    <div className="h-full flex flex-col bg-zinc-950 overflow-hidden">
      {/* Container de visualização que ocupa todo o espaço exceto o menu */}
      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>

      {/* Navegação fixa no rodapé */}
      <nav className="shrink-0 bg-zinc-900/50 backdrop-blur-xl border-t border-zinc-800 flex justify-around items-center px-2 py-3 pb-safe">
        {menuItems.filter(item => item.roles.includes(currentUser.role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1.5 transition-all flex-1 ${
              currentView === item.id ? 'text-purple-400' : 'text-zinc-500'
            }`}
          >
            <div className={`p-2 rounded-xl transition-colors ${currentView === item.id ? 'bg-purple-500/10' : ''}`}>
              {item.icon}
            </div>
            <span className="text-[8px] font-black tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>
      <InstallPrompt />
    </div>
  );
};

export default App;
