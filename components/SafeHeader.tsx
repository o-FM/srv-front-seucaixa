import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface SafeHeaderProps {
  title: string;
  onBack?: () => void;
  rightAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

const SafeHeader: React.FC<SafeHeaderProps> = ({ title, onBack, rightAction }) => {
  return (
    <header 
      className="shrink-0 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md z-10 flex items-center justify-between px-4 gap-3"
      style={{
        paddingTop: `max(12px, calc(env(safe-area-inset-top) + 12px))`,
        paddingBottom: '12px',
        paddingLeft: 'max(12px, env(safe-area-inset-left))',
        paddingRight: 'max(12px, env(safe-area-inset-right))',
      }}
    >
      {/* BOTÃO VOLTAR */}
      {onBack ? (
        <button 
          onClick={onBack}
          type="button"
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors active:scale-95 flex-shrink-0"
        >
          <ArrowLeft size={24} />
        </button>
      ) : (
        <div className="w-10" />
      )}
      
      {/* TÍTULO */}
      <h2 className="text-lg font-black tracking-tight text-white flex-1 text-center px-2 truncate">
        {title}
      </h2>

      {/* BOTÃO DIREITA (SALVAR) */}
      {rightAction ? (
        <button 
          type="button"
          onClick={rightAction.onClick}
          className="px-3 py-2 bg-purple-600 rounded-xl text-white font-bold text-xs flex items-center gap-2 active:scale-95 transition-transform whitespace-nowrap flex-shrink-0 hover:bg-purple-700"
        >
          {rightAction.icon}
          {rightAction.label}
        </button>
      ) : (
        <div className="w-16" />
      )}
    </header>
  );
};

export default SafeHeader;