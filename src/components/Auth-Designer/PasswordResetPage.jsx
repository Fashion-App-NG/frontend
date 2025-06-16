import React from 'react';
import { Logo } from '../Common/Logo';
import { PasswordResetForm } from './PasswordResetForm';

export const PasswordResetPage = () => {
  return (
    <div className="bg-[rgba(249,249,249,1)] overflow-hidden min-h-screen">
      <div className="gap-5 flex max-md:flex-col max-md:items-stretch">
        {/* Content Section - LEFT SIDE */}
        <div className="w-6/12 max-md:w-full max-md:ml-0">
          <div className="flex w-full flex-col items-stretch mt-16 max-md:max-w-full max-md:mt-10 px-20 max-md:px-5">
            {/* Header */}
            <Logo />

            {/* Main Content */}
            <div className="flex flex-col mt-16 max-md:mt-10">
              <PasswordResetForm />
            </div>
          </div>
        </div>

        {/* Image Section - RIGHT SIDE */}
        <div className="w-6/12 ml-5 max-md:w-full max-md:ml-0 max-md:hidden">
          <img
            className="aspect-[0.58] object-contain w-full grow rounded-[0px_0px_0px_0px] max-md:max-w-full max-md:mt-10"
            alt="Fashion model for shoppers"
            src="https://c.animaapp.com/mbgdqa1w85bFXv/img/mask-group.png"
          />
        </div>
      </div>
    </div>
  );
};

export default PasswordResetPage;