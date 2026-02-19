import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Palette, Upload, X, Database } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface ShopStyle {
    id: string;
    name: string;
    slug: string;
    description?: string;
    prompt: string;
    thumbnailUrl?: string;
    types: string[];
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
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


const ShopStyles = () => {
    const [styles, setStyles] = useState<ShopStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [filterTypes, setFilterTypes] = useState<string[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingStyle, setEditingStyle] = useState<ShopStyle | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        prompt: '',
        types: [] as string[],
        order: 0,
    });
    const [formError, setFormError] = useState('');
    const [uploadingThumbnail, setUploadingThumbnail] = useState<string | null>(null);

    const filteredStyles = filterTypes.length === 0
        ? styles
        : styles.filter(s => s.types.some(t => filterTypes.includes(t)));

    useEffect(() => {
        fetchStyles();
    }, []);

    const fetchStyles = async () => {
        try {
            const response = await apiClient.get('/shop-styles');
            setStyles(response.data.data.styles);
        } catch (error) {
            console.error('Error fetching shop styles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name.trim()) {
            setFormError('Style name is required');
            return;
        }
        if (!formData.prompt.trim()) {
            setFormError('Prompt is required');
            return;
        }
        if (formData.types.length === 0) {
            setFormError('Select at least one shop type');
            return;
        }

        try {
            if (editingStyle) {
                await apiClient.put(`/shop-styles/${editingStyle.id}`, formData);
            } else {
                await apiClient.post('/shop-styles', formData);
            }
            fetchStyles();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving shop style:', error);
            const msg = error?.response?.data?.message || 'Failed to save style';
            setFormError(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this style?')) return;

        try {
            await apiClient.delete(`/shop-styles/${id}`);
            fetchStyles();
        } catch (error) {
            console.error('Error deleting shop style:', error);
        }
    };

    const handleEdit = (style: ShopStyle) => {
        setEditingStyle(style);
        setFormData({
            name: style.name,
            slug: style.slug,
            description: style.description || '',
            prompt: style.prompt,
            types: style.types,
            order: style.order,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingStyle(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            prompt: '',
            types: [],
            order: 0,
        });
        setFormError('');
    };

    const handleSlugGeneration = (name: string) => {
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        setFormData({ ...formData, name, slug });
    };

    const toggleType = (type: string) => {
        setFormData(prev => ({
            ...prev,
            types: prev.types.includes(type)
                ? prev.types.filter(t => t !== type)
                : [...prev.types, type]
        }));
    };

    const handleThumbnailUpload = async (styleId: string, file: File) => {
        setUploadingThumbnail(styleId);
        try {
            const fd = new FormData();
            fd.append('thumbnail', file);
            await apiClient.post(`/shop-styles/${styleId}/thumbnail`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            fetchStyles();
        } catch (error) {
            console.error('Error uploading thumbnail:', error);
        } finally {
            setUploadingThumbnail(null);
        }
    };

    const handleThumbnailDelete = async (styleId: string) => {
        try {
            await apiClient.delete(`/shop-styles/${styleId}/thumbnail`);
            fetchStyles();
        } catch (error) {
            console.error('Error deleting thumbnail:', error);
        }
    };

    const handleSeedDefaults = async () => {
        setSeeding(true);
        try {
            const response = await apiClient.post('/shop-styles/seed');
            const { created, skipped } = response.data.data;
            setStyles(response.data.data.styles);
            alert(`Seeded: ${created} created, ${skipped} already existed`);
        } catch (error) {
            console.error('Error seeding defaults:', error);
            alert('Failed to seed default styles');
        } finally {
            setSeeding(false);
        }
    };

    const resolveImageUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return url;
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shop Styles</h1>
                    <p className="text-gray-500 mt-2 text-base">
                        Manage photography styles and prompts for Zhest app
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSeedDefaults}
                        disabled={seeding}
                        className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                    >
                        {seeding ? (
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                        ) : (
                            <Database size={20} />
                        )}
                        Seed Defaults
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        <Plus size={20} />
                        Add Style
                    </button>
                </div>
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-gray-500 mr-1">Filter:</span>
                {SHOP_TYPE_OPTIONS.map(option => (
                    <button
                        key={option.value}
                        onClick={() => setFilterTypes(prev =>
                            prev.includes(option.value)
                                ? prev.filter(t => t !== option.value)
                                : [...prev, option.value]
                        )}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${filterTypes.includes(option.value)
                                ? 'bg-black text-white border-black shadow-sm'
                                : `${option.color} hover:opacity-80`
                            }`}
                    >
                        {option.label}
                    </button>
                ))}
                {filterTypes.length > 0 && (
                    <button
                        onClick={() => setFilterTypes([])}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all"
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Styles Grid */}
            {filteredStyles.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <Palette size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shop styles yet</h3>
                    <p className="text-gray-500 mb-6">Create your first photography style</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all"
                    >
                        <Plus size={20} />
                        Add Style
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStyles.map((style) => (
                        <div
                            key={style.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:border-gray-200 transition-all duration-300 group"
                        >
                            {/* Thumbnail */}
                            <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                {style.thumbnailUrl ? (
                                    <>
                                        <img
                                            src={resolveImageUrl(style.thumbnailUrl)}
                                            alt={style.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => handleThumbnailDelete(style.id)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </>
                                ) : (
                                    <label className="cursor-pointer flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors">
                                        {uploadingThumbnail === style.id ? (
                                            <div className="animate-spin w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full" />
                                        ) : (
                                            <>
                                                <Upload size={28} />
                                                <span className="text-sm font-medium">Upload Thumbnail</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) handleThumbnailUpload(style.id, file);
                                            }}
                                        />
                                    </label>
                                )}
                            </div>

                            <div className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{style.name}</h3>
                                        <p className="text-sm text-gray-500">{style.slug}</p>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${style.isActive
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {style.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                {/* Shop Types */}
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {style.types.map(type => {
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

                                {style.description && (
                                    <p className="text-gray-600 text-sm mb-3">{style.description}</p>
                                )}

                                {/* Prompt preview */}
                                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                                    <p className="text-xs text-gray-500 font-medium mb-1">Prompt</p>
                                    <p className="text-xs text-gray-700 line-clamp-3 font-mono">{style.prompt}</p>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEdit(style)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        <Edit size={18} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(style.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                                    >
                                        <Trash2 size={18} />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                                <Palette className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingStyle ? 'Edit Style' : 'New Style'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {editingStyle ? 'Update style details and prompt' : 'Create a new photography style'}
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleSlugGeneration(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. فروشگاهی"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. ecommerce"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="e.g. پس‌زمینه سفید، حرفه‌ای"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Prompt *
                                </label>
                                <textarea
                                    value={formData.prompt}
                                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                                    rows={6}
                                    placeholder="Professional e-commerce product photography style..."
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    This prompt will be sent to the AI for image generation
                                </p>
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Order
                                </label>
                                <input
                                    type="number"
                                    value={formData.order}
                                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                />
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
                                    {editingStyle ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopStyles;
