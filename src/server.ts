import { createApp } from './app.js';

const PORT = process.env.PORT || 3001;

const app = createApp();

app.listen(PORT, () => {
  console.log(`Experience API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});