import express from 'express';
import { getCommandInfo, tldrReady } from './man.js';
import { SYSADMIN_COMMANDS, BEST_PRACTICES } from './sysadmin.js';
import cors from 'cors';

const app = express();
app.use(cors());

app.get('/api/sysadmin', (_req, res) => {
  res.json(SYSADMIN_COMMANDS);
});

app.get('/api/command/:name', async (req, res) => {
  const { name } = req.params;
  if (!/^[a-zA-Z0-9._+-]+$/.test(name)) return res.status(400).json({ error: 'Invalid command name' });
  try {
    await tldrReady;
    const info = await getCommandInfo(name);
    if (!info) return res.status(404).json({ error: 'Command not found' });
    const bestPractices = BEST_PRACTICES[name] || [];
    res.json({ ...info, bestPractices });
  } catch (e) {
    res.status(500).json({ error: 'Internal error' });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  process.stdout.write(`Server running on http://localhost:${port}\n`);
});
