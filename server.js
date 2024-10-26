import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import cors from 'cors';

const app = express();

// Define allowed origins
const allowedOrigins = [
  'https://syntaxy-aibot.vercel.app'
];

// Enable CORS for specified origins
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}));

dotenv.config(); // Load environment variables from .env file

app.use(express.json()); // Middleware to parse JSON request bodies

const apiKey = process.env.API_KEY; // Your API key from .env
console.log(apiKey);
const genAI = new GoogleGenerativeAI(apiKey); // Initialize Gemini AI

// Define your chat model configuration
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Endpoint to handle messages
app.post('/api/message', async (req, res) => {
  console.log('Received message:', req.body); // Log the full request body

  const { message } = req.body;
  if (!message) {
      return res.status(400).json({ error: 'Message is required' });
  }

  const chatSession = model.startChat({
      generationConfig,
      history: [],
  });

  try {
      const result = await chatSession.sendMessage(message);
      console.log('Generated response:', result.response.text()); // Log the generated response
      res.json({ reply: result.response.text() });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: 'Error communicating with Gemini.' });
  }
});


// Start the server
const PORT = process.env.PORT || 5000; // Correctly set the port
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`); // Output the port
});
