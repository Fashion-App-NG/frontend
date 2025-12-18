import { useCart } from '../../../../contexts/CartContext';

export const PopularFabricsSection = () => {
  const { addToCart, error } = useCart();

  // ✅ FIXED: 4 fabrics to match DiscoverSection exactly
  const fabrics = [
    {
      id: 1,
      name: "Guinea Fabric",
      price: "80,000",
      rating: "4.9",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-1.png",
    },
    {
      id: 2,
      name: "Ankara Fabric", 
      price: "75,000",
      rating: "4.7",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group.png",
    },
    {
      id: 3,
      name: "Adire Fabric", 
      price: "65,000",
      rating: "4.8",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-4.png",
    },
    {
      id: 4,
      name: "Kente Fabric", 
      price: "95,000",
      rating: "4.9",
      image: "https://c.animaapp.com/mbr2jpx2DSKBSz/img/mask-group-5.png",
    }
  ];

  const handleAddToCart = (fabric) => {
    addToCart({
      id: fabric.id,
      name: fabric.name,
      price: parseFloat(fabric.price.replace(',', '')),
      image: fabric.image,
      quantity: 1
    });
  };

  return (
    <section className="w-full">
      {error && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
          {error}
        </div>
      )}
      {/* ✅ FIXED: Use Popular Fabrics font style for heading */}
      <div className="mb-6">
        <h2 className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-2xl">
          Popular Fabrics
        </h2>
      </div>

      {/* ✅ FIXED: 4-column grid to match DiscoverSection exactly */}
      <div className="grid grid-cols-4 gap-6">
        {fabrics.map((fabric) => (
          <div
            key={fabric.id}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            {/* ✅ FIXED: Exact image container sizing */}
            <div className="aspect-square overflow-hidden">
              <img
                src={fabric.image}
                alt={fabric.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* ✅ FIXED: Exact card content height and Popular Fabrics font styling */}
            <div className="p-4">
              <h3 className="font-['Urbanist',Helvetica] font-semibold text-[#2d2d2d] text-lg mb-2">
                {fabric.name}
              </h3>
              
              <div className="flex items-center justify-between mb-3">
                <span className="font-['Urbanist',Helvetica] font-bold text-[#2d2d2d] text-xl">
                  ₦{fabric.price}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="font-['Urbanist',Helvetica] font-medium text-[#6b7280] text-sm">
                    {fabric.rating}
                  </span>
                </div>
              </div>

              {/* ✅ FIXED: Exact button styling to match DiscoverSection */}
              <button
                onClick={() => handleAddToCart(fabric)}
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

export default PopularFabricsSection;