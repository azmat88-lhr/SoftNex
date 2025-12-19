const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve the static site files from this folder
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.json({ ok: true, status: 'ok' }));

app.post('/api/contact', (req, res) => {
  const { name = '', email = '', message = '' } = req.body || {};
  if (!name || !email) {
    return res.status(400).json({ ok: false, error: 'Name and email are required' });
  }

  const entry = { name, email, message, receivedAt: new Date().toISOString() };
  console.log('Contact submission:', entry);

  // Persist submissions to submissions.json
  const file = path.join(__dirname, 'submissions.json');
  try {
    let arr = [];
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf8') || '[]';
      arr = JSON.parse(raw);
    }
    arr.push(entry);
    fs.writeFileSync(file, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist submission:', err);
  }

  res.json({ ok: true, data: entry });
});

app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
