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
            Fashion Culture
          </h2>
        </div>

        {/* Description text */}
        <p className="font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-base leading-relaxed">
          Welcome to our fashion Paradise, Where style meets culture! Get ready
          to embark on a journey of self-expression and fashion exploration.
        </p>

        {/* Discover Culture button */}
        <div className="pt-2">
          <button className="bg-[#303030] text-[#edff8c] rounded-[26px] px-[24px] py-[18px] hover:bg-[#404040] transition-colors flex items-center">
            <span className="font-['Urbanist',Helvetica] font-semibold text-base">
              Discover Culture
            </span>
            <svg
              className="w-4 h-4 ml-3"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscoverSection;