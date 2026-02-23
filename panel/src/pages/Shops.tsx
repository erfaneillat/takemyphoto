import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Store, Copy, Check, KeyRound, ShieldCheck, ShieldX, Clock, AlertTriangle, Pencil, Coins, QrCode, Download, X, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { QRCodeSVG } from 'qrcode.react';

interface Shop {
    id: string;
    name: string;
    description?: string;
    types: string[];
    licenseKey: string;
    licenseDurationMonths: number;
    licenseExpiresAt?: string;
    isActivated: boolean;
    activatedAt?: string;
    deviceFingerprint?: string;
    isActive: boolean;
    credit: number;
    generationCount: number;
    phoneNumber?: string;
    address?: string;
    ownerName?: string;
    createdAt: string;
}

const DURATION_OPTIONS = [
    { value: 1, label: '1 Month' },
    { value: 3, label: '3 Months' },
    { value: 6, label: '6 Months' },
    { value: 12, label: '12 Months' },
];

function getRemainingDays(expiresAt?: string): number | null {
    if (!expiresAt) return null;
    const diff = new Date(expiresAt).getTime() - Date.now();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function isExpired(shop: Shop): boolean {
    if (!shop.licenseExpiresAt) return false;
    return new Date(shop.licenseExpiresAt) < new Date();
}

const SHOP_TYPE_OPTIONS = [
    { value: 'gold', label: '🥇 Gold', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    { value: 'clothes', label: '👗 Clothes', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    { value: 'watch', label: '⌚ Watch', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'shoes', label: '👟 Shoes', color: 'bg-rose-100 text-rose-800 border-rose-200' },
    { value: 'bags', label: '👜 Bags', color: 'bg-orange-100 text-orange-800 border-orange-200' },
    { value: 'cosmetics', label: '💄 Cosmetics', color: 'bg-pink-100 text-pink-800 border-pink-200' },
    { value: 'food', label: '🍽️ Food', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'electronics', label: '📱 Electronics', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    { value: 'furniture', label: '🪑 Furniture', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'accessories', label: '💍 Accessories', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    { value: 'perfume', label: '🌸 Perfume', color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200' },
    { value: 'other', label: '📦 Other', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

const Shops = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingShop, setEditingShop] = useState<Shop | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [qrShop, setQrShop] = useState<Shop | null>(null);
    const qrRef = useRef<HTMLDivElement>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        types: [] as string[],
        licenseDurationMonths: 1,
        credit: 0,
        phoneNumber: '',
        address: '',
        ownerName: '',
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const response = await apiClient.get('/shops');
            setShops(response.data.data.shops);
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name.trim()) {
            setFormError('Shop name is required');
            return;
        }
        if (formData.types.length === 0) {
            setFormError('Select at least one shop type');
            return;
        }

        try {
            if (editingShop) {
                await apiClient.put(`/shops/${editingShop.id}`, formData);
            } else {
                await apiClient.post('/shops', formData);
            }
            fetchShops();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving shop:', error);
            setFormError(editingShop ? 'Failed to update shop' : 'Failed to create shop');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this shop? This will invalidate its license.')) return;
        try {
            await apiClient.delete(`/shops/${id}`);
            fetchShops();
        } catch (error) {
            console.error('Error deleting shop:', error);
        }
    };

    const handleRegenerateLicense = async (id: string) => {
        if (!confirm('Are you sure you want to regenerate the license key? The old key will immediately expire and be permanently invalid.')) return;
        try {
            await apiClient.post(`/shops/${id}/regenerate-license`);
            fetchShops();
        } catch (error) {
            console.error('Error regenerating license:', error);
            alert('Failed to regenerate license');
        }
    };

    const toggleType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter(t => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleEdit = (shop: Shop) => {
        setEditingShop(shop);
        setFormData({
            name: shop.name,
            description: shop.description || '',
            types: [...shop.types],
            licenseDurationMonths: shop.licenseDurationMonths || 1,
            credit: shop.credit ?? 0,
            phoneNumber: shop.phoneNumber || '',
            address: shop.address || '',
            ownerName: shop.ownerName || '',
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingShop(null);
        setFormData({ name: '', description: '', types: [], licenseDurationMonths: 1, credit: 0, phoneNumber: '', address: '', ownerName: '' });
        setFormError('');
    };

    const copyLicenseKey = (key: string, shopId: string) => {
        navigator.clipboard.writeText(key);
        setCopiedId(shopId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const downloadQrCode = () => {
        if (!qrRef.current || !qrShop) return;
        const svg = qrRef.current.querySelector('svg');
        if (!svg) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            canvas.width = 512;
            canvas.height = 512;
            ctx!.fillStyle = 'white';
            ctx!.fillRect(0, 0, 512, 512);
            ctx!.drawImage(img, 0, 0, 512, 512);
            const link = document.createElement('a');
            link.download = `license-qr-${qrShop.licenseKey}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        };
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shops</h1>
                    <p className="text-gray-500 mt-2 text-base">
                        Manage shop licenses for Zhest app
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <Plus size={20} />
                    Add Shop
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Store size={20} className="text-gray-600" />
                        </div>
                        <span className="text-sm text-gray-500">Total Shops</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 ml-13">{shops.length}</p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <ShieldCheck size={20} className="text-green-600" />
                        </div>
                        <span className="text-sm text-gray-500">Activated</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 ml-13">
                        {shops.filter(s => s.isActivated && !isExpired(s)).length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <KeyRound size={20} className="text-amber-600" />
                        </div>
                        <span className="text-sm text-gray-500">Pending</span>
                    </div>
                    <p className="text-3xl font-bold text-amber-600 ml-13">
                        {shops.filter(s => !s.isActivated).length}
                    </p>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                            <AlertTriangle size={20} className="text-red-600" />
                        </div>
                        <span className="text-sm text-gray-500">Expired</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600 ml-13">
                        {shops.filter(s => isExpired(s)).length}
                    </p>
                </div>
            </div>

            {/* Table */}
            {shops.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Store size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops yet</h3>
                    <p className="text-gray-500 mb-6">Create your first shop to generate a license key</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all"
                    >
                        <Plus size={20} />
                        Add Shop
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Shop</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Types</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">License Key</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Credit</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Duration</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Created</th>
                                <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shops.map((shop) => (
                                <tr key={shop.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-semibold text-gray-900">{shop.name}</p>
                                            {shop.description && (
                                                <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{shop.description}</p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1.5">
                                            {shop.types.map(type => {
                                                const opt = SHOP_TYPE_OPTIONS.find(o => o.value === type);
                                                return (
                                                    <span
                                                        key={type}
                                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${opt?.color || 'bg-gray-100 text-gray-600 border-gray-200'}`}
                                                    >
                                                        {opt?.label || type}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <button
                                                onClick={() => copyLicenseKey(shop.licenseKey, shop.id)}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-mono text-sm font-bold text-gray-800 group"
                                            >
                                                {shop.licenseKey}
                                                {copiedId === shop.id ? (
                                                    <Check size={14} className="text-green-600" />
                                                ) : (
                                                    <Copy size={14} className="text-gray-400 group-hover:text-gray-600" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => setQrShop(shop)}
                                                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                                                title="Show QR Code"
                                            >
                                                <QrCode size={16} />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-sm font-bold ${shop.credit > 5 ? 'bg-green-50 text-green-700 border border-green-200' :
                                            shop.credit > 0 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                                                'bg-red-50 text-red-700 border border-red-200'
                                            }`}>
                                            <Coins size={14} />
                                            {shop.credit}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={14} className="text-gray-400" />
                                            <span className="text-sm text-gray-700">{shop.licenseDurationMonths} mo</span>
                                        </div>
                                        {shop.licenseExpiresAt && (() => {
                                            const days = getRemainingDays(shop.licenseExpiresAt);
                                            if (days !== null && days > 0) {
                                                return <span className={`text-xs mt-0.5 block ${days <= 7 ? 'text-red-500' : days <= 30 ? 'text-amber-500' : 'text-gray-400'}`}>{days}d left</span>;
                                            }
                                            return null;
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired(shop) ? (
                                            <div className="flex items-center gap-1.5">
                                                <AlertTriangle size={16} className="text-red-500" />
                                                <span className="text-sm font-medium text-red-600">Expired</span>
                                            </div>
                                        ) : shop.isActivated ? (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldCheck size={16} className="text-green-600" />
                                                <span className="text-sm font-medium text-green-700">Activated</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-1.5">
                                                <ShieldX size={16} className="text-amber-500" />
                                                <span className="text-sm font-medium text-amber-600">Pending</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(shop.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => handleRegenerateLicense(shop.id)}
                                                className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                title="Regenerate license key"
                                            >
                                                <RefreshCw size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleEdit(shop)}
                                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                title="Edit shop"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(shop.id)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                                                title="Delete shop"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center">
                                <Store className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{editingShop ? 'Edit Shop' : 'New Shop'}</h2>
                                <p className="text-sm text-gray-500">{editingShop ? 'Update shop details' : 'A license key will be generated automatically'}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Shop Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. Golden Palace Jewelry"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Owner Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.ownerName}
                                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. Ali Rezaei"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. 09123456789"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    rows={2}
                                    placeholder="Full address of the shop..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    rows={3}
                                    placeholder="Brief description of the shop..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Shop Types *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {SHOP_TYPE_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => toggleType(option.value)}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${formData.types.includes(option.value)
                                                ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    License Duration *
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DURATION_OPTIONS.map(option => (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, licenseDurationMonths: option.value })}
                                            className={`px-4 py-2.5 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${formData.licenseDurationMonths === option.value
                                                ? 'bg-black text-white border-black shadow-lg shadow-black/20'
                                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Credit (Image Generation Quota)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.credit}
                                    onChange={(e) => setFormData({ ...formData, credit: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="0"
                                />
                                <p className="text-xs text-gray-400 mt-1">Number of images this shop can generate</p>
                            </div>

                            {formError && (
                                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                                    {formError}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 font-semibold shadow-lg"
                                >
                                    {editingShop ? 'Save Changes' : 'Create Shop'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* QR Code Modal */}
            {qrShop && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative">
                        <button
                            onClick={() => setQrShop(null)}
                            className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <QrCode size={20} className="text-gray-600" />
                                <h3 className="text-lg font-bold text-gray-900">License QR Code</h3>
                            </div>
                            <p className="text-sm text-gray-500 mb-6">{qrShop.name}</p>

                            <div ref={qrRef} className="inline-flex p-6 bg-white rounded-2xl border border-gray-100 shadow-sm mb-4">
                                <QRCodeSVG
                                    value={qrShop.licenseKey}
                                    size={220}
                                    level="H"
                                    includeMargin={false}
                                />
                            </div>

                            <p className="font-mono text-lg font-bold text-gray-900 tracking-widest mb-6">
                                {qrShop.licenseKey}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => { copyLicenseKey(qrShop.licenseKey, qrShop.id); }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all font-medium text-sm"
                                >
                                    {copiedId === qrShop.id ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
                                    {copiedId === qrShop.id ? 'Copied!' : 'Copy Key'}
                                </button>
                                <button
                                    onClick={downloadQrCode}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-black text-white hover:bg-gray-800 transition-all font-medium text-sm shadow-lg"
                                >
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Shops;
