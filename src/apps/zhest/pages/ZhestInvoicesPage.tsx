import { useState, useEffect, useRef } from 'react';
import { useLicenseStore } from '../stores/useLicenseStore';
import { apiClient } from '@/shared/services/api';
import { Upload, CheckCircle, Clock, ArrowRight, X, ChevronLeft, AlertCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface PreInvoice {
    id: string;
    basePrice: number;
    discountPercentage: number;
    finalPrice: number;
    creditCount: number;
    durationMonths: number;
    accountDetails: string;
    status: 'pending' | 'paid' | 'approved' | 'rejected';
    receiptImageUrl?: string;
    createdAt: string;
}

export const ZhestInvoicesPage = () => {
    const { shopId, shopName, ownerName, phoneNumber, address } = useLicenseStore();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState<PreInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);
    const [selectedInvoice, setSelectedInvoice] = useState<PreInvoice | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const showToast = (message: string, type: 'success' | 'error') => {
        if (toastTimer.current) clearTimeout(toastTimer.current);
        setToast({ message, type });
        toastTimer.current = setTimeout(() => setToast(null), 3500);
    };

    useEffect(() => {
        if (!shopId) return;
        fetchInvoices();
    }, [shopId]);

    const fetchInvoices = async () => {
        try {
            const response = await apiClient.get(`/shops/${shopId}/pre-invoices`);
            setInvoices(response.data.data);
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (invoiceId: string, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadingId(invoiceId);
        const formData = new FormData();
        formData.append('receipt', file);

        try {
            await apiClient.post(`/shops/${shopId}/pre-invoices/${invoiceId}/receipt`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            showToast('رسید با موفقیت آپلود شد و در انتظار تایید است.', 'success');
            fetchInvoices();
            setSelectedInvoice(null);
        } catch (error) {
            console.error('Error uploading receipt:', error);
            showToast('متاسفانه در آپلود رسید خطایی رخ داد.', 'error');
        } finally {
            setUploadingId(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('fa-IR');
    };

    const handleZarinpalPay = async (invoiceId: string) => {
        setPayingId(invoiceId);
        try {
            const response = await apiClient.post(`/shops/${shopId}/pre-invoices/${invoiceId}/pay`);
            if (response.data.success && response.data.data.paymentUrl) {
                window.location.href = response.data.data.paymentUrl;
            } else {
                showToast(response.data.error || 'خطا در ایجاد درخواست پرداخت', 'error');
            }
        } catch (error: any) {
            console.error('Zarinpal pay error:', error);
            showToast(error.response?.data?.error || 'خطا در اتصال به درگاه پرداخت', 'error');
        } finally {
            setPayingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'approved': return 'تایید شده';
            case 'paid': return 'در انتظار تایید';
            default: return 'در انتظار پرداخت';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'paid': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
            default: return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-white" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100 dark:bg-zinc-950 transition-colors pb-28" dir="rtl">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-4 left-4 right-4 z-[100] flex justify-center pointer-events-none"
                    >
                        <div className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium max-w-sm w-full ${toast.type === 'success'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                            }`}>
                            {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                            <span className="flex-1">{toast.message}</span>
                            <button onClick={() => setToast(null)} className="p-0.5 hover:opacity-70 transition-opacity">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 py-3.5 flex items-center justify-between">
                <h1 className="text-lg font-bold text-zinc-900 dark:text-white">پیش‌فاکتورها</h1>
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -mr-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <ArrowRight size={22} />
                </button>
            </div>

            {/* Mini Card List */}
            <div className="max-w-xl mx-auto px-4 py-5 space-y-3">
                {invoices.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-zinc-400 dark:text-zinc-500 text-sm">هیچ پیش‌فاکتوری ثبت نشده است.</p>
                    </div>
                ) : (
                    invoices.map((invoice) => (
                        <button
                            key={invoice.id}
                            onClick={() => setSelectedInvoice(invoice)}
                            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-right active:scale-[0.98] transition-transform"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                                        پکیج {invoice.creditCount} توکن — {invoice.durationMonths >= 12 ? 'سالانه' : `${invoice.durationMonths} ماهه`}
                                    </p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                                        {formatDate(invoice.createdAt)}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2.5 shrink-0 mr-3">
                                    <div className="text-left">
                                        <p className="text-sm font-black text-zinc-900 dark:text-white">
                                            {formatCurrency(invoice.finalPrice)}
                                        </p>
                                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${getStatusColor(invoice.status)}`}>
                                            {getStatusLabel(invoice.status)}
                                        </span>
                                    </div>
                                    <ChevronLeft size={16} className="text-zinc-300 dark:text-zinc-600" />
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>

            {/* Full Invoice Modal */}
            <AnimatePresence>
                {selectedInvoice && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-end sm:items-center justify-center"
                        onClick={() => setSelectedInvoice(null)}
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-zinc-900 w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto"
                            dir="rtl"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-5 py-3.5 flex items-center justify-between z-10">
                                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">پیش‌فاکتور</h2>
                                <button
                                    onClick={() => setSelectedInvoice(null)}
                                    className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Invoice Body */}
                            <div className="p-6 space-y-5">

                                {/* Title */}
                                <div className="text-center pb-4 border-b border-dashed border-zinc-300 dark:border-zinc-700">
                                    <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                                        پیش‌فاکتور فعال‌سازی پلتفرم
                                    </h2>
                                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-2">
                                        تاریخ صدور: {formatDate(selectedInvoice.createdAt)}
                                    </p>
                                </div>

                                {/* Provider */}
                                <div className="space-y-1">
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">ارائه‌دهنده:</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                                        گروه Next Group
                                        <br />
                                        عضو پارک علم و فناوری، مستقر در پردیس علم و فناوری
                                    </p>
                                </div>

                                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                                {/* Customer */}
                                <div className="space-y-2.5">
                                    <InvoiceRow label="نام گالری" value={shopName || '—'} />
                                    <InvoiceRow label="نام نماینده" value={ownerName || '—'} />
                                    <InvoiceRow label="شماره تماس" value={phoneNumber || '—'} ltr />
                                    <InvoiceRow label="آدرس گالری" value={address || '—'} />
                                </div>

                                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                                {/* Service */}
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">خدمت:</p>
                                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-[1.9]">
                                        فعال‌سازی {selectedInvoice.durationMonths >= 12 ? 'سالانه' : `${selectedInvoice.durationMonths} ماهه`} دسترسی
                                        به zhestai.ir + اعتبار اولیه {selectedInvoice.creditCount} توکن (بیش از {Math.floor(selectedInvoice.creditCount / 7)} عکس)
                                    </p>
                                </div>

                                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                                {/* Pricing */}
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">قیمت و تخفیف‌ها:</p>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">مبلغ پایه</span>
                                            <span className="text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                                                {formatCurrency(selectedInvoice.basePrice)} تومان
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400">تخفیف عید نوروز</span>
                                            <span className="text-xs text-red-600 dark:text-red-400 font-bold">
                                                {selectedInvoice.discountPercentage}٪
                                            </span>
                                        </div>
                                        <div className="border-t border-dashed border-zinc-300 dark:border-zinc-700 pt-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-bold text-zinc-900 dark:text-white">مبلغ نهایی قابل پرداخت</span>
                                                <span className="text-sm font-black text-zinc-900 dark:text-white">
                                                    {formatCurrency(selectedInvoice.finalPrice)} تومان
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                                {/* Account */}
                                <div>
                                    <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5">حساب دریافت:</p>
                                    <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium" dir="rtl">
                                        {selectedInvoice.accountDetails}
                                    </p>
                                </div>

                                <div className="border-t border-zinc-200 dark:border-zinc-800" />

                                {/* Disclaimer */}
                                <p className="text-[10.5px] leading-[2] text-zinc-400 dark:text-zinc-500 text-justify">
                                    مبلغ پرداختی صرفاً بابت فعال‌سازی حساب کاربری، دسترسی و پشتیبانی یک‌ساله است و شامل تولید نامحدود تصویر نمی‌باشد. تولید تصاویر بر اساس توکن انجام می‌شود؛ پس از اتمام {selectedInvoice.creditCount} توکن، ادامه استفاده منوط به خرید توکن جدید طبق تعرفه‌های وبسایت است.
                                </p>
                            </div>

                            {/* Action Footer */}
                            <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-5 pb-28 sm:pb-5">
                                {selectedInvoice.status === 'approved' ? (
                                    <div className="flex items-center justify-center gap-2 py-3 text-green-700 dark:text-green-400 text-sm font-medium">
                                        <CheckCircle size={18} />
                                        <span>پرداخت تایید شد — حساب فعال است</span>
                                    </div>
                                ) : selectedInvoice.status === 'paid' ? (
                                    <div className="flex items-center justify-center gap-2 py-3 text-amber-600 dark:text-amber-400 text-sm font-medium">
                                        <Clock size={18} />
                                        <span>رسید ارسال شده — در انتظار تایید</span>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {/* Online Payment */}
                                        <button
                                            onClick={() => handleZarinpalPay(selectedInvoice.id)}
                                            disabled={payingId === selectedInvoice.id}
                                            className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
                                        >
                                            {payingId === selectedInvoice.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                                            ) : (
                                                <>
                                                    <CreditCard size={18} />
                                                    <span>پرداخت آنلاین (درگاه زرین‌پال)</span>
                                                </>
                                            )}
                                        </button>

                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500">یا</span>
                                            <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
                                        </div>

                                        <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
                                            پس از کارت‌به‌کارت، لطفاً عکس رسید را آپلود کنید.
                                        </p>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            ref={el => fileInputRefs.current[selectedInvoice.id] = el}
                                            onChange={(e) => handleFileUpload(selectedInvoice.id, e)}
                                        />

                                        <button
                                            onClick={() => fileInputRefs.current[selectedInvoice.id]?.click()}
                                            disabled={uploadingId === selectedInvoice.id}
                                            className="w-full flex items-center justify-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 py-3 rounded-xl text-sm font-bold active:scale-[0.98] transition-transform disabled:opacity-50"
                                        >
                                            {uploadingId === selectedInvoice.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-zinc-900" />
                                            ) : (
                                                <>
                                                    <Upload size={18} />
                                                    <span>آپلود تصویر رسید پرداخت</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/* ── Helper ── */
const InvoiceRow = ({ label, value, ltr }: { label: string; value: string; ltr?: boolean }) => (
    <div className="flex gap-2">
        <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 w-24">{label}:</span>
        <span className={`text-xs text-zinc-800 dark:text-zinc-200 font-medium`} dir={ltr ? 'ltr' : undefined}>
            {value}
        </span>
    </div>
);
