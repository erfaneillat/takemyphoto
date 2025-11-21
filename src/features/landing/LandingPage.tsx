import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
            role: "Digital Artist",
            content: "The quality of images produced is absolutely mind-blowing. It has completely changed my workflow.",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
        },
        {
            name: "Sarah Miller",
            role: "Content Creator",
            content: "Finally, an AI tool that gives me exactly what I want without complex prompt engineering.",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
        },
        {
            name: "Jordan Taylor",
            role: "Marketing Director",
            content: "We use this for all our campaign assets now. It saves us hours of work every single week.",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop"
        }
    ];

    const features = [
        {
            title: "Professional Quality",
            description: "Studio-grade output resolution suitable for commercial use.",
            icon: <Star className="w-6 h-6 text-yellow-500" />,
            className: "col-span-1 md:col-span-2 bg-yellow-500/5 border-yellow-500/10"
        },
        {
            title: "Lightning Fast",
            description: "Generate images in seconds with our optimized engine.",
            icon: <Zap className="w-6 h-6 text-blue-500" />,
            className: "col-span-1 bg-blue-500/5 border-blue-500/10"
        },
        {
            title: "Secure & Private",
            description: "Your data and creations are encrypted and protected.",
            icon: <Shield className="w-6 h-6 text-green-500" />,
            className: "col-span-1 bg-green-500/5 border-green-500/10"
        },
        {
            title: "Creative Freedom",
            description: "Unlimited possibilities with advanced prompt understanding.",
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
        <div ref={containerRef} className="min-h-screen bg-background text-foreground overflow-hidden selection:bg-purple-500/20" onMouseMove={handleMouseMove}>
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
                    <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground/5 border border-foreground/10 backdrop-blur-md hover:bg-foreground/10 transition-colors cursor-default">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span className="text-sm font-medium text-foreground/80">Next Gen AI Engine Available</span>
                    </motion.div>

                    <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground leading-[1.1]">
                        Create Beyond <br />
                        <span className="relative inline-block">
                            <span className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 blur-3xl opacity-20 animate-pulse"></span>
                            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 animate-gradient-x">
                                Imagination
                            </span>
                        </span>
                    </motion.h1>

                    <motion.p variants={itemVariants} className="text-xl text-foreground/60 max-w-2xl mx-auto leading-relaxed">
                        Unleash your creativity with the most powerful AI art generation platform.
                        Transform your ideas into breathtaking visuals in seconds using our suite of professional tools.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        <Button
                            size="lg"
                            onClick={() => navigate('/explore')}
                            className="relative overflow-hidden group text-lg px-8 py-6 rounded-2xl bg-foreground text-background hover:bg-foreground/90 shadow-xl shadow-foreground/10 transition-all hover:scale-105 active:scale-95"
                        >
                            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            Start Creating Free
                            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            onClick={() => {
                                const toolsSection = document.getElementById('tools-section');
                                toolsSection?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="text-lg px-8 py-6 rounded-2xl border-2 hover:bg-foreground/5 transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
                        >
                            Explore Tools
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
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 h-full pointer-events-none" />
                    <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-transparent z-10 h-24 pointer-events-none" />

                    {/* Scrolling Marquee */}
                    <div className="flex gap-6 overflow-hidden py-4 mask-image-linear-gradient">
                        <div className="flex gap-6 animate-scroll-x min-w-max">
                            {[...tools, ...tools].map((tool, i) => (
                                <div key={`${tool.id}-${i}`} className="w-72 h-96 rounded-3xl overflow-hidden relative group shadow-2xl border border-foreground/5 bg-foreground/5">
                                    <img src={tool.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-6">
                                        <div className="text-white font-semibold text-lg">{t(`tools.${tool.translationKey}.title`)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-6 animate-scroll-x min-w-max" aria-hidden="true">
                            {[...tools, ...tools].map((tool, i) => (
                                <div key={`${tool.id}-${i}-clone`} className="w-72 h-96 rounded-3xl overflow-hidden relative group shadow-2xl border border-foreground/5 bg-foreground/5">
                                    <img src={tool.image} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-90 group-hover:opacity-100" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                                    <div className="absolute bottom-6 left-6">
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
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Why Choose Take My Photo?</h2>
                        <p className="text-foreground/60 text-lg max-w-2xl mx-auto">Experience the future of creativity with our cutting-edge features.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-8 rounded-3xl border backdrop-blur-sm hover:bg-foreground/[0.02] transition-colors ${feature.className}`}
                            >
                                <div className="w-12 h-12 rounded-2xl bg-background border border-foreground/10 flex items-center justify-center mb-6 shadow-sm">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                                <p className="text-foreground/60 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tools Showcase Section */}
            <section id="tools-section" className="py-24 px-4 sm:px-6 lg:px-8 scroll-mt-20 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent -z-10" />
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
                        <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
                            {t('tools.title')}
                        </h2>
                        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
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
                                        background: `radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(255,255,255,0.1), transparent 40%)`
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
                        <p className="text-foreground/60 text-sm font-medium flex items-center justify-center gap-2">
                            <Zap className="w-4 h-4 text-amber-500" />
                            {t('tools.moreComingSoon.description')}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-foreground/5 bg-foreground/[0.01]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-foreground/10">
                        {[
                            { number: "10M+", label: "Images Generated" },
                            { number: "500k+", label: "Active Creators" },
                            { number: "99.9%", label: "Uptime Reliability" }
                        ].map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                className="space-y-2 pt-8 md:pt-0"
                            >
                                <div className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/40 font-tracking-tight">
                                    {stat.number}
                                </div>
                                <div className="text-foreground/60 font-medium text-lg">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">Loved by Creators</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="p-8 rounded-3xl bg-background border border-foreground/10 relative hover:border-foreground/20 transition-colors shadow-lg shadow-foreground/5 group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
                                <div className="flex items-center gap-4 mb-6 relative z-10">
                                    <img src={testimonial.avatar} alt={testimonial.name} className="w-14 h-14 rounded-full object-cover ring-4 ring-foreground/5" />
                                    <div>
                                        <div className="font-bold text-foreground text-lg">{testimonial.name}</div>
                                        <div className="text-sm text-foreground/60 font-medium">{testimonial.role}</div>
                                    </div>
                                </div>
                                <div className="flex mb-4 relative z-10">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                                    ))}
                                </div>
                                <p className="text-foreground/80 italic text-lg leading-relaxed relative z-10">"{testimonial.content}"</p>
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
                        className="rounded-[3rem] bg-foreground text-background p-12 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-foreground/20 group"
                    >
                        <div className="absolute top-0 left-0 w-full h-full opacity-10">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
                            <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-transparent via-white/20 to-transparent animate-spin-slow" />
                        </div>

                        <div className="relative z-10 space-y-8">
                            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">Ready to start creating?</h2>
                            <p className="text-xl text-background/80 max-w-2xl mx-auto">
                                Join thousands of creators who are already using our tools to bring their imagination to reality.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                                <Button
                                    size="lg"
                                    onClick={() => navigate('/explore')}
                                    className="bg-background text-foreground hover:bg-background/90 text-lg px-12 py-7 rounded-2xl shadow-xl transition-transform hover:scale-105 active:scale-95"
                                >
                                    Get Started Now
                                </Button>
                            </div>
                            <div className="flex flex-wrap justify-center gap-6 pt-8 text-sm text-background/60 font-medium">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4" /> No credit card required
                                </div>
                                <div className="flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> 7-day free trial
                                </div>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Cancel anytime
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};
