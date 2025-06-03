import React from 'react';

export const SocialLogin = () => {
  return (
    <>
      <div className="flex items-center gap-4 text-sm text-[rgba(46,46,46,1)] font-normal leading-[1.2] flex-wrap mt-[35px]">
        <div className="border self-stretch w-[184px] shrink-0 h-px my-auto border-[rgba(211,211,211,1)] border-solid" />
        <div className="self-stretch grow shrink w-[104px]">
          or register with email
        </div>
        <div className="border self-stretch w-[216px] shrink-0 h-px my-auto border-[rgba(211,211,211,1)] border-solid" />
      </div>
      <div className="self-center flex w-[315px] max-w-full items-stretch gap-4 mt-[15px]">
        <button className="focus:outline-none">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/ccbe2f7c-77cf-4857-839e-f7b38c5ec733?placeholderIfAbsent=true"
            alt="Google Login"
            className="aspect-[1.81] object-contain w-[94px] shrink-0 rounded-[5px]"
          />
        </button>
        <button className="border flex flex-col items-stretch justify-center flex-1 px-[19px] py-2.5 rounded-[5px] border-[rgba(215,215,215,1)] border-solid focus:outline-none">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/0a675b932a168dbf454e2aa72d7eb6443194536b?placeholderIfAbsent=true"
            alt="Facebook Login"
            className="aspect-[1.61] object-contain w-[53px]"
          />
        </button>
        <button className="focus:outline-none">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/6ef54409-b217-483c-b77f-5e5efa9af6dc?placeholderIfAbsent=true"
            alt="Phone Login"
            className="aspect-[1.81] object-contain w-[94px] shrink-0 rounded-[5px]"
          />
        </button>
      </div>
    </>
  );
};

export default SocialLogin;