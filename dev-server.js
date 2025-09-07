// Development server for API proxying
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Proxy API calls to Vercel
app.use('/api', createProxyMiddleware({
  target: 'https://brandscene-a1llz7gmm-jayascript1.vercel.app',
  changeOrigin: true,
  secure: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying ${req.method} ${req.url} to Vercel`);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log(`Received response from Vercel: ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', message: err.message });
  }
}));

// Fallback route for SPA - handle all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Development server running on http://localhost:${PORT}`);
  console.log(`API calls will be proxied to Vercel`);
});