import { motion, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Wand2, Camera, Sparkles, Zap, Layers, Image as ImageIcon, ChevronRight } from 'lucide-react';
import { Footer } from '@/shared/components/Footer';
import { useEffect, useState } from 'react';

// Assets
import BeforeImage from '@/apps/zhest/assets/mockups/product-before.jpeg';
import AfterImage from '@/apps/zhest/assets/mockups/product-after.png';

// Animation variants for Framer Motion
const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeInOut" } }
};

const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.15
        }
    }
};

const NeuralNetworkBackground = () => {
    const [elements, setElements] = useState<{ paths: any[], nodes: any[] }>({ paths: [], nodes: [] });

    useEffect(() => {
        // Generate pseudo-random elements once on mount to avoid hydration mismatch
        const paths = Array.from({ length: 20 }).map(() => ({
            d: `M${Math.random() * 100} ${Math.random() * 100} Q${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100} ${Math.random() * 100}`,
            duration: 10 + Math.random() * 8,
            delay: Math.random() * 5
        }));

        const nodes = Array.from({ length: 40 }).map(() => ({
            x1: `${Math.random() * 100}%`,
            y1: `${Math.random() * 100}%`,
            x2: `${Math.random() * 100}%`,
            y2: `${Math.random() * 100}%`,
            r: Math.random() * 1.5 + 0.5,
            duration: 15 + Math.random() * 15,
            delay: Math.random() * 5
        }));

        setElements({ paths, nodes });
    }, []);

    if (!elements.paths.length) return null;

    return (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden opacity-50 dark:opacity-40 mix-blend-screen">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                    <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
                        <stop offset="50%" stopColor="#a855f7" stopOpacity="1" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {elements.paths.map((path, i) => (
                    <motion.path
                        key={`path-${i}`}
                        d={path.d}
                        stroke="url(#lineGrad)"
                        strokeWidth="0.15"
                        fill="none"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{
                            pathLength: [0, 1, 1, 0],
                            opacity: [0, 0.6, 0.6, 0]
                        }}
                        transition={{
                            duration: path.duration,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: path.delay
                        }}
                    />
                ))}

                {elements.nodes.map((node, i) => (
                    <motion.circle
                        key={`node-${i}`}
                        r={node.r / 3}
                        fill="#a855f7"
                        initial={{ cx: node.x1, cy: node.y1, opacity: 0.1 }}
                        animate={{
                            cx: [node.x1, node.x2, node.x1],
                            cy: [node.y1, node.y2, node.y1],
                            opacity: [0.1, 0.9, 0.1]
                        }}
                        transition={{
                            duration: node.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: node.delay
                        }}
                    />
                ))}
            </svg>
        </div>
    );
};

const AnimatedMockupBody = () => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        let isMounted = true;
        const sequence = async () => {
            while (isMounted) {
                const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

                setStep(0);
                await wait(1000); if (!isMounted) break;

                setStep(1); // Move to upload
                await wait(800); if (!isMounted) break;

                setStep(2); // Click upload
                await wait(300); if (!isMounted) break;

                setStep(3); // Uploaded
                await wait(600); if (!isMounted) break;

                setStep(4); // Move to style
                await wait(800); if (!isMounted) break;

                setStep(5); // Click style
                await wait(300); if (!isMounted) break;

                setStep(6); // Move to generate
                await wait(800); if (!isMounted) break;

                setStep(7); // Click generate
                await wait(300); if (!isMounted) break;

                setStep(8); // Generating map
                await wait(2400); if (!isMounted) break;

                setStep(9); // Result
                await wait(4000); if (!isMounted) break;
            }
        };
        sequence();
        return () => { isMounted = false; };
    }, []);

    const cursorVariants = {
        s0: { right: "110%", top: "110%", opacity: 0 },
        s1: { right: "25%", top: "40%", opacity: 1 },
        s2: { right: "25%", top: "40%", scale: 0.8 },
        s3: { right: "25%", top: "40%", scale: 1 },
        s4: { right: "38%", top: "68%", opacity: 1 },
        s5: { right: "38%", top: "68%", scale: 0.8 },
        s6: { right: "25%", top: "85%", opacity: 1 },
        s7: { right: "25%", top: "85%", scale: 0.8 },
        s8: { right: "110%", top: "90%", opacity: 0 },
        s9: { right: "110%", top: "90%", opacity: 0 },
    };

    return (
        <div className="h-[400px] md:h-[600px] bg-gradient-to-b from-gray-50 to-gray-100 dark:from-black dark:to-[#0A0A0B] p-6 md:p-10 flex flex-col md:flex-row gap-8 relative overflow-hidden">
            {/* Left Panel - Input Controls */}
            <div className="flex-1 space-y-5 relative flex flex-col justify-center">

                <div className="h-12 w-3/4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl px-5 flex items-center shadow-sm">
                    <div className="h-2.5 w-1/3 bg-gray-200 dark:bg-gray-800 rounded-full" />
                </div>

                <div className={`aspect-square w-full rounded-3xl flex flex-col items-center justify-center transition-all duration-300 border-2 overflow-hidden relative ${step >= 3 ? 'border-purple-500 shadow-lg' : step === 2 ? 'border-gray-400 dark:border-gray-600 bg-gray-100 dark:bg-gray-800' : 'border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 shadow-sm'}`}>
                    {step >= 3 ? (
                        <motion.img
                            src={BeforeImage}
                            alt="Original Product"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <ImageIcon className="text-gray-400" size={24} />
                            </div>
                            <div className="w-24 h-2 bg-gray-200 dark:bg-gray-800 rounded-full" />
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="h-24 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm flex flex-col justify-end p-4">
                        <div className="w-1/2 h-2.5 bg-gray-200 dark:bg-gray-800 rounded-full" />
                    </div>
                    <div className={`h-24 rounded-2xl transition-all duration-300 flex flex-col justify-end p-4 border-2 ${step >= 5 ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-500 shadow-inner' : step === 4 ? 'bg-gray-100 dark:bg-gray-800 border-gray-400' : 'bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800 shadow-sm'}`}>
                        <div className={`w-2/3 h-2.5 rounded-full transition-colors duration-300 ${step >= 5 ? 'bg-purple-500/50' : 'bg-gray-200 dark:bg-gray-800'}`} />
                    </div>
                </div>

                <div className={`h-14 mt-2 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 ${step >= 8 ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600' : step >= 7 ? 'bg-purple-700 text-white scale-95' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-xl shadow-purple-500/20'}`}>
                    {step >= 8 ? <span className="flex items-center gap-2"><div className="w-4 h-4 rounded-full border-2 border-gray-400 border-t-transparent animate-spin" /> پردازش</span> : <span>ساخت تصویر</span>}
                </div>
            </div>

            {/* Right Panel - Output */}
            <div className="flex-1 bg-white dark:bg-[#151515] border border-gray-200 dark:border-gray-800 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center shadow-2xl">
                {step < 8 && step > 0 && (
                    <div className="opacity-40 flex flex-col items-center justify-center transition-opacity duration-500">
                        <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center border border-gray-100 dark:border-gray-800 mb-6">
                            <ImageIcon className="text-gray-300 dark:text-gray-700" size={40} />
                        </div>
                        <div className="h-2 w-32 bg-gray-100 dark:bg-gray-800 rounded-full mb-3" />
                        <div className="h-2 w-20 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    </div>
                )}

                {step === 8 && (
                    <div className="flex flex-col items-center">
                        <Wand2 size={48} className="text-purple-500 animate-bounce mb-6" />
                        <div className="w-48 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 animate-[progress_2s_ease-in-out_infinite]" />
                        </div>
                    </div>
                )}

                {step === 9 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(12px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute inset-0 bg-gray-100 dark:bg-[#111] flex items-center justify-center overflow-hidden"
                    >
                        <img
                            src={AfterImage}
                            alt="Generated Product"
                            className="w-full h-full object-cover"
                        />

                        <div className="absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-6 z-20">
                            <div className="flex justify-between items-center w-full">
                                <div className="h-6 px-4 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center border border-white/30 shadow-lg">
                                    Product Render PRO
                                </div>
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg transform hover:scale-110 cursor-pointer transition-transform">
                                    <Sparkles size={16} className="text-white animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Cursor SVG */}
            <motion.div
                className="absolute z-50 pointer-events-none drop-shadow-2xl"
                variants={cursorVariants}
                initial="s0"
                animate={`s${step}`}
                transition={{ duration: step === 0 ? 0 : 0.6, ease: "easeInOut" }}
                style={{ marginRight: '-12px', marginTop: '-12px' }}
            >
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.5 3.21V20.8C5.5 21.45 6.27 21.79 6.75 21.36L11.44 17.15H17.5C18.05 17.15 18.5 16.7 18.5 16.15V15.68C18.5 15.34 18.33 15.02 18.05 14.85L6.68 3.14C6.22 2.66 5.5 2.99 5.5 3.65V3.21Z" fill="white" stroke="#111" strokeWidth="1.5" />
                </svg>
            </motion.div>
        </div>
    )
}

export const ZhestLandingPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0B] text-gray-900 dark:text-white overflow-hidden transition-colors selection:bg-purple-500/30">
            {/* Navigation / Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
                            Z
                        </div>
                        <span className="text-xl font-black tracking-tight rtl:font-sans">ژست</span>
                    </div>
                    <Link
                        to="/app"
                        className="px-6 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-semibold text-sm hover:scale-105 transition-transform active:scale-95 flex items-center gap-2"
                    >
                        ورود به پنل
                        <ChevronRight size={16} className="rtl:rotate-180" />
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden min-h-[90vh] flex flex-col justify-center">
                {/* Decorative Background Elements */}
                <NeuralNetworkBackground />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 dark:bg-purple-600/20 rounded-full blur-[120px] pointer-events-none z-0" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 dark:bg-blue-600/20 rounded-full blur-[100px] pointer-events-none z-0" />

                <div className="max-w-7xl mx-auto relative z-10 w-full text-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="max-w-4xl mx-auto flex flex-col items-center"
                    >



                        <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 text-gray-900 dark:text-white">
                            محصولات خود را به <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-500 dark:from-purple-400 dark:to-indigo-400">
                                شاهکارهای بصری
                            </span> تبدیل کنید
                        </motion.h1>

                        <motion.p variants={fadeInUp} className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mb-12 leading-relaxed font-light">
                            با استفاده از قدرتمندترین موتورهای هوش مصنوعی، تنها با آپلود چند عکس ساده، تصاویر صنعتی و دکوراتیو خیره‌کننده برای محصولات خود بسازید. بدون نیاز به آتلیه و عکاس حرفه‌ای.
                        </motion.p>

                        <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto">
                            <Link
                                to="/app"
                                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-lg hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-black/10 to-transparent skew-x-12" />
                                <Wand2 size={24} className="group-hover:rotate-12 transition-transform" />
                                شروع ساخت تصاویر
                            </Link>

                        </motion.div>
                    </motion.div>

                    {/* App Interface Preview Mockup */}
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-20 relative mx-auto max-w-5xl"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-[2.5rem] blur-xl opacity-30 dark:opacity-50" />
                        <div className="relative rounded-[2rem] bg-white dark:bg-[#111] border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden flex flex-col">
                            {/* Window Header */}
                            <div className="h-12 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-[#0A0A0B]/50 flex items-center px-4 gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                <div className="w-3 h-3 rounded-full bg-green-400" />
                                <div className="mx-auto text-xs font-medium text-gray-400">zhestai.ir/app</div>
                            </div>
                            {/* Abstract App Body Animated Simulation */}
                            <AnimatedMockupBody />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Bento Grid */}
            <section className="py-24 px-6 relative z-10 bg-white dark:bg-black">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">قدرتمند، سریع، حرفه‌ای</h2>
                        <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">ویژگی‌هایی که برای متحول کردن فروشگاه آنلاین خود به آن نیاز دارید.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Feature 1 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl group hover:border-purple-500/30 transition-colors"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap size={28} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">مدل‌های دوگانه پردازش</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-light">
                                انتخاب بین مدل سریع (Normal) برای رندرهای پرتعداد، یا مدل حرفه‌ای (Pro) برای بالاترین دقت و درک جزئیات.
                            </p>
                        </motion.div>

                        {/* Feature 2 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl group hover:border-purple-500/30 transition-colors md:col-span-2 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Layers size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">ده‌ها استایل متنوع و صنعتی</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-md font-light">
                                    از محیط‌های مینیمال تا دکوراسیون کلاسیک. استایل مناسب برند خود را انتخاب کنید تا هوش مصنوعی محصول شما را به طور طبیعی در آن محیط قرار دهد.
                                </p>
                            </div>
                        </motion.div>

                        {/* Feature 3 */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="bg-gray-50 dark:bg-[#111] border border-gray-100 dark:border-gray-800 p-8 rounded-3xl group hover:border-purple-500/30 transition-colors md:col-span-3 text-center sm:text-start flex flex-col sm:flex-row items-center gap-8"
                        >
                            <div className="flex-1">
                                <div className="w-14 h-14 mx-auto sm:mx-0 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Camera size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-3">درک سه‌بعدی از تمام زوایا</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg font-light">
                                    فقط کافیست تا ۵ عکس خام از محصول خود با گوشی موبایل بگیرید. هوش مصنوعی ما با آنالیز فرم، نور و بافت، رندری خیره‌کننده با حفظ دقیق هویت کالا به شما تحویل می‌دهد.
                                </p>
                            </div>
                            <div className="w-full sm:w-1/3 aspect-[4/3] rounded-2xl bg-gradient-to-tr from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-white/10 shadow-lg relative overflow-hidden flex items-center justify-center">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMTI4LDEyOCwxMjgsMC4yKSIvPjwvc3ZnPg==')] opacity-50" />
                                <div className="relative z-10 p-4 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-xl border border-white/20 text-sm font-medium">Smart 3D Perception</div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Bottom CTA */}
            <section className="py-32 px-6 relative z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-purple-900/10 dark:to-purple-900/20" />
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-black mb-6">آمادهِ خلق تصاویر حرفه‌ای هستید؟</h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 font-light max-w-2xl mx-auto">همین حالا وارد پنل شوید و با تولید تصاویر دکوراتیو با کیفیت، فروش محصولات خود را چند برابر کنید.</p>
                    <Link
                        to="/app"
                        className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-xl hover:scale-105 transition-transform shadow-2xl shadow-purple-500/20"
                    >
                        ورود رایگان
                        <ChevronRight className="rtl:rotate-180" />
                    </Link>
                </div>
            </section>

            {/* Application Universal Footer */}
            <div className="relative z-10">
                <Footer />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
            `}} />
        </div>
    );
};
