export const ReturnRefundPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Return & Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Returns Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Customers may request a return within 14 days of delivery, as long as the item is unused, in its original packaging, and in the condition it was received.</li>
              <li>To request a return, customers must contact our customer support team with their order number, reason for return, and, if applicable, photos of the item.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Non-Returnable Items</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Custom-made or bespoke items are not eligible for return unless they are defective.</li>
              <li>Items that naturally degrade quickly or are sensitive for hygiene reasons may also be excluded, depending on the product.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Return Shipping Costs</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Unless the return is due to an error on our part (e.g., damaged or incorrect item), customers are responsible for the return shipping costs.</li>
              <li>We recommend using a trackable and insured shipping method, as we are not liable for items lost in transit.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Refund Processing</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>After we receive and inspect a returned item, we will process a refund to the original payment method.</li>
              <li>Refunds are typically issued within 7–14 business days after we confirm the return and condition.</li>
              <li>Shipping costs may be excluded from refunds if initially charged, unless otherwise stated.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Cancellations</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Orders can be canceled for a full refund if they have not yet been dispatched.</li>
              <li>Once an order has shipped, the normal returns process applies.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Refunds for Defective or Incorrect Items</h2>
            <p className="text-gray-700 mb-4">
              If an item is defective, damaged, or not as described, we will issue a full refund, including original shipping costs when applicable.
              For returns initiated for valid reasons, we may also support exchanges based on availability.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Dispute Resolution</h2>
            <p className="text-gray-700 mb-4">
              If there is a disagreement about returns or refunds, customers should contact our support team to resolve the issue. 
              We will work to mediate fairly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReturnRefundPolicyPage;