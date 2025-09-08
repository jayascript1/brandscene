import React, { useCallback } from 'react';
import { useForm } from '../../hooks/useForm';

interface BrandInfoFormProps {
  className?: string;
}

const BrandInfoForm: React.FC<BrandInfoFormProps> = ({ className = '' }) => {
  const { formData, updateBrandInfo, errors } = useForm();

  const handleInputChange = useCallback((field: string, value: string) => {
    updateBrandInfo({ [field]: value });
  }, [updateBrandInfo]);

  const getFieldError = (field: string) => {
    return errors[field];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div>
        <label htmlFor="image-dimensions" className="block text-white font-medium mb-2">
          Image Dimensions <span className="text-red-400">*</span>
        </label>
        <select
          id="image-dimensions"
          value={formData.brandInfo.imageDimensions}
          onChange={(e) => handleInputChange('imageDimensions', e.target.value)}
          className={`input-field w-full px-4 py-3 text-base ${getFieldError('imageDimensions') ? 'border-red-500 focus:ring-red-500' : 'border-dark-600 focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg transition-colors`}
          aria-describedby={getFieldError('imageDimensions') ? 'image-dimensions-error' : 'image-dimensions-help'}
          aria-invalid={!!getFieldError('imageDimensions')}
        >
          <option value="square">Square (1:1)</option>
          <option value="portrait">Portrait (9:16)</option>
          <option value="landscape">Landscape (16:9)</option>
        </select>
        {getFieldError('imageDimensions') && (
          <p id="image-dimensions-error" className="text-red-400 text-sm mt-1" role="alert">
            {getFieldError('imageDimensions')}
          </p>
        )}
        <p id="image-dimensions-help" className="text-dark-400 text-sm mt-1">
          Choose the aspect ratio for your generated images
        </p>
      </div>

      <div>
        <label htmlFor="brand-name" className="block text-white font-medium mb-2">
          Brand Name <span className="text-dark-400 text-sm">(optional)</span>
        </label>
        <input
          id="brand-name"
          type="text"
          value={formData.brandInfo.brandName}
          onChange={(e) => handleInputChange('brandName', e.target.value)}
          placeholder="e.g., AquaWorks"
          className={`input-field w-full px-4 py-3 text-base ${getFieldError('brandName') ? 'border-red-500 focus:ring-red-500' : 'border-dark-600 focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg transition-colors`}
          aria-describedby={getFieldError('brandName') ? 'brand-name-error' : 'brand-name-help'}
          aria-invalid={!!getFieldError('brandName')}
        />
        {getFieldError('brandName') && (
          <p id="brand-name-error" className="text-red-400 text-sm mt-1" role="alert">
            {getFieldError('brandName')}
          </p>
        )}
        <p id="brand-name-help" className="text-dark-400 text-sm mt-1 sr-only">
          Enter your brand name to help generate more personalized scenes
        </p>
      </div>
      
      <div>
        <label htmlFor="product-name" className="block text-white font-medium mb-2">
          Product Name <span className="text-dark-400 text-sm">(optional)</span>
        </label>
        <input
          id="product-name"
          type="text"
          value={formData.brandInfo.productName}
          onChange={(e) => handleInputChange('productName', e.target.value)}
          placeholder="e.g., Horizon Bottle"
          className={`input-field w-full px-4 py-3 text-base ${getFieldError('productName') ? 'border-red-500 focus:ring-red-500' : 'border-dark-600 focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg transition-colors`}
          aria-describedby={getFieldError('productName') ? 'product-name-error' : 'product-name-help'}
          aria-invalid={!!getFieldError('productName')}
        />
        {getFieldError('productName') && (
          <p id="product-name-error" className="text-red-400 text-sm mt-1" role="alert">
            {getFieldError('productName')}
          </p>
        )}
        <p id="product-name-help" className="text-dark-400 text-sm mt-1 sr-only">
          Enter the name of your product to help generate more relevant scenes
        </p>
      </div>
      
      <div>
        <label htmlFor="product-description" className="block text-white font-medium mb-2">
          What is your product? <span className="text-dark-400 text-sm">(optional)</span>
        </label>
        <textarea
          id="product-description"
          value={formData.brandInfo.productDescription}
          onChange={(e) => handleInputChange('productDescription', e.target.value)}
          placeholder="e.g., A sleek water bottle made from recycled stainless steel with a bamboo cap"
          className={`input-field w-full h-20 px-4 py-3 text-base resize-none ${getFieldError('productDescription') ? 'border-red-500 focus:ring-red-500' : 'border-dark-600 focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg transition-colors`}
          aria-describedby={getFieldError('productDescription') ? 'product-description-error' : 'product-description-help'}
          aria-invalid={!!getFieldError('productDescription')}
        />
        {getFieldError('productDescription') && (
          <p id="product-description-error" className="text-red-400 text-sm mt-1" role="alert">
            {getFieldError('productDescription')}
          </p>
        )}
        <p id="product-description-help" className="text-dark-400 text-sm mt-1">
          Describe what kind of item your product is to help preserve its design and structural integrity
        </p>
      </div>
      
      <div>
        <label htmlFor="brand-values" className="block text-white font-medium mb-2">
          Brand Values <span className="text-dark-400 text-sm">(optional)</span>
        </label>
        <textarea
          id="brand-values"
          value={formData.brandInfo.brandValues}
          onChange={(e) => handleInputChange('brandValues', e.target.value)}
          placeholder="e.g., sustainable, adventurous, minimalist"
          className={`input-field w-full h-24 sm:h-28 px-4 py-3 text-base resize-none ${getFieldError('brandValues') ? 'border-red-500 focus:ring-red-500' : 'border-dark-600 focus:ring-primary-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-dark-900 rounded-lg transition-colors`}
          aria-describedby={getFieldError('brandValues') ? 'brand-values-error' : 'brand-values-help'}
          aria-invalid={!!getFieldError('brandValues')}
        />
        {getFieldError('brandValues') && (
          <p id="brand-values-error" className="text-red-400 text-sm mt-1" role="alert">
            {getFieldError('brandValues')}
          </p>
        )}
        <p id="brand-values-help" className="text-dark-400 text-sm mt-1">
          Enter comma-separated values that describe your brand's personality and values
        </p>
      </div>
    </div>
  );
};

export default BrandInfoForm;
