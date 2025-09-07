import React from 'react';
import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  type: 'WebApplication' | 'Organization' | 'Product' | 'Article';
  data: Record<string, any>;
}

const StructuredData: React.FC<StructuredDataProps> = ({ type, data }) => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

// Predefined structured data components
export const WebAppStructuredData: React.FC = () => (
  <StructuredData
    type="WebApplication"
    data={{
      name: 'BrandScene',
      description: 'AI-Powered Brand Ad Scene Generator',
      url: 'https://brandscene.app',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      author: {
        '@type': 'Organization',
        name: 'BrandScene'
      },
      screenshot: 'https://brandscene.app/screenshot.png',
      softwareVersion: '1.0.0'
    }}
  />
);

export const OrganizationStructuredData: React.FC = () => (
  <StructuredData
    type="Organization"
    data={{
      name: 'BrandScene',
      description: 'AI-Powered Brand Ad Scene Generator',
      url: 'https://brandscene.app',
      logo: 'https://brandscene.app/logo.png',
      sameAs: [
        'https://twitter.com/brandscene',
        'https://linkedin.com/company/brandscene'
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        email: 'support@brandscene.app'
      }
    }}
  />
);

export default StructuredData;
