import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';

export const UserTypeSelection = () => {
  const navigate = useNavigate();

  const handleShopperClick = () => {
    // Navigate directly to shopper login
    navigate('/login', { state: { userType: 'shopper' } });
  };

  const handleVendorClick = () => {
    // For now, show an alert that it's coming soon
    alert('Vendor sign-in coming soon! Please check back later.');
    // Later this will be: navigate('/login', { state: { userType: 'vendor' } });
  };

  return (
    <div className="relative flex h-screen w-full bg-[#f9f9f9] overflow-hidden">
      <div className="flex flex-col w-full max-w-[850px] px-[124px] py-[111px]">
        {/* Logo Section */}
        <div className="flex items-center gap-1 h-[38px]">
          <img
            className="w-[38px] h-[31px]"
            alt="Fashion Culture Logo"
            src="https://c.animaapp.com/mbormqrhVzbcgH/img/subtract.svg"
          />
          <div className="font-['Urbanist',Helvetica] font-bold text-black text-base leading-[19.2px]">
            FASHION&nbsp;&nbsp;
            <br />
            CULTURE
          </div>
        </div>

        {/* Welcome Section */}
        <div className="flex flex-col mt-[125px] gap-[9px]">
          <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base leading-[16.0px]">
            Welcome to Fashion Culture!
          </p>
          <h2 className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-3xl">
            How would you like to sign in?
          </h2>
        </div>

        {/* User Type Cards */}
        <div className="flex gap-6 mt-[50px]">
          {/* Shopper Card */}
          <div
            className="w-[297px] h-[138px] bg-[#d9d9d9] rounded-[7px] border-none hover:bg-[#c9c9c9] cursor-pointer transition-colors"
            onClick={handleShopperClick}
          >
            <div className="flex flex-col h-full p-3.5 justify-between">
              <div className="pt-[15px]">
                <ShoppingBagIcon className="w-[26px] h-[26px] text-[#2d2d2d]" />
              </div>
              <div className="pb-[15px]">
                <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-xl mb-1">
                  Shopper
                </p>
                <p className="font-['Urbanist',Helvetica] font-normal text-[#666] text-sm">
                  Browse and buy fashion items
                </p>
              </div>
            </div>
          </div>

          {/* Vendor Card */}
          <div
            className="w-[297px] h-[138px] bg-[#d9d9d9] rounded-[7px] border-none hover:bg-[#c9c9c9] cursor-pointer transition-colors opacity-60"
            onClick={handleVendorClick}
          >
            <div className="flex flex-col h-full p-3.5 justify-between">
              <div className="pt-[15px] relative w-[31px] h-[31px]">
                <div className="relative w-[18px] h-[17px] top-1.5 left-1.5">
                  <img
                    className="absolute w-[19px] h-[18px] -top-px -left-px"
                    alt="Vendor Icon"
                    src="https://c.animaapp.com/mbormqrhVzbcgH/img/vector-55.svg"
                  />
                </div>
              </div>
              <div className="pb-[15px]">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-xl">
                    Vendor
                  </p>
                  <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                    Coming Soon
                  </span>
                </div>
                <p className="font-['Urbanist',Helvetica] font-normal text-[#666] text-sm">
                  Sell your fashion products
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Image - Better UX */}
      <div className="flex-1 h-full relative overflow-hidden">
        <img
          className="h-full w-full object-cover"
          alt="Fashion model"
          src="https://c.animaapp.com/mbormqrhVzbcgH/img/mask-group.png"
          style={{
            filter: 'brightness(0.95) contrast(1.1) saturate(1.1)',
            objectPosition: 'center 40%'
          }}
        />
      </div>
    </div>
  );
};

export default UserTypeSelection;