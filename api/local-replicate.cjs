const express = require('express');
const cors = require('cors');
const Replicate = require('replicate');

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

// Main handler for all Replicate API calls
app.post('/', async (req, res) => {
  const { action, ...body } = req.body;
  
  console.log('API request received:', { action, ...body });
  
  if (!action) {
    return res.status(400).json({
      error: {
        message: 'Action is required',
        status: 400
      }
    });
  }
  
  try {
    switch (action) {
      case 'testConnection':
        const models = await replicate.models.list();
        res.json({
          success: true,
          message: 'Replicate API connection successful',
          modelsCount: models.length
        });
        break;
        
      case 'createPrediction':
        const { model, input } = body;
        
        if (!model || !input) {
          return res.status(400).json({
            error: {
              message: 'Model and input are required',
              status: 400
            }
          });
        }

        console.log('Creating prediction with:', { 
          model, 
          input: { 
            ...input, 
            input_image: input.input_image ? '[BASE64_IMAGE]' : 'none' 
          } 
        });

        const prediction = await replicate.predictions.create({
          model,
          input
        });

        console.log('Prediction created:', prediction);

        res.json({
          success: true,
          prediction
        });
        break;
        
      case 'getPrediction':
        const { id } = body;
        
        if (!id) {
          return res.status(400).json({
            error: {
              message: 'Prediction ID is required',
              status: 400
            }
          });
        }

        const retrievedPrediction = await replicate.predictions.get(id);

        res.json({
          success: true,
          prediction: retrievedPrediction
        });
        break;
        
      default:
        res.status(400).json({
          error: {
            message: `Unknown action: ${action}`,
            status: 400
          }
        });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: error.status || 500,
        code: error.code || 'API_ERROR'
      }
    });
  }
});

// Legacy endpoints for direct access
app.post('/test', async (req, res) => {
  try {
    const models = await replicate.models.list();
    res.json({
      success: true,
      message: 'Replicate API connection successful',
      modelsCount: models.length
    });
  } catch (error) {
    console.error('Test connection error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: 500
      }
    });
  }
});

// Create prediction endpoint
app.post('/createPrediction', async (req, res) => {
  try {
    const { model, input } = req.body;
    
    if (!model || !input) {
      return res.status(400).json({
        error: {
          message: 'Model and input are required',
          status: 400
        }
      });
    }

    console.log('Creating prediction with:', { 
      model, 
      input: { 
        ...input, 
        input_image: input.input_image ? '[BASE64_IMAGE]' : 'none' 
      } 
    });

    const prediction = await replicate.predictions.create({
      model,
      input
    });

    console.log('Prediction created:', prediction);

    res.json({
      success: true,
      prediction
    });

  } catch (error) {
    console.error('Create prediction error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: error.status || 500,
        code: error.code || 'API_ERROR'
      }
    });
  }
});

// Get prediction endpoint
app.post('/getPrediction', async (req, res) => {
  try {
    const { id } = req.body;
    
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'Prediction ID is required',
          status: 400
        }
      });
    }

    const prediction = await replicate.predictions.get(id);

    res.json({
      success: true,
      prediction
    });

  } catch (error) {
    console.error('Get prediction error:', error);
    res.status(500).json({
      error: {
        message: error.message,
        status: error.status || 500,
        code: error.code || 'API_ERROR'
      }
    });
  }
});

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
