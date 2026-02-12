
import React, { useEffect, useRef, useState } from 'react';
import { X, Zap, ZapOff, Loader2, Keyboard, ShoppingCart, Check } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Product } from '../types';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
  lastItem?: { product: Product; quantity: number } | null;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose, lastItem }) => {
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "reader";

  useEffect(() => {
    const html5QrCode = new Html5Qrcode(containerId);
    scannerRef.current = html5QrCode;

    const config = {
      fps: 25,
      qrbox: { width: 250, height: 150 },
      aspectRatio: 1.0,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.UPC_A
      ]
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        if (navigator.vibrate) navigator.vibrate(50);
        onScan(decodedText);
        // Não paramos o scanner aqui para permitir leitura contínua
      },
      () => {}
    ).then(() => {
      setIsInitializing(false);
    }).catch((err) => {
      setError("Permissão de câmera negada ou erro de hardware.");
      setIsInitializing(false);
    });

    return () => {
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop();
      } catch (e) {
        console.warn("Erro ao parar scanner:", e);
      }
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const nextTorch = !torch;
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextTorch } as any]
        });
        setTorch(nextTorch);
      } catch (e) {
        console.warn("Lanterna não suportada");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col overflow-hidden">
      {/* Container da Câmera */}
      <div className="relative flex-1 bg-black">
        <div id={containerId} className="w-full h-full" />
        
        {/* Overlay de Foco Único */}
        {!error && !isInitializing && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-72 h-48 border-2 border-white/20 rounded-[40px] relative">
               <div className="absolute inset-0 border-2 border-purple-500 rounded-[40px] animate-pulse opacity-50" />
               <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,1)] scanner-line" />
            </div>
          </div>
        )}

        {/* Feedback do Último Item Registrado */}
        {lastItem && (
          <div className="absolute top-24 left-4 right-4 animate-in slide-in-from-top-4 duration-300">
             <div className="bg-zinc-900/90 backdrop-blur-xl border border-emerald-500/30 p-4 rounded-3xl flex items-center gap-4 shadow-2xl">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                   <Check size={24} strokeWidth={3} />
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Registrado Agora</p>
                   <h4 className="text-sm font-bold text-white truncate">{lastItem.product.name}</h4>
                   <p className="text-xs font-black text-zinc-400">QTD: {lastItem.quantity} • R$ {lastItem.product.price.toFixed(2)}</p>
                </div>
             </div>
          </div>
        )}

        {/* Controles do Topo */}
        <div className="absolute top-8 left-6 right-6 flex justify-between items-center z-10">
          <button 
            onClick={onClose}
            className="p-4 bg-zinc-900/80 backdrop-blur-xl rounded-2xl text-white border border-white/10"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={toggleTorch}
            className={`p-4 rounded-2xl border border-white/10 ${torch ? 'bg-yellow-500 text-black' : 'bg-zinc-900/80 text-white'}`}
          >
            {torch ? <Zap size={24} /> : <ZapOff size={24} />}
          </button>
        </div>

        {isInitializing && (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4">
             <Loader2 size={40} className="text-purple-600 animate-spin" />
             <p className="text-zinc-500 font-bold text-xs">ACESSANDO CÂMERA...</p>
          </div>
        )}
      </div>
      
      {/* Rodapé do Scanner - Com padding extra para não sumir atrás do menu */}
      <div className="shrink-0 p-6 pb-24 md:pb-32 bg-zinc-950 border-t border-zinc-900 space-y-4">
          <form onSubmit={handleManualSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Keyboard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
              <input 
                type="text" 
                inputMode="numeric"
                placeholder="Código Manual..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-4 text-sm font-mono text-white focus:border-purple-600 outline-none"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-zinc-800 px-6 rounded-2xl text-white font-black text-[10px] uppercase border border-zinc-700">OK</button>
          </form>

          <button 
            onClick={onClose}
            className="w-full py-5 bg-purple-600 rounded-[24px] font-black text-white tracking-widest uppercase text-xs shadow-xl shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <ShoppingCart size={18} /> FINALIZAR LEITURA
          </button>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.3; }
          50% { top: 100%; opacity: 1; }
        }
        .scanner-line {
          animation: scan 2.5s ease-in-out infinite;
        }
        #reader { border: none !important; }
        #reader video { object-fit: cover !important; width: 100% !important; height: 100% !important; }
        /* Esconder UI padrão da lib */
        #reader__dashboard, #reader__status_span, #reader img { display: none !important; }
      `}</style>
    </div>
  );
};

export default Scanner;
