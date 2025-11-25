require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// --- PERBAIKAN UTAMA DI SINI ---
// Kita gunakan process.cwd() agar Vercel tidak tersesat mencari folder public
app.use(express.static(path.join(process.cwd(), "public")));

// Paksa kirim index.html jika user membuka halaman utama
app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "public", "index.html"));
});
// -------------------------------

// Koneksi Database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true },
});

// API Dashboard
app.get("/api/dashboard", (req, res) => {
  const qIncome =
    "SELECT SUM(amount) as total FROM transactions WHERE type='income'";
  const qExpense =
    "SELECT SUM(amount) as total FROM transactions WHERE type='expenditure'";

  db.query(qIncome, (err, resIncome) => {
    if (err) return res.status(500).json(err);
    db.query(qExpense, (err, resExpense) => {
      if (err) return res.status(500).json(err);
      const income = resIncome[0].total || 0;
      const expense = resExpense[0].total || 0;
      const total_assets = income - expense;
      res.json({
        target: 10000000,
        main_acc: total_assets,
        sec_acc: 0,
        total_assets: total_assets,
        progress: (total_assets / 10000000) * 100,
      });
    });
  });
});

// API Transaksi
app.get("/api/transactions", (req, res) => {
  const type = req.query.type;
  db.query(
    "SELECT * FROM transactions WHERE type = ? ORDER BY transaction_date DESC",
    [type],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

app.post("/api/transactions", (req, res) => {
  const {
    type,
    description,
    category,
    amount,
    account_name,
    transaction_date,
  } = req.body;
  const sql =
    "INSERT INTO transactions (type, description, category, amount, account_name, transaction_date) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [type, description, category, amount, account_name, transaction_date],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "Berhasil disimpan" });
    }
  );
});

// Setup Server untuk Vercel
const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
}
module.exports = app;
