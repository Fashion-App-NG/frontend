import { useState } from 'react';
import { toast } from 'react-toastify';
import productService from '../../services/productService';

// Vendor-configurable selling units (Pack, Bundle, Roll, etc.) for a
// single product. Deliberately plain-styled — not reskinned to match
// either VendorProductUploadContent's bespoke design system or
// VendorProductEditPage's own Tailwind boxes, since it's shared verbatim
// between the two rather than duplicated. See conversation notes for why.
//
// An offering's yardsPerUnit/pricePerUnit are immutable once created — no
// edit exists here, deliberately. A vendor corrects a mistake by
// deactivating the old one and adding a new one, protecting any cart/order
// that already references the original.
const SellingUnitsSection = ({ productId, offerings = [], onOfferingsChange }) => {
  const [label, setLabel] = useState('');
  const [yardsPerUnit, setYardsPerUnit] = useState('');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const activeOfferings = offerings.filter((o) => o.status === 'active');
  const inactiveOfferings = offerings.filter((o) => o.status !== 'active');

  const handleAdd = async () => {
    if (!label.trim()) {
      toast.warning('Please enter a label for this unit');
      return;
    }
    const yards = parseFloat(yardsPerUnit);
    if (isNaN(yards) || yards <= 0) {
      toast.warning('Please enter a valid number of yards');
      return;
    }
    if (Math.round(yards * 100) !== yards * 100) {
      toast.warning('Yards can have at most 2 decimal places');
      return;
    }
    const price = parseFloat(pricePerUnit);
    if (isNaN(price) || price <= 0) {
      toast.warning('Please enter a valid price');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await productService.addSellingUnit(productId, {
        label: label.trim(),
        yardsPerUnit: yards,
        pricePerUnit: price,
      });
      onOfferingsChange(result.sellingUnitOfferings);
      setLabel('');
      setYardsPerUnit('');
      setPricePerUnit('');
      toast.success(`"${label.trim()}" added`);
    } catch (error) {
      toast.error(error.message || 'Failed to add selling unit');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (offering) => {
    if (!window.confirm(`Deactivate "${offering.label}"? Shoppers will no longer be able to buy this product as a ${offering.label}.`)) {
      return;
    }
    setDeactivatingId(offering._id);
    try {
      const result = await productService.deactivateSellingUnit(productId, offering._id);
      onOfferingsChange(result.sellingUnitOfferings);
      toast.success(`"${offering.label}" deactivated`);
    } catch (error) {
      toast.error(error.message || 'Failed to deactivate selling unit');
    } finally {
      setDeactivatingId(null);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Selling units</h3>
        <p className="text-sm text-gray-500 mt-1">
          Optional extra ways to buy this product, in addition to plain yards — e.g. a Pack of 5 yards, a Bundle of 10.
        </p>
      </div>

      {activeOfferings.length > 0 && (
        <div className="space-y-2">
          {activeOfferings.map((offering) => (
            <div
              key={offering._id}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200"
            >
              <span className="text-sm text-gray-900">
                {offering.label} &middot; {offering.yardsPerUnit} yds &middot; &#8358;{offering.pricePerUnit.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => handleDeactivate(offering)}
                disabled={deactivatingId === offering._id}
                className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deactivatingId === offering._id ? 'Deactivating…' : 'Deactivate'}
              </button>
            </div>
          ))}
        </div>
      )}

      {inactiveOfferings.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Deactivated</p>
          {inactiveOfferings.map((offering) => (
            <div
              key={offering._id}
              className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 opacity-50"
            >
              <span className="text-sm text-gray-600">
                {offering.label} &middot; {offering.yardsPerUnit} yds &middot; &#8358;{offering.pricePerUnit.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Add a new unit</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Label (e.g. Pack)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength={30}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Yards"
            value={yardsPerUnit}
            onChange={(e) => setYardsPerUnit(e.target.value)}
            min="0.01"
            step="0.01"
            className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <input
            type="number"
            placeholder="Price (₦)"
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
            min="0.01"
            step="0.01"
            className="w-full sm:w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSubmitting ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellingUnitsSection;
