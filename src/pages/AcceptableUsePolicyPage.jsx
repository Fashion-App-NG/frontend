export const AcceptableUsePolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Acceptable Use Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Purpose</h2>
            <p className="text-gray-700 mb-4">
              This Acceptable Use Policy ("AUP") applies to all users of our platform, including shoppers and vendors. 
              By using our platform, you agree to follow this AUP.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Prohibited Activities</h2>
            <p className="text-gray-700 mb-4">You must not use our platform to:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>List or sell counterfeit, illegal, stolen, or unauthorized goods.</li>
              <li>Engage in fraud, money laundering, or any illicit financial schemes.</li>
              <li>Transmit unsolicited commercial communications ("spam") using our messaging or email systems.</li>
              <li>Share or upload pornographic, harassing, defamatory, or unlawful content.</li>
              <li>Attempt to harm the security or performance of our platform (e.g., hacking, distributing malware).</li>
              <li>Scrape, reverse-engineer, or systematically crawl our platform in ways that violate our terms.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Account Security</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>You are responsible for safeguarding your login credentials.</li>
              <li>Any actions taken using your account are your responsibility.</li>
              <li>You must notify us immediately if you suspect unauthorized use of your account.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Compliance</h2>
            <p className="text-gray-700 mb-4">
              Vendors must comply with all relevant laws and regulations and accurately represent their business and identity.
              You may not misrepresent your identity or business registration information.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Enforcement</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
              <li>We may suspend or terminate your access, delete content, or take other actions if you violate this policy.</li>
              <li>We may cooperate with law enforcement when necessary.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Modifications</h2>
            <p className="text-gray-700 mb-4">
              We may update this AUP from time to time. We will notify users of major changes via email or in-app messaging.
              Continuing to use the platform after updates means you accept the new policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptableUsePolicyPage;