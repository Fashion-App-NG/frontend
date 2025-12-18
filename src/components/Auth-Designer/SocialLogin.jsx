import { memo } from 'react';

const SocialLogin = memo(({ isLogin = false }) => {
  return (
    <div className="mt-6 sm:mt-8">
      {/* Divider */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-[rgba(46,46,46,1)] font-normal mb-4 sm:mb-6">
        <div className="flex-1 border-t border-[rgba(211,211,211,1)]" />
        <div className="text-center whitespace-nowrap px-2">
          {isLogin ? 'or' : 'or register with email'}
        </div>
        <div className="flex-1 border-t border-[rgba(211,211,211,1)]" />
      </div>
      
      {/* Social Login Buttons */}
      <div className="flex items-center justify-center gap-3 sm:gap-4">
        <button 
          type="button"
          className="w-20 h-12 sm:w-[94px] sm:h-[52px] rounded-[5px] border border-[rgba(190,190,190,1)] flex items-center justify-center focus:outline-none hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Google login clicked')}
        >
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/logos.svg"
            alt="Google Login"
            className="w-6 h-6 sm:w-[30px] sm:h-[30px]"
          />
        </button>
        
        <button 
          type="button"
          className="w-20 h-12 sm:w-[94px] sm:h-[52px] rounded-[5px] border border-[rgba(190,190,190,1)] flex items-center justify-center focus:outline-none hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Facebook login clicked')}
        >
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/facebook-logo-1.png"
            alt="Facebook Login"
            className="w-10 h-6 sm:w-[53px] sm:h-[33px] object-cover"
          />
        </button>
        
        <button 
          type="button"
          className="w-20 h-12 sm:w-[94px] sm:h-[52px] rounded-[5px] border border-[rgba(190,190,190,1)] flex items-center justify-center focus:outline-none hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Phone login clicked')}
        >
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/phone-filled--streamline-carbon-1.svg"
            alt="Phone Login"
            className="w-6 h-6 sm:w-7 sm:h-7"
          />
        </button>
      </div>
    </div>
  );
});

SocialLogin.displayName = 'SocialLogin';

export default SocialLogin;