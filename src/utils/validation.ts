import { FileValidationResult, ValidationError } from '../types';

export const validateFile = (file: File): FileValidationResult => {
  const errors: string[] = [];
  const maxSize = 15 * 1024 * 1024; // 15MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  // Check file size
  if (file.size > maxSize) {
    errors.push('File size must be less than 15MB');
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    errors.push('File must be a JPEG, PNG, or WebP image');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateBrandInfo = (brandInfo: {
  brandName: string;
  productName: string;
  productDescription: string;
  brandValues: string;
  imageDimensions: string;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Image dimensions validation (required)
  if (!brandInfo.imageDimensions || brandInfo.imageDimensions === '') {
    errors.push({
      field: 'imageDimensions',
      message: 'Please select image dimensions'
    });
  }

  // Brand name validation (optional but if provided, should be valid)
  if (brandInfo.brandName.trim() && brandInfo.brandName.length < 2) {
    errors.push({
      field: 'brandName',
      message: 'Brand name must be at least 2 characters long'
    });
  }

  // Product name validation (optional but if provided, should be valid)
  if (brandInfo.productName.trim() && brandInfo.productName.length < 2) {
    errors.push({
      field: 'productName',
      message: 'Product name must be at least 2 characters long'
    });
  }

  // Product description validation (optional but if provided, should be valid)
  if (brandInfo.productDescription.trim() && brandInfo.productDescription.length < 10) {
    errors.push({
      field: 'productDescription',
      message: 'Product description must be at least 10 characters long'
    });
  }

  // Brand values validation (optional but if provided, should be valid)
  if (brandInfo.brandValues.trim()) {
    const values = brandInfo.brandValues.split(',').map(v => v.trim()).filter(v => v);
    if (values.length === 0) {
      errors.push({
        field: 'brandValues',
        message: 'Please provide at least one brand value'
      });
    }
    
    if (values.some(v => v.length < 2)) {
      errors.push({
        field: 'brandValues',
        message: 'Each brand value must be at least 2 characters long'
      });
    }
  }

  return errors;
};

export const validateForm = (formData: {
  brandInfo: {
    brandName: string;
    productName: string;
    productDescription: string;
    brandValues: string;
    imageDimensions: string;
  };
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Add brand info validation
  errors.push(...validateBrandInfo(formData.brandInfo));

  return errors;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = URL.createObjectURL(file);
  });
};
