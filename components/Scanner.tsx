'use client';

import { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { useToast } from '@/hooks/UseToast';
import { Product } from '@/types';
import { Barcode, X } from 'lucide-react';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { AlertCircle } from 'lucide-react';

export interface ScannerProps {
  onDetected: (result: string) => void;
  products?: Product[];
  lastItem?: Product; // último item registrado
  onClose?: () => void; // callback para fechar o scanner
  addToCart?: (product: Product) => void;
  editingProd?: boolean;
}

function Scanner({ onDetected, products, lastItem, onClose, addToCart, editingProd }: ScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [manualCode, setManualCode] = useState('');
  const codeReaderRef = useRef(new BrowserMultiFormatReader());
  const isScanningRef = useRef(false);

  useEffect(() => {
    const codeReader = codeReaderRef.current;

    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      setHasCameraPermission(false);
      return;
    }

    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Ensure we don't start multiple decoding sessions
          if (isScanningRef.current) return;
          isScanningRef.current = true;

          codeReader.decodeFromStream(stream, videoRef.current, (result, err) => {
            if (result && isScanningRef.current) {
              isScanningRef.current = false; // Stop further scans
              onDetected(result.getText());
              codeReader.reset();
              stream.getTracks().forEach(track => track.stop());
            }
            if (err && !(err instanceof NotFoundException)) {
              console.error('Scan error:', err);
            }
          });
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Acesso à câmera negado',
          description: 'Por favor, habilite a permissão da câmera nas configurações do seu navegador.',
        });
      }
    };

    startScanner();
    setManualCode('');
    editingProd = false

    return () => {
      isScanningRef.current = false;
      codeReader.reset();
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4 rounded-md">
      {/* Container do vídeo */}
      <div className="relative w-full max-w-2xl md:w-3/4 lg:w-1/2 rounded-md overflow-hidden -translate-y-20">
        <video
          ref={videoRef}
          className="w-full aspect-video bg-black rounded-md"
          autoPlay
          muted
          playsInline
        />

        {/* Overlay da linha vermelha */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-3/4 h-1 bg-red-500/70 rounded-full shadow-lg" />
        </div>

        {/* Overlay de permissão da câmera */}
        {hasCameraPermission === null && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800/50">
            <p className="text-white">Solicitando acesso à câmera...</p>
          </div>
        )}
      </div>

      {/* Último item registrado */}
      {lastItem && (
        <div className="mt-4 w-11/12 md:w-3/4 lg:w-1/2 bg-white p-3 rounded shadow flex flex-col gap-2">
          <div>
            <p className="font-semibold">Último item registrado:</p>
            <p>{lastItem.productName}</p>
            <p>R$ {lastItem.salePrice.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {!editingProd && (
          <div className="relative flex-1">
            <Barcode className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input
              ref={isScanningRef}
              type="text"
              placeholder="Produto ou Código..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-purple-600 outline-none transition-all placeholder:text-zinc-700"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const p = products.find(
                    prod =>
                      prod.barcode === manualCode ||
                      prod.productName.toLowerCase().includes(manualCode.toLowerCase())
                  );
                  if (p) addToCart(p);
                }
              }}
            />
          </div>
        )}
        {onClose && (
          <button
            className="bg-purple-600 p-4 rounded-2xl text-white shadow-lg shadow-purple-600/20 active:scale-90 transition-transform"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        )}
      </div>
    </div>
  )
}
export default Scanner;