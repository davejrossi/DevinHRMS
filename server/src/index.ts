import express from 'express';
import cors from 'cors';
import { seedDatabase } from './seed.js';
import routes from './routes.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

seedDatabase();

app.use('/api', routes);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`HRMS API server running on port ${PORT}`);
});
