
import React, { useEffect, useRef, useState } from 'react';
import { X, Zap, ZapOff, Loader2 } from 'lucide-react';

interface ScannerProps {
  onScan: (code: string) => void;
  onClose: () => void;
}

const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [isSearching, setIsSearching] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationId: number;
    let detector: any = null;

    // Tenta instanciar o detector nativo se disponível
    if ('BarcodeDetector' in window) {
      // @ts-ignore
      detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
    }

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Inicia loop de detecção
          if (detector) scanFrame();
        }
      } catch (err) {
        console.error("Erro ao acessar câmera:", err);
        setError("Não foi possível acessar a câmera. Verifique as permissões.");
      }
    };

    const scanFrame = async () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const code = barcodes[0].rawValue;
            onScan(code);
            return; // Para o loop ao encontrar
          }
        } catch (e) {
          console.error("Erro na detecção:", e);
        }
      }
      animationId = requestAnimationFrame(scanFrame);
    };

    startCamera();

    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop());
      cancelAnimationFrame(animationId);
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="relative flex-1 overflow-hidden bg-zinc-900">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className="w-full h-full object-cover"
        />
        
        {/* Camada de UI de Escaneamento */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-72 h-48 border-2 border-purple-500 rounded-2xl relative shadow-[0_0_30px_rgba(167,139,250,0.3)]">
            {/* Cantos Estilizados */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-purple-400 rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-purple-400 rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-purple-400 rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-purple-400 rounded-br-lg" />
            
            {/* Linha de Scanner Animada */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-[scan_2s_ease-in-out_infinite]" />
          </div>
        </div>

        {/* Controles Superiores */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10 active:scale-90 transition-transform"
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10">
            <Loader2 size={16} className="text-purple-400 animate-spin" />
            <span className="text-white font-bold text-xs tracking-wider uppercase">Buscando Código</span>
          </div>
          <button 
            onClick={() => setTorch(!torch)}
            className={`p-3 rounded-full border border-white/10 active:scale-90 transition-transform ${torch ? 'bg-yellow-500 text-black' : 'bg-black/40 text-white'}`}
          >
            {torch ? <Zap size={24} /> : <ZapOff size={24} />}
          </button>
        </div>

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 px-8 text-center z-20">
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 space-y-6 max-w-xs">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <X size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2">Erro na Câmera</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{error}</p>
              </div>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-purple-600 rounded-2xl font-bold active:scale-95 transition-transform"
              >
                Tentar Manualmente
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-8 bg-zinc-950 flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">Entrada de Dados</p>
          <div className="w-full max-w-sm">
            <input 
              autoFocus
              type="text" 
              placeholder="Digite o código ou use um leitor USB..." 
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-center text-lg font-mono tracking-widest text-purple-400 focus:border-purple-500 outline-none transition-all shadow-inner"
              onKeyDown={(e) => {
                if(e.key === 'Enter') {
                  onScan((e.target as HTMLInputElement).value);
                }
              }}
            />
          </div>
          <p className="text-zinc-600 text-[10px] text-center">
            Aponte a câmera para o código de barras ou<br/>use um leitor externo para adicionar automaticamente.
          </p>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { top: 0%; opacity: 0.2; }
          50% { top: 100%; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
