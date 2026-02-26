import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";

const app = express();
app.use(express.json());
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "betengine-super-secret-key-2026";

// Initialize SQLite Database
const db = new Database("database.sqlite");

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

// Set existing users to approved to avoid locking them out
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
    
    // thechacalcts@gmail.com is always approved and admin
    const isTheChacal = email === 'thechacalcts@gmail.com';
    const status = isTheChacal ? 'approved' : 'pending';
    
    const info = stmt.run(name, email, hashedPassword, whatsapp, pix_key, status);
    
    // Create initial metrics for the user (everyone starts with 0)
    const metricsStmt = db.prepare('INSERT INTO metrics (user_id, balance, ftds, leads, clicks, cpa) VALUES (?, ?, ?, ?, ?, ?)');
    metricsStmt.run(info.lastInsertRowid, 0, 0, 0, 0, 0);

    if (isTheChacal) {
        db.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").run(info.lastInsertRowid);
    }

    // If pending, do not return token, return specific code
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

// Get User Metrics
app.get('/api/user/metrics', authenticateToken, (req: any, res: any) => {
  const stmt = db.prepare('SELECT m.*, u.custom_link, u.status FROM metrics m JOIN users u ON m.user_id = u.id WHERE m.user_id = ?');
  const metrics = stmt.get(req.user.id);
  
  if (!metrics) {
    return res.status(404).json({ error: 'Métricas não encontradas.' });
  }
  
  res.json(metrics);
});

// --- ADMIN ROUTES ---

// Middleware to verify Admin
const authenticateAdmin = (req: any, res: any, next: any) => {
  authenticateToken(req, res, () => {
    if (!req.user.is_admin) {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
  });
};

// Get all users and their metrics
app.get('/api/admin/users', authenticateAdmin, (req: any, res: any) => {
  const stmt = db.prepare(`
    SELECT u.id, u.name, u.email, u.whatsapp, u.pix_key, u.is_admin, u.custom_link, u.status, m.balance, m.ftds, m.leads, m.clicks, m.cpa
    FROM users u
    LEFT JOIN metrics m ON u.id = m.user_id
    ORDER BY u.id DESC
  `);
  const users = stmt.all();
  res.json(users);
});

// Approve User
app.post('/api/admin/users/:id/approve', authenticateAdmin, (req: any, res: any) => {
  try {
    const stmt = db.prepare("UPDATE users SET status = 'approved' WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao aprovar usuário.' });
  }
});

// Reject User
app.post('/api/admin/users/:id/reject', authenticateAdmin, (req: any, res: any) => {
  try {
    const stmt = db.prepare("UPDATE users SET status = 'rejected' WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao rejeitar usuário.' });
  }
});

// Update user link
app.post('/api/admin/users/:id/link', authenticateAdmin, (req: any, res: any) => {
  const { custom_link } = req.body;
  try {
    const stmt = db.prepare('UPDATE users SET custom_link = ? WHERE id = ?');
    stmt.run(custom_link, req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar link.' });
  }
});

// Impersonate user
app.post('/api/admin/impersonate/:id', authenticateAdmin, (req: any, res: any) => {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  const user = stmt.get(req.params.id) as any;
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

  const token = jwt.sign({ id: user.id, email: user.email, name: user.name, is_admin: user.is_admin }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp, pix_key: user.pix_key, is_admin: user.is_admin } });
});

// Update user metrics
app.post('/api/admin/users/:id/metrics', authenticateAdmin, (req: any, res: any) => {
  const { id } = req.params;
  const { ftds, balance, leads, clicks, cpa } = req.body;

  try {
    const updates = [];
    const values = [];
    
    // Fetch current metrics first to handle balance calculation
    const currentMetrics = db.prepare('SELECT ftds, cpa FROM metrics WHERE user_id = ?').get(id) as any;
    let newFtds = currentMetrics.ftds;
    let newCpa = currentMetrics.cpa;

    if (ftds !== undefined) { 
        updates.push('ftds = ?'); 
        values.push(ftds); 
        newFtds = ftds;
    }
    if (cpa !== undefined) {
        updates.push('cpa = ?');
        values.push(cpa);
        newCpa = cpa;
    }
    if (leads !== undefined) { updates.push('leads = ?'); values.push(leads); }
    if (clicks !== undefined) { updates.push('clicks = ?'); values.push(clicks); }
    
    // Auto-calculate balance if FTDs or CPA changed
    if (ftds !== undefined || cpa !== undefined) {
        const newBalance = newFtds * newCpa;
        updates.push('balance = ?');
        values.push(newBalance);
    } else if (balance !== undefined) {
        // Allow manual override if needed, though FTD*CPA is preferred
        updates.push('balance = ?'); 
        values.push(balance); 
    }

    if (updates.length > 0) {
      values.push(id);
      const stmt = db.prepare(`UPDATE metrics SET ${updates.join(', ')} WHERE user_id = ?`);
      stmt.run(...values);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar métricas.' });
  }
});

// --- VITE MIDDLEWARE ---
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files from dist
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
