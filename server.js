// Minimal Express server to expose the webhook handler for local testing
import express from 'express';
import { webhook as webhookHandler } from './api/webhook.js';

const app = express();
const PORT = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta para el webhook
app.post('/api/webhook', (req, res) => {
  // Llama al handler exportado (formato Next.js/Vercel)
  webhookHandler(req, res);
});

app.listen(PORT, () => {
  console.log(`Ready! Available at http://localhost:${PORT}`);
});
