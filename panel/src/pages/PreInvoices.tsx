import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Image as ImageIcon, Store, Clock, AlertTriangle, Coins, CreditCard, Banknote } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface PreInvoice {
    id: string;
    shopId: string;
    shopName?: string;
    basePrice: number;
    discountPercentage: number;
    finalPrice: number;
    creditCount: number;
    durationMonths: number;
    status: 'pending' | 'paid' | 'approved' | 'rejected';
    receiptImageUrl?: string;
    accountDetails?: string;
    zarinpalRefId?: number;
    createdAt: string;
}

const PreInvoices = () => {
    const [invoices, setInvoices] = useState<PreInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = async () => {
        try {
            const response = await apiClient.get('/admin/pre-invoices');
            if (response.data && response.data.data) {
                setInvoices(response.data.data);
            } else {
                setInvoices(response.data);
            }
        } catch (error) {
            console.error('Error fetching pre-invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to approve this invoice? This will activate the shop and grant credits.')) return;
        try {
            await apiClient.post(`/admin/pre-invoices/${id}/approve`);
            fetchInvoices();
        } catch (error) {
            console.error('Error approving invoice:', error);
            alert('Failed to approve invoice');
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString('en-US') + ' Toman';
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pre-invoices</h1>
                    <p className="text-gray-500 mt-2 text-base">
                        Manage pre-invoices and activate shops
                    </p>
                </div>
            </div>

            {/* Table */}
            {invoices.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No pre-invoices yet</h3>
                    <p className="text-gray-500 mb-6">Create a pre-invoice from the Shops page</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Shop</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Package</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Price Details</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Payment</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Receipt</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Store size={16} className="text-gray-400" />
                                            <span className="font-semibold text-gray-900">{invoice.shopName || invoice.shopId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <Coins size={14} className="text-amber-500" />
                                                <span className="text-sm font-medium">{invoice.creditCount} Credits</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-gray-500">
                                                <Clock size={14} />
                                                <span className="text-xs">{invoice.durationMonths} Months</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-900">{formatCurrency(invoice.finalPrice)}</p>
                                            <p className="text-xs text-gray-500 line-through">{formatCurrency(invoice.basePrice)}</p>
                                            <span className="inline-block px-2 py-0.5 bg-red-50 text-red-600 rounded text-xs font-bold border border-red-100">
                                                -{invoice.discountPercentage}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.status === 'approved' ? (
                                            <div className="flex items-center gap-1.5">
                                                <CheckCircle size={16} className="text-green-600" />
                                                <span className="text-sm font-medium text-green-700 capitalize">Approved</span>
                                            </div>
                                        ) : invoice.status === 'paid' ? (
                                            <div className="flex items-center gap-1.5">
                                                <AlertTriangle size={16} className="text-amber-600" />
                                                <span className="text-sm font-medium text-amber-700 capitalize">Paid (Pending Approval)</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600 capitalize">{invoice.status}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.zarinpalRefId ? (
                                            <div className="space-y-1">
                                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-100">
                                                    <CreditCard size={13} />
                                                    Zarinpal
                                                </div>
                                                <p className="text-[11px] text-gray-400 font-mono">Ref: {invoice.zarinpalRefId}</p>
                                            </div>
                                        ) : invoice.receiptImageUrl ? (
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
                                                <Banknote size={13} />
                                                Card-to-card
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">—</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {invoice.receiptImageUrl ? (
                                            <button
                                                onClick={() => {
                                                    const base = (import.meta.env.VITE_API_BASE_URL || '').replace('/api/v1', '') || '';
                                                    setSelectedReceiptUrl(base + invoice.receiptImageUrl);
                                                }}
                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <ImageIcon size={14} />
                                                View Receipt
                                            </button>
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No receipt</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(invoice.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {invoice.status !== 'approved' && (
                                            <button
                                                onClick={(e) => handleApprove(invoice.id, e)}
                                                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors shadow-sm"
                                            >
                                                Approve & Activate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Receipt Image Modal */}
            {selectedReceiptUrl && (
                <div
                    className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedReceiptUrl(null)}
                >
                    <div className="relative max-w-4xl max-h-[90vh] w-full flex justify-center">
                        <img
                            src={selectedReceiptUrl}
                            alt="Receipt"
                            className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PreInvoices;
