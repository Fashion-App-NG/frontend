import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Fashion Culture</h3>
            <p className="text-gray-400 text-sm">
              Your premier destination for fashion discovery and shopping.
            </p>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/refunds" className="text-gray-400 hover:text-white text-sm">
                  Returns & Refunds
                </Link>
              </li>
              <li>
                <Link to="/acceptable-use" className="text-gray-400 hover:text-white text-sm">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Vendor Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Vendors</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/vendor-terms" className="text-gray-400 hover:text-white text-sm">
                  Vendor Terms
                </Link>
              </li>
              <li>
                <Link to="/register/vendor" className="text-gray-400 hover:text-white text-sm">
                  Become a Vendor
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>legal@faari.app</li>
              <li>privacy@faari.app</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Fáàrí. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;