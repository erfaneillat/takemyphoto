import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, ImageIcon, ChevronLeft } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { resolveApiBase } from '../utils/api';

interface SampleImage {
    url: string;
    publicId: string;
}

interface ShopCategory {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    types: string[];
    sampleImages: SampleImage[];
}

const API_BASE = resolveApiBase().replace(/\/api(\/v1)?\/?$/, '');

const ShopCategorySamples = () => {
    const [categories, setCategories] = useState<ShopCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ShopCategory | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await apiClient.get('/shop-categories');
            setCategories(response.data.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!selectedCategory || !e.target.files?.length) return;

        setUploading(true);
        try {
            const formData = new FormData();
            Array.from(e.target.files).forEach(file => {
                formData.append('images', file);
            });

            const response = await apiClient.post(`/shop-categories/${selectedCategory.id}/images`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setSelectedCategory(response.data.data.category);
            fetchCategories();
        } catch (error) {
            console.error('Error uploading images:', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleDeleteImage = async (publicId: string) => {
        if (!selectedCategory) return;
        if (!confirm('Delete this image?')) return;

        try {
            const response = await apiClient.delete(
                `/shop-categories/${selectedCategory.id}/images/${encodeURIComponent(publicId)}`
            );
            setSelectedCategory(response.data.data.category);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting image:', error);
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading...</div>;
    }

    // Detail view for a selected category
    if (selectedCategory) {
        return (
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        <ChevronLeft size={22} />
                    </button>
                    <div className="flex items-center gap-3">
                        {selectedCategory.icon && (
                            <span className="text-3xl">{selectedCategory.icon}</span>
                        )}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{selectedCategory.name}</h1>
                            <p className="text-gray-500 text-sm">Sample images for this category</p>
                        </div>
                    </div>
                </div>

                {/* Upload area */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    <div
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${uploading
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-gray-300 hover:border-black hover:bg-gray-50'
                            }`}
                    >
                        <Upload size={32} className="mx-auto text-gray-400 mb-3" />
                        <p className="font-semibold text-gray-700">
                            {uploading ? 'Uploading...' : 'Click to upload images'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each</p>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleUpload}
                        className="hidden"
                    />
                </div>

                {/* Image grid */}
                {(selectedCategory.sampleImages || []).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sample images yet</h3>
                        <p className="text-gray-500">Upload images to showcase this category</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {selectedCategory.sampleImages.map((img) => (
                            <div
                                key={img.publicId}
                                className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-white aspect-square"
                            >
                                <img
                                    src={`${API_BASE}${img.url}`}
                                    alt="Sample"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                                    <button
                                        onClick={() => handleDeleteImage(img.publicId)}
                                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 bg-red-500 text-white p-2.5 rounded-xl hover:bg-red-600 shadow-lg"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    // Category list view
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Sample Images</h1>
                <p className="text-gray-500 mt-2 text-base">
                    Select a category to manage its sample images
                </p>
            </div>

            {categories.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No categories found</h3>
                    <p className="text-gray-500">Create shop categories first</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category)}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-xl hover:border-gray-200 transition-all duration-300 text-left group"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-900 to-gray-600 flex items-center justify-center flex-shrink-0">
                                    {category.icon ? (
                                        <span className="text-2xl">{category.icon}</span>
                                    ) : (
                                        <ImageIcon className="text-white" size={24} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-black transition-colors">
                                        {category.name}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {(category.sampleImages || []).length} images
                                    </p>
                                </div>
                            </div>

                            {/* Preview grid */}
                            {(category.sampleImages || []).length > 0 ? (
                                <div className="grid grid-cols-3 gap-1.5 rounded-lg overflow-hidden">
                                    {category.sampleImages.slice(0, 3).map((img) => (
                                        <div key={img.publicId} className="aspect-square">
                                            <img
                                                src={`${API_BASE}${img.url}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-20 bg-gray-50 rounded-lg flex items-center justify-center">
                                    <p className="text-sm text-gray-400">No images yet</p>
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ShopCategorySamples;
