import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout';
import { ErrorBoundary, NetworkStatus, ToastWrapper, AccessibilityProvider, SkipLink } from './components/ui';
import { MetaTags, WebAppStructuredData, OrganizationStructuredData } from './components/seo';
import CreatePage from './pages/CreatePage';
import ResultsPage from './pages/ResultsPage';
import TestPage from './pages/TestPage';

function App() {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <AccessibilityProvider>
          <ToastProvider>
            <AppProvider>
              <Router>
                <NetworkStatus />
                <SkipLink targetId="main-content">Skip to main content</SkipLink>
                <MetaTags />
                <WebAppStructuredData />
                <OrganizationStructuredData />
                <Layout>
                  <main id="main-content" tabIndex={-1}>
                    <Routes>
                      <Route path="/" element={<CreatePage />} />
                      <Route path="/results" element={<ResultsPage />} />
                      <Route path="/test" element={<TestPage />} />
                    </Routes>
                  </main>
                </Layout>
                <ToastWrapper />
              </Router>
            </AppProvider>
          </ToastProvider>
        </AccessibilityProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
