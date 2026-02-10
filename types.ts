
export type Role = 'Admin' | 'Gerente' | 'Operador';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type PaymentMethod = 'Dinheiro' | 'Crédito' | 'Débito' | 'PIX' | 'Ticket Refeição' | 'Ticket Alimentação';

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
}

export interface Sale {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  payments: PaymentEntry[];
  paymentMethod: string;
  operator: string;
  operatorId: string; // Adicionado para filtro de permissão
  status: 'Concluída' | 'Cancelada' | 'Pendente';
}

export type View = 'dashboard' | 'sales' | 'products' | 'history' | 'users' | 'settings';
