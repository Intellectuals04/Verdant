const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Route to handle personal tracker requests
app.post('/api/personal-tracker', async (req, res) => {
  const { category, input } = req.body;

  try {
    const response = await axios.post(`http://localhost:8000/rag/${category}`, {
      user_input: input
    });

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Error communicating with RAG API:', error.message);
    res.status(500).json({ success: false, message: 'Failed to process your input with RAG.' });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Node.js backend listening on port ${PORT}`);
});
