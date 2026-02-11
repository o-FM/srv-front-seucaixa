
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Trash2, ScanLine, ShoppingBag, CheckCircle2, X, Barcode, Loader2, Share2, Terminal } from 'lucide-react';
import { Product, CartItem, Sale, PaymentEntry } from '../types';
import Scanner from '../components/Scanner';

interface SalesRegistrationProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
}

const SalesRegistration: React.FC<SalesRegistrationProps> = ({ products, onCompleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [manualCode, setManualCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [{ ...product, quantity: 1 }, ...prev];
    });
    setManualCode('');
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const finalizeSale = () => {
    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      items: cart,
      total,
      payments: [{ method: 'Dinheiro', amount: total }],
      paymentMethod: 'Dinheiro',
      operator: 'João',
      operatorId: '1',
      status: 'Concluída'
    };
    onCompleteSale(sale);
    setLastSale(sale);
    setCart([]);
    setShowCheckout(false);
  };

  if (isScannerOpen) return <Scanner onScan={(code) => {
    const p = products.find(prod => prod.barcode === code);
    if(p) addToCart(p);
    setIsScannerOpen(false);
  }} onClose={() => setIsScannerOpen(false)} />;

  return (
    <div className="h-full flex flex-col bg-black">
      {/* 1. HEADER FIXO (Busca e Scan) */}
      <header className="shrink-0 p-4 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-black tracking-tighter text-white">CAIXA LIVRE</h2>
            <div className="flex items-center gap-1 mt-1">
              <Terminal size={10} className="text-purple-500" />
              <span className="text-[8px] font-black text-purple-500/70 uppercase tracking-widest">Develop Mode</span>
            </div>
          </div>
          <div className="px-3 py-1 bg-zinc-900 rounded-full text-[9px] font-black text-zinc-500 uppercase tracking-widest border border-zinc-800">
            OP: JOÃO
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              ref={inputRef}
              type="text"
              placeholder="Produto ou Código..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-purple-600 outline-none transition-all placeholder:text-zinc-700"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter') {
                  const p = products.find(prod => prod.barcode === manualCode || prod.name.toLowerCase().includes(manualCode.toLowerCase()));
                  if(p) addToCart(p);
                }
              }}
            />
          </div>
          <button 
            onClick={() => setIsScannerOpen(true)}
            className="bg-purple-600 p-4 rounded-2xl text-white shadow-lg shadow-purple-600/20 active:scale-90 transition-transform"
          >
            <ScanLine size={24} />
          </button>
        </div>
      </header>

      {/* 2. ÁREA DE ITENS (O ÚNICO LUGAR COM SCROLL) */}
      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-20 gap-4 text-center px-8">
            <ShoppingBag size={64} strokeWidth={1} />
            <p className="text-xs font-black uppercase tracking-[0.2em] leading-relaxed">
              Inicie a venda lendo um código ou digitando o nome
            </p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-zinc-900/30 border border-zinc-800/50 p-4 rounded-3xl flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
              <div className="flex-1 min-w-0 pr-4">
                <h4 className="text-sm font-bold text-white truncate">{item.name}</h4>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-zinc-500"><Minus size={14}/></button>
                      <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-zinc-500"><Plus size={14}/></button>
                   </div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                     UN R$ {item.price.toFixed(2)}
                   </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-purple-400">R$ {(item.price * item.quantity).toFixed(2)}</div>
                <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-zinc-800 mt-2"><Trash2 size={14}/></button>
              </div>
            </div>
          ))
        )}
      </main>

      {/* 3. RODAPÉ FIXO (Total e Botão de Ação) */}
      <footer className="shrink-0 p-5 bg-zinc-950 border-t border-zinc-900 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.4)]">
        <div className="flex justify-between items-end">
           <div>
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total da Venda</p>
              <h3 className="text-4xl font-black text-white tracking-tighter">R$ {total.toFixed(2)}</h3>
           </div>
           <div className="text-right pb-1">
              <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{cart.length} ITENS</p>
           </div>
        </div>

        <button 
          onClick={() => setShowCheckout(true)}
          disabled={cart.length === 0}
          className="w-full py-5 bg-purple-600 rounded-[24px] font-black text-white tracking-widest uppercase text-sm shadow-xl shadow-purple-600/10 active:scale-[0.98] disabled:opacity-20 transition-all"
        >
          FINALIZAR PAGAMENTO
        </button>
      </footer>

      {/* Modal de Conclusão */}
      {showCheckout && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6">
           <div className="w-full max-w-xs bg-zinc-900 border border-zinc-800 rounded-[40px] p-8 space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-white">Confirmar Venda?</h3>
              <p className="text-zinc-500 text-sm">O valor de <strong>R$ {total.toFixed(2)}</strong> será registrado no sistema.</p>
              <div className="space-y-3">
                 <button onClick={finalizeSale} className="w-full py-4 bg-emerald-600 rounded-2xl font-black text-white active:scale-95 transition-all">CONFIRMAR</button>
                 <button onClick={() => setShowCheckout(false)} className="w-full py-4 bg-zinc-800 rounded-2xl font-black text-zinc-400 active:scale-95 transition-all">VOLTAR</button>
              </div>
           </div>
        </div>
      )}

      {/* View de Sucesso Pós-Venda */}
      {lastSale && (
        <div className="fixed inset-0 z-[110] bg-black flex flex-col items-center justify-center p-8 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/20">
               <CheckCircle2 size={48} className="text-white" />
            </div>
            <h2 className="text-3xl font-black tracking-tighter mb-2">VENDA OK!</h2>
            <p className="text-zinc-500 font-bold text-sm mb-12 uppercase tracking-widest">Cupom #{lastSale.id}</p>
            
            <div className="w-full space-y-3">
               <button className="w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3">
                  <Share2 size={20} /> COMPARTILHAR CUPOM
               </button>
               <button 
                 onClick={() => setLastSale(null)} 
                 className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black"
               >
                  PRÓXIMA VENDA
               </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default SalesRegistration;
