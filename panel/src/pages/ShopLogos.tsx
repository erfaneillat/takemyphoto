import { useState, useEffect, useRef } from 'react';
import { Upload, ImageIcon, ChevronLeft, Store } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { resolveApiBase } from '../utils/api';

interface Shop {
    id: string;
    name: string;
    logoWithBg?: string;
    logoWithoutBg?: string;
    isActive: boolean;
}

const API_BASE = resolveApiBase().replace(/\/api(\/v1)?\/?$/, '');

const ShopLogos = () => {
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingWithBg, setUploadingWithBg] = useState(false);
    const [uploadingWithoutBg, setUploadingWithoutBg] = useState(false);

    const withBgRef = useRef<HTMLInputElement>(null);
    const withoutBgRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const response = await apiClient.get('/shops');
            setShops(response.data.data.shops);

            // Re-select shop if already selected to update logos
            if (selectedShop) {
                const updated = response.data.data.shops.find((s: Shop) => s.id === selectedShop.id);
                if (updated) setSelectedShop(updated);
            }
        } catch (error) {
            console.error('Error fetching shops:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'logoWithBg' | 'logoWithoutBg') => {
        if (!selectedShop || !e.target.files?.length) return;

        const isWithBg = type === 'logoWithBg';
        if (isWithBg) setUploadingWithBg(true);
        else setUploadingWithoutBg(true);

        try {
            const formData = new FormData();
            formData.append(type, e.target.files[0]);

            const response = await apiClient.post(`/shops/${selectedShop.id}/logos`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSelectedShop(response.data.data.shop);
            fetchShops(); // Refresh the main list too
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
        } finally {
            if (isWithBg) {
                setUploadingWithBg(false);
                if (withBgRef.current) withBgRef.current.value = '';
            } else {
                setUploadingWithoutBg(false);
                if (withoutBgRef.current) withoutBgRef.current.value = '';
            }
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    if (selectedShop) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedShop(null)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <Store size={24} className="text-gray-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{selectedShop.name}</h1>
                            <p className="text-gray-500 text-sm">Manage logos for this shop</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo Without Background */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Icon without background</h2>
                        <p className="text-gray-500 text-sm mb-6 text-center">Used in places where a transparent background is required (e.g. Zhest overall header icons depending on theme).</p>

                        {selectedShop.logoWithoutBg ? (
                            <div className="relative group w-48 h-48 rounded-xl overflow-hidden border border-gray-200 bg-gray-50 mb-6 flex items-center justify-center">
                                <img
                                    src={`${API_BASE}${selectedShop.logoWithoutBg}`}
                                    alt="Logo without bg"
                                    className="max-w-full max-h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => !uploadingWithoutBg && withoutBgRef.current?.click()}
                                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Change Logo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => !uploadingWithoutBg && withoutBgRef.current?.click()}
                                className={`w-48 h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 mb-6 ${uploadingWithoutBg
                                    ? 'border-gray-200 bg-gray-50'
                                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                                    }`}
                            >
                                <Upload size={32} className="text-gray-400 mb-3" />
                                <p className="font-semibold text-gray-700">
                                    {uploadingWithoutBg ? 'Uploading...' : 'Upload Logo'}
                                </p>
                            </div>
                        )}
                        <input
                            ref={withoutBgRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, 'logoWithoutBg')}
                            className="hidden"
                        />
                    </div>

                    {/* Logo With Background */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Icon with background</h2>
                        <p className="text-gray-500 text-sm mb-6 text-center">Used in places where a solid background icon is appropriate, such as app icon or default logo.</p>

                        {selectedShop.logoWithBg ? (
                            <div className="relative group w-48 h-48 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm mb-6 flex items-center justify-center">
                                <img
                                    src={`${API_BASE}${selectedShop.logoWithBg}`}
                                    alt="Logo with bg"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <button
                                        onClick={() => !uploadingWithBg && withBgRef.current?.click()}
                                        className="bg-white text-gray-900 px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Change Logo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => !uploadingWithBg && withBgRef.current?.click()}
                                className={`w-48 h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 mb-6 ${uploadingWithBg
                                    ? 'border-gray-200 bg-gray-50'
                                    : 'border-gray-300 hover:border-black hover:bg-gray-50'
                                    }`}
                            >
                                <Upload size={32} className="text-gray-400 mb-3" />
                                <p className="font-semibold text-gray-700">
                                    {uploadingWithBg ? 'Uploading...' : 'Upload Logo'}
                                </p>
                            </div>
                        )}
                        <input
                            ref={withBgRef}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleUpload(e, 'logoWithBg')}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Shop Logos</h1>
                <p className="text-gray-500 mt-2 text-base">
                    Select a shop to manage its logos
                </p>
            </div>

            {shops.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shops found</h3>
                    <p className="text-gray-500">Create shops first to manage their logos</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {shops.map((shop) => (
                        <button
                            key={shop.id}
                            onClick={() => setSelectedShop(shop)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 text-left group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center flex-shrink-0">
                                    {shop.logoWithoutBg ? (
                                        <img src={`${API_BASE}${shop.logoWithoutBg}`} alt="" className="w-10 h-10 object-contain drop-shadow" />
                                    ) : shop.logoWithBg ? (
                                        <img src={`${API_BASE}${shop.logoWithBg}`} alt="" className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        <Store className="text-white" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-black transition-colors">
                                        {shop.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {shop.logoWithBg && shop.logoWithoutBg ? 'All logos set' :
                                            shop.logoWithBg || shop.logoWithoutBg ? 'Partial logos' : 'No logos yet'}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopLogos;
