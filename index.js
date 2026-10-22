const express = require('express');
const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const DATA_DIR = process.env.DATA_DIR || '/data';
const API_ID = parseInt(process.env.API_ID);
const API_HASH = process.env.API_HASH;
const SESSION_FILE = path.join(DATA_DIR, 'session.txt');

// Create /data folder if not exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Load session
let stringSession = new StringSession('');
if (fs.existsSync(SESSION_FILE)) {
  const saved = fs.readFileSync(SESSION_FILE, 'utf-8');
  stringSession = new StringSession(saved);
  console.log('Loaded session from /data');
}

const client = new TelegramClient(stringSession, API_ID, API_HASH, {
  connectionRetries: 5,
});

async function start() {
  await client.connect();
  console.log('MTProto connected!');
  
  // Save session
  const sessionString = client.session.save();
  fs.writeFileSync(SESSION_FILE, sessionString);
  console.log('Session saved to', SESSION_FILE);
}

start();

app.get('/', (req, res) => {
  res.send('Wazzup MTProto Service Running - session at /data');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', sessionExists: fs.existsSync(SESSION_FILE) });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server on port ${PORT}`));
