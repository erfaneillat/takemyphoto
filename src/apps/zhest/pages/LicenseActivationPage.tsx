import { useState, useRef, useEffect, useCallback } from 'react';
import { useLicenseStore } from '../stores/useLicenseStore';
import { KeyRound, ShieldCheck, Loader2, AlertCircle, ScanLine, X, Lock } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';

export const LicenseActivationPage = () => {
    const { activate, isLoading, error, clearError } = useLicenseStore();
    const [inputValues, setInputValues] = useState<string[]>(Array(8).fill(''));
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannerError, setScannerError] = useState<string | null>(null);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const scannerContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const handleInputChange = (index: number, value: string) => {
        if (clearError) clearError();
        const char = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(-1);
        const newValues = [...inputValues];
        newValues[index] = char;
        setInputValues(newValues);
        if (char && index < 7) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !inputValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
        if (e.key === 'Enter') {
            handleActivate();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
        const newValues = Array(8).fill('');
        for (let i = 0; i < pasted.length; i++) {
            newValues[i] = pasted[i];
        }
        setInputValues(newValues);
        const focusIndex = Math.min(pasted.length, 7);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleActivate = async () => {
        const key = inputValues.join('');
        if (key.length !== 8) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
            return;
        }
        try {
            await activate(key);
            setSuccess(true);
        } catch {
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    };

    const stopScanner = useCallback(async () => {
        if (scannerRef.current) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch { /* ignore */ }
            scannerRef.current = null;
        }
        setShowScanner(false);
    }, []);

    const handleScanSuccess = useCallback(async (decodedText: string) => {
        const cleaned = decodedText.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8);
        if (cleaned.length !== 8) return;

        await stopScanner();

        const newValues = cleaned.split('');
        const fullValues = Array(8).fill('');
        newValues.forEach((v, i) => fullValues[i] = v);
        setInputValues(fullValues);

        try {
            await activate(cleaned);
            setSuccess(true);
        } catch {
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    }, [activate, stopScanner]);

    const startScanner = useCallback(async () => {
        setScannerError(null);
        setShowScanner(true);

        await new Promise(r => setTimeout(r, 300));

        try {
            const html5Qr = new Html5Qrcode('qr-scanner-region');
            scannerRef.current = html5Qr;

            await html5Qr.start(
                { facingMode: 'environment' },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                (decodedText) => { handleScanSuccess(decodedText); },
                () => { /* ignore */ }
            );
        } catch (err: any) {
            setScannerError('دسترسی به دوربین ممکن نیست');
            console.error('QR Scanner error:', err);
        }
    }, [handleScanSuccess]);

    useEffect(() => {
        return () => {
            if (scannerRef.current) {
                scannerRef.current.stop().catch(() => { });
            }
        };
    }, []);

    const licenseComplete = inputValues.every(v => v.length === 1);

    if (success) {
        return (
            <div className="min-h-[100dvh] bg-gray-50 dark:bg-[#0A0A0B] flex items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 relative overflow-hidden rtl" dir="rtl">
                {/* SVG Background for Success */}
                <div className="absolute inset-0 pointer-events-none z-0 flex items-center justify-center opacity-40 dark:opacity-20">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-[150%] h-[150%] max-w-4xl max-h-4xl text-gray-500 dark:text-gray-600 fill-current animate-[spin_60s_linear_infinite] blur-3xl">
                        <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,95.5,-3C94.2,12.1,85.6,26.9,75.4,39.3C65.2,51.7,53.4,61.7,40.1,69.5C26.8,77.3,12,82.9,-2.7,86C-17.4,89.1,-32,89.7,-44.6,83.8C-57.2,77.9,-67.8,65.5,-76.4,51.8C-85,38.1,-91.6,23.1,-92.4,7.8C-93.2,-7.5,-88.2,-23.1,-80.1,-36.4C-72,-49.7,-60.8,-60.7,-47.7,-68.3C-34.6,-75.9,-19.6,-80.1,-3.2,-74.6C13.2,-69.1,28.6,-62.4,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>

                <div className="relative z-10 text-center animate-in zoom-in duration-500 fade-in">
                    <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center shadow-lg shadow-gray-900/20 dark:shadow-white/20 relative">
                        <div className="absolute inset-0 border-4 border-gray-900/30 dark:border-white/30 rounded-full animate-ping" />
                        <ShieldCheck size={48} className="text-white dark:text-gray-900 relative z-10 mix-blend-overlay" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-3">لایسنس فعال شد!</h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg mb-12">سیستم با موفقیت تأیید شد و آماده‌ی استفاده است.</p>

                    <div className="w-12 h-12 mx-auto border-4 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-gray-50/50 dark:bg-[#0A0A0B] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 transition-colors duration-300 relative overflow-hidden rtl" dir="rtl">
            {/* Stunning SVG Backgrounds */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                {/* Gray Blob */}
                <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] md:w-[50%] md:h-[50%] max-w-3xl animate-[spin_40s_linear_infinite] opacity-30 dark:opacity-10 blur-[80px] md:blur-[120px] text-gray-500 fill-current">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,95.5,-3C94.2,12.1,85.6,26.9,75.4,39.3C65.2,51.7,53.4,61.7,40.1,69.5C26.8,77.3,12,82.9,-2.7,86C-17.4,89.1,-32,89.7,-44.6,83.8C-57.2,77.9,-67.8,65.5,-76.4,51.8C-85,38.1,-91.6,23.1,-92.4,7.8C-93.2,-7.5,-88.2,-23.1,-80.1,-36.4C-72,-49.7,-60.8,-60.7,-47.7,-68.3C-34.6,-75.9,-19.6,-80.1,-3.2,-74.6C13.2,-69.1,28.6,-62.4,44.7,-76.4Z" transform="translate(100 100)" />
                    </svg>
                </div>
                {/* Second Blob */}
                <div className="absolute bottom-[-10%] right-[-20%] w-[80%] h-[80%] md:w-[60%] md:h-[60%] max-w-3xl animate-[spin_50s_linear_infinite_reverse] opacity-20 dark:opacity-[0.08] blur-[80px] md:blur-[120px] text-gray-400 fill-current">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path d="M47.7,-74C59.9,-64.7,66.6,-47.9,71.4,-32.4C76.2,-16.9,79.1,-2.7,76.5,10.6C73.9,23.9,65.8,36.3,55.1,45.8C44.4,55.3,31.1,61.9,16.8,67.6C2.5,73.3,-12.8,78.1,-26.4,75.3C-40,72.5,-51.9,62.1,-61.8,49.8C-71.7,37.5,-79.6,23.3,-82.4,7.8C-85.2,-7.7,-82.9,-24.5,-74.2,-37.9C-65.5,-51.3,-50.4,-61.3,-36.2,-69.5C-22,-77.7,-8.7,-84.1,4.2,-89.6C17.1,-95.1,35.5,-83.3,47.7,-74Z" transform="translate(100 100)" />
                    </svg>
                </div>
            </div>

            <div className={`relative z-10 w-full max-w-md ${shake ? 'animate-[shake_0.6s_ease-in-out]' : ''}`}>
                {/* Logo & Header */}
                <div className="text-center mb-10 group">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-[1.5rem] bg-gray-900 dark:bg-white shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(255,255,255,0.1)] transform transition-transform duration-500 hover:scale-105 hover:rotate-3 flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-white/20 dark:bg-black/10 group-hover:translate-x-full transition-transform duration-1000 -skew-x-12 -translate-x-[150%]" />
                        <svg width="40" height="40" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white dark:text-gray-900 drop-shadow-md relative z-10">
                            {/* Main hollow sparkle */}
                            <path
                                d="M22 10.5 C22 18.5 26.5 23 34.5 23 C26.5 23 22 27.5 22 35.5 C22 27.5 17.5 23 9.5 23 C17.5 23 22 18.5 22 10.5 Z"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            {/* Top right plus */}
                            <path
                                d="M37 10 V18 M33 14 H41"
                                stroke="currentColor"
                                strokeWidth="3.5"
                                strokeLinecap="round"
                            />
                            {/* Bottom left diamond */}
                            <rect
                                x="12" y="32"
                                width="5" height="5"
                                rx="1"
                                transform="rotate(45 14.5 34.5)"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                        ژست
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                        برای شروع کلید لایسنس خود را وارد کنید
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white/80 dark:bg-gray-900/60 backdrop-blur-2xl rounded-[2.5rem] p-8 shadow-xl border border-white/50 dark:border-gray-800/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-bl-full -z-10" />

                    <div className="flex items-center gap-3 justify-center mb-8">
                        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-xl text-gray-900 dark:text-white">
                            <Lock size={20} />
                        </div>
                        <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                            فعال‌سازی سیستم
                        </span>
                    </div>

                    {/* Inputs */}
                    <div className="flex justify-center gap-1.5 sm:gap-2 mb-8" dir="ltr" onPaste={handlePaste}>
                        {inputValues.map((value, index) => (
                            <input
                                key={index}
                                ref={el => { inputRefs.current[index] = el; }}
                                type="text"
                                inputMode="text"
                                autoCapitalize="characters"
                                maxLength={1}
                                value={value}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-10 sm:w-12 h-14 sm:h-16 text-center text-xl sm:text-2xl font-black font-mono rounded-2xl outline-none transition-all duration-300 transform
                                ${value
                                        ? 'bg-gray-100 dark:bg-gray-800 border-2 border-gray-900 dark:border-white text-gray-900 dark:text-white shadow-[0_4px_16px_rgba(0,0,0,0.1)] scale-105'
                                        : 'bg-gray-50/80 dark:bg-gray-950/80 border-2 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:border-gray-500 dark:focus:border-gray-400 focus:bg-white dark:focus:bg-gray-900 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.05)]'
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className="mb-8 p-4 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/30 flex items-center gap-3 animate-in slide-in-from-top-2 fade-in">
                            <AlertCircle size={20} className="text-red-500 shrink-0" />
                            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleActivate}
                        disabled={!licenseComplete || isLoading}
                        className={`w-full py-4 px-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all duration-300 relative overflow-hidden group
                        ${licenseComplete && !isLoading
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-[0_8px_30px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.12)] dark:hover:shadow-[0_8px_40px_rgba(255,255,255,0.16)] hover:-translate-y-1'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        {licenseComplete && !isLoading && (
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[150%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12" />
                        )}
                        {isLoading ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>در حال بررسی...</span>
                            </>
                        ) : (
                            <>
                                <KeyRound size={24} className={licenseComplete ? "animate-pulse" : ""} />
                                <span>بررسی و فعال‌سازی</span>
                            </>
                        )}
                    </button>

                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6 leading-relaxed">
                        هر لایسنس مختص یک سیستم بوده<br />و تنها یک‌بار قابل استفاده است
                    </p>
                </div>

                {/* QR Code Divider */}
                <div className="relative my-8 text-center flex items-center justify-center gap-4 px-4 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-gray-300 dark:to-gray-700" />
                    <span className="text-sm font-medium text-gray-500 whitespace-nowrap">یا روش سریع‌تر</span>
                    <div className="h-px w-full bg-gradient-to-r from-gray-300 dark:from-gray-700 via-gray-300 dark:via-gray-700 to-transparent" />
                </div>

                <button
                    onClick={startScanner}
                    disabled={isLoading}
                    className="w-full max-w-sm mx-auto py-4 px-4 rounded-2xl flex items-center justify-center gap-3 text-base font-bold transition-all duration-300
                    border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/10 text-gray-700 dark:text-gray-300
                    hover:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:-translate-y-1
                    shadow-sm disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-800 rounded-full blur group-hover:animate-ping" />
                        <ScanLine size={22} className="relative z-10" />
                    </div>
                    <span>اسکن با دوربین (QR Code)</span>
                </button>
            </div>

            {/* Footer */}
            <p className="relative z-10 text-center text-xs text-gray-400 mt-12 mb-4 tracking-wide font-medium">
                ژست © {new Date().getFullYear()} • قدرت گرفته از هوش مصنوعی
            </p>

            {/* QR Scanner Overlay */}
            {showScanner && (
                <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <button
                        onClick={stopScanner}
                        className="absolute top-6 right-6 z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all hover:rotate-90"
                    >
                        <X size={24} />
                    </button>

                    <div className="text-center mb-8 relative z-10">
                        <h2 className="text-2xl font-bold text-white mb-2">اسکن QR Code</h2>
                        <p className="text-white/60 text-sm">دوربین را روی کد لایسنس نگه دارید</p>
                    </div>

                    <div className="relative">
                        {/* Decorative corners */}
                        <div className="absolute -inset-4 border-2 border-gray-500/50 rounded-[2rem] pointer-events-none">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-gray-100 dark:border-gray-800 rounded-tl-[2rem]" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-gray-100 dark:border-gray-800 rounded-tr-[2rem]" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-gray-100 dark:border-gray-800 rounded-bl-[2rem]" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-gray-100 dark:border-gray-800 rounded-br-[2rem]" />

                            {/* Scanning line animation */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-white animate-[scan_2s_ease-in-out_infinite]" />
                        </div>

                        <div
                            ref={scannerContainerRef}
                            id="qr-scanner-region"
                            className="w-72 h-72 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.1)] bg-black/50"
                        />
                    </div>

                    {scannerError && (
                        <div className="absolute bottom-24 bg-red-500/20 border border-red-500/50 text-red-200 px-6 py-3 rounded-2xl flex items-center gap-2 backdrop-blur-md animate-in slide-in-from-bottom-4">
                            <AlertCircle size={20} />
                            <span>{scannerError}</span>
                        </div>
                    )}

                    <style>{`
                        @keyframes scan {
                            0% { top: 0%; opacity: 0; }
                            10% { opacity: 1; }
                            90% { opacity: 1; }
                            100% { top: 100%; opacity: 0; }
                        }
                        #qr-scanner-region video { 
                            object-fit: cover; 
                            width: 100%; 
                            height: 100%;
                            border-radius: 1.5rem;
                        }
                        /* Hide the default html5-qrcode UI elements */
                        #qr-scanner-region img { display: none !important; }
                        #qr-scanner-region_dashboard_section_csr span { display: none !important; }
                        #qr-scanner-region_dashboard_section_swaplink { display: none !important; }
                    `}</style>
                </div>
            )}

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
                    20%, 40%, 60%, 80% { transform: translateX(6px); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
