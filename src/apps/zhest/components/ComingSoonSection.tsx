import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const AnimatedCaptionIcon = ({ className }: { className?: string }) => (
    <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <motion.path
            d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"
            animate={{ y: [0, -2, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
            d="M15 5l4 4"
            animate={{ y: [0, -2, 0], rotate: [0, -3, 3, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.path
            d="M3 21h18"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
    </motion.svg>
);

const AnimatedCoverIcon = ({ className }: { className?: string }) => (
    <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <motion.rect
            width="18" height="18" x="3" y="3" rx="2" ry="2"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <circle cx="9" cy="9" r="2" />
        <motion.path
            d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
            animate={{ y: [0, -1, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.g animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ transformOrigin: '19px 5px' }}>
            <line x1="16" y1="5" x2="22" y2="5" />
            <line x1="19" y1="2" x2="19" y2="8" />
        </motion.g>
    </motion.svg>
);

const AnimatedReelsIcon = ({ className }: { className?: string }) => (
    <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
        <line x1="7" x2="7" y1="2" y2="22" />
        <line x1="17" x2="17" y1="2" y2="22" />

        <motion.g animate={{ y: [-4, 4] }} transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse", ease: "linear" }}>
            <line x1="2" x2="7" y1="4" y2="4" />
            <line x1="2" x2="7" y1="10" y2="10" />
            <line x1="2" x2="7" y1="16" y2="16" />
            <line x1="2" x2="7" y1="22" y2="22" />

            <line x1="17" x2="22" y1="4" y2="4" />
            <line x1="17" x2="22" y1="10" y2="10" />
            <line x1="17" x2="22" y1="16" y2="16" />
            <line x1="17" x2="22" y1="22" y2="22" />
        </motion.g>

        <motion.polygon
            points="10 9 15 12 10 15 10 9"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
    </motion.svg>
);

const AnimatedModelIcon = ({ className }: { className?: string }) => (
    <motion.svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} style={{ transformOrigin: '12px 12px' }}>
            <motion.path
                d="M12 2v2M12 20v2M22 12h-2M4 12H2M19.07 4.93l-1.41 1.41M6.34 17.66l-1.41 1.41M19.07 19.07l-1.41-1.41M6.34 6.34L4.93 4.93"
                strokeWidth="1.5"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.9, 1.1, 0.9] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
        </motion.g>
        <path d="M18 20a6 6 0 0 0-12 0" />
        <circle cx="12" cy="10" r="4" />
        <circle cx="12" cy="12" r="10" />
    </motion.svg>
);

const COMING_SOON_TOOLS = [
    {
        id: 'instagram-caption',
        title: 'کپشن اینستاگرام',
        description: 'نویسنده هوشمند کپشن',
        icon: AnimatedCaptionIcon,
        bgColor: 'bg-[#FDF2F8] dark:bg-pink-950/20'
    },
    {
        id: 'instagram-cover',
        title: 'کاور اینستاگرام',
        description: 'طراحی کاور جذاب و حرفه‌ای',
        icon: AnimatedCoverIcon,
        bgColor: 'bg-[#F3E8FF] dark:bg-purple-950/20'
    },
    {
        id: 'image-to-reels',
        title: 'تبدیل عکس به ریلز',
        description: 'ساخت ویدیوهای کوتاه',
        icon: AnimatedReelsIcon,
        bgColor: 'bg-[#EFF6FF] dark:bg-indigo-950/20'
    },
    {
        id: 'exclusive-model',
        title: 'مدل اختصاصی آقا/خانم',
        description: 'خلق مانکن هوش مصنوعی',
        icon: AnimatedModelIcon,
        bgColor: 'bg-[#ECFEFF] dark:bg-cyan-950/20'
    }
];

export const ComingSoonSection = () => {
    return (
        <div className="w-full py-6">
            <div className="px-5 mb-5 flex items-center gap-3">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h2 className="text-[17px] font-bold text-gray-900 dark:text-white">بخش‌های جدید</h2>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                    </span>
                    <span className="mt-0.5">به زودی</span>
                </div>
            </div>

            <div className="w-full overflow-x-auto pb-4 px-5 snap-x snap-mandatory flex gap-3 hide-scrollbar">
                {COMING_SOON_TOOLS.map((tool, index) => (
                    <motion.div
                        key={tool.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className={`relative w-[210px] h-[64px] rounded-2xl overflow-hidden snap-center shrink-0 ${tool.bgColor} flex items-center px-3 transition-transform hover:-translate-y-0.5`}
                    >
                        {/* Animated Icon Container */}
                        <div className="w-[42px] h-[42px] rounded-xl bg-white dark:bg-gray-900 flex items-center justify-center shadow-sm shrink-0 ml-3">
                            <tool.icon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                        </div>

                        {/* Text Content */}
                        <div className="flex flex-col justify-center h-full w-full overflow-hidden text-right">
                            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                                {tool.title}
                            </h3>
                            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 truncate font-medium">
                                {tool.description}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}} />
        </div>
    );
};
