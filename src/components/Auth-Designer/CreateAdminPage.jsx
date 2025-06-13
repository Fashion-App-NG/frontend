import React from 'react';
import { CreateAdminForm } from './CreateAdminForm';

export const CreateAdminPage = () => {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        {/* Logo Section */}
        <div className="flex justify-center mb-12">
          <div className="flex items-center gap-1">
            <img
              src="https://cdn.builder.io/api/v1/image/assets/ea356ae0f1da43fbbc02727416114024/eee8f71bfde6a3b1e04aa9edd9c252a82b00ff2c?placeholderIfAbsent=true"
              alt="Fashion App Logo"
              className="w-[38px] h-[31px] object-contain"
            />
            <div className="font-['Urbanist',Helvetica] font-bold text-black text-base leading-[19.2px]">
              <div className="whitespace-pre-wrap">FASHION  </div>
              <div>CULTURE</div>
            </div>
          </div>
        </div>

        <CreateAdminForm />
      </div>
    </div>
  );
};

export default CreateAdminPage;