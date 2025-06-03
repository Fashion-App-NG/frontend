import React, { useState } from 'react';

export const PasswordInput = ({ placeholder, eyeIconUrl, name }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="bg-[rgba(242,242,242,1)] border flex min-h-[60px] items-center text-base text-[rgba(180,180,180,1)] font-normal leading-[19px] flex-wrap mt-[9px] px-4 py-[18px] rounded-[5px] border-[rgba(203,203,203,1)] border-solid max-md:max-w-full">
      <input
        type={showPassword ? "text" : "password"}
        name={name}
        placeholder={placeholder}
        className="grow shrink w-[103px] my-auto bg-transparent border-none outline-none"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="focus:outline-none"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <img
          src={eyeIconUrl}
          alt=""
          className="aspect-[1] object-contain w-6 self-stretch shrink-0 my-auto"
        />
      </button>
    </div>
  );
};

export default PasswordInput;