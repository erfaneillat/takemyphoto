import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { thumbnailApi, GenerateThumbnailResponse } from '@/shared/services';
import { Upload, X, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';

export const InstagramCoverGeneratorPage = () => {
    const { t } = useTranslation();
    const [description, setDescription] = useState('');
    const [visualDescription, setVisualDescription] = useState('');
    const [language, setLanguage] = useState('English');
    const [images, setImages] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<GenerateThumbnailResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            if (images.length + newImages.length > 6) {
                setError(t('instagramCoverGenerator.error.maxImages'));
                return;
            }
            setImages([...images, ...newImages]);
            setError(null);
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!description) {
            setError(t('instagramCoverGenerator.error.descriptionRequired'));
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Pass 9:16 aspect ratio for Instagram Cover
            const data = await thumbnailApi.generate(description, language, images, '9:16', visualDescription);
            setResult(data);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || err.message || t('instagramCoverGenerator.error.failed'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-surface p-4 sm:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        {t('tools.instagramCoverGenerator.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('tools.instagramCoverGenerator.description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6 bg-white dark:bg-surface-paper p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 order-2 lg:order-1">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instagramCoverGenerator.contentDescription')}
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-hover border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[120px] text-gray-900 dark:text-white"
                                placeholder={t('instagramCoverGenerator.contentDescriptionPlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instagramCoverGenerator.visualDescription')}
                            </label>
                            <textarea
                                value={visualDescription}
                                onChange={(e) => setVisualDescription(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-hover border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none min-h-[100px] text-gray-900 dark:text-white"
                                placeholder={t('instagramCoverGenerator.visualDescriptionPlaceholder')}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {t('instagramCoverGenerator.visualDescriptionHint')}
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instagramCoverGenerator.textLanguage')}
                            </label>
                            <input
                                type="text"
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-hover border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all text-gray-900 dark:text-white"
                                placeholder={t('instagramCoverGenerator.textLanguagePlaceholder')}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('instagramCoverGenerator.referenceImages')}
                            </label>
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group bg-gray-100 dark:bg-gray-800">
                                        <img
                                            src={URL.createObjectURL(img)}
                                            alt={`ref-${idx}`}
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                {images.length < 6 && (
                                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors bg-gray-50 dark:bg-surface-hover">
                                        <Upload className="text-gray-400 mb-2" size={20} />
                                        <span className="text-xs text-gray-500">{t('instagramCoverGenerator.upload')}</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={handleImageUpload}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm border border-red-100 dark:border-red-900/30">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !description}
                            className={`w-full py-3 px-6 rounded-xl flex items-center justify-center gap-2 text-white font-medium transition-all ${loading || !description
                                ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-500/25'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    {t('instagramCoverGenerator.generating')}
                                </>
                            ) : (
                                <>
                                    <Sparkles size={20} />
                                    {t('instagramCoverGenerator.generateButton')}
                                </>
                            )}
                        </button>
                    </div>

                    {/* Result Section - Order 1 on mobile (top), Order 2 on desktop */}
                    <div className="bg-white dark:bg-surface-paper p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full min-h-[400px] order-1 lg:order-2">
                        {result ? (
                            <div className="flex-1 flex flex-col gap-4">
                                <div className="relative rounded-xl overflow-hidden shadow-lg group flex-1 bg-gray-900 flex items-center justify-center">
                                    <img
                                        src={`data:${result.mimeType};base64,${result.image}`}
                                        alt="Generated Cover"
                                        className="max-w-full max-h-full object-contain"
                                        style={{ aspectRatio: '9/16' }}
                                    />
                                    <a
                                        href={`data:${result.mimeType};base64,${result.image}`}
                                        download="instagram-cover.png"
                                        className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 hover:bg-white text-gray-900 rounded-lg shadow-lg font-medium text-sm transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        {t('instagramCoverGenerator.download')}
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                <div className="w-20 h-20 mb-4 rounded-2xl bg-gray-50 dark:bg-surface-hover flex items-center justify-center">
                                    <ImageIcon size={40} className="opacity-50" />
                                </div>
                                <p className="text-center">
                                    {loading ? t('instagramCoverGenerator.preview.loading') : t('instagramCoverGenerator.preview.placeholder')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

