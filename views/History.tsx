
import React, { useState } from 'react';
import { Sale } from '../types';
import { Search, Calendar, ChevronRight, Receipt, ArrowLeft, Printer } from 'lucide-react';

interface HistoryProps { sales: Sale[]; }

const History: React.FC<HistoryProps> = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const filteredSales = sales.filter(s => 
    s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const ThermalReceipt = ({ sale }: { sale: Sale }) => (
    <div className="bg-white text-zinc-900 p-6 font-mono text-[10px] leading-tight shadow-inner w-full overflow-hidden">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-xs font-black uppercase">Mercado Online PDV</h2>
        <p>CNPJ: 00.000.000/0001-00</p>
      </div>
      <div className="border-t border-dashed border-zinc-400 my-2" />
      <div className="flex justify-between mb-2">
        <span>DATA: {new Date(sale.date).toLocaleDateString()}</span>
        <span>HORA: {new Date(sale.date).toLocaleTimeString()}</span>
      </div>
      <div className="space-y-1 border-t border-dashed border-zinc-400 pt-2">
        {sale.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span>{item.quantity}x {item.name.toUpperCase()}</span>
            <span>{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-zinc-400 my-2 pt-2 text-sm font-black flex justify-between">
        <span>TOTAL R$</span>
        <span>{sale.total.toFixed(2)}</span>
      </div>
      
      <div className="space-y-1 border-t border-dashed border-zinc-400 pt-2">
        <span className="font-bold underline">PAGAMENTOS:</span>
        {sale.payments?.map((p, idx) => (
          <div key={idx} className="flex justify-between">
            <span>{p.method.toUpperCase()}</span>
            <span>{p.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-zinc-400 my-2 pt-2 text-center italic">
        <p>OPERADOR: {sale.operator}</p>
        <p className="mt-2 font-bold uppercase">CUPOM REIMPRESSO</p>
      </div>
    </div>
  );

  if (selectedSale) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in slide-in-from-right duration-300">
        <header className="shrink-0 p-4 flex items-center gap-4 bg-zinc-950 border-b border-zinc-800">
          <button onClick={() => setSelectedSale(null)} className="p-2 bg-zinc-900 rounded-full border border-zinc-800"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-black">Detalhes</h1>
            <p className="text-xs text-zinc-500">#{selectedSale.id}</p>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
          <div className="rounded-[32px] overflow-hidden border border-zinc-800 max-w-sm mx-auto shadow-2xl">
            <ThermalReceipt sale={selectedSale} />
          </div>
          <button onClick={() => window.print()} className="w-full max-w-sm mx-auto py-5 bg-purple-600 rounded-2xl font-black text-white flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-purple-600/20">
            <Printer size={22} /> IMPRIMIR
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-black overflow-hidden">
      <header className="shrink-0 p-4 space-y-6">
        <h1 className="text-2xl font-black tracking-tight">Histórico</h1>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
          <input 
            type="text"
            placeholder="Buscar venda..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 text-sm focus:ring-2 focus:ring-purple-500/50 outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {filteredSales.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
            <Calendar size={48} />
            <p className="text-xs font-bold uppercase tracking-widest">Nenhuma venda encontrada</p>
          </div>
        ) : (
          filteredSales.map((sale) => (
            <div key={sale.id} onClick={() => setSelectedSale(sale)} className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 active:scale-[0.98]">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-bold">Venda #{sale.id.slice(0, 8)}</h4>
                  <span className="text-xs font-black">R$ {sale.total.toFixed(2)}</span>
                </div>
                <p className="text-[9px] text-zinc-500 uppercase font-bold">{sale.paymentMethod}</p>
              </div>
              <ChevronRight size={16} className="text-zinc-700" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
