
import React, { useEffect, useRef, useState } from 'react';
import { X, Zap, ZapOff, Loader2, Keyboard } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
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
      fps: 20,
      qrbox: { width: 280, height: 180 },
      aspectRatio: 1.0,
      formatsToSupport: [
        Html5QrcodeSupportedFormats.EAN_13,
        Html5QrcodeSupportedFormats.EAN_8,
        Html5QrcodeSupportedFormats.CODE_128,
        Html5QrcodeSupportedFormats.QR_CODE,
        Html5QrcodeSupportedFormats.UPC_A,
        Html5QrcodeSupportedFormats.UPC_E
      ]
    };

    html5QrCode.start(
      { facingMode: "environment" },
      config,
      (decodedText) => {
        if (navigator.vibrate) navigator.vibrate(100);
        onScan(decodedText);
        stopScanner();
      },
      () => {}
    ).then(() => {
      setIsInitializing(false);
    }).catch((err) => {
      console.error("Erro ao iniciar câmera:", err);
      setError("Não foi possível acessar a câmera. Verifique as permissões do navegador.");
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
    }
  };

  const toggleTorch = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        const nextTorch = !torch;
        // @ts-ignore
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: nextTorch }]
        });
        setTorch(nextTorch);
      } catch (e) {
        console.warn("Lanterna não suportada neste dispositivo", e);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 bg-zinc-950 overflow-hidden">
        <div id={containerId} className="w-full h-full" />
        
        {!error && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
            <div className="w-72 h-48 border-2 border-purple-500/50 rounded-3xl relative shadow-[0_0_100px_rgba(0,0,0,0.8)]">
               <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-purple-500 rounded-tl-2xl" />
               <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-purple-500 rounded-tr-2xl" />
               <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-purple-500 rounded-bl-2xl" />
               <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-purple-500 rounded-br-2xl" />
               <div className="absolute top-0 left-0 w-full h-0.5 bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] scanner-line" />
            </div>
            <p className="mt-8 text-white font-black text-[10px] tracking-[0.2em] uppercase bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
              Aponte para o código
            </p>
          </div>
        )}

        <div className="absolute top-10 left-6 right-6 flex justify-between items-center z-10">
          <button 
            onClick={onClose}
            className="p-4 bg-zinc-900/80 backdrop-blur-xl rounded-2xl text-white border border-white/10 active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
          
          <button 
            onClick={toggleTorch}
            className={`p-4 rounded-2xl border border-white/10 active:scale-90 transition-transform ${torch ? 'bg-yellow-500 text-black' : 'bg-zinc-900/80 text-white'}`}
          >
            {torch ? <Zap size={24} /> : <ZapOff size={24} />}
          </button>
        </div>

        {isInitializing && (
          <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-4 z-20">
             <Loader2 size={40} className="text-purple-600 animate-spin" />
             <p className="text-zinc-500 font-bold text-xs">INICIANDO CÂMERA...</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 p-8 text-center z-30">
            <div className="bg-zinc-900 p-8 rounded-[40px] border border-zinc-800 space-y-6 max-w-xs">
              <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <X size={40} />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">Ops! Câmera Travada</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-5 bg-purple-600 rounded-2xl font-black text-white active:scale-95 transition-transform"
              >
                ENTRADA MANUAL
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-8 pb-12 bg-zinc-950 border-t border-zinc-900">
          <form onSubmit={handleManualSubmit} className="space-y-4 max-w-sm mx-auto">
            <div className="flex flex-col items-center gap-2 mb-2">
               <Keyboard size={16} className="text-zinc-700" />
               <p className="text-zinc-600 text-[9px] font-black uppercase tracking-widest">Entrada Alternativa</p>
            </div>
            <div className="relative">
              <input 
                type="text" 
                inputMode="numeric"
                placeholder="Digite o código manualmente..." 
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-5 text-center text-lg font-mono tracking-widest text-white focus:border-purple-600 outline-none"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
              />
              {manualCode && (
                <button 
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-purple-600 rounded-xl text-white shadow-lg animate-in fade-in zoom-in"
                >
                  <CheckIcon />
                </button>
              )}
            </div>
          </form>
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
        #reader video { 
          object-fit: cover !important; 
          width: 100% !important; 
          height: 100% !important;
        }
      `}</style>
    </div>
  );
};

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default Scanner;
