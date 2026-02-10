
import React, { useMemo } from 'react';
import { TrendingUp, Users, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Sale } from '../types';

interface DashboardProps {
  sales: Sale[];
}

const Dashboard: React.FC<DashboardProps> = ({ sales }) => {
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    const totalItems = sales.reduce((acc, s) => acc + s.items.reduce((sum, i) => sum + i.quantity, 0), 0);
    const uniqueCustomers = new Set(sales.map(s => s.id)).size; // Simple mock: each sale is a "customer" for now
    const ticketMedio = sales.length > 0 ? totalRevenue / sales.length : 0;

    return { totalRevenue, totalItems, uniqueCustomers, ticketMedio };
  }, [sales]);

  // Generate hourly data based on today's sales
  const chartData = useMemo(() => {
    const hours = ['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
    const data = hours.map(h => ({ name: h, sales: 0 }));
    
    // Add real data to closest bucket (simplified logic)
    sales.forEach(s => {
      const hour = new Date(s.date).getHours();
      const bucketIndex = Math.floor((hour - 8) / 2);
      if (bucketIndex >= 0 && bucketIndex < data.length) {
        data[bucketIndex].sales += s.total;
      }
    });

    // If no sales, show some subtle mock placeholders so it's not empty
    if (sales.length === 0) return [
      { name: '08:00', sales: 40 }, { name: '10:00', sales: 120 }, { name: '12:00', sales: 210 }, 
      { name: '14:00', sales: 180 }, { name: '16:00', sales: 240 }, { name: '18:00', sales: 310 }, { name: '20:00', sales: 150 }
    ];

    return data;
  }, [sales]);

  return (
    <div className="space-y-6 pb-24 p-4">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Dashboard</h1>
          <p className="text-zinc-400 text-sm">Resumo operacional real</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-900/30 text-purple-400 text-[10px] font-black px-3 py-1.5 rounded-full border border-purple-500/30">
          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
          AO VIVO
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-2">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-500">
            <DollarSign size={20} />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Faturamento</p>
            <h3 className="text-xl font-black tracking-tighter">R$ {stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-2">
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
            <Users size={20} />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Vendas</p>
            <h3 className="text-xl font-black tracking-tighter">{sales.length}</h3>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-2">
          <div className="w-10 h-10 bg-orange-600/20 rounded-xl flex items-center justify-center text-orange-500">
            <Package size={20} />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Itens</p>
            <h3 className="text-xl font-black tracking-tighter">{stats.totalItems}</h3>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl space-y-2">
          <div className="w-10 h-10 bg-emerald-600/20 rounded-xl flex items-center justify-center text-emerald-500">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Ticket Médio</p>
            <h3 className="text-xl font-black tracking-tighter">R$ {stats.ticketMedio.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[32px] space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">Fluxo de Caixa (Hoje)</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{backgroundColor: '#18181b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'}}
                itemStyle={{color: '#a78bfa', fontWeight: '900'}}
              />
              <Area 
                type="monotone" 
                dataKey="sales" 
                stroke="#7c3aed" 
                fillOpacity={1} 
                fill="url(#colorSales)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 px-1">Últimas Vendas</h3>
        {sales.length === 0 ? (
          <p className="text-center py-8 text-zinc-600 text-sm italic">Nenhuma atividade registrada ainda.</p>
        ) : (
          sales.slice(0, 5).map((sale) => (
            <div key={sale.id} className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50">
              <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-black text-[10px]">
                {sale.paymentMethod.substring(0, 2)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Venda #{sale.id.slice(0, 6)}</p>
                <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {new Date(sale.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {sale.items.length} itens
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-white">R$ {sale.total.toFixed(2)}</p>
                <p className="text-[10px] text-emerald-500 font-bold">OK</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
