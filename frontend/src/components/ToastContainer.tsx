import React from 'react';
import { useToastStore } from '../store/useToastStore';
import { Toast } from './Toast';

export const ToastContainer: React.FC = () => {
    const toasts = useToastStore((state) => state.toasts);

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            {toasts.map((toast) => (
                <div key={toast.id} className="pointer-events-auto">
                    <Toast id={toast.id} type={toast.type} message={toast.message} />
                </div>
            ))}
        </div>
    );
};
