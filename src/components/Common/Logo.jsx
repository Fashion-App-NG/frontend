import React from 'react';

export const Logo = () => {
  return (
    <div className="flex flex-col relative aspect-[3] w-[114px] max-w-full text-base text-black font-bold leading-[19px] px-[41px] max-md:ml-[3px] max-md:pl-5">
      <img
        src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/21ea8e80-0b98-44b5-871d-7efce59ad490?placeholderIfAbsent=true"
        alt="Fashion Culture Logo"
        className="absolute h-full w-full object-cover inset-0"
      />
      <span>
        FASHION <br />
        CULTURE
      </span>
    </div>
  );
};

export default Logo;