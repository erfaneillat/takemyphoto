import React, { useRef } from 'react';
import { Upload, Maximize2, Download, AlertCircle, ImageIcon } from 'lucide-react';
import { useTranslation } from '@/shared/hooks';
import { useUpscaleState } from './hooks/useUpscaleState';

export const UpscalePage = () => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const {
        selectedImage,
        selectedResolution,
        isUpscaling,
        upscaledImage,
        error,
        setSelectedImage,
        setSelectedResolution,
        upscaleImage,
        clearResults
    } = useUpscaleState();

    const resolutions = [
        { value: '1K', label: '1K', description: t('upscale.resolution.1k') },
        { value: '2K', label: '2K', description: t('upscale.resolution.2k') },
        { value: '4K', label: '4K', description: t('upscale.resolution.4k') }
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setSelectedImage(file);
                clearResults();
            } else {
                // Handle error - not an image
            }
        }
    };

    const handleUpscale = async () => {
        if (selectedImage && selectedResolution) {
            await upscaleImage();
        }
    };

    const handleDownload = () => {
        if (upscaledImage) {
            const link = document.createElement('a');
            link.href = upscaledImage;
            link.download = `upscaled-${selectedResolution}-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-surface">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 dark:border-blue-500/20 mb-6">
                        <Maximize2 size={16} className="text-cyan-600 dark:text-blue-400" />
                        <span className="text-sm font-semibold text-cyan-600 dark:text-blue-400">
                            {t('upscale.badge')}
                        </span>
                    </div>

                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {t('upscale.title')}
                    </h1>

                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('upscale.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Panel - Upload & Options */}
                    <div className="space-y-6">
                        {/* Image Upload */}
                        <div className="bg-white dark:bg-surface-card rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {t('upscale.upload.title')}
                            </h3>

                            <div
                                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${selectedImage
                                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20'
                                    : 'border-gray-300 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 hover:bg-cyan-50 dark:hover:bg-cyan-950/20'
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {selectedImage ? (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 mx-auto rounded-xl bg-cyan-500 flex items-center justify-center">
                                            <ImageIcon size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {selectedImage.name}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedImage(null);
                                                clearResults();
                                            }}
                                            className="text-sm text-cyan-600 dark:text-cyan-400 hover:underline"
                                        >
                                            {t('upscale.upload.change')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="w-16 h-16 mx-auto rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                            <Upload size={24} className="text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">
                                                {t('upscale.upload.dragDrop')}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t('upscale.upload.formats')}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Resolution Selection */}
                        <div className="bg-white dark:bg-surface-card rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                {t('upscale.resolution.title')}
                            </h3>

                            <div className="grid grid-cols-3 gap-3">
                                {resolutions.map((resolution) => (
                                    <button
                                        key={resolution.value}
                                        onClick={() => setSelectedResolution(resolution.value)}
                                        className={`p-4 rounded-xl border-2 text-center transition-all ${selectedResolution === resolution.value
                                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-cyan-300 dark:hover:border-cyan-700'
                                            }`}
                                    >
                                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                                            {resolution.label}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {resolution.description}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleUpscale}
                            disabled={!selectedImage || !selectedResolution || isUpscaling}
                            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
                        >
                            {isUpscaling ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                                    {t('upscale.processing')}
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Maximize2 size={20} />
                                    {t('upscale.button')}
                                </div>
                            )}
                        </button>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-red-900 dark:text-red-100">
                                            {t('upscale.error.title')}
                                        </h4>
                                        <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                                            {error}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Results */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-surface-card rounded-2xl p-6 border border-gray-200 dark:border-gray-800">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t('upscale.result.title')}
                                </h3>
                                {upscaledImage && (
                                    <button
                                        onClick={handleDownload}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        <Download size={16} />
                                        {t('upscale.download')}
                                    </button>
                                )}
                            </div>

                            {upscaledImage ? (
                                <div className="space-y-4">
                                    <img
                                        src={upscaledImage}
                                        alt="Upscaled result"
                                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700"
                                    />
                                    <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                                        {t('upscale.result.success', { resolution: selectedResolution })}
                                    </div>
                                </div>
                            ) : (
                                <div className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
                                    <div className="text-center text-gray-500 dark:text-gray-400">
                                        <Maximize2 size={48} className="mx-auto mb-4 opacity-50" />
                                        <p>{t('upscale.result.placeholder')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
