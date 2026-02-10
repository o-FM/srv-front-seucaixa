
import React, { useState } from 'react';
import { Search, Plus, MoreVertical, Edit2, Trash, X, Barcode, ScanLine, Save, ArrowLeft } from 'lucide-react';
import { Product } from '../types';
import Scanner from '../components/Scanner';

interface ProductManagementProps {
  products: Product[];
  onSave: (product: Product) => void;
  onDelete: (id: string) => void;
}

const CATEGORIES = ['Grãos', 'Bebidas', 'Limpeza', 'Açougues', 'Doces', 'Higiene', 'Frios', 'Padaria'];

const ProductManagement: React.FC<ProductManagementProps> = ({ products, onSave, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const handleAdd = () => {
    setEditingProduct({
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      barcode: '',
      price: 0,
      stock: 0,
      category: 'Geral',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop'
    });
    setIsFormOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      onSave(editingProduct as Product);
      setIsFormOpen(false);
      setEditingProduct(null);
    }
  };

  if (isScannerOpen) {
    return (
      <Scanner 
        onScan={(code) => {
          setEditingProduct(prev => prev ? { ...prev, barcode: code } : null);
          setIsScannerOpen(false);
        }} 
        onClose={() => setIsScannerOpen(false)} 
      />
    );
  }

  if (isFormOpen && editingProduct) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
        <header className="p-4 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsFormOpen(false)} className="p-2 text-zinc-400">
              <ArrowLeft size={24} />
            </button>
            <h2 className="text-xl font-black tracking-tight">
              {products.find(p => p.id === editingProduct.id) ? 'Editar Produto' : 'Novo Produto'}
            </h2>
          </div>
          <button 
            form="product-form"
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 active:scale-95 transition-all"
          >
            <Save size={18} /> Salvar
          </button>
        </header>

        <form id="product-form" onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Código de Barras primeiro */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Código de Barras</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
                <input 
                  required
                  autoFocus
                  type="text"
                  placeholder="Código EAN-13"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono focus:border-purple-500 outline-none transition-all"
                  value={editingProduct.barcode}
                  onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                />
              </div>
              <button 
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="bg-zinc-800 border border-zinc-700 p-4 rounded-2xl text-purple-400 active:scale-90 transition-all"
              >
                <ScanLine size={24} />
              </button>
            </div>
          </div>

          {/* Nome do Produto depois */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Nome do Produto</label>
            <input 
              required
              type="text"
              placeholder="Ex: Arroz Tio João 1kg"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm focus:border-purple-500 outline-none transition-all"
              value={editingProduct.name}
              onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Preço de Venda</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-xs font-bold">R$</span>
                <input 
                  required
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-10 pr-4 text-sm focus:border-purple-500 outline-none transition-all"
                  value={editingProduct.price || ''}
                  onChange={e => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Estoque Atual</label>
              <input 
                required
                type="number"
                placeholder="0"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-sm focus:border-purple-500 outline-none transition-all"
                value={editingProduct.stock || ''}
                onChange={e => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Categoria</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setEditingProduct({ ...editingProduct, category: cat })}
                  className={`px-4 py-2 rounded-full text-[10px] font-bold border transition-all ${
                    editingProduct.category === cat 
                      ? 'bg-purple-600 border-purple-500 text-white' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {editingProduct.id && products.find(p => p.id === editingProduct.id) && (
             <button 
              type="button"
              onClick={() => {
                onDelete(editingProduct.id!);
                setIsFormOpen(false);
              }}
              className="w-full py-4 text-red-500 text-xs font-bold uppercase tracking-widest border border-red-500/20 rounded-2xl mt-8"
             >
                Excluir Produto Permanentemente
             </button>
          )}
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6 pb-24 min-h-screen bg-black">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Estoque</h1>
          <p className="text-zinc-500 text-sm font-medium">{products.length} itens no catálogo</p>
        </div>
        <button 
          onClick={handleAdd}
          className="bg-purple-600 p-4 rounded-2xl shadow-lg shadow-purple-600/20 active:scale-90 transition-all text-white"
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-purple-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Buscar produto ou código..."
          className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all shadow-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="py-20 text-center space-y-4 opacity-50">
             <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
                <Barcode size={32} className="text-zinc-600" />
             </div>
             <p className="text-sm font-medium">Nenhum produto encontrado</p>
          </div>
        ) : (
          filtered.map(product => (
            <div 
              key={product.id} 
              onClick={() => handleEdit(product)}
              className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-4 flex gap-4 items-center active:scale-[0.98] transition-all hover:bg-zinc-900"
            >
              <img src={product.image} className="w-14 h-14 rounded-xl object-cover border border-zinc-800 bg-zinc-800" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm truncate pr-2">{product.name}</h4>
                  <span className="text-sm font-black text-purple-400 whitespace-nowrap">R$ {product.price.toFixed(2)}</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-mono tracking-tighter mb-2">{product.barcode}</p>
                <div className="flex items-center gap-2">
                  <div className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                    product.stock < 10 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                    product.stock < 30 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 
                    'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                  }`}>
                    Estoque: {product.stock}
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{product.category}</span>
                </div>
              </div>
              <MoreVertical size={16} className="text-zinc-700" />
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;
