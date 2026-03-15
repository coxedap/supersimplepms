import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastType, useToastStore } from '../store/useToastStore';

interface ToastProps {
    id: string;
    type: ToastType;
    message: string;
}

const toastStyles: Record<ToastType, { icon: React.ReactNode; color: string; border: string; bg: string }> = {
    success: {
        icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        color: 'text-emerald-900',
        border: 'border-emerald-100',
        bg: 'bg-emerald-50/80',
    },
    error: {
        icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
        color: 'text-rose-900',
        border: 'border-rose-100',
        bg: 'bg-rose-50/80',
    },
    warning: {
        icon: <AlertTriangle className="w-5 h-5 text-amber-500" />,
        color: 'text-amber-900',
        border: 'border-amber-100',
        bg: 'bg-amber-50/80',
    },
    info: {
        icon: <Info className="w-5 h-5 text-blue-500" />,
        color: 'text-blue-900',
        border: 'border-blue-100',
        bg: 'bg-blue-50/80',
    },
};

export const Toast: React.FC<ToastProps> = ({ id, type, message }) => {
    const removeToast = useToastStore((state) => state.removeToast);
    const style = toastStyles[type];

    return (
        <div
            className={`
        flex items-center gap-3 p-4 pr-10 rounded-2xl border ${style.border} ${style.bg}
        backdrop-blur-md shadow-lg shadow-gray-200/50 animate-in slide-in-from-right-full fade-in duration-300
        relative overflow-hidden group min-w-[320px] max-w-md
      `}
        >
            <div className="flex-shrink-0">{style.icon}</div>
            <p className={`text-sm font-semibold tracking-tight ${style.color}`}>{message}</p>

            <button
                onClick={() => removeToast(id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-black/5 transition-all"
            >
                <X className="w-4 h-4 text-gray-400" />
            </button>

            {/* Progress bar simulation */}
            <div className="absolute bottom-0 left-0 h-[3px] bg-black/5 w-full">
                <div
                    className="h-full bg-current opacity-20 animate-shrink"
                    style={{ animationDuration: '5000ms' }}
                />
            </div>
        </div>
    );
};
