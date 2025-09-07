import React, { useState } from 'react';

interface AccessibilityTestProps {
  className?: string;
}

const AccessibilityTest: React.FC<AccessibilityTestProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState('keyboard');
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});

  const runAccessibilityTests = () => {
    const results: Record<string, boolean> = {};

    // Test 1: Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    results.headingStructure = headings.length > 0;

    // Test 2: Check for proper form labels
    const inputs = document.querySelectorAll('input, textarea, select');
    const labeledInputs = Array.from(inputs).filter(input => {
      const id = input.getAttribute('id');
      return id && document.querySelector(`label[for="${id}"]`);
    });
    results.formLabels = labeledInputs.length === inputs.length;

    // Test 3: Check for ARIA attributes
    const elementsWithAria = document.querySelectorAll('[aria-label], [aria-describedby], [aria-labelledby]');
    results.ariaAttributes = elementsWithAria.length > 0;

    // Test 4: Check for focus indicators
    const focusableElements = document.querySelectorAll('button, a, input, textarea, select, [tabindex]');
    const hasFocusStyles = Array.from(focusableElements).some(el => {
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.boxShadow !== 'none';
    });
    results.focusIndicators = hasFocusStyles;

    // Test 5: Check for alt text on images
    const images = document.querySelectorAll('img');
    const imagesWithAlt = Array.from(images).filter(img => img.hasAttribute('alt'));
    results.imageAltText = imagesWithAlt.length === images.length;

    setTestResults(results);
  };

  const testItems = [
    { id: 'keyboard', label: 'Keyboard Navigation', icon: '⌨️' },
    { id: 'screenreader', label: 'Screen Reader', icon: '🔊' },
    { id: 'responsive', label: 'Responsive Design', icon: '📱' },
    { id: 'contrast', label: 'Color Contrast', icon: '🎨' },
    { id: 'semantic', label: 'Semantic HTML', icon: '🏷️' }
  ];

  return (
    <div className={`bg-dark-800 rounded-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-white mb-6">Accessibility Testing</h2>
      
      {/* Test Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {testItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === item.id
                ? 'bg-primary-600 text-white'
                : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
            }`}
            aria-label={`Switch to ${item.label} testing`}
          >
            <span className="mr-2">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </div>

      {/* Test Content */}
      <div className="space-y-6">
        {activeTab === 'keyboard' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Keyboard Navigation Test</h3>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Test Instructions:</h4>
                <ul className="text-dark-300 text-sm space-y-1">
                  <li>• Use Tab to navigate through interactive elements</li>
                  <li>• Use Arrow keys to navigate carousel (if available)</li>
                  <li>• Use Enter/Space to activate buttons</li>
                  <li>• Use Escape to close modals or menus</li>
                </ul>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Focus Management:</h4>
                <div className="text-dark-300 text-sm">
                  <p>Current focus should be visible with a clear outline or highlight.</p>
                  <button 
                    className="mt-2 px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => document.getElementById('main-content')?.focus()}
                  >
                    Test Focus Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'screenreader' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Screen Reader Test</h3>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">ARIA Landmarks:</h4>
                <ul className="text-dark-300 text-sm space-y-1">
                  <li>• <code>role="banner"</code> for header</li>
                  <li>• <code>role="navigation"</code> for navigation</li>
                  <li>• <code>role="main"</code> for main content</li>
                  <li>• <code>role="region"</code> for carousel</li>
                </ul>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Live Regions:</h4>
                <div className="text-dark-300 text-sm">
                  <p>Dynamic content should be announced to screen readers.</p>
                  <button 
                    className="mt-2 px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                    onClick={() => {
                      const announcement = document.createElement('div');
                      announcement.setAttribute('aria-live', 'polite');
                      announcement.className = 'sr-only';
                      announcement.textContent = 'Test announcement for screen readers';
                      document.body.appendChild(announcement);
                      setTimeout(() => document.body.removeChild(announcement), 1000);
                    }}
                  >
                    Test Announcement
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'responsive' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Responsive Design Test</h3>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Breakpoint Testing:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-dark-600 p-2 rounded text-center">
                    <div className="font-medium">Mobile</div>
                    <div className="text-dark-400">&lt; 640px</div>
                  </div>
                  <div className="bg-dark-600 p-2 rounded text-center">
                    <div className="font-medium">Tablet</div>
                    <div className="text-dark-400">640px - 1024px</div>
                  </div>
                  <div className="bg-dark-600 p-2 rounded text-center">
                    <div className="font-medium">Desktop</div>
                    <div className="text-dark-400">1024px - 1280px</div>
                  </div>
                  <div className="bg-dark-600 p-2 rounded text-center">
                    <div className="font-medium">Large</div>
                    <div className="text-dark-400">&gt; 1280px</div>
                  </div>
                </div>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Current Viewport:</h4>
                <p className="text-dark-300 text-sm">
                  Width: <span className="text-white">{window.innerWidth}px</span> | 
                  Height: <span className="text-white">{window.innerHeight}px</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'contrast' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Color Contrast Test</h3>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Color Combinations:</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-500 rounded"></div>
                    <span className="text-dark-300 text-sm">Primary on Dark</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white rounded"></div>
                    <span className="text-dark-300 text-sm">White on Dark</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-dark-300 rounded"></div>
                    <span className="text-dark-300 text-sm">Light Gray on Dark</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'semantic' && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Semantic HTML Test</h3>
            <div className="space-y-4">
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">HTML Structure:</h4>
                <ul className="text-dark-300 text-sm space-y-1">
                  <li>• Proper heading hierarchy (h1 → h2 → h3)</li>
                  <li>• Semantic elements (main, section, article, nav)</li>
                  <li>• Form elements with proper labels</li>
                  <li>• Button elements for interactive actions</li>
                  <li>• Alt text for images</li>
                </ul>
              </div>
              <div className="bg-dark-700 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">Quick Test:</h4>
                <button 
                  className="px-3 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700"
                  onClick={runAccessibilityTests}
                >
                  Run Semantic Tests
                </button>
                {Object.keys(testResults).length > 0 && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(testResults).map(([test, passed]) => (
                      <div key={test} className="flex items-center space-x-2">
                        <span className={passed ? 'text-green-400' : 'text-red-400'}>
                          {passed ? '✓' : '✗'}
                        </span>
                        <span className="text-dark-300 text-sm capitalize">
                          {test.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessibilityTest;
