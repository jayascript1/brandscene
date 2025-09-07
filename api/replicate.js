// Vercel serverless function to proxy Replicate API requests
let Replicate;

// Dynamically import Replicate to handle ES module
const getReplicateClient = async () => {
  if (!Replicate) {
    // Try to import Replicate
    try {
      const replicateModule = await import('replicate');
      Replicate = replicateModule.default;
    } catch (error) {
      // Fallback to require for older Node versions
      Replicate = require('replicate');
    }
  }
  
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  console.log('Environment check:', {
    hasToken: !!apiToken,
    tokenLength: apiToken ? apiToken.length : 0,
    tokenPrefix: apiToken ? apiToken.substring(0, 10) + '...' : 'none'
  });
  
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN environment variable is required');
  }
  
  return new Replicate({
    auth: apiToken,
  });
};

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Allow all origins for development
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Helper function to handle CORS
const handleCors = (req, res) => {
  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  
  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }
  
  return false;
};

// Helper function to send error response
const sendError = (res, message, status = 500, details = {}) => {
  res.status(status).json({
    error: {
      message,
      status,
      ...details
    }
  });
};

// Main handler function
module.exports = async function handler(req, res) {
  console.log('API request received:', {
    method: req.method,
    url: req.url,
    headers: req.headers,
    body: req.body
  });
  
  // Handle CORS
  if (handleCors(req, res)) {
    return;
  }
  
  // Only allow POST requests for predictions
  if (req.method !== 'POST') {
    return sendError(res, 'Method not allowed', 405);
  }
  
  try {
    const { action, ...body } = req.body;
    
    console.log('Request body:', { action, ...body });
    
    if (!action) {
      return sendError(res, 'Action is required', 400);
    }
    
    const replicate = await getReplicateClient();
    
    switch (action) {
      case 'createPrediction':
        return await handleCreatePrediction(replicate, body, res);
      
      case 'getPrediction':
        return await handleGetPrediction(replicate, body, res);
      
      case 'testConnection':
        return await handleTestConnection(replicate, res);
      
      default:
        return sendError(res, `Unknown action: ${action}`, 400);
    }
    
  } catch (error) {
    console.error('Replicate API Error:', error);
    
    // Handle specific error types
    if (error.status === 401) {
      return sendError(res, 'Invalid API key', 401);
    }
    
    if (error.status === 429) {
      return sendError(res, 'Rate limit exceeded', 429);
    }
    
    if (error.status >= 400 && error.status < 500) {
      return sendError(res, error.message || 'Bad request', error.status);
    }
    
    return sendError(res, 'Internal server error', 500, {
      code: 'INTERNAL_ERROR'
    });
  }
}

// Handle create prediction requests
async function handleCreatePrediction(replicate, body, res) {
  const { model, input } = body;
  
  if (!model || !input) {
    return sendError(res, 'Model and input are required', 400);
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
    return sendError(res, 'Prediction ID is required', 400);
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