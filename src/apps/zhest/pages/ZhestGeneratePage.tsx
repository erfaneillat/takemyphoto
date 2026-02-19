import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { shopProductImageApi, ShopProductStyle, ShopGenerateProductImageResponse, ShopStyleItem } from '@/shared/services/shopProductImageApi';
import { useLicenseStore } from '../stores/useLicenseStore';
import { useReferenceImageStore } from '../stores/useReferenceImageStore';
import { getErrorMessage } from '@/shared/utils';
import { AspectRatioSelector } from '@/shared/components/AspectRatioSelector';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';
import {
    Upload,
    X,
    Image as ImageIcon,
    Sparkles,
    Loader2,
    ShoppingBag,
    Check,
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || '';

const resolveImageUrl = (url: string) => {
    if (url.startsWith('http')) return url;
    return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
};

export const ZhestGeneratePage = () => {
    const { t } = useTranslation();
    const { licenseKey, deviceFingerprint, credit, shopTypes, refreshLicenseInfo } = useLicenseStore();
    const { referenceImageUrl: storeRefUrl, clearReferenceImageUrl } = useReferenceImageStore();
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [selectedStyle, setSelectedStyle] = useState<ShopProductStyle>('');
    const [styleOptions, setStyleOptions] = useState<ShopStyleItem[]>([]);
    const [stylesLoading, setStylesLoading] = useState(true);
    const [productImages, setProductImages] = useState<File[]>([]);
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [referenceImageUrl, setReferenceImageUrl] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatioValue>('1:1');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ShopGenerateProductImageResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch styles from API
    useEffect(() => {
        const fetchStyles = async () => {
            setStylesLoading(true);
            try {
                const styles = await shopProductImageApi.getStyles(shopTypes.length > 0 ? shopTypes : undefined);
                setStyleOptions(styles);
                if (styles.length > 0 && !selectedStyle) {
                    setSelectedStyle(styles[0].slug);
                }
            } catch (err) {
                console.error('Failed to fetch styles:', err);
            } finally {
                setStylesLoading(false);
            }
        };
        fetchStyles();
    }, [shopTypes]);

    // Consume reference image URL from store (set by Search page)
    useEffect(() => {
        if (storeRefUrl) {
            setReferenceImageUrl(storeRefUrl);
            setReferenceImage(null);
            clearReferenceImageUrl();
        }
    }, [storeRefUrl]);

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
        setReferenceImageUrl(null);
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

        if (!licenseKey || !deviceFingerprint) {
            setError('License not activated');
            return;
        }

        if (credit <= 0) {
            setError('اعتبار شما به پایان رسیده است. لطفاً برای شارژ مجدد با پشتیبانی تماس بگیرید.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // If we have a URL-based reference (from Search page), fetch it as a File
            let refFile = referenceImage;
            if (!refFile && referenceImageUrl) {
                try {
                    const res = await fetch(referenceImageUrl);
                    const blob = await res.blob();
                    refFile = new File([blob], 'reference.jpg', { type: blob.type || 'image/jpeg' });
                } catch (fetchErr) {
                    console.error('Failed to fetch reference image:', fetchErr);
                }
            }

            const data = await shopProductImageApi.generate(
                productName,
                selectedStyle,
                productImages,
                licenseKey,
                deviceFingerprint,
                productDescription || undefined,
                refFile || undefined,
                aspectRatio,
            );
            setResult(data);
            // Refresh credit from server after successful generation
            await refreshLicenseInfo();
        } catch (err: any) {
            console.error(err);
            setError(getErrorMessage(err) || t('productGenerator.error.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 pb-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 dark:border-pink-500/20 mb-3">
                        <ShoppingBag size={16} className="text-purple-600 dark:text-pink-400" />
                        <span className="text-sm font-semibold text-purple-600 dark:text-pink-400">
                            {t('productGenerator.badge')}
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {t('productGenerator.title')}
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('productGenerator.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Input Section */}
                    <div className="space-y-5 bg-white dark:bg-surface-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 order-2 lg:order-1">
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

                        {/* Product Images Upload */}
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
                            {stylesLoading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="animate-spin text-gray-400" size={24} />
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {styleOptions.map((style) => (
                                        <button
                                            key={style.slug}
                                            onClick={() => setSelectedStyle(style.slug)}
                                            className={`group relative rounded-xl rtl:text-right ltr:text-left transition-all overflow-hidden aspect-[4/3] ${selectedStyle === style.slug
                                                ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-surface'
                                                : 'hover:ring-2 hover:ring-primary/50 hover:ring-offset-2 dark:hover:ring-offset-surface'
                                                }`}
                                        >
                                            {style.thumbnailUrl ? (
                                                <img
                                                    src={resolveImageUrl(style.thumbnailUrl)}
                                                    alt={style.name}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-300 to-gray-500" />
                                            )}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                                            {selectedStyle === style.slug && (
                                                <div className="absolute top-2 rtl:left-2 ltr:right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                                                    <Check size={14} className="text-white" />
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 p-3">
                                                <div className="text-sm font-bold text-white mb-0.5 truncate">
                                                    {style.name}
                                                </div>
                                                {style.description && (
                                                    <div className="text-[10px] text-gray-300 line-clamp-1">
                                                        {style.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Reference Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('productGenerator.referenceImage')}
                            </label>
                            {referenceImage || referenceImageUrl ? (
                                <div className="relative w-32 h-32 rounded-xl overflow-hidden group">
                                    <img
                                        src={referenceImage ? URL.createObjectURL(referenceImage) : referenceImageUrl!}
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

                        {/* Aspect Ratio */}
                        <div>
                            <AspectRatioSelector
                                value={aspectRatio}
                                onChange={setAspectRatio}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !productName.trim() || productImages.length === 0 || credit <= 0}
                            className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all ${loading || !productName.trim() || productImages.length === 0 || credit <= 0
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
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Section */}
                    <div className="bg-white dark:bg-surface-card p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col order-1 lg:order-2">
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
