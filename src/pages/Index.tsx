import React from "react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Simple Hero Section */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="text-center">
            <span className="inline-block px-4 py-1.5 bg-pink-100 text-pink-800 rounded-full text-sm font-medium mb-6">
              Handcrafted with love
            </span>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Uniquely Crafted <br className="hidden md:block" />
              <span className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
                Accessories
              </span>{" "}
              <br className="hidden md:block" />
              For Your Style
            </h1>

            <p className="text-lg text-gray-600 mb-8 max-w-xl mx-auto">
              Discover our collection of handmade knotted bands, keychains, and
              accessories that blend craftsmanship with pop culture inspiration.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-medium">
                Shop Collection
              </button>
              <button className="border border-pink-300 text-purple-600 hover:bg-pink-50 px-8 py-3 rounded-lg font-medium">
                Customize Your Own
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose WollyWay?
            </h2>
            <p className="text-lg text-gray-600">
              Handcrafted quality meets modern design
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Handcrafted</h3>
              <p className="text-gray-600">
                Each piece is carefully made by hand with attention to detail
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Unique Design</h3>
              <p className="text-gray-600">
                Pop culture inspired designs that stand out from the crowd
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Perfect Gift</h3>
              <p className="text-gray-600">
                Thoughtful presents for friends, family, or yourself
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-4">WollyWay</h3>
          <p className="text-gray-400 mb-6">
            Handcrafted accessories for the modern individual
          </p>
          <p className="text-sm text-gray-500">
            © 2024 WollyWay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
