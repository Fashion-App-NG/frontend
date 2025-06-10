import React from 'react';
import { StarIcon, HeartIcon } from 'lucide-react';
import { useCart } from '../../../../contexts/CartContext';

export const PopularFabricsSection = () => {
  const { addToCart } = useCart();

  const fabricItems = [
    {
      id: 1,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-4.png",
    },
    {
      id: 2,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-5.png",
    },
    {
      id: 3,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-6.png",
    },
    {
      id: 4,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-7.png",
    },
  ];

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: parseFloat(item.price.replace(',', '')),
      image: item.image,
      quantity: 1
    });
  };

  return (
    <section className="w-full">
      <div className="mb-6">
        <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-2xl">
          Popular Fabrics
        </h2>
      </div>
      
      <div className="flex gap-7 overflow-x-auto">
        {fabricItems.map((item) => (
          <div
            key={item.id}
            className="w-[239px] h-[297px] relative border-none bg-white rounded-lg shadow-sm flex-shrink-0"
          >
            <div
              className="w-full h-[200px] bg-cover bg-center relative rounded-t-lg"
              style={{ backgroundImage: `url(${item.image})` }}
            >
              <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                <HeartIcon className="w-4 h-4 text-gray-700" />
              </button>
            </div>

            <div className="p-3 flex flex-col justify-between h-[97px]">
              <div>
                <div className="font-bold font-['Urbanist',Helvetica] text-[#2d2d2d] text-[15px] leading-[15px] mb-2">
                  {item.name}
                </div>
                
                <div className="flex items-center mb-2">
                  <img
                    className="w-4 h-4"
                    alt="Currency naira NGN"
                    src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/currency-naira--ngn-.svg"
                  />
                  <span className="ml-1 font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-base leading-[16px]">
                    {item.price}
                  </span>
                  <span className="ml-2 font-['Urbanist',Helvetica] font-medium text-xs leading-3 text-black">
                    Per Yard
                  </span>
                </div>

                <div className="flex items-center justify-end">
                  <div className="flex items-center">
                    <StarIcon className="w-[11px] h-[9px] text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-['Urbanist',Helvetica] font-normal text-[#2d2d2d] text-sm leading-[14px]">
                      {item.rating}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(item)}
                className="w-full h-[43px] mt-2 rounded-md bg-[#d8dfe9] hover:bg-[#c8d0da] font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-base transition-colors"
              >
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PopularFabricsSection;