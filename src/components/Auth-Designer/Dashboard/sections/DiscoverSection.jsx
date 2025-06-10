import React from 'react';
import { HeartIcon } from 'lucide-react';
import { useCart } from '../../../../contexts/CartContext';

export const DiscoverSection = () => {
  const { addToCart } = useCart();

  const products = [
    {
      id: 5,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group.png",
      buttonStyle: "primary",
    },
    {
      id: 6,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-1.png",
      buttonStyle: "secondary",
    },
    {
      id: 7,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-2.png",
      buttonStyle: "secondary",
    },
    {
      id: 8,
      name: "Adire Fabric",
      price: "100,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-3.png",
      buttonStyle: "secondary",
    },
  ];

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace(',', '')),
      image: product.image,
      quantity: 1
    });
  };

  return (
    <section className="w-full py-8">
      <div className="mb-6">
        <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-2xl">
          Recommendation
        </h2>
      </div>
      
      <div className="grid grid-cols-4 gap-7">
        {products.map((product) => (
          <div key={product.id} className="w-full border-none bg-white rounded-lg shadow-sm">
            <div className="p-0">
              <div className="relative">
                <div
                  className="h-[198px] w-full bg-cover bg-center rounded-t-lg relative"
                  style={{ backgroundImage: `url(${product.image})` }}
                >
                  <button className="absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-white transition-colors">
                    <HeartIcon className="w-3 h-4 text-gray-700" />
                  </button>
                </div>

                <div className="p-3">
                  <div className="mt-2">
                    <p className="font-['Urbanist'] font-medium text-[15px] leading-[15px] text-[#2d2d2d] mb-2">
                      {product.name}
                    </p>

                    <div className="flex items-center mt-2 mb-2">
                      <img
                        className="w-4 h-4"
                        alt="Currency naira NGN"
                        src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/currency-naira--ngn-.svg"
                      />
                      <span className="font-['Urbanist'] font-bold text-base leading-4 text-[#2d2d2d] ml-1">
                        {product.price}
                      </span>
                      <span className="font-['Urbanist'] font-medium text-xs leading-3 text-black ml-2">
                        Per Yard
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end mt-2 mb-3">
                    <div className="flex">
                      {[1, 2, 3, 4].map((star) => (
                        <img
                          key={star}
                          className="w-[11px] h-[9px]"
                          alt="Star"
                          src="https://c.animaapp.com/mbr2jpx2DSKBSz/img/vector.svg"
                        />
                      ))}
                    </div>
                    <span className="font-['Urbanist'] font-normal text-sm leading-[14px] text-[#2d2d2d] ml-1">
                      {product.rating}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className={`w-full h-[43px] rounded-md transition-colors ${
                      product.buttonStyle === "primary"
                        ? "bg-[#303030] text-[#edff8c] hover:bg-[#404040]"
                        : "bg-[#d8dfe9] text-[#2d2d2d] hover:bg-[#c8d0da]"
                    }`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DiscoverSection;