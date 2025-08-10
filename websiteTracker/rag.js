// rag.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const data = {
  energy: require('./energy.json'),
  food: require('./food_emission.json'),
  transportation: require('./transportation2.json')
};

async function getEmbeddings(text) {
  const model = genAI.getGenerativeModel({ model: "embedding-001" });
  const result = await model.embedContent(text);
  return result.embedding;
}

async function searchKnowledgeBase(query) {
  const queryEmbedding = await getEmbeddings(query);
  let bestMatch = { score: -1, content: '' };
  
  // This is a simplified search. A real implementation would use a vector database.
  // We'll iterate through all your data to find the most relevant snippet.
  for (const category in data) {
    const content = JSON.stringify(data[category]);
    const contentEmbedding = await getEmbeddings(content);
    const score = calculateCosineSimilarity(queryEmbedding, contentEmbedding);

    if (score > bestMatch.score) {
      bestMatch = { score, content };
    }
  }

  return bestMatch.content;
}

function calculateCosineSimilarity(vecA, vecB) {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] ** 2;
    magnitudeB += vecB[i] ** 2;
  }
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  return dotProduct / (magnitudeA * magnitudeB);
}

async function generateResponse(prompt, context) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const fullPrompt = `Based on the following context, answer the user's question. If the information is not available in the context, please state that you cannot answer.
  
  Context:
  ${context}
  
  Question:
  ${prompt}`;
  
  const result = await model.generateContent(fullPrompt);
  return result.response.text();
}

async function handleRagQuery(query) {
  const context = await searchKnowledgeBase(query);
  const response = await generateResponse(query, context);
  return response;
}

module.exports = handleRagQuery;