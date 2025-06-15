
export const RecommendationSection = () => {
  return (
    <div className="w-full max-w-[451px] bg-white rounded-lg shadow-sm">
      <div className="p-7">
        <div className="flex flex-col gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-[32px] leading-tight font-['Urbanist',Helvetica] tracking-[0]">
              Discover Your
            </h2>
            <h2 className="font-bold text-[32px] leading-tight font-['Urbanist',Helvetica] tracking-[0]">
              Fashion Culture
            </h2>
          </div>

          <p className="font-['Urbanist',Helvetica] font-normal text-black text-base tracking-[0] leading-[16.5px]">
            Welcome to our fashion Paradise, Where style meets culture! Get ready <br />
            to embark on a journey of self-expression and fashion exploration.
          </p>

          <div className="pt-2">
            <button 
              // onClick={handleDiscoverCulture}
              className="bg-[#303030] text-[#edff8c] rounded-[26px] h-auto px-[18px] py-[17px] hover:bg-[#404040] transition-colors flex items-center"
            >
              <span className="font-['Urbanist',Helvetica] font-semibold text-sm leading-[14.4px] tracking-[0]">
                Discover Culture
              </span>
              <img
                className="w-[13.5px] h-[13.5px] ml-3.5"
                alt="Arrow icon"
                src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/group-1.png"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationSection;