import React from 'react';
import { PasswordInput } from './PasswordInput';

export const RegisterForm = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password'),
      repeatPassword: formData.get('repeatPassword'),
      terms: formData.get('terms')
    };
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="flex flex-col items-stretch mt-[66px] max-md:ml-1 max-md:mt-10">
        <h1 className="text-black text-[32px] font-bold">
          Create Your Account
        </h1>
        <p className="text-[rgba(46,46,46,1)] text-base font-normal leading-[1.2] mt-[5px]">
          Get started for free
        </p>
      </div>

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[42px] max-md:mt-10">
        Email Address
      </label>
      <input
        type="email"
        name="email"
        placeholder="Enter your email"
        className="self-stretch bg-[rgba(242,242,242,1)] border min-h-[61px] gap-[5px] text-base text-[rgba(180,180,180,1)] font-normal leading-[1.2] mt-4 px-4 py-[21px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid"
      />

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Password
      </label>
      <PasswordInput 
        name="password"
        placeholder="Enter Password" 
        eyeIconUrl="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/fa61a7ea2e8a3f0de0c22adc1913896bf9ccc751?placeholderIfAbsent=true" 
      />

      <label className="text-[rgba(46,46,46,1)] text-sm font-normal leading-[1.2] mt-[9px]">
        Repeat Password
      </label>
      <PasswordInput 
        name="repeatPassword"
        placeholder="Repeat Password" 
        eyeIconUrl="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/721587a1008fbb598d4b26f6f18fcdb426762d83?placeholderIfAbsent=true" 
      />

      <div className="flex items-center gap-[5px] text-xs text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-2.5 max-md:ml-0.5">
        <input
          type="checkbox"
          name="terms"
          className="border w-[17px] h-[17px] rounded-sm border-[rgba(46,46,46,1)] border-solid"
        />
        <label className="self-stretch my-auto">
          I agree to the <span className="underline">Terms of Service</span> and{' '}
          <span className="underline">Privacy Policy</span>
        </label>
      </div>

      <button
        type="submit"
        className="self-stretch bg-[rgba(46,46,46,1)] min-h-[60px] text-base text-[rgba(237,255,140,1)] font-bold leading-[1.2] mt-[29px] px-4 py-[21px] rounded-[44px] max-md:max-w-full"
      >
        Continue
      </button>

      <div className="self-center flex items-center text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] mt-[11px]">
        <span className="self-stretch my-auto">Already have account?</span>
        <button type="button" className="self-stretch my-auto font-bold ml-1">
          Sign in
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;