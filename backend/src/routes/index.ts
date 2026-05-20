import { Router } from 'express';

const routes = Router();

// Routes will be added here
routes.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default routes;
