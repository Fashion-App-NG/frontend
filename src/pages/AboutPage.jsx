export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">About Faari</h1>

          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 mb-4">
              Faari is a fashion marketplace product built and operated by Solution Synthesis Ltd (SoluSis), a company registered in Nigeria.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-6 mb-4">Contact</h2>
            <p className="text-gray-700 mb-4">
              2, Olayiwola Street, Oregun, Lagos, Nigeria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
