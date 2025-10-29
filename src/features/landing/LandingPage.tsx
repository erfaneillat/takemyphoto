import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/shared/hooks';
import { Button, ImageCard, FeatureCard } from '@/shared/components';
import { 
  Wand2, 
  FileText, 
  Image, 
  Upload, 
  Play, 
  Zap, 
  Palette,
  Sparkles,
  Crown,
  CheckCircle
} from 'lucide-react';

export const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Mock trending images
  const trendingImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', title: 'Cyberpunk Style' },
    { id: 2, url: 'https://images.unsplash.com/photo-1618556450994-a6a128ef0d9d?w=400', title: 'Fantasy Art' },
    { id: 3, url: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=400', title: 'Portrait Pro' },
    { id: 4, url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400', title: 'Cinematic Look' },
    { id: 5, url: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400', title: 'Vintage Filter' },
    { id: 6, url: 'https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=400', title: 'Modern Art' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8">
          {/* Icon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-foreground/10 border border-foreground/20 rounded-full text-foreground text-sm font-medium mb-4">
            <Sparkles size={16} className="animate-pulse" />
            <span>{t('landing.hero.badge')}</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            {t('landing.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-foreground-secondary max-w-3xl mx-auto">
            {t('landing.hero.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button 
              size="lg"
              leftIcon={<Upload size={20} />}
              onClick={() => navigate('/edit')}
              className="bg-foreground hover:bg-foreground/90 text-white shadow-2xl shadow-foreground/40 hover:shadow-foreground/50 hover:scale-105"
            >
              {t('landing.hero.uploadPhoto')}
            </Button>
            <Button 
              size="lg"
              variant="outline"
              leftIcon={<Play size={20} />}
              onClick={() => navigate('/explore')}
              className="border-2 border-foreground text-foreground hover:bg-foreground/10 hover:scale-105"
            >
              {t('landing.hero.tryDemo')}
            </Button>
          </div>
          
          {/* Feature Pills */}
          <div className="flex flex-wrap justify-center gap-3 pt-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-full text-sm text-foreground-secondary">
              <CheckCircle size={16} className="text-foreground" />
              <span>{t('landing.hero.noCreditCard')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-full text-sm text-foreground-secondary">
              <Zap size={16} className="text-foreground" />
              <span>{t('landing.hero.instantResults')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-background-secondary border border-border rounded-full text-sm text-foreground-secondary">
              <Crown size={16} className="text-foreground" />
              <span>{t('landing.hero.premiumQuality')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Palette size={32} className="text-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('landing.trending.title')}
          </h2>
          <p className="text-foreground-secondary text-lg">{t('landing.trending.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {trendingImages.map((image) => (
            <ImageCard
              key={image.id}
              imageUrl={image.url}
              title={image.title}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles size={32} className="text-foreground" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            {t('landing.features.title')}
          </h2>
          <p className="text-foreground-secondary text-lg">{t('landing.features.subtitle')}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={
              <div className="relative">
                <Wand2 size={48} />
                <div className="absolute inset-0 bg-foreground/20 blur-2xl" />
              </div>
            }
            title={t('landing.features.styleTransfer.title')}
            description={t('landing.features.styleTransfer.description')}
          />
          <FeatureCard
            icon={
              <div className="relative">
                <FileText size={48} />
                <div className="absolute inset-0 bg-foreground/20 blur-2xl" />
              </div>
            }
            title={t('landing.features.textEdit.title')}
            description={t('landing.features.textEdit.description')}
          />
          <FeatureCard
            icon={
              <div className="relative">
                <Image size={48} />
                <div className="absolute inset-0 bg-foreground/20 blur-2xl" />
              </div>
            }
            title={t('landing.features.highQuality.title')}
            description={t('landing.features.highQuality.description')}
          />
        </div>
      </section>
    </div>
  );
};
