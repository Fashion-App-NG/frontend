
export const FeaturedSection = () => {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative flex items-center justify-center">
        {/* Left fabric image */}
        <div className="relative mr-[-20px] z-0">
          <img
            className="w-[180px] h-[220px] object-cover rounded-lg shadow-lg"
            alt="Guinea Fabric"
            src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/dd7f9aa8fe5fb6cd0694cf379e2781e7.png"
          />
          {/* ✅ FIXED: Use previous font styling without font-['Urbanist',Helvetica] */}
          <div className="absolute bottom-3 left-3 bg-white px-3 py-2 rounded-lg shadow-md">
            <span className="text-black font-medium text-[13px]">
              Guinea Fabric
            </span>
          </div>
        </div>

        {/* Right fabric image - overlapping */}
        <div className="relative ml-[-20px] z-10 mt-8">
          <img
            className="w-[180px] h-[200px] object-cover rounded-lg shadow-lg"
            alt="Ankara Fabric"
            src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/ff4e0820410c87fd757f153701e1ac11.png"
          />
          {/* ✅ FIXED: Use previous font styling without font-['Urbanist',Helvetica] */}
          <div className="absolute bottom-3 right-3 bg-white px-3 py-2 rounded-lg shadow-md">
            <span className="text-black font-medium text-[13px]">
              Ankara Fabric
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSection;