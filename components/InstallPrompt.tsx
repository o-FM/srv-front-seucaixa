
import React, { useState, useEffect } from 'react';
import { Download, X, Share, PlusSquare, ArrowBigDownDash, Smartphone, Zap } from 'lucide-react';

const InstallPrompt: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState<'android' | 'ios' | 'other'>('other');
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Verificar se já está instalado (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
                         || (window.navigator as any).standalone 
                         || document.referrer.includes('android-app://');

    if (isStandalone) return;

    // 2. Detectar Plataforma
    const ua = window.navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isIos) setPlatform('ios');
    else if (isAndroid) setPlatform('android');

    // 3. Capturar evento de instalação (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Mostrar o popup após 3 segundos para não ser invasivo de imediato
      setTimeout(() => setIsVisible(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // No iOS, mostramos o prompt após 5 segundos se não for standalone
    if (isIos && !isStandalone) {
      setTimeout(() => setIsVisible(true), 5000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto bg-zinc-900 border border-purple-500/30 rounded-[32px] p-6 shadow-[0_-20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex gap-5">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
            <Smartphone className="text-white" size={32} />
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white leading-tight">Instalar App PDV</h3>
            <p className="text-zinc-400 text-xs font-medium leading-relaxed">
              Tenha acesso rápido, leitor de barras otimizado e use até sem internet.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {platform === 'android' ? (
            <button 
              onClick={handleInstallClick}
              className="w-full py-4 bg-purple-600 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
            >
              <Download size={20} /> INSTALAR AGORA
            </button>
          ) : platform === 'ios' ? (
            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-4 space-y-4">
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest text-center">Como instalar no iPhone:</p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                  <span>Toque no ícone de <span className="inline-flex bg-zinc-800 p-1 rounded"><Share size={14} className="text-blue-400"/></span> na barra do Safari</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-zinc-300">
                  <div className="w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-black">2</div>
                  <span>Role e selecione <span className="font-bold text-white">"Adicionar à Tela de Início"</span></span>
                </div>
              </div>
              <div className="pt-2 flex justify-center">
                 <ArrowBigDownDash className="text-purple-500 animate-bounce" size={24} />
              </div>
            </div>
          ) : (
             <button 
              onClick={() => setIsVisible(false)}
              className="w-full py-4 bg-zinc-800 text-white rounded-2xl font-black text-xs uppercase"
            >
              Entendido
            </button>
          )}

          <div className="flex items-center justify-center gap-4 pt-2">
            <div className="flex items-center gap-1.5 opacity-50">
               <Zap size={10} className="text-yellow-500 fill-yellow-500" />
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Leve e Seguro</span>
            </div>
            <div className="w-1 h-1 bg-zinc-800 rounded-full" />
            <div className="flex items-center gap-1.5 opacity-50">
               <Smartphone size={10} className="text-blue-500" />
               <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">Mobile Nativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPrompt;
