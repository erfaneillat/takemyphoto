import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { shopProductImageApi, ShopProductStyle, ShopGenerateProductImageResponse, ShopStyleItem } from '@/shared/services/shopProductImageApi';
import { useLicenseStore } from '../stores/useLicenseStore';
import { useReferenceImageStore } from '../stores/useReferenceImageStore';
import { getErrorMessage } from '@/shared/utils';
import { AspectRatioSelector } from '@/shared/components/AspectRatioSelector';
import type { AspectRatioValue } from '@/shared/components/AspectRatioSelector';
import { Upload, Wand2, Trash2, X, Download, ImageIcon as ImageIconOutline, Check, Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { resolveApiBase } from '@/shared/services/api';

const API_BASE = resolveApiBase().replace(/\/api(\/v1)?\/?$/, '');

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
    const [modelType, setModelType] = useState<'normal' | 'pro'>('pro');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<ShopGenerateProductImageResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const requiredCredit = modelType === 'pro' ? 15 : 5;

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

        if (credit < requiredCredit) {
            setError(`اعتبار شما کافی نیست. تولید این تصویر نیاز به ${requiredCredit} اعتبار دارد.`);
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
                modelType
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
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#0A0A0B] p-4 sm:p-6 lg:p-8 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto space-y-8">
                {/* Header Backdrop */}
                <div className="relative text-center py-8 lg:py-12">
                    <div className="absolute inset-0 max-w-3xl mx-auto bg-gray-200/50 dark:bg-gray-800/50 blur-[100px] -z-10 rounded-full pointer-events-none" />



                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight leading-tight">
                        {t('productGenerator.title')}
                    </h1>

                    <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('productGenerator.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                    {/* Input Section - Left Side on Desktop, Bottom on Mobile */}
                    <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 lg:order-1 order-2">

                        {/* Box 1: Core Details */}
                        <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100/80 dark:border-gray-800/80 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-medium">1</div>
                                اطلاعات محصول
                            </h2>

                            <div className="space-y-5">
                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-gray-900 dark:group-focus-within:text-white">
                                        {t('productGenerator.productName')}
                                    </label>
                                    <input
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white outline-none transition-all text-gray-900 dark:text-white text-base shadow-inner"
                                        placeholder={t('productGenerator.productNamePlaceholder')}
                                    />
                                </div>

                                <div className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors group-focus-within:text-gray-900 dark:group-focus-within:text-white">
                                        {t('productGenerator.productDescription')}
                                    </label>
                                    <textarea
                                        value={productDescription}
                                        onChange={(e) => setProductDescription(e.target.value)}
                                        className="w-full px-5 py-4 rounded-2xl bg-gray-50/50 dark:bg-gray-950/50 border border-gray-200 dark:border-gray-800 focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:border-gray-900 dark:focus:border-white outline-none transition-all resize-none min-h-[120px] text-gray-900 dark:text-white text-base shadow-inner"
                                        placeholder={t('productGenerator.productDescriptionPlaceholder')}
                                    />
                                </div>

                                {/* Model Type Selection */}
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
                                        کیفیت پردازش (مدل هوش مصنوعی)
                                    </label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setModelType('normal')}
                                            className={`relative p-4 rounded-2xl border-2 text-start transition-all overflow-hidden ${modelType === 'normal'
                                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20'
                                                : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 hover:border-gray-300 dark:hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-bold ${modelType === 'normal' ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>سریع (Normal)</span>
                                                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${modelType === 'normal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>۵ اعتبار</div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">سرعت بالا در تولید تصویر با کیفیت مطلوب (مدل Gemini Flash).</p>
                                        </button>

                                        <button
                                            onClick={() => setModelType('pro')}
                                            className={`relative p-4 rounded-2xl border-2 text-start transition-all overflow-hidden ${modelType === 'pro'
                                                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
                                                : 'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 hover:border-gray-300 dark:hover:border-gray-700'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className={`font-bold flex items-center gap-1 ${modelType === 'pro' ? 'text-purple-700 dark:text-purple-400' : 'text-gray-900 dark:text-white'}`}>
                                                    حرفه‌ای (Pro)
                                                    <Sparkles size={14} className={modelType === 'pro' ? 'text-purple-500' : 'text-gray-400'} />
                                                </span>
                                                <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${modelType === 'pro' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}`}>۱۵ اعتبار</div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">بالاترین کیفیت، جزئیات دقیق و درک بهتر درخواست (مدل Gemini Pro).</p>

                                            {modelType === 'pro' && (
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-transparent rounded-bl-full -z-10" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Box 2: Visual Assets */}
                        <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100/80 dark:border-gray-800/80 space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-medium">2</div>
                                تصاویر و ساختار
                            </h2>

                            <div className="flex flex-col gap-8">
                                {/* Main Product Images Upload - Full Width Prominent */}
                                <div className="w-full">
                                    <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-3 flex justify-between items-center">
                                        <span className="flex items-center gap-2">
                                            <ImageIconOutline className="text-gray-600 dark:text-gray-400" size={18} />
                                            {t('productGenerator.productImages')} <span className="text-red-500">*</span>
                                        </span>
                                        <span className="text-xs font-medium px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                                            {productImages.length}/5 عکس
                                        </span>
                                    </label>

                                    <div className="space-y-4">
                                        {/* Large prominent dropzone if no images yet, or smaller if we have some but less than 5 */}
                                        {productImages.length === 0 ? (
                                            <label className="w-full h-48 sm:h-64 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group/upload bg-gray-50/50 dark:bg-gray-950/50 relative overflow-hidden transform-gpu">
                                                {/* Animated SVG Background */}
                                                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none flex items-center justify-center">
                                                    <svg width="400" height="400" viewBox="0 0 400 400" className="animate-[spin_60s_linear_infinite] transform-gpu will-change-transform">
                                                        <path d="M200,50 C282.84,50 350,117.16 350,200 C350,282.84 282.84,350 200,350 C117.16,350 50,282.84 50,200 C50,117.16 117.16,50 200,50 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 20" />
                                                        <path d="M200,80 C266.27,80 320,133.73 320,200 C320,266.27 266.27,320 200,320 C133.73,320 80,266.27 80,200 C80,133.73 133.73,80 200,80 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 15" className="animate-[spin_40s_linear_infinite_reverse] transform-gpu will-change-transform" style={{ transformOrigin: '50% 50%' }} />
                                                    </svg>
                                                </div>

                                                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-gray-800 shadow-lg shadow-gray-200/50 dark:shadow-black/50 flex items-center justify-center mb-4 group-hover/upload:scale-110 group-hover/upload:-translate-y-2 transition-all duration-300 z-10 relative transform-gpu">
                                                    <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 rounded-2xl animate-ping opacity-20" />
                                                    <Upload className="text-gray-900 dark:text-white relative z-10" size={28} />
                                                </div>
                                                <span className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1 z-10 relative transform-gpu">تصویر اصلی محصول</span>
                                                <span className="text-sm text-gray-500 dark:text-gray-400 z-10 text-center px-4 relative transform-gpu">برای آپلود کلیک کنید یا عکس را اینجا رها کنید<br />تا ۵ تصویر از زوایای مختلف</span>
                                                <input type="file" accept="image/*" multiple className="hidden" onChange={handleProductImageUpload} />
                                            </label>
                                        ) : (
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                {/* First image is larger and spanning */}
                                                <div className="col-span-2 row-span-2 relative rounded-3xl overflow-hidden group/img bg-gray-100 dark:bg-gray-800 shadow-md border border-gray-200/50 dark:border-gray-700/50 aspect-square sm:aspect-auto">
                                                    <img
                                                        src={URL.createObjectURL(productImages[0])}
                                                        alt="Main Product"
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                                                    />
                                                    <div className="absolute top-3 right-3 bg-gray-900 dark:bg-white dark:text-gray-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
                                                        تصویر اصلی
                                                    </div>
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end justify-center p-4">
                                                        <button
                                                            onClick={() => removeProductImage(0)}
                                                            className="px-4 py-2 bg-gray-900/80 hover:bg-gray-900 dark:bg-white/80 dark:hover:bg-white rounded-xl text-white dark:text-gray-900 font-medium text-sm transform translate-y-4 group-hover/img:translate-y-0 transition-transform flex items-center gap-2 shadow-lg"
                                                        >
                                                            <Trash2 size={16} className="text-white dark:text-gray-900" />
                                                            حذف
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Remaining images grid */}
                                                {productImages.slice(1).map((img, idx) => (
                                                    <div key={idx + 1} className="relative aspect-square rounded-2xl overflow-hidden group/img bg-gray-100 dark:bg-gray-800 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                                                        <img
                                                            src={URL.createObjectURL(img)}
                                                            alt={`product-${idx + 1}`}
                                                            className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                            <button
                                                                onClick={() => removeProductImage(idx + 1)}
                                                                className="p-2 bg-gray-900/80 hover:bg-gray-900 dark:bg-white/80 dark:hover:bg-white rounded-full text-white dark:text-gray-900 transform scale-75 group-hover/img:scale-100 transition-transform shadow-lg"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Add more button if < 5 */}
                                                {productImages.length < 5 && (
                                                    <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-gray-500 dark:hover:border-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group/upload bg-gray-50/50 dark:bg-gray-950/50">
                                                        <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                                                            <Upload className="text-gray-600 dark:text-gray-400" size={18} />
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">عکس بعدی</span>
                                                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleProductImageUpload} />
                                                    </label>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start gap-2">
                                        <div className="mt-0.5 text-gray-900 dark:text-white"><AlertCircle size={16} /></div>
                                        <span>{t('productGenerator.productImagesHint')} تصویر اول به عنوان <strong>زاویه اصلی</strong> در نظر گرفته می‌شود.</span>
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-2" />

                                {/* Reference Image Upload - Less Prominent */}
                                <div className="w-full bg-gray-50/50 dark:bg-gray-900/30 p-5 rounded-3xl border border-gray-100 dark:border-gray-800/50">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                            <Wand2 className="text-gray-900 dark:text-white" size={16} />
                                            {t('productGenerator.referenceImage')}
                                        </span>
                                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">اختیاری</span>
                                    </label>

                                    <div className="flex flex-col sm:flex-row gap-5 items-center">
                                        {referenceImage || referenceImageUrl ? (
                                            <div className="relative w-full sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden group/ref shadow-sm border border-gray-200/50 dark:border-gray-700/50 shrink-0">
                                                <img
                                                    src={referenceImage ? URL.createObjectURL(referenceImage) : referenceImageUrl!}
                                                    alt="Reference"
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover/ref:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/ref:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                                    <button
                                                        onClick={removeReferenceImage}
                                                        className="p-2.5 bg-gray-900/80 hover:bg-gray-900 dark:bg-white/80 dark:hover:bg-white rounded-full text-white dark:text-gray-900 backdrop-blur-md transition-all flex items-center gap-2"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label className="w-full sm:w-48 aspect-[4/3] rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-gray-900 dark:hover:border-white hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all group/upload bg-white dark:bg-gray-950 shrink-0">
                                                <div className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 shadow-sm flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                                                    <ImageIconOutline className="text-gray-900 dark:text-white" size={20} />
                                                </div>
                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">آپلود مرجع</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={handleReferenceImageUpload} />
                                            </label>
                                        )}

                                        <div className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed text-center sm:text-start">
                                            {t('productGenerator.referenceImageHint')}
                                            <p className="mt-1 text-xs opacity-80">از این قابلیت برای تعیین نوع ترکیب‌بندی، رنگ‌بندی خاص محیط، یا زاویه دوربین الهام‌بخش استفاده کنید.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Aspect Ratio Component */}
                            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                                <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-4">
                                    نسبت تصویر خروجی
                                </label>
                                <AspectRatioSelector
                                    value={aspectRatio}
                                    onChange={setAspectRatio}
                                />
                            </div>
                        </div>

                        {/* Box 3: Style Selection */}
                        <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-xl p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100/80 dark:border-gray-800/80 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />

                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-900 dark:text-white font-medium">3</div>
                                انتخاب استایل
                            </h2>

                            {stylesLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <div className="relative">
                                        <div className="absolute inset-0 border-4 border-gray-300 dark:border-gray-700 rounded-full animate-ping" />
                                        <Loader2 className="animate-spin text-gray-600 dark:text-gray-400 relative" size={32} />
                                    </div>
                                    <p className="text-sm text-gray-500 animate-pulse">در حال بارگذاری استایل‌ها...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {styleOptions.map((style) => (
                                        <button
                                            key={style.slug}
                                            onClick={() => setSelectedStyle(style.slug)}
                                            className={`group/card relative rounded-2xl rtl:text-right ltr:text-left transition-all duration-300 overflow-hidden aspect-[4/5] shadow-sm transform hover:-translate-y-1 ${selectedStyle === style.slug
                                                ? 'ring-4 ring-gray-900/50 dark:ring-white/50 shadow-gray-900/20 dark:shadow-white/20 shadow-lg'
                                                : 'hover:ring-2 hover:ring-gray-900/30 dark:hover:ring-white/30 border border-gray-200/50 dark:border-gray-800/50'
                                                }`}
                                        >
                                            {style.thumbnailUrl ? (
                                                <img
                                                    src={resolveImageUrl(style.thumbnailUrl)}
                                                    alt={style.name}
                                                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 ${selectedStyle === style.slug ? 'scale-110' : 'group-hover/card:scale-110'
                                                        }`}
                                                />
                                            ) : (
                                                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900" />
                                            )}

                                            {/* Gradient Overlay for Text */}
                                            <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${selectedStyle === style.slug
                                                ? 'from-gray-900/90 dark:from-black/90 via-black/40 to-transparent'
                                                : 'from-black/80 via-black/20 to-transparent opacity-80 group-hover/card:opacity-100'
                                                }`} />

                                            {selectedStyle === style.slug && (
                                                <div className="absolute top-3 rtl:left-3 ltr:right-3 w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg shadow-gray-900/50 dark:shadow-white/50 animate-bounce-subtle backdrop-blur-sm border border-white/20">
                                                    <Check size={16} className="text-white dark:text-gray-900" />
                                                </div>
                                            )}

                                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                                <div className="text-base font-extrabold text-white mb-1 tracking-wide leading-tight drop-shadow-md">
                                                    {style.name}
                                                </div>
                                                {style.description && (
                                                    <div className="text-xs text-gray-200/90 line-clamp-2 leading-relaxed drop-shadow">
                                                        {style.description}
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Result Section - Right Side on Desktop, Top on Mobile */}
                    <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-8 lg:order-2 order-1 flex flex-col gap-6">

                        {/* Generation Output Box */}
                        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl p-6 rounded-[2rem] shadow-xl border-2 border-gray-200 dark:border-gray-800 flex flex-col relative overflow-hidden">
                            {/* Decorative glows */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gray-200/50 dark:bg-gray-800/50 blur-[50px] rounded-full pointer-events-none" />
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gray-200/50 dark:bg-gray-800/50 blur-[50px] rounded-full pointer-events-none" />

                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center justify-between">
                                <span>نتیجه پردازش</span>
                            </h2>

                            <div
                                className={`relative rounded-2xl overflow-hidden shadow-inner flex items-center justify-center transition-all duration-500 ${result ? 'bg-transparent' : 'bg-gray-50/80 dark:bg-gray-950/80 border-2 border-dashed border-gray-200 dark:border-gray-800'
                                    }`}
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
                                            className="w-full h-full object-contain bg-white dark:bg-black rounded-2xl"
                                        />

                                        {/* Elegant Overlay Downloader */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                            <p className="text-white/90 text-sm font-medium mb-4 line-clamp-2">
                                                {productName}
                                            </p>
                                            <a
                                                href={`data:${result.mimeType};base64,${result.image}`}
                                                download={`product-${productName.replace(/\s+/g, '-')}.png`}
                                                className="w-full py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border border-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                                            >
                                                <Download size={18} />
                                                دانلود کیفیت اصلی
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 w-full h-full p-6 text-center z-10">
                                        {loading ? (
                                            <div className="flex flex-col items-center">
                                                <div className="relative mb-6">
                                                    <div className="absolute inset-0 bg-gray-200/50 dark:bg-gray-800/50 blur-xl rounded-full" />
                                                    <Wand2 size={48} className="text-gray-600 dark:text-gray-400 animate-bounce relative z-10" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">جادو در حال انجام است...</h3>
                                                <p className="text-sm">این فرآیند ممکن است چند لحظه طول بکشد</p>

                                                {/* Fancy progress indicator */}
                                                <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full mt-6 overflow-hidden">
                                                    <div className="h-full bg-gray-900 dark:bg-white rounded-full w-full animate-[progress_2s_ease-in-out_infinite]" style={{ transformOrigin: 'left' }} />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 mb-4 rounded-full bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center transition-transform hover:scale-110 hover:-rotate-12 duration-300">
                                                    <ImageIconOutline size={36} className="text-gray-300 dark:text-gray-600" />
                                                </div>
                                                <h3 className="text-base font-bold text-gray-600 dark:text-gray-400 mb-1">آماده برای خلق!</h3>
                                                <p className="text-sm opacity-80 max-w-[200px]">
                                                    اطلاعات را وارد کنید و روی دکمه تولید کلیک کنید تا تصویر شما ساخته شود.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Error Message Display */}
                            {error && (
                                <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm border border-red-200/50 dark:border-red-500/20 flex items-start gap-3 backdrop-blur-sm animate-in slide-in-from-bottom-2 fade-in">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                    <p className="leading-relaxed">{error}</p>
                                </div>
                            )}

                            {/* Generate Action Button */}
                            <button
                                onClick={handleGenerate}
                                disabled={loading || !productName.trim() || productImages.length === 0 || credit < requiredCredit}
                                className={`mt-6 w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 overflow-hidden relative group ${loading || !productName.trim() || productImages.length === 0 || credit < requiredCredit
                                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.12)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.16)] transform hover:-translate-y-1 my-2'
                                    }`}
                            >
                                {/* Shine effect for enabled button */}
                                {!(loading || !productName.trim() || productImages.length === 0 || credit < requiredCredit) && (
                                    <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
                                )}

                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        <span>{t('productGenerator.generating')}...</span>
                                    </>
                                ) : (
                                    <>
                                        <Wand2 size={24} className={!(loading || !productName.trim() || productImages.length === 0 || credit < requiredCredit) ? "animate-pulse" : ""} />
                                        <span>{t('productGenerator.generateButton')}</span>
                                    </>
                                )}
                            </button>

                            {/* Validation Hints (Shows when disabled but not loading) */}
                            {!(loading) && (!productName.trim() || productImages.length === 0) && (
                                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4 px-4 leading-relaxed">
                                    {!productName.trim() ? "ابتدا نام محصول را وارد کنید" : "حداقل یک تصویر از محصول آپلود کنید"}
                                </p>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes progress {
                    0% { transform: scaleX(0); transform-origin: left; }
                    50% { transform: scaleX(1); transform-origin: left; }
                    50.1% { transform: scaleX(1); transform-origin: right; }
                    100% { transform: scaleX(0); transform-origin: right; }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
};
