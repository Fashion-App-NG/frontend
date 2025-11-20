export const VendorTermsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Vendor Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Enrollment & Onboarding</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Vendors register on our platform by completing a vendor profile and providing identity or business documentation for verification.</li>
              <li>Vendor listings are free; there is no listing fee.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Product Listings & Compliance</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Vendors are solely responsible for the accuracy of their product details (name, description, images, price).</li>
              <li>All products listed must be genuine, lawful, and compliant with our Acceptable Use Policy.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Payments & Commission</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>We use a payment-splitting system: when a customer pays, funds are distributed between the vendor and our platform according to our commission model.</li>
              <li>Vendors must provide valid payout details (bank account, mobile money, etc.) for fund disbursement.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Order Fulfillment & Logistics</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Our logistics partner, Terminal, handles all shipping and delivery. Vendors do not manage logistics.</li>
              <li>Vendors must provide confirmation when items are ready for pickup and cooperate with Terminal for handover.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Customer Support & Disputes</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>We handle customer complaints, disputes, and refund requests centrally.</li>
              <li>Vendors are expected to assist when contacted, especially for product-specific issues.</li>
              <li>Repeat customer complaints may lead to review, suspension, or removal from our platform.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Returns & Refunds</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>We manage returns and refunds under our Return & Refund Policy.</li>
              <li>Refunds are issued via our payment provider's refund mechanisms, and vendors will participate in refunds per our agreement.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Termination</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>We reserve the right to terminate a vendor's account for breach of these terms or repeated policy violations.</li>
              <li>Vendors may terminate their account when there are no pending orders or payouts.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Data Use & Privacy</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>Vendors consent to our collection and use of their business and payment data to deliver the service (e.g., payouts, fraud checks).</li>
              <li>We will not share sensitive data outside our platform beyond operational necessity.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Modifications</h2>
            <p className="text-gray-700 mb-4">
              We may update these Terms. We will notify vendors of major changes.
              Continued use of the platform after such updates indicates acceptance of the new terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorTermsPage;