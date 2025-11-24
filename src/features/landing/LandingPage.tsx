import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRegion } from '@/shared/hooks';
import { Button } from '@/shared/components';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Star,
    Shield,
    Zap,
    Palette
} from 'lucide-react';
import { useToolsState } from '@/features/tools/hooks';
import { ToolCard } from '@/features/tools/components';
import { useRef } from 'react';

export const LandingPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { tools } = useToolsState();
    const { isIran } = useRegion();
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 30, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.6
            }
        }
    };

    const testimonials = [
        {
            name: "Alex Chen",
            role: t('landing.testimonials.alex.role'),
            content: t('landing.testimonials.alex.content'),
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        },
        {
            name: "Sarah Miller",
            role: t('landing.testimonials.sarah.role'),
            content: t('landing.testimonials.sarah.content'),
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
        },
        {
            name: "Jordan Taylor",
            role: t('landing.testimonials.jordan.role'),
            content: t('landing.testimonials.jordan.content'),
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
        }
    ];

    const features = [
        {
            title: t('landing.featuresList.quality.title'),
            description: t('landing.featuresList.quality.description'),
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            className: "col-span-1 md:col-span-2 bg-yellow-500/5 border-yellow-500/10"
        },
        {
            title: t('landing.featuresList.fast.title'),
            description: t('landing.featuresList.fast.description'),
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            className: "col-span-1 bg-blue-500/5 border-blue-500/10"
        },
        {
            title: t('landing.featuresList.secure.title'),
            description: t('landing.featuresList.secure.description'),
            icon: <Shield className="w-6 h-6 text-green-500" />,
            className: "col-span-1 bg-green-500/5 border-green-500/10"
        },
        {
            title: t('landing.featuresList.creative.title'),
            description: t('landing.featuresList.creative.description'),
            icon: <Palette className="w-6 h-6 text-purple-500" />,
            className: "col-span-1 md:col-span-2 bg-purple-500/5 border-purple-500/10"
        }
    ];

    // Spotlight effect logic
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const cards = document.getElementsByClassName("spotlight-card");
        for (const card of cards) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            (card as HTMLElement).style.setProperty("--mouse-x", `${x}px`);
            (card as HTMLElement).style.setProperty("--mouse-y", `${y}px`);
        }
    };

    return (
        <div ref={containerRef} dir={isIran ? 'rtl' : 'ltr'} className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white overflow-hidden selection:bg-purple-500/20" onMouseMove={handleMouseMove}>
            {/* Dynamic Background Elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse delay-1000" />
                <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
            </div>

            {/* Hero Section */}
            <section className="relative pt-20 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <motion.div
                    className="text-center space-y-8 relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 backdrop-blur-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-default">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('landing.newHero.badge')}</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                        {t('landing.newHero.titleLine1')} <br />
                        <span className="relative inline-block">
                            <span className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 blur-3xl opacity-20 animate-pulse"></span>
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 animate-gradient-x">
                                {t('landing.newHero.titleLine2')}
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                        {t('landing.newHero.description')}
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button
                            size="lg"
                            onClick={() => navigate('/explore')}
                            className="relative overflow-hidden group text-lg px-8 py-6 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 shadow-xl shadow-black/10 dark:shadow-white/10 transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            {t('landing.newHero.startCreating')}
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => {
                                const toolsSection = document.getElementById('tools-section');
                                toolsSection?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-lg px-8 py-6 rounded-2xl border-2 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                        >
                            {t('landing.newHero.exploreTools')}
                        </Button>
                    </motion.div>
                </motion.div>

                {/* Floating Hero Image / Marquee */}
                <motion.div
                    style={{ y }}
                    className="mt-24 relative z-0"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4 }}
                >
                    <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-black via-transparent to-transparent z-10 h-full pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-white dark:from-black via-transparent to-transparent z-10 h-24 pointer-events-none" />

                    {/* Scrolling Marquee */}
                    <div className="flex overflow-hidden py-4 mask-image-linear-gradient">
                        <div className={`flex gap-6 min-w-max pe-6 ${isIran ? 'animate-scroll-x-reverse' : 'animate-scroll-x'}`}>
                            {[...tools, ...tools].map((tool, i) => (
                                <div key={`${tool.id}-${i}`} className="w-72 h-96 rounded-3xl overflow-hidden relative group shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <img src={tool.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-6 right-6 text-start">
                                        <div className="text-white font-semibold text-lg">{t(`tools.${tool.translationKey}.title`)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className={`flex gap-6 min-w-max pe-6 ${isIran ? 'animate-scroll-x-reverse' : 'animate-scroll-x'}`} aria-hidden="true">
                            {[...tools, ...tools].map((tool, i) => (
                                <div key={`${tool.id}-${i}-clone`} className="w-72 h-96 rounded-3xl overflow-hidden relative group shadow-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                                    <img src={tool.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-6 right-6 text-start">
                                        <div className="text-white font-semibold text-lg">{t(`tools.${tool.translationKey}.title`)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Features Bento Grid Section (Replaces How It Works) */}
            <section className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900 dark:text-white">{t('landing.whyChoose.title')}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-2xl mx-auto">{t('landing.whyChoose.subtitle')}</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-8 rounded-3xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${feature.className}`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 flex items-center justify-center mb-6 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools Showcase Section */}
            <section id="tools-section" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-gray-50 dark:from-gray-900/50 to-transparent -z-10" />
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6">
                            <Palette className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                {t('tools.badge')}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            {t('tools.title')}
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            {t('tools.subtitle')}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
                        {tools.map((tool, index) => (
                            <motion.div
                                key={tool.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="h-full spotlight-card relative group rounded-3xl"
                            >
                                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"
                                    style={{
                                        background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.05), transparent 40%)`
                                    }}
                                />
                                <div className="relative z-10 h-full">
                                    <ToolCard tool={tool} />
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        className="mt-16 text-center"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5 }}
                    >
                        <p className="text-gray-600 dark:text-gray-400 text-sm font-medium flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            {t('tools.moreComingSoon.description')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-gray-200 dark:divide-gray-700">
                        {[
                            { number: "10M+", label: t('landing.stats.imagesGenerated') },
                            { number: "500k+", label: t('landing.stats.activeCreators') },
                            { number: "99.9%", label: t('landing.stats.uptime') }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="space-y-2 pt-8 md:pt-0"
                            >
                                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 font-tracking-tight">
                                    {stat.number}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400 font-medium text-lg">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">{t('landing.testimonials.title')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 relative hover:border-gray-300 dark:hover:border-gray-600 transition-colors shadow-lg shadow-gray-500/5 dark:shadow-black/20 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 dark:from-gray-700/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover ring-4 ring-gray-200 dark:ring-gray-700" />
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-white text-lg">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{testimonial.role}</div>
                                    </div>
                                </div>
                                <div className="flex mb-4 relative z-10">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-gray-700 dark:text-gray-300 italic text-lg leading-relaxed relative z-10">"{testimonial.content}"</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 mb-20">
                <div className="max-w-5xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="rounded-[3rem] bg-gray-900 text-white p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-gray-900/20 group"
                    >
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/20 to-transparent animate-spin-slow" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">{t('landing.cta.title')}</h2>
                            <p className="text-xl text-white/80 max-w-2xl mx-auto">
                                {t('landing.cta.subtitle')}
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/explore')}
                                    className="bg-blue-600 text-white hover:bg-blue-700 border-transparent text-lg px-12 py-7 rounded-2xl shadow-xl shadow-blue-600/20 transition-transform hover:scale-105 active:scale-95"
                                >
                                    {t('landing.cta.button')}
                                </Button>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-white/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> {t('landing.cta.noCreditCard')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> {t('landing.cta.freeTrial')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> {t('landing.cta.cancelAnytime')}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
