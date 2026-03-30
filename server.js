const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 3000;

// 解析 JSON 格式的请求体
app.use(express.json());
// 托管前端静态文件（放在 public 文件夹里）
app.use(express.static('public'));

// 连接数据库（文件不存在则自动创建）
const db = new sqlite3.Database('./shop.db', (err) => {
  if (err) console.error(err.message);
  console.log('已连接到 SQLite 数据库。');
});

// 创建商品表（如果不存在）
db.run(`CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  stock INTEGER NOT NULL
)`);

// API：获取所有商品
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// API：添加新商品
app.post('/api/products', (req, res) => {
  const { name, price, stock } = req.body;
  if (!name || price === undefined || stock === undefined) {
    return res.status(400).json({ error: '缺少必要字段' });
  }
  db.run('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)',
    [name, price, stock],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, name, price, stock });
    }
  );
});

// 启动服务器
app.listen(port, () => {
  console.log(`服务器已启动，访问 http://localhost:${port}`);
});