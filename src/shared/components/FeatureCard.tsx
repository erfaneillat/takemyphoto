import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon, title, description }: FeatureCardProps) => {
  return (
    <div className="group bg-background-secondary border border-border rounded-2xl p-8 hover:border-foreground transition-all duration-500 hover:shadow-2xl hover:shadow-foreground/20 hover:-translate-y-2 cursor-pointer">
      <div className="flex flex-col items-center text-center gap-4">
        <div className="relative p-4 bg-foreground/10 rounded-2xl text-foreground group-hover:scale-110 transition-transform duration-500 group-hover:rotate-6">
          <div className="relative z-10">
            {icon}
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/20 to-foreground/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <h3 className="text-xl font-bold text-foreground transition-colors duration-300">{title}</h3>
        <p className="text-foreground-secondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
};
