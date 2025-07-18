import { memo } from 'react';

const SocialLogin = memo(({ isLogin = false }) => {
  return (
    <>
      {/* Divider */}
      <div className="flex items-center gap-4 text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] flex-wrap mt-[35px]">
        <div className="border self-stretch w-[184px] shrink-0 h-px my-auto border-[rgba(211,211,211,1)] border-solid" />
        <div className="self-stretch grow shrink w-[104px] text-center">
          {isLogin ? 'or' : 'or register with email'}
        </div>
        <div className="border self-stretch w-[216px] shrink-0 h-px my-auto border-[rgba(211,211,211,1)] border-solid" />
      </div>
      
      {/* Social Login Buttons */}
      <div className="self-center flex w-[315px] max-w-full items-stretch gap-4 mt-[15px]">
        <button 
          type="button"
          className="w-[94px] h-[52px] rounded-[5px] border border-[rgba(190,190,190,1)] flex items-center justify-center focus:outline-none hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Google login clicked')}
        >
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/logos.svg"
            alt="Google Login"
            className="w-[30px] h-[30px]"
          />
        </button>
        
        <button 
          type="button"
          className="w-[94px] h-[52px] rounded-[5px] border border-[rgba(190,190,190,1)] flex items-center justify-center focus:outline-none hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Facebook login clicked')}
        >
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/facebook-logo-1.png"
            alt="Facebook Login"
            className="w-[53px] h-[33px] object-cover"
          />
        </button>
        
        <button 
          type="button"
          className="w-[94px] h-[52px] rounded-[5px] border border-[rgba(190,190,190,1)] flex items-center justify-center focus:outline-none hover:bg-gray-50 transition-colors"
          onClick={() => console.log('Phone login clicked')}
        >
          <img
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/phone-filled--streamline-carbon-1.svg"
            alt="Phone Login"
            className="w-7 h-7"
          />
        </button>
      </div>
    </>
  );
});

SocialLogin.displayName = 'SocialLogin';

// ✅ Only default export
export default SocialLogin;