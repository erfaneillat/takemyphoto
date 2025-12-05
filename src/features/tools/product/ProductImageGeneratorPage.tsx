import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productImageApi, ProductStyle, GenerateProductImageResponse } from '@/shared/services';
import { useAuthStore } from '@/shared/stores';
import { handleInsufficientStarsError, getErrorMessage } from '@/shared/utils';
import { ResolutionSelector, getStarCostForResolution } from '@/shared/components/ResolutionSelector';
import { AspectRatioSelector } from '@/shared/components/AspectRatioSelector';
import type { ResolutionValue } from '@/shared/components/ResolutionSelector';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';
import {
    Upload,
    X,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    ShoppingBag,
    Check,
    Star
} from 'lucide-react';

// Style options with icons and colors
const STYLE_OPTIONS: {
    value: ProductStyle;
    labelKey: string;
    descriptionKey: string;
    color: string;
    image: string;
}[] = [
        { value: 'pinterest', labelKey: 'productGenerator.styles.pinterest.label', descriptionKey: 'productGenerator.styles.pinterest.description', color: 'from-red-500 to-rose-600', image: '/product-styles/pinterest.png' },
        { value: 'ecommerce', labelKey: 'productGenerator.styles.ecommerce.label', descriptionKey: 'productGenerator.styles.ecommerce.description', color: 'from-gray-500 to-gray-600', image: '/product-styles/shop.png' },
        { value: 'lifestyle', labelKey: 'productGenerator.styles.lifestyle.label', descriptionKey: 'productGenerator.styles.lifestyle.description', color: 'from-green-500 to-emerald-600', image: '/product-styles/lifestyle.png' },
        { value: 'flatlay', labelKey: 'productGenerator.styles.flatlay.label', descriptionKey: 'productGenerator.styles.flatlay.description', color: 'from-pink-500 to-rose-600', image: '/product-styles/flatli.jpeg' },
        { value: 'minimal', labelKey: 'productGenerator.styles.minimal.label', descriptionKey: 'productGenerator.styles.minimal.description', color: 'from-slate-400 to-slate-500', image: '/product-styles/minimal.png' },
        { value: 'colorblock', labelKey: 'productGenerator.styles.colorblock.label', descriptionKey: 'productGenerator.styles.colorblock.description', color: 'from-purple-500 to-fuchsia-600', image: '/product-styles/colored.png' },
        { value: 'moody', labelKey: 'productGenerator.styles.moody.label', descriptionKey: 'productGenerator.styles.moody.description', color: 'from-gray-700 to-gray-900', image: '/product-styles/moody.png' },
        { value: 'macro', labelKey: 'productGenerator.styles.macro.label', descriptionKey: 'productGenerator.styles.macro.description', color: 'from-blue-500 to-indigo-600', image: '/product-styles/micro.png' },
        { value: 'infographic', labelKey: 'productGenerator.styles.infographic.label', descriptionKey: 'productGenerator.styles.infographic.description', color: 'from-cyan-500 to-teal-600', image: '/product-styles/infography.png' },
        { value: 'ugc', labelKey: 'productGenerator.styles.ugc.label', descriptionKey: 'productGenerator.styles.ugc.description', color: 'from-orange-500 to-amber-600', image: '/product-styles/ugc.png' },
    ];

export const ProductImageGeneratorPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { refreshUser } = useAuthStore();
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<ProductStyle>('ecommerce');
    const [productImages, setProductImages] = useState<File[]>([]);
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [resolution, setResolution] = useState<ResolutionValue>('1K');
    const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('1:1');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GenerateProductImageResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            if (productImages.length + newImages.length > 5) {
                setError(t('productGenerator.error.maxProductImages'));
                return;
            }
            setProductImages([...productImages, ...newImages]);
            setError(null);
        }
    };

    const handleReferenceImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReferenceImage(e.target.files[0]);
            setError(null);
        }
    };

    const removeProductImage = (index: number) => {
        setProductImages(productImages.filter((_, i) => i !== index));
    };

    const removeReferenceImage = () => {
        setReferenceImage(null);
    };

    const handleGenerate = async () => {
        if (!productName.trim()) {
            setError(t('productGenerator.error.nameRequired'));
            return;
        }

        if (productImages.length === 0) {
            setError(t('productGenerator.error.imageRequired'));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await productImageApi.generate(
                productName,
                selectedStyle,
                productImages,
                productDescription || undefined,
                referenceImage || undefined,
                aspectRatio,
                resolution
            );
            setResult(data);

            // Refresh user data to update star count in header
            await refreshUser();
        } catch (err: any) {
            console.error(err);
            // Check for insufficient stars error and handle redirect
            if (!handleInsufficientStarsError(err, setError, navigate, t)) {
                setError(getErrorMessage(err) || t('productGenerator.error.failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-surface p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 dark:border-pink-500/20 mb-4">
                        <ShoppingBag size={16} className="text-purple-600 dark:text-pink-400" />
                        <span className="text-sm font-semibold text-purple-600 dark:text-pink-400">
                            {t('productGenerator.badge')}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('productGenerator.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('productGenerator.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6 bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 order-2 lg:order-1">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('productGenerator.productName')}
                            </label>
                            <input
                                type="text"
                                value={productName}
                                onChange={(e) => setProductName(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-hover border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                placeholder={t('productGenerator.productNamePlaceholder')}
                            />
                        </div>

                        {/* Product Description */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('productGenerator.productDescription')}
                            </label>
                            <textarea
                                value={productDescription}
                                onChange={(e) => setProductDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-hover border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[80px] text-gray-900 dark:text-white"
                                placeholder={t('productGenerator.productDescriptionPlaceholder')}
                            />
                        </div>

                        {/* Product Images Upload (Up to 5) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('productGenerator.productImages')}
                            </label>
                            <div className="grid grid-cols-4 gap-3 mb-2">
                                {productImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`product-${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeProductImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                                {productImages.length < 5 && (
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-surface-hover">
                                        <Upload className="text-gray-400 mb-1" size={16} />
                                        <span className="text-xs text-gray-500">{t('productGenerator.upload')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleProductImageUpload}
                                        />
                                    </label>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {t('productGenerator.productImagesHint')}
                            </p>
                        </div>

                        {/* Style Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                                {t('productGenerator.selectStyle')}
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {STYLE_OPTIONS.map((style) => (
                                    <button
                                        key={style.value}
                                        onClick={() => setSelectedStyle(style.value)}
                                        className={`group relative rounded-xl rtl:text-right ltr:text-left transition-all overflow-hidden aspect-[4/3] ${selectedStyle === style.value
                                            ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-surface'
                                            : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 dark:hover:ring-offset-surface'
                                            }`}
                                    >
                                        {/* Background Image */}
                                        <img
                                            src={style.image}
                                            alt={t(style.labelKey)}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                                        {/* Selection Indicator */}
                                        {selectedStyle === style.value && (
                                            <div className="absolute top-2 rtl:left-2 ltr:right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}

                                        {/* Text Content */}
                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                            <div className="text-sm font-bold text-white mb-0.5 truncate">
                                                {t(style.labelKey)}
                                            </div>
                                            <div className="text-[10px] text-gray-300 line-clamp-1">
                                                {t(style.descriptionKey)}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reference Image (Optional, 1 only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('productGenerator.referenceImage')}
                            </label>
                            {referenceImage ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden group">
                                    <img
                                        src={URL.createObjectURL(referenceImage)}
                                        alt="Reference"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        onClick={removeReferenceImage}
                                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ) : (
                                <label className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-surface-hover">
                                    <Upload className="text-gray-400 mb-2" size={24} />
                                    <span className="text-xs text-gray-500">{t('productGenerator.upload')}</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleReferenceImageUpload}
                                    />
                                </label>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                {t('productGenerator.referenceImageHint')}
                            </p>
                        </div>

                        {/* Aspect Ratio & Resolution Selectors */}
                        <div className="grid grid-cols-2 gap-4">
                            <AspectRatioSelector
                                value={aspectRatio}
                                onChange={setAspectRatio}
                            />
                            <ResolutionSelector
                                value={resolution}
                                onChange={setResolution}
                            />
                        </div>

                        {/* Error Display */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !productName.trim() || productImages.length === 0}
                            className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all ${loading || !productName.trim() || productImages.length === 0
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {t('productGenerator.generating')}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    {t('productGenerator.generateButton')}
                                    <div className="flex items-center gap-1 bg-yellow-400/20 px-2 py-0.5 rounded-full">
                                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                                        <span className="text-yellow-300 text-sm font-medium">{getStarCostForResolution(resolution)}</span>
                                    </div>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Section */}
                    <div className="bg-white dark:bg-surface-card p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col order-1 lg:order-2">
                        <div
                            className="relative rounded-xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center"
                            style={{
                                aspectRatio: aspectRatio.replace(':', '/'),
                                width: '100%'
                            }}
                        >
                            {result ? (
                                <div className="relative w-full h-full group">
                                    <img
                                        src={`data:${result.mimeType};base64,${result.image}`}
                                        alt="Generated Product"
                                        className="w-full h-full object-contain"
                                    />
                                    <a
                                        href={`data:${result.mimeType};base64,${result.image}`}
                                        download={`product-${productName.replace(/\s+/g, '-')}.png`}
                                        className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg shadow-lg font-medium text-sm transition-all"
                                    >
                                        {t('productGenerator.download')}
                                    </a>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                                    <div className="w-16 h-16 mb-3 rounded-2xl bg-gray-200 dark:bg-surface-hover flex items-center justify-center">
                                        {loading ? (
                                            <Loader2 size={32} className="animate-spin opacity-50" />
                                        ) : (
                                            <ImageIcon size={32} className="opacity-50" />
                                        )}
                                    </div>
                                    <p className="text-center text-sm">
                                        {loading ? t('productGenerator.preview.loading') : t('productGenerator.preview.placeholder')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
