const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

const db = new sqlite3.Database('./db/database.db', (err) => {
  if (err) {
    console.error('Failed to connect to the database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS high_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    score INTEGER NOT NULL
  )
`);


app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

app.get('/api/scores', (req, res) => {
  db.all('SELECT name, score FROM high_scores ORDER BY score DESC LIMIT 10', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch high scores' });
    res.json(rows);
  });
});

app.post('/api/scores', (req, res) => {
  const { name, score } = req.body;

  db.run('INSERT INTO high_scores (name, score) VALUES (?, ?)', [name, score], function (err) {
    if (err) return res.status(500).json({ error: 'Failed to save score' });
    res.status(201).json({ id: this.lastID });
  });
});


app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
