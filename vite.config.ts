import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    port: 3000,
    host: true,
    // Enable HMR with performance optimizations
    hmr: {
      overlay: false
    },
    // Proxy API calls to local development server
    proxy: {
      '/api/replicate': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace('/api/replicate', '/api/replicate')
      }
    }
  },
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: false,
    // Enable chunk size warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          vendor: ['react', 'react-dom'],
          three: ['three'],
          utils: ['axios', 'react-router-dom'],
          ui: ['@headlessui/react', 'lucide-react']
        },
        // Optimize asset naming for better caching
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `assets/images/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js'
      }
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 2
      },
      mangle: {
        safari10: true
      }
    }
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'three',
      'axios',
      'react-router-dom'
    ],
    exclude: ['@vite/client', '@vite/env']
  },
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  },
  // Performance optimizations
  css: {
    devSourcemap: false
  }
})
