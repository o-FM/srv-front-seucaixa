
import React, { useState, useEffect } from 'react';
import { View, Sale, Product } from './types';
import { NAV_ITEMS, INITIAL_PRODUCTS } from './constants';
import Dashboard from './views/Dashboard';
import SalesRegistration from './views/SalesRegistration';
import ProductManagement from './views/ProductManagement';
import History from './views/History';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  
  // Estado de Produtos Persistente
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('inventory_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  // Estado de Vendas Persistente
  const [salesHistory, setSalesHistory] = useState<Sale[]>(() => {
    const saved = localStorage.getItem('sales_history');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('inventory_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('sales_history', JSON.stringify(salesHistory));
  }, [salesHistory]);

  const handleCompleteSale = (sale: Sale) => {
    setSalesHistory(prev => [sale, ...prev]);
    
    // Baixa automática de estoque
    setProducts(prevProducts => prevProducts.map(p => {
      const soldItem = sale.items.find(item => item.id === p.id);
      if (soldItem) {
        return { ...p, stock: Math.max(0, p.stock - soldItem.quantity) };
      }
      return p;
    }));
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) {
        return prev.map(p => p.id === product.id ? product : p);
      }
      return [...prev, product];
    });
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm("Deseja realmente excluir este produto?")) {
      setProducts(prev => prev.filter(p => p.id !== id));
    }
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard sales={salesHistory} />;
      case 'sales': return <SalesRegistration products={products} onCompleteSale={handleCompleteSale} />;
      case 'products': return (
        <ProductManagement 
          products={products} 
          onSave={handleSaveProduct} 
          onDelete={handleDeleteProduct} 
        />
      );
      case 'history': return <History sales={salesHistory} />;
      case 'settings': return (
        <div className="p-8 space-y-6">
          <h2 className="text-xl font-bold mb-4">Configurações</h2>
          <div className="space-y-4">
             <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex justify-between items-center text-sm">
                <span>Impressora Bluetooth</span>
                <span className="text-xs text-emerald-500 font-bold">CONECTADO</span>
             </div>
             <button 
                onClick={() => {
                  if(confirm("Deseja resetar o estoque para o padrão inicial?")) {
                    setProducts(INITIAL_PRODUCTS);
                  }
                }}
                className="w-full py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-bold border border-zinc-800 text-sm"
              >
                Resetar Estoque Inicial
             </button>
             <button 
                onClick={() => {
                  if(confirm("Deseja limpar todo o histórico de vendas?")) {
                    setSalesHistory([]);
                  }
                }}
                className="w-full py-4 bg-red-600/10 text-red-500 rounded-2xl font-bold border border-red-500/20 text-sm"
              >
                Limpar Histórico de Vendas
             </button>
          </div>
        </div>
      );
      default: return <Dashboard sales={salesHistory} />;
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto bg-zinc-950 text-zinc-100 flex flex-col selection:bg-purple-500/30">
      <main className="flex-1 overflow-x-hidden">
        {renderView()}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border-t border-zinc-900/50 px-6 py-3 flex justify-between items-center z-40">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id as View)}
            className={`flex flex-col items-center gap-1 transition-all ${
              currentView === item.id 
                ? 'text-purple-400 transform scale-110' 
                : 'text-zinc-500'
            }`}
          >
            <div className={`p-1 rounded-lg ${currentView === item.id ? 'bg-purple-500/10' : ''}`}>
               {item.icon}
            </div>
            <span className="text-[10px] font-bold tracking-tight uppercase">
              {item.label}
            </span>
            {currentView === item.id && (
               <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-0.5 shadow-[0_0_8px_#a78bfa]" />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
