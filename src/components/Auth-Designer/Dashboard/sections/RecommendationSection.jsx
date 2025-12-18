// NEW FILE: src/components/Auth-Designer/Dashboard/sections/RecommendationSection.jsx
import { useCart } from '../../../../contexts/CartContext';

export const RecommendationSection = () => {
  const { addToCart } = useCart();

  // ✅ Product recommendations data
  const products = [
    {
      id: 5,
      name: "Silk Blouse",
      price: "45,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group.png",
    },
    {
      id: 6,
      name: "Cotton Dress",
      price: "32,000", 
      rating: "4.6",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-1.png",
    },
    {
      id: 7,
      name: "Denim Jacket",
      price: "28,000",
      rating: "4.7", 
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-2.png",
    },
    {
      id: 8,
      name: "Linen Pants",
      price: "35,000",
      rating: "4.5",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-3.png",
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
    <section className="w-full">
      {/* ✅ FIXED: Correct title matching the display */}
      <div className="mb-6">
        <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-2xl">
          Recommendations
        </h2>
      </div>

      {/* ✅ 4-column grid to match Popular Fabrics exactly */}
      <div className="grid grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* Product Image */}
            <div className="aspect-square overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-lg mb-2">
                {product.name}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-xl">
                  ₦{product.price}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-['Urbanist',Helvetica] font-medium text-[#6b7280] text-sm">
                    {product.rating}
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(product)}
                className="w-full bg-[#2d2d2d] text-white py-2.5 rounded-lg font-['Urbanist',Helvetica] font-medium text-sm hover:bg-[#1f1f1f] transition-colors duration-200"
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

export default RecommendationSection;