import { Link } from 'react-router-dom';

export const Logo = ({ 
  variant = 'full',  // 'full' | 'icon'
  size = 'md',       // 'sm' | 'md' | 'lg'
  className = '',
  linkTo = '/'
}) => {
  const sizes = {
    full: {
      sm: 'h-8',    // 32px
      md: 'h-12',   // 48px
      lg: 'h-16'    // 64px
    },
    icon: {
      sm: 'h-6 w-6',    // 24px
      md: 'h-10 w-10',  // 40px
      lg: 'h-12 w-12'   // 48px
    }
  };

  if (variant === 'icon') {
    return (
      <Link to={linkTo} className={`inline-flex ${className}`}>
        <img
          src="/favicon.svg"
          alt="Fáàrí"
          className={`${sizes.icon[size]} object-contain`}
        />
      </Link>
    );
  }

  return (
    <Link to={linkTo} className={`inline-flex items-center space-x-3 ${className}`}>
      <img
        src="/favicon.svg"
        alt="Fáàrí"
        className={`${sizes.icon[size]} object-contain`}
      />
      <span className="text-xl font-bold text-gray-900">Fáàrí</span>
    </Link>
  );
};

export default Logo;