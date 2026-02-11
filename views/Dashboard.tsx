
import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Package, User } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sale } from '../types';

interface DashboardProps {
  sales: Sale[];
}

interface OperatorStat {
  name: string;
  vendas: number;
  itens: number;
  totalRevenue: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sales }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalItems = sales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);
    const ticketMedio = sales.length > 0 ? totalRevenue / sales.length : 0;
    return { totalRevenue, totalItems, ticketMedio };
  }, [sales]);

  const operatorStats = useMemo(() => {
    const grouped = sales.reduce((acc: Record<string, OperatorStat>, s) => {
      const id = s.operatorId || s.operator;
      if (!acc[id]) {
        acc[id] = { name: s.operator, vendas: 0, itens: 0, totalRevenue: 0 };
      }
      acc[id].vendas += 1;
      acc[id].totalRevenue += s.total;
      acc[id].itens += s.items.reduce((sum, i) => sum + i.quantity, 0);
      return acc;
    }, {} as Record<string, OperatorStat>);

    return (Object.values(grouped) as OperatorStat[]).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [sales]);

  const chartData = useMemo(() => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const data = hours.map(h => ({ name: h, sales: 0 }));
    
    sales.forEach(s => {
      const hour = new Date(s.date).getHours();
      const bucketIndex = Math.floor((hour - 8) / 2);
      if (bucketIndex >= 0 && bucketIndex < data.length) {
        data[bucketIndex].sales += s.total;
      }
    });

    if (sales.length === 0) return hours.map(h => ({ name: h, sales: 0 }));
    return data;
  }, [sales]);

  return (
    <div className="h-full overflow-y-auto space-y-6 pb-24 p-4 md:p-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-sm font-medium">Resumo de desempenho operacional</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 text-[9px] md:text-[11px] font-black px-4 py-2 rounded-full border border-emerald-500/20 self-start md:self-auto">
          SESSÃO ATIVA
        </div>
      </header>

      {/* Stats Globais - Responsivo: 2 colunas mobile, 4 colunas desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-[24px] space-y-1">
          <DollarSign size={16} className="text-purple-500 mb-2" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Faturamento</p>
          <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">R$ {stats.totalRevenue.toFixed(2)}</h3>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-[24px] space-y-1">
          <Users size={16} className="text-blue-500 mb-2" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Vendas</p>
          <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">{sales.length}</h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-[24px] space-y-1">
          <Package size={16} className="text-orange-500 mb-2" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Itens</p>
          <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">{stats.totalItems}</h3>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-[24px] space-y-1">
          <TrendingUp size={16} className="text-emerald-500 mb-2" />
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Média Venda</p>
          <h3 className="text-xl md:text-2xl font-black tracking-tighter text-white">R$ {stats.ticketMedio.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fluxo de Caixa - Ocupa 2 colunas no desktop */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 p-5 md:p-8 rounded-[32px]">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-zinc-500 mb-6">Fluxo de Caixa (Faturamento p/ Hora)</h3>
          <div className="h-48 md:h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#18181b" />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px'}}
                  itemStyle={{color: '#a78bfa', fontWeight: '900'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#7c3aed" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={4}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Atividade Recente - Ocupa 1 coluna no desktop */}
        <div className="space-y-4">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-zinc-500 px-1">Atividade Recente</h3>
          <div className="space-y-3">
            {sales.length === 0 ? (
              <p className="text-center py-8 text-zinc-700 text-xs italic">Sem vendas registradas hoje.</p>
            ) : (
              sales.slice(0, 4).map((sale) => (
                <div key={sale.id} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
                  <div className="w-10 h-10 bg-purple-600/10 text-purple-500 rounded-full flex items-center justify-center font-black text-[10px]">
                    {sale.paymentMethod.substring(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">Venda #{sale.id.slice(0, 6)}</p>
                    <p className="text-[9px] text-zinc-600 font-bold uppercase truncate">POR: {sale.operator}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-sm font-black text-white">R$ {sale.total.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Desempenho da Equipe - Grid responsivo */}
      {operatorStats.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-black text-[10px] uppercase tracking-widest text-zinc-500 px-1">Desempenho da Equipe</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {operatorStats.map((op, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 md:p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-600/20 rounded-full flex items-center justify-center text-purple-400">
                    <User size={16} />
                  </div>
                  <h4 className="text-sm font-black text-white">{op.name}</h4>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Vendas</p>
                    <p className="text-base font-black text-white">{op.vendas}</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Itens</p>
                    <p className="text-base font-black text-white">{op.itens}</p>
                  </div>
                  <div className="text-center p-3 bg-zinc-950 rounded-2xl border border-zinc-800">
                    <p className="text-[8px] font-black text-zinc-500 uppercase mb-1">Média</p>
                    <p className="text-sm font-black text-purple-400">R${(op.totalRevenue / op.vendas).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
