require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const axios = require('axios');
require('dotenv').config();

async function enrichTask(title, description = '') {
  const prompt = `
You are a project management AI. Given a task, respond ONLY with a JSON object.

Task title: "${title}"
Task description: "${description}"

Return this exact JSON structure:
{
  "priority": "high" or "medium" or "low",
  "estimated_time": "e.g. 2 hours or 3 days",
  "tags": ["tag1", "tag2", "tag3"],
  "subtasks": [
    { "title": "subtask 1", "done": false },
    { "title": "subtask 2", "done": false },
    { "title": "subtask 3", "done": false }
  ]
}

Rules:
- priority: high if urgent/critical, low if minor, medium otherwise
- tags: relevant tech or category labels (max 4)
- subtasks: 3 to 5 concrete actionable steps
- Return ONLY the JSON, no explanation, no markdown
`;

  const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`  ,  {
      contents: [{ parts: [{ text: prompt }] }]
    }
  );

  const text = response.data.candidates[0].content.parts[0].text;
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

module.exports = { enrichTask };