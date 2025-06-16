import React from 'react';

export const FeaturedSection = () => {
  const featuredItems = [
    {
      id: 1,
      name: "Guinea Fabric",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/dd7f9aa8fe5fb6cd0694cf379e2781e7.png",
      position: "left",
    },
    {
      id: 2,
      name: "Ankara Fabric",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/ff4e0820410c87fd757f153701e1ac11.png",
      position: "right",
    },
  ];

  return (
    <div className="w-full max-w-[520px] h-auto relative">
      <div className="relative flex items-center justify-center">
        {featuredItems.map((item) => (
          <div
            key={item.id}
            className={`relative ${item.position === "left" ? "mr-[-50px] z-0" : "ml-[-50px] z-10"}`}
          >
            <img
              className={`object-cover rounded-lg ${item.position === "left" ? "w-[227px] h-60" : "w-[234px] h-[247px] mt-9"}`}
              alt={item.name}
              src={item.image}
            />

            <div
              className={`absolute bg-white text-black font-medium text-[13px] rounded-lg shadow-[0px_4px_4px_#00000040] py-3 px-4 font-['Urbanist',Helvetica] ${
                item.position === "left"
                  ? "bottom-8 left-0"
                  : "bottom-24 right-0"
              }`}
            >
              {item.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeaturedSection;