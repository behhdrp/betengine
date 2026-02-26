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
let db: Database.Database;
try {
  db = new Database("database.sqlite");
} catch (e) {
  console.error("Database initialization error:", e);
  // Fallback for Vercel (use /tmp for temporary storage)
  db = new Database("/tmp/database.sqlite");
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
    is_admin BOOLEAN DEFAULT 0
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

// Handle schema updates for existing DBs
try { db.exec('ALTER TABLE users ADD COLUMN whatsapp TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN pix_key TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0'); } catch (e) {}
try { db.exec('ALTER TABLE users ADD COLUMN custom_link TEXT'); } catch (e) {}
try { db.exec('ALTER TABLE metrics ADD COLUMN cpa REAL DEFAULT 0'); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'pending'"); } catch (e) {}

// Set existing users to approved
try { db.exec("UPDATE users SET status = 'approved' WHERE status IS NULL OR status = 'pending'"); } catch (e) {}

// Middleware to verify JWT Token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: "Token inválido" });
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

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
    const stmt = db.prepare('INSERT INTO users (name, email, password, whatsapp, pix_key, status) VALUES (?, ?, ?, ?, ?, ?)');
    
    const isTheChacal = email === 'thechacalcts@gmail.com';
    const status = isTheChacal ? 'approved' : 'pending';
    
    const info = stmt.run(name, email, hashedPassword, whatsapp, pix_key, status);
    
    const metricsStmt = db.prepare('INSERT INTO metrics (user_id, balance, ftds, leads, clicks, cpa) VALUES (?, ?, ?, ?, ?, ?)');
    metricsStmt.run(info.lastInsertRowid, 0, 0, 0, 0, 0);

    if (isTheChacal) {
        db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(info.lastInsertRowid);
    }

    if (status === 'pending') {
      return res.status(201).json({ 
        message: 'Cadastro realizado. Aguardando aprovação.', 
        code: 'PENDING_APPROVAL' 
      });
    }

    const isAdmin = isTheChacal ? 1 : 0;
    const token = jwt.sign({ id: info.lastInsertRowid, email, name, is_admin: isAdmin }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: info.lastInsertRowid, name, email, whatsapp, pix_key, is_admin: isAdmin, status } });
  } catch (error: any) {
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

  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const user = stmt.get(email) as any;

  if (!user) {
    console.log(`Login failed: User not found for email '${email}'`);
    return res.status(401).json({ error: 'Email ou senha incorretos.' });
  }

  if (!bcrypt.compareSync(password, user.password)) {
    console.log(`Login failed: Password mismatch for user '${email}'`);
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
  const userId = (req as any).user.id;
  const stmt = db.prepare('SELECT * FROM metrics WHERE user_id = ?');
  const metrics = stmt.get(userId);
  res.json(metrics);
});

// Update Metrics
app.post('/api/user/metrics', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const { balance, ftds, leads, clicks, cpa } = req.body;
  
  const stmt = db.prepare('UPDATE metrics SET balance = ?, ftds = ?, leads = ?, clicks = ?, cpa = ? WHERE user_id = ?');
  stmt.run(balance, ftds, leads, clicks, cpa, userId);
  res.json({ message: 'Métricas atualizadas' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Catch all for API
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' });
});

// Serve static files
app.use(express.static(path.resolve(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

// Export for Vercel
export default app;
