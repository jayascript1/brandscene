import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';

const Header: React.FC = () => {
  const { state } = useAppContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeMobileMenu();
    }
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700" role="banner">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <h1 className="text-xl sm:text-2xl font-bold text-primary-500">
              <a href="/" className="hover:text-primary-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded">
                BrandScene
              </a>
            </h1>
            <span className="text-xs sm:text-sm text-dark-400 hidden sm:block">
              AI-Powered Brand Ad Scene Generator
            </span>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6" role="navigation" aria-label="Main navigation">
            <a 
              href="/" 
              className="text-dark-300 hover:text-primary-500 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded px-2 py-1"
              aria-current={state.currentPage === 'create' ? 'page' : undefined}
            >
              Create
            </a>
            <a 
              href="/results" 
              className="text-dark-300 hover:text-primary-500 transition-colors duration-200 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded px-2 py-1"
              aria-current={state.currentPage === 'results' ? 'page' : undefined}
            >
              Results
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-dark-300 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 rounded"
            onClick={toggleMobileMenu}
            onKeyDown={handleKeyDown}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label="Toggle mobile menu"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <nav 
            id="mobile-menu"
            className="md:hidden mt-4 pb-4 border-t border-dark-700"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col space-y-2 pt-4">
              <a 
                href="/" 
                className="text-dark-300 hover:text-primary-500 transition-colors duration-200 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                onClick={closeMobileMenu}
                aria-current={state.currentPage === 'create' ? 'page' : undefined}
              >
                Create
              </a>
              <a 
                href="/results" 
                className="text-dark-300 hover:text-primary-500 transition-colors duration-200 font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800"
                onClick={closeMobileMenu}
                aria-current={state.currentPage === 'results' ? 'page' : undefined}
              >
                Results
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
