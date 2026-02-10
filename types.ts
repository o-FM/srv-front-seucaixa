
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
  paymentMethod: string; // Mantido para compatibilidade, agora será uma string resumida
  operator: string;
  status: 'Concluída' | 'Cancelada' | 'Pendente';
}

export type View = 'dashboard' | 'sales' | 'products' | 'history' | 'settings' | 'scanner';
