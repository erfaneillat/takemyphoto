import { useState, useRef, useEffect } from 'react';
import { useLicenseStore } from '../stores/useLicenseStore';
import { KeyRound, ShieldCheck, Loader2, AlertCircle, Sparkles } from 'lucide-react';

export const LicenseActivationPage = () => {
    const { activate, isLoading, error, clearError } = useLicenseStore();
    const [inputValues, setInputValues] = useState<string[]>(Array(8).fill(''));
    const [shake, setShake] = useState(false);
    const [success, setSuccess] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    const licenseComplete = inputValues.every(v => v.length === 1);

    if (success) {
        return (
            <div style={{
                minHeight: '100dvh',
                background: 'linear-gradient(135deg, #f8f9ff 0%, #eef1ff 50%, #f0f4ff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                direction: 'rtl',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        width: 88, height: 88,
                        margin: '0 auto 24px',
                        borderRadius: 24,
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 20px 40px rgba(16, 185, 129, 0.25)',
                        animation: 'successBounce 2s ease-in-out infinite',
                    }}>
                        <ShieldCheck size={44} color="white" />
                    </div>
                    <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a2e', marginBottom: 8 }}>
                        لایسنس فعال شد!
                    </h1>
                    <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>
                        اپلیکیشن آماده استفاده است
                    </p>
                    <div style={{
                        width: 40, height: 40, margin: '0 auto',
                        border: '3px solid #10b981', borderTopColor: 'transparent',
                        borderRadius: '50%', animation: 'spin 1s linear infinite',
                    }} />
                </div>
                <style>{`
          @keyframes successBounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
          @keyframes spin { to{transform:rotate(360deg)} }
        `}</style>
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100dvh',
            background: 'linear-gradient(160deg, #f8f9ff 0%, #eef1ff 40%, #f5f0ff 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px 16px',
            direction: 'rtl',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Soft background blobs */}
            <div style={{
                position: 'absolute', top: -120, left: -80,
                width: 300, height: 300,
                background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: -100, right: -60,
                width: 280, height: 280,
                background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
                borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400 }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 36 }}>
                    <div style={{
                        width: 72, height: 72,
                        margin: '0 auto 16px',
                        borderRadius: 20,
                        background: 'linear-gradient(135deg, #8b5cf6, #a855f7, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 12px 32px rgba(139, 92, 246, 0.2)',
                        transform: 'rotate(3deg)',
                        transition: 'transform 0.5s',
                    }}>
                        <Sparkles size={36} color="white" />
                    </div>
                    <h1 style={{
                        fontSize: 28, fontWeight: 800, color: '#1a1a2e',
                        marginBottom: 6, letterSpacing: '-0.02em',
                    }}>
                        ژست
                    </h1>
                    <p style={{ fontSize: 14, color: '#9ca3af' }}>
                        کلید لایسنس خود را وارد کنید
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: 24,
                    border: '1px solid rgba(0,0,0,0.06)',
                    padding: '28px 24px',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.03)',
                    ...(shake ? { animation: 'shake 0.6s ease-in-out' } : {}),
                }}>
                    {/* Label */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 20, justifyContent: 'flex-start',
                    }}>
                        <KeyRound size={18} color="#8b5cf6" />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#374151' }}>
                            کلید لایسنس
                        </span>
                    </div>

                    {/* LTR Input boxes */}
                    <div
                        dir="ltr"
                        onPaste={handlePaste}
                        style={{
                            display: 'flex',
                            gap: 6,
                            justifyContent: 'center',
                            marginBottom: 20,
                            direction: 'ltr',
                        }}
                    >
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
                                style={{
                                    width: 40, height: 52,
                                    textAlign: 'center',
                                    fontSize: 20, fontWeight: 700,
                                    fontFamily: 'monospace',
                                    borderRadius: 14,
                                    border: `2px solid ${value ? 'rgba(139,92,246,0.4)' : 'rgba(0,0,0,0.08)'}`,
                                    background: value ? 'rgba(139,92,246,0.04)' : 'rgba(0,0,0,0.02)',
                                    color: '#1a1a2e',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    direction: 'ltr',
                                    caretColor: '#8b5cf6',
                                    boxShadow: value ? '0 2px 8px rgba(139,92,246,0.08)' : 'none',
                                }}
                                onFocus={(e) => {
                                    e.currentTarget.style.borderColor = '#8b5cf6';
                                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.12)';
                                }}
                                onBlur={(e) => {
                                    e.currentTarget.style.borderColor = value ? 'rgba(139,92,246,0.4)' : 'rgba(0,0,0,0.08)';
                                    e.currentTarget.style.boxShadow = value ? '0 2px 8px rgba(139,92,246,0.08)' : 'none';
                                }}
                            />
                        ))}
                    </div>

                    {/* Error */}
                    {error && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 14px', marginBottom: 16,
                            borderRadius: 14,
                            background: 'rgba(239,68,68,0.06)',
                            border: '1px solid rgba(239,68,68,0.12)',
                        }}>
                            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                            <p style={{ fontSize: 13, color: '#dc2626', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    {/* Button */}
                    <button
                        onClick={handleActivate}
                        disabled={!licenseComplete || isLoading}
                        style={{
                            width: '100%',
                            padding: '15px 24px',
                            borderRadius: 16,
                            fontWeight: 700,
                            fontSize: 15,
                            border: 'none',
                            cursor: licenseComplete && !isLoading ? 'pointer' : 'default',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 8,
                            transition: 'all 0.3s',
                            ...(licenseComplete && !isLoading
                                ? {
                                    background: 'linear-gradient(135deg, #8b5cf6, #a855f7)',
                                    color: 'white',
                                    boxShadow: '0 8px 24px rgba(139,92,246,0.25)',
                                }
                                : {
                                    background: 'rgba(0,0,0,0.04)',
                                    color: '#9ca3af',
                                }
                            ),
                        }}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} />
                                در حال فعال‌سازی...
                            </>
                        ) : (
                            <>
                                <ShieldCheck size={20} />
                                فعال‌سازی لایسنس
                            </>
                        )}
                    </button>

                    <p style={{
                        textAlign: 'center', fontSize: 12,
                        color: '#9ca3af', marginTop: 16, marginBottom: 0,
                    }}>
                        هر لایسنس فقط یک‌بار قابل فعال‌سازی است
                    </p>
                </div>

                {/* Footer */}
                <p style={{
                    textAlign: 'center', fontSize: 11,
                    color: '#c0c5d0', marginTop: 28,
                }}>
                    ژست © {new Date().getFullYear()} • برای راهنمایی با پشتیبانی تماس بگیرید
                </p>
            </div>

            <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          10%,30%,50%,70%,90%{transform:translateX(-4px)}
          20%,40%,60%,80%{transform:translateX(4px)}
        }
        @keyframes spin { to{transform:rotate(360deg)} }
      `}</style>
        </div>
    );
};
