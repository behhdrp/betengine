import express from "express";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "betengine-super-secret-key-2026";

// Initialize SQLite Database
let db;
try {
  const dbPath = path.join("/tmp", "database.sqlite");
  db = new Database(dbPath);
} catch (e) {
  console.error("Database initialization error:", e);
  db = new Database(":memory:");
}

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    whatsapp TEXT,
    pix_key TEXT,
    is_admin BOOLEAN DEFAULT 0,
    status TEXT DEFAULT 'pending'
  );
  
  CREATE TABLE IF NOT EXISTS metrics (
    user_id INTEGER PRIMARY KEY,
    balance REAL DEFAULT 0,
    ftds INTEGER DEFAULT 0,
    leads INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    cpa REAL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Handle schema updates
try { db.exec('ALTER TABLE users ADD COLUMN status TEXT DEFAULT "pending"'); } catch (e) {}

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// Register
app.post('/api/auth/register', (req, res) => {
  let { name, email, password, whatsapp, pix_key } = req.body;
  
  if (!name || !email || !password || !whatsapp || !pix_key) {
    return res.status(400).json({ error: 'Preencha todos os campos.' });
  }

  email = email.trim().toLowerCase();
  password = password.trim();

  try {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const isTheChacal = email === 'thechacalcts@gmail.com';
    const status = isTheChacal ? 'approved' : 'pending';
    
    const info = db.prepare('INSERT INTO users (name, email, password, whatsapp, pix_key, status) VALUES (?, ?, ?, ?, ?, ?)').run(name, email, hashedPassword, whatsapp, pix_key, status);
    
    db.prepare('INSERT INTO metrics (user_id, balance, ftds, leads, clicks, cpa) VALUES (?, ?, ?, ?, ?, ?)').run(info.lastInsertRowid, 0, 0, 0, 0, 0);

    if (isTheChacal) {
      db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(info.lastInsertRowid);
    }

    if (status === 'pending') {
      return res.status(201).json({ message: 'Cadastro realizado. Aguardando aprovação.', code: 'PENDING_APPROVAL' });
    }

    const token = jwt.sign({ id: info.lastInsertRowid, email, name, is_admin: isTheChacal ? 1 : 0 }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: info.lastInsertRowid, name, email, whatsapp, pix_key, is_admin: isTheChacal ? 1 : 0, status } });
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ error: 'Este email já está cadastrado.' });
    } else {
      res.status(500).json({ error: 'Erro interno no servidor.' });
    }
  }
});

// Login
app.post('/api/auth/login', (req, res) => {
  let { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Preencha email e senha.' });
  }

  email = email.trim().toLowerCase();
  password = password.trim();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({ error: 'Sua conta está em análise.', code: 'PENDING_APPROVAL' });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({ error: 'Sua conta foi recusada.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp, pix_key: user.pix_key, is_admin: user.is_admin, status: user.status } });
});

// Get Metrics
app.get('/api/user/metrics', authenticateToken, (req, res) => {
  const metrics = db.prepare('SELECT * FROM metrics WHERE user_id = ?').get(req.user.id);
  res.json(metrics || {});
});

// Update Metrics
app.post('/api/user/metrics', authenticateToken, (req, res) => {
  const { balance, ftds, leads, clicks, cpa } = req.body;
  db.prepare('UPDATE metrics SET balance = ?, ftds = ?, leads = ?, clicks = ?, cpa = ? WHERE user_id = ?').run(balance, ftds, leads, clicks, cpa, req.user.id);
  res.json({ message: 'Métricas atualizadas' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
