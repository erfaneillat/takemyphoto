import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FolderOpen } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface ShopCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
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
];

const ShopCategories = () => {
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<ShopCategory | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        icon: '',
        types: [] as string[],
        order: 0,
    });
    const [formError, setFormError] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/shop-categories');
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Error fetching shop categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formData.name.trim()) {
            setFormError('Category name is required');
            return;
        }
        if (formData.types.length === 0) {
            setFormError('Select at least one shop type');
            return;
        }

        try {
            if (editingCategory) {
                await apiClient.put(`/shop-categories/${editingCategory.id}`, formData);
            } else {
                await apiClient.post('/shop-categories', formData);
            }
            fetchCategories();
            handleCloseModal();
        } catch (error: any) {
            console.error('Error saving shop category:', error);
            const msg = error?.response?.data?.message || 'Failed to save category';
            setFormError(msg);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;

        try {
            await apiClient.delete(`/shop-categories/${id}`);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting shop category:', error);
        }
    };

    const handleEdit = (category: ShopCategory) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            icon: category.icon || '',
            types: category.types,
            order: category.order,
        });
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingCategory(null);
        setFormData({
            name: '',
            slug: '',
            description: '',
            icon: '',
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

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shop Categories</h1>
                    <p className="text-gray-500 mt-2 text-base">
                        Manage categories for shop types in Zhest app
                    </p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                    <Plus size={20} />
                    Add Category
                </button>
            </div>

            {/* Categories Grid */}
            {categories.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No shop categories yet</h3>
                    <p className="text-gray-500 mb-6">Create your first shop category</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-gray-800 transition-all"
                    >
                        <Plus size={20} />
                        Add Category
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center">
                                        {category.icon ? (
                                            <span className="text-2xl">{category.icon}</span>
                                        ) : (
                                            <FolderOpen className="text-white" size={24} />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                                        <p className="text-sm text-gray-500">{category.slug}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${category.isActive
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {category.isActive ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            {/* Shop Types */}
                            <div className="flex flex-wrap gap-1.5 mb-3">
                                {category.types.map(type => {
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

                            {category.description && (
                                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                            )}

                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                <button
                                    onClick={() => handleEdit(category)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition-all duration-200 font-medium"
                                >
                                    <Edit size={18} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(category.id)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium"
                                >
                                    <Trash2 size={18} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center">
                                <FolderOpen className="text-white" size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {editingCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {editingCategory ? 'Update shop category details' : 'Create a new shop category'}
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
                                    placeholder="e.g. Rings"
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
                                    placeholder="Brief description..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Icon (emoji)
                                </label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                                    placeholder="💎"
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
                                    {editingCategory ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShopCategories;
