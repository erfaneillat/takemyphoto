interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  src?: string;
}

export const Logo = ({ size = 'md', className = '', src = '/logo.png' }: LogoProps) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <img
      src={src}
      alt="Take My Photo Logo"
      className={`${sizeMap[size]} ${className}`}
    />
  );
};
