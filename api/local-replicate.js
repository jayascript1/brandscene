import express from 'express';
import cors from 'cors';
import Replicate from 'replicate';

const app = express();
const PORT = 3001;

// Enable CORS for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

// Main API endpoint that handles action-based requests (like Vercel function)
app.post('/api/replicate', async (req, res) => {
  console.log('API request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  try {
    const { action, ...body } = req.body;
    
    console.log('Request body:', { action, ...body });
    
    if (!action) {
      return res.status(400).json({
        error: {
          message: 'Action is required',
          status: 400
        }
      });
    }
    
    switch (action) {
      case 'createPrediction':
        return await handleCreatePrediction(replicate, body, res);
      
      case 'getPrediction':
        return await handleGetPrediction(replicate, body, res);
      
      case 'testConnection':
        return await handleTestConnection(replicate, res);
      
      default:
        return res.status(400).json({
          error: {
            message: `Unknown action: ${action}`,
            status: 400
          }
        });
    }
    
  } catch (error) {
    console.error('Replicate API Error:', error);
    
    // Handle specific error types
    if (error.status === 401) {
      return res.status(401).json({
        error: {
          message: 'Invalid API key',
          status: 401
        }
      });
    }
    
    if (error.status === 429) {
      return res.status(429).json({
        error: {
          message: 'Rate limit exceeded',
          status: 429
        }
      });
    }
    
    if (error.status >= 400 && error.status < 500) {
      return res.status(error.status).json({
        error: {
          message: error.message || 'Bad request',
          status: error.status
        }
      });
    }
    
    return res.status(500).json({
      error: {
        message: 'Internal server error',
        status: 500,
        code: 'INTERNAL_ERROR'
      }
    });
  }
});

// Handle create prediction requests
async function handleCreatePrediction(replicate, body, res) {
  const { model, input } = body;
  
  if (!model || !input) {
    return res.status(400).json({
      error: {
        message: 'Model and input are required',
        status: 400
      }
    });
  }
  
  console.log('Creating prediction with:', { model, input: { ...input, image: input.image ? '[BASE64_IMAGE]' : 'none' } });
  
  try {
    const prediction = await replicate.predictions.create({
      model,
      input
    });
    
    console.log('Prediction created:', prediction);
    
    res.status(200).json({
      success: true,
      prediction
    });
    
  } catch (error) {
    console.error('Create prediction error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      code: error.code,
      details: error.details
    });
    throw error;
  }
}

// Handle test connection requests
async function handleTestConnection(replicate, res) {
  try {
    // Try to list models to test the connection
    const models = await replicate.models.list();
    
    console.log('Test connection successful, found models:', models.length);
    
    res.status(200).json({
      success: true,
      message: 'Replicate API connection successful',
      modelsCount: models.length
    });
    
  } catch (error) {
    console.error('Test connection error:', error);
    throw error;
  }
}

// Handle get prediction requests  
async function handleGetPrediction(replicate, body, res) {
  const { id } = body;
  
  if (!id) {
    return res.status(400).json({
      error: {
        message: 'Prediction ID is required',
        status: 400
      }
    });
  }
  
  try {
    const prediction = await replicate.predictions.get(id);
    
    res.status(200).json({
      success: true,
      prediction
    });
    
  } catch (error) {
    console.error('Get prediction error:', error);
    throw error;
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Local Replicate API server is running'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Local Replicate API server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

