# BrandScene - AI-Powered Brand Ad Scene Generator

A modern web application that generates AI-powered advertising scenes for brands using OpenAI's DALL-E 3 API.

## 🚀 Features

- **AI Image Generation**: Create 4 unique brand scenes using OpenAI DALL-E 3
- **3D Interactive Carousel**: Swipe through generated scenes in a dynamic 3D environment
- **Smart Form Validation**: Real-time validation with user-friendly error messages
- **Responsive Design**: Works seamlessly across all devices
- **Error Handling**: Comprehensive error handling with retry mechanisms
- **Performance Optimized**: Fast loading with code splitting and lazy loading
- **Toast Notifications**: Real-time feedback for user actions
- **Network Monitoring**: Automatic detection of connectivity issues

## 🛠 Tech Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **AI Integration**: OpenAI DALL-E 3 API

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd BrandScene
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Add your OpenAI API key to .env
VITE_OPENAI_API_KEY=your_api_key_here
```

4. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENAI_API_KEY=your_openai_api_key_here
VITE_APP_NAME=BrandScene
```

### OpenAI API Setup

1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add the key to your `.env` file
3. The app will validate the key on startup

## 🎯 Usage

1. **Upload Product Image**: Drag and drop or select an image of your product/logo
2. **Add Brand Information**: Enter product name, brand name, and brand values
3. **Generate Scenes**: Click "Generate 4 Scenes" to create AI-powered ad mockups
4. **Explore Results**: Swipe through the 3D carousel to view generated scenes
5. **Download**: Save your favorite scenes for use in marketing materials

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=ComponentName
```

### Test Utilities

The project includes comprehensive testing utilities:

```typescript
import { 
  render, 
  simulateError, 
  simulateNetworkError,
  createMockBrandInfo,
  measureRenderTime 
} from './utils/testing';

// Test component with providers
const { getByText } = render(<YourComponent />);

// Simulate errors
simulateError(new Error('Test error'));

// Measure performance
const renderTime = await measureRenderTime(<YourComponent />);
```

### Error Testing

```typescript
// Test error boundaries
const { getByText } = render(
  <ErrorBoundary>
    <ComponentThatThrows />
  </ErrorBoundary>
);

expect(getByText('Something went wrong')).toBeInTheDocument();
```

## 🚀 Performance Optimization

### Build Optimization

The project includes several performance optimizations:

- **Code Splitting**: Automatic chunking of vendor libraries
- **Tree Shaking**: Unused code elimination
- **Minification**: Terser for production builds
- **Lazy Loading**: Components loaded on demand
- **Image Optimization**: Automatic image compression

### Bundle Analysis

```bash
# Analyze bundle size
npm run build
npm run analyze
```

### Performance Monitoring

```typescript
import { usePerformance } from './hooks/usePerformance';

const MyComponent = () => {
  const { trackError, getMetrics } = usePerformance('MyComponent');
  
  // Track errors
  try {
    // risky operation
  } catch (error) {
    trackError(error);
  }
  
  // Get performance metrics
  const metrics = getMetrics();
};
```

## 🛡 Error Handling

### Error Types

The application handles various error types:

- **Network Errors**: Connection issues, timeouts
- **API Errors**: OpenAI API failures, rate limits
- **Validation Errors**: Form validation failures
- **Runtime Errors**: JavaScript errors in components

### Error Recovery

```typescript
import { retry, withErrorHandling } from './utils/errorHandling';

// Retry failed operations
const result = await retry(
  () => apiCall(),
  3, // max retries
  1000 // delay
);

// Wrap functions with error handling
const safeFunction = withErrorHandling(
  async () => riskyOperation(),
  'ComponentName'
);
```

### Error Boundaries

The app includes error boundaries at multiple levels:

- **Global Error Boundary**: Catches all unhandled errors
- **Component Error Boundaries**: Isolated error handling
- **Route Error Boundaries**: Page-level error recovery

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Enhancement**: Enhanced features for larger screens
- **Touch Support**: Full touch interaction for the 3D carousel

## 🔒 Security

### API Key Security

- API keys are stored locally (for demo purposes)
- In production, use secure backend storage
- Keys are validated before use
- Automatic retry with exponential backoff

### Input Validation

- Client-side validation for immediate feedback
- Server-side validation for security
- File type and size restrictions
- XSS protection through proper escaping

## 🚀 Deployment

### Production Build

```bash
npm run build
```

### Deployment Options

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod`
- **AWS S3**: Upload `dist` folder to S3 bucket
- **Docker**: Use provided Dockerfile

### Environment Setup

```bash
# Production environment variables
VITE_OPENAI_API_KEY=your_production_key
VITE_APP_NAME=BrandScene
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Use proper error handling
- Optimize for performance
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the error logs
- Test with different network conditions

## 🔄 Changelog

### Version 1.0.0
- Initial release with core functionality
- AI image generation with DALL-E 3
- 3D interactive carousel
- Comprehensive error handling
- Performance optimizations
- Testing suite
- Responsive design
