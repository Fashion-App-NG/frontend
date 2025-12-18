export const DiscoverSection = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      {/* Text content only - let FeaturedSection handle the images */}
      <div className="max-w-md space-y-6">
        {/* Main heading with proper line breaks */}
        <div className="space-y-1">
          <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-[40px] leading-tight">
            Discover Your
          </h2>
          <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-[40px] leading-tight">
            Fáàrí
          </h2>
        </div>

        {/* Description text */}
        <div className="pt-2">
          <p className="font-['Urbanist',Helvetica] font-normal text-[#636363] text-[20px] leading-normal mt-[13px]">
            Welcome to our fashion paradise, where style meets innovation! Get ready
            to embark on a journey of self-expression and fashion exploration.
          </p>
        </div>

        {/* Discover button */}
        <button className="flex items-center justify-center px-[23px] py-[9px] gap-[10px] bg-[#2d2d2d] rounded-[30px] hover:bg-[#3d3d3d] transition-colors">
          <span className="font-['Urbanist',Helvetica] font-semibold text-white text-[20px] text-center">
            Discover Fáàrí
          </span>
        </button>
      </div>
    </div>
  );
};

export default DiscoverSection;