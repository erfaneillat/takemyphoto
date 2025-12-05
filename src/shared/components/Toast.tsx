import { useToastStore, ToastType } from '../stores/toastStore';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const iconMap: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <AlertCircle className="w-5 h-5" />,
    warning: <AlertTriangle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
};

const colorMap: Record<ToastType, string> = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-white',
    info: 'bg-blue-500 text-white',
};

export const ToastContainer = () => {
    const { toasts, removeToast } = useToastStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`${colorMap[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}
                >
                    {iconMap[toast.type]}
                    <p className="flex-1 text-sm font-medium">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};
