import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FinanceIcon3DProps {
  icon: LucideIcon;
  className?: string;
  color?: string;
  style?: React.CSSProperties;
}

export default function FinanceIcon3D({ icon: Icon, className, color = "text-accent", style }: FinanceIcon3DProps) {
  return (
    <div 
      className={cn("relative group transition-all duration-500", className)}
      style={style}
    >
      {/* Outer Glow */}
      <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full scale-125 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* 3D Container */}
      <div className="relative flex items-center justify-center p-5 rounded-3xl bg-background finance-3d-shadow border border-white/40 overflow-hidden transform group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300">
        {/* Reflection Highlight */}
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-white/40 to-transparent rotate-45 pointer-events-none" />
        
        <Icon className={cn("w-10 h-10 relative z-10 drop-shadow-[4px_4px_6px_rgba(0,0,0,0.2)]", color)} strokeWidth={1.5} />
        
        {/* Inner Shadow for Neumorphism */}
        <div className="absolute inset-0 rounded-3xl pointer-events-none ring-1 ring-white/20 inset-shadow-sm" />
      </div>
    </div>
  );
}
