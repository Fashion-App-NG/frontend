import React from 'react';
import { Logo } from '../Common/Logo';
import { VendorLoginForm } from './VendorLoginForm';

export const VendorLoginPageForm = () => {
  return (
    <div className="bg-[rgba(249,249,249,1)] overflow-hidden pl-20 max-md:pl-5">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
        <div className="w-6/12 max-md:w-full max-md:ml-0">
          <div className="flex w-full flex-col items-stretch mt-16 max-md:max-w-full max-md:mt-10">
            <Logo />
            <VendorLoginForm />
          </div>
        </div>
        <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0">
          <img
            src="/images/vendor-banner.jpg"
            alt="Colorful fabric rolls and textiles for fashion vendors"
            className="aspect-[0.58] object-contain w-full grow rounded-[0px_0px_0px_0px] max-md:max-w-full max-md:mt-10"
          />
        </div>
      </div>
    </div>
  );
};

export default VendorLoginPageForm;