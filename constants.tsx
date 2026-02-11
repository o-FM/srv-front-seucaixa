
import React from 'react';
import { LayoutDashboard, ShoppingCart, Package, History, Settings } from 'lucide-react';
// import { Product } from './types';

// export const INITIAL_PRODUCTS: Product[] = [
//   { id: '1', name: 'Arroz Integral 1kg', barcode: '7891234567890', price: 15.90, stock: 50, category: 'Grãos', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop' },
//   { id: '2', name: 'Feijão Preto 1kg', barcode: '7891234567891', price: 8.50, stock: 42, category: 'Grãos', image: 'https://images.unsplash.com/photo-1551462147-37885acc3c41?w=200&h=200&fit=crop' },
//   { id: '3', name: 'Óleo de Soja 900ml', barcode: '7891234567892', price: 6.99, stock: 24, category: 'Óleos', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&h=200&fit=crop' },
//   { id: '4', name: 'Café Torrado 500g', barcode: '7891234567893', price: 21.50, stock: 15, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop' },
//   { id: '5', name: 'Açúcar Refinado 1kg', barcode: '7891234567894', price: 4.80, stock: 60, category: 'Doces', image: 'https://images.unsplash.com/photo-1581448670548-410d255a0b3e?w=200&h=200&fit=crop' },
//   { id: '6', name: 'Cerveja Lata 350ml', barcode: '7891991010392', price: 3.99, stock: 120, category: 'Bebidas', image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?w=200&h=200&fit=crop' },
//   { id: '7', name: 'Sabonete Dove 90g', barcode: '7891150031862', price: 4.25, stock: 85, category: 'Higiene', image: 'https://images.unsplash.com/photo-1600857062241-98e5dba7f214?w=200&h=200&fit=crop' },
//   { id: '8', name: 'Creme Dental 90g', barcode: '7891037000516', price: 5.90, stock: 40, category: 'Higiene', image: 'https://images.unsplash.com/photo-1559591937-e3b2af98563a?w=200&h=200&fit=crop' },
// ];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', icon: <LayoutDashboard size={20} /> },
  { id: 'sales', label: 'Venda', icon: <ShoppingCart size={20} /> },
  { id: 'products', label: 'Estoque', icon: <Package size={20} /> },
  { id: 'history', label: 'Histórico', icon: <History size={20} /> },
  { id: 'settings', label: 'Config', icon: <Settings size={20} /> },
];
