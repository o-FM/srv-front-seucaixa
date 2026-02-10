
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Trash2, ScanLine, CreditCard, Wallet, QrCode, ArrowRight, Barcode, ShoppingBag, Receipt, CheckCircle2, X, AlertCircle, RefreshCw, Calculator, Banknote, MessageSquare, Mail, Send, FileText, Share2, Loader2 } from 'lucide-react';
import { Product, CartItem, Sale, PaymentMethod, PaymentEntry } from '../types';
import Scanner from '../components/Scanner';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface SalesRegistrationProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
}

const SalesRegistration: React.FC<SalesRegistrationProps> = ({ products, onCompleteSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Estados de Pagamento
  const [checkoutStep, setCheckoutStep] = useState<'selection' | 'amount' | 'method'>('selection');
  const [collectedPayments, setCollectedPayments] = useState<PaymentEntry[]>([]);
  const [pendingPayment, setPendingPayment] = useState<{ method: PaymentMethod; amount: number } | null>(null);
  const [partialAmount, setPartialAmount] = useState<string>('');
  
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [manualCode, setManualCode] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Estados de Envio
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  useEffect(() => {
    if (!isScannerOpen && !showCheckout && !lastSale && !pendingPayment) {
      inputRef.current?.focus();
    }
  }, [isScannerOpen, showCheckout, lastSale, pendingPayment]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
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

  const handleScan = (barcode: string) => {
    const product = products.find(p => p.barcode === barcode);
    if (product) {
      addToCart(product);
      setIsScannerOpen(false);
      setManualCode('');
    } else {
      alert(`Produto com código ${barcode} não cadastrado.`);
    }
  };

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalPaid = collectedPayments.reduce((acc, p) => acc + p.amount, 0);
  const remaining = Math.max(0, total - totalPaid);

  const startCheckout = () => {
    setCheckoutStep('selection');
    setShowCheckout(true);
  };

  const selectTotal = () => {
    setPartialAmount(remaining.toFixed(2));
    setCheckoutStep('method');
  };

  const selectPartial = () => {
    setPartialAmount('');
    setCheckoutStep('amount');
  };

  const handleMethodSelection = (method: PaymentMethod) => {
    const amount = parseFloat(partialAmount);
    if (isNaN(amount) || amount <= 0) {
      alert("Informe um valor válido.");
      return;
    }
    setPendingPayment({ method, amount });
    setShowCheckout(false);
  };

  const confirmPayment = () => {
    if (!pendingPayment) return;
    
    const newPayments = [...collectedPayments, pendingPayment];
    const newTotalPaid = newPayments.reduce((acc, p) => acc + p.amount, 0);
    
    setCollectedPayments(newPayments);
    setPendingPayment(null);

    if (newTotalPaid >= total - 0.01) {
      finalizeSale(newPayments);
    } else {
      setCheckoutStep('selection');
      setShowCheckout(true);
    }
  };

  const finalizeSale = (allPayments: PaymentEntry[]) => {
    const newSale: Sale = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      date: new Date().toISOString(),
      items: [...cart],
      total: total,
      payments: allPayments,
      paymentMethod: allPayments.map(p => p.method).join(' + '),
      operator: 'JOÃO CAIXA',
      operatorId: '', 
      status: 'Concluída'
    };
    
    onCompleteSale(newSale);
    setLastSale(newSale);
    setCart([]);
    setCollectedPayments([]);
    setShowCheckout(false);
  };

  const abortSale = () => {
    if (confirm("Deseja CANCELAR toda a venda e limpar o carrinho?")) {
      setCart([]);
      setCollectedPayments([]);
      setPendingPayment(null);
      setShowCheckout(false);
    }
  };

  const handleSharePDF = async () => {
    if (!receiptRef.current || !lastSale) return;
    
    setIsGeneratingPDF(true);
    try {
      // Captura o cupom como imagem
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, (canvas.height * 80) / canvas.width] // Formato papel térmico 80mm
      });

      const imgWidth = 80;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const pdfBlob = pdf.output('blob');
      const fileName = `Cupom_${lastSale.id}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Tenta usar a API de Compartilhamento Nativa
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Cupom Fiscal - Mercado Online',
          text: `Segue o cupom fiscal da sua compra no valor de R$ ${lastSale.total.toFixed(2)}`
        });
      } else {
        // Fallback: Download do arquivo
        const link = document.createElement('a');
        link.href = URL.createObjectURL(pdfBlob);
        link.download = fileName;
        link.click();
        alert("PDF gerado com sucesso! Verifique sua pasta de downloads para compartilhar.");
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o PDF do cupom.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (isScannerOpen) return <Scanner onScan={handleScan} onClose={() => setIsScannerOpen(false)} />;

  const ThermalReceipt = ({ sale }: { sale: Sale }) => (
    <div ref={receiptRef} className="bg-white text-zinc-900 p-8 font-mono text-[11px] leading-tight shadow-2xl max-w-[320px] mx-auto overflow-hidden">
      <div className="text-center space-y-1 mb-4">
        <h2 className="text-sm font-black uppercase">Mercado Online PDV</h2>
        <p className="text-[9px]">CNPJ: 00.000.000/0001-00</p>
        <p className="text-[9px]">Rua das Flores, 123 - Centro</p>
      </div>
      <div className="border-t border-dashed border-zinc-400 my-2" />
      <div className="flex justify-between mb-2">
        <span>DATA: {new Date(sale.date).toLocaleDateString()}</span>
        <span>ID: {sale.id}</span>
      </div>
      <div className="space-y-1 mb-2">
        {sale.items.map((item, i) => (
          <div key={i} className="flex justify-between">
            <span className="truncate pr-2">{item.quantity}x {item.name.toUpperCase()}</span>
            <span>{(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-zinc-400 pt-2 flex justify-between font-black text-sm">
        <span>TOTAL</span>
        <span>R$ {sale.total.toFixed(2)}</span>
      </div>
      <div className="mt-2 space-y-1">
        <span className="text-[9px] font-bold">PAGAMENTOS:</span>
        {sale.payments.map((p, idx) => (
          <div key={idx} className="flex justify-between italic text-[10px]">
            <span>{p.method.toUpperCase()}</span>
            <span>R$ {p.amount.toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="text-center mt-6 font-bold pt-2 border-t border-dashed border-zinc-400 text-[10px]">
        OBRIGADO PELA PREFERÊNCIA!
        <div className="mt-2 flex justify-center opacity-50">
           <Barcode size={40} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-black">
      <header className="p-4 bg-zinc-950 border-b border-zinc-800 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-black tracking-tighter">CAIXA LIVRE</h2>
          <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded-full text-[10px] font-bold text-zinc-500">
            OP: JOÃO
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 group">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Produto..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-purple-600 outline-none transition-all"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter') {
                   const cleanCode = manualCode.trim();
                   const p = products.find(p => p.barcode === cleanCode || p.name.toLowerCase().includes(cleanCode.toLowerCase()));
                   if(p) { addToCart(p); setManualCode(''); }
                }
              }}
            />
          </div>
          <button onClick={() => setIsScannerOpen(true)} className="bg-purple-600 p-4 rounded-2xl text-white active:scale-90 transition-transform">
            <ScanLine size={24} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4">
            <ShoppingBag size={48} />
            <p className="text-xs font-bold uppercase tracking-widest">Carrinho Vazio</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item, idx) => (
              <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                <div className="flex-1">
                  <h4 className="text-sm font-bold">{item.name}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1"><Minus size={14}/></button>
                      <span className="w-8 text-center text-xs font-black">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1"><Plus size={14}/></button>
                    </div>
                    <span className="text-xs font-black text-zinc-500">R$ {item.price.toFixed(2)} un.</span>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-sm font-black">R$ {(item.price * item.quantity).toFixed(2)}</div>
                   <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-zinc-700 hover:text-red-500 mt-2"><Trash2 size={16}/></button>
                </div>
              </div>
            )).reverse()}
          </div>
        )}
      </main>

      <footer className="p-6 bg-zinc-950 border-t border-zinc-800 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-bold text-zinc-500 uppercase">Total da Venda</span>
            <div className="text-3xl font-black">R$ {total.toFixed(2)}</div>
          </div>
          {totalPaid > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-500 uppercase">Recebido: R$ {totalPaid.toFixed(2)}</span>
              <div className="text-sm font-bold text-purple-400">Restante: R$ {remaining.toFixed(2)}</div>
            </div>
          )}
        </div>
        <button 
          onClick={startCheckout}
          disabled={total === 0}
          className="w-full py-5 bg-purple-600 rounded-2xl font-black text-white shadow-lg active:scale-95 disabled:opacity-50"
        >
          {collectedPayments.length > 0 ? 'PAGAR SALDO RESTANTE' : 'FINALIZAR PAGAMENTO'}
        </button>
      </footer>

      {/* Modal de Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-end justify-center p-4">
          <div className="w-full max-w-sm bg-zinc-900 border-t border-zinc-800 rounded-t-[40px] p-8 space-y-8 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-black">Pagamento</h3>
              <button onClick={() => setShowCheckout(false)} className="bg-zinc-800 p-2 rounded-full"><X size={20}/></button>
            </div>

            {checkoutStep === 'selection' && (
              <div className="grid grid-cols-1 gap-4">
                <button 
                  onClick={selectTotal}
                  className="w-full p-6 bg-zinc-800 border-2 border-transparent hover:border-purple-600 rounded-3xl flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <CheckCircle2 size={24}/>
                  </div>
                  <div className="text-left">
                    <div className="font-black uppercase text-xs tracking-widest">Cobrar Valor Total</div>
                    <div className="text-lg font-black text-white">R$ {remaining.toFixed(2)}</div>
                  </div>
                </button>

                <button 
                  onClick={selectPartial}
                  className="w-full p-6 bg-zinc-950 border-2 border-zinc-800 hover:border-blue-500/50 rounded-3xl flex items-center gap-4 group transition-all"
                >
                  <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Calculator size={24}/>
                  </div>
                  <div className="text-left">
                    <div className="font-black uppercase text-xs tracking-widest">Cobrar Valor Parcial</div>
                    <div className="text-sm font-bold text-zinc-500">Definir quanto cliente pagará agora</div>
                  </div>
                </button>
              </div>
            )}

            {checkoutStep === 'amount' && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Informe o Valor</label>
                  <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl flex items-center gap-4">
                    <span className="text-2xl font-black text-zinc-700">R$</span>
                    <input 
                      autoFocus
                      type="number" 
                      placeholder="0,00"
                      className="bg-transparent text-3xl font-black text-white outline-none w-full"
                      value={partialAmount}
                      onChange={e => setPartialAmount(e.target.value)}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => partialAmount && setCheckoutStep('method')}
                  className="w-full py-4 bg-blue-600 rounded-2xl font-black text-white active:scale-95"
                >
                  CONTINUAR PARA MÉTODOS
                </button>
                <button onClick={() => setCheckoutStep('selection')} className="w-full text-zinc-500 text-xs font-bold uppercase">Voltar</button>
              </div>
            )}

            {checkoutStep === 'method' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                   <div className="text-[10px] font-bold text-zinc-500 uppercase">Recebendo R$ {parseFloat(partialAmount).toFixed(2)}</div>
                   <button onClick={() => setCheckoutStep('selection')} className="text-[10px] font-bold text-purple-500">Alterar Valor</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {id: 'Dinheiro', icon: <Wallet size={18}/>, color: 'text-emerald-500'},
                    {id: 'PIX', icon: <QrCode size={18}/>, color: 'text-purple-500'},
                    {id: 'Crédito', icon: <CreditCard size={18}/>, color: 'text-blue-500'},
                    {id: 'Débito', icon: <CreditCard size={18}/>, color: 'text-sky-400'},
                    {id: 'Ticket Refeição', icon: <Receipt size={18}/>, color: 'text-orange-500'},
                    {id: 'Ticket Alimentação', icon: <Receipt size={18}/>, color: 'text-red-500'},
                  ].map(m => (
                    <button 
                      key={m.id}
                      onClick={() => handleMethodSelection(m.id as PaymentMethod)}
                      className="flex flex-col items-center justify-center p-4 bg-zinc-950 border border-zinc-800 rounded-2xl gap-2 active:scale-95 hover:border-zinc-700 transition-all"
                    >
                      <div className={m.color}>{m.icon}</div>
                      <span className="text-[9px] font-black uppercase text-center leading-tight">{m.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Validação de Pagamento */}
      {pendingPayment && (
        <div className="fixed inset-0 z-[60] bg-black/98 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <div className="w-full max-w-sm space-y-8 text-center">
              <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                 <RefreshCw size={32} className="text-purple-400 animate-spin-slow" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-2xl font-black">Confirme no Terminal</h2>
                 <p className="text-zinc-500 text-sm">Aguardando recebimento via <span className="text-purple-400 font-bold">{pendingPayment.method}</span></p>
                 <div className="text-4xl font-black text-white py-4">R$ {pendingPayment.amount.toFixed(2)}</div>
              </div>
              <div className="space-y-3">
                 <button onClick={confirmPayment} className="w-full py-5 bg-emerald-600 rounded-2xl font-black text-white flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-emerald-900/20">
                    <CheckCircle2 size={20}/> PAGAMENTO APROVADO
                 </button>
                 <button onClick={() => setPendingPayment(null)} className="w-full py-4 bg-zinc-900 text-zinc-400 rounded-2xl font-bold active:scale-95 border border-zinc-800">
                    RECUSADO / VOLTAR
                 </button>
                 <button onClick={abortSale} className="pt-4 text-red-500 text-[10px] font-black uppercase tracking-widest">Cancelar Venda Inteira</button>
              </div>
           </div>
        </div>
      )}

      {/* Resultado Final com Fluxo de Envio em PDF */}
      {lastSale && (
        <div className="fixed inset-0 z-[70] bg-black/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 overflow-y-auto">
          <div className="w-full max-w-sm flex flex-col gap-6 my-auto pb-12">
            <div className="flex flex-col items-center gap-2">
               <CheckCircle2 size={48} className="text-emerald-500" />
               <h2 className="text-xl font-black">Venda Finalizada!</h2>
            </div>
            
            <div className="rounded-[40px] overflow-hidden border border-zinc-800 shadow-2xl">
              <ThermalReceipt sale={lastSale} />
            </div>

            <div className="space-y-3">
              <button 
                onClick={handleSharePDF}
                disabled={isGeneratingPDF}
                className="w-full py-5 bg-white text-black rounded-2xl font-black flex items-center justify-center gap-3 active:scale-95 shadow-lg disabled:opacity-50"
              >
                {isGeneratingPDF ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Share2 size={20} />
                )}
                ENVIAR CUPOM PDF (WHATSAPP/EMAIL)
              </button>

              <button 
                onClick={() => setLastSale(null)} 
                className="w-full py-4 bg-purple-600 rounded-2xl font-black text-white active:scale-95"
              >
                PRÓXIMA VENDA
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default SalesRegistration;
