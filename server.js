require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static("public"));

// Koneksi Database
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true }, // Wajib untuk TiDB
});

// 1. API untuk Dashboard (Hitung Target, Progress, Total Asset)
app.get("/api/dashboard", (req, res) => {
  // Ambil Target
  const qTarget =
    "SELECT setting_value FROM settings WHERE setting_key = 'savings_target'";
  // Hitung Total per Akun (Main acc, Sec acc, dll)
  const qAssets =
    "SELECT account_name, SUM(amount) as total FROM transactions WHERE type='income' GROUP BY account_name";
  // Hitung Pengeluaran per Akun (untuk mengurangi aset)
  const qExpenses =
    "SELECT account_name, SUM(amount) as total FROM transactions WHERE type='expenditure' GROUP BY account_name";

  // Catatan: Logika hitungan lengkap akan kita taruh di sini nanti.
  // Untuk tes awal, kita kirim data dummy dulu agar jalan.
  res.json({
    target: 10000000,
    main_acc: 1073111,
    sec_acc: 41250,
    total_assets: 1073111 + 41250,
    progress: 10.73,
  });
});

// 2. API Ambil Data Transaksi
app.get("/api/transactions", (req, res) => {
  const type = req.query.type; // 'income' atau 'expenditure'
  db.query(
    "SELECT * FROM transactions WHERE type = ?",
    [type],
    (err, results) => {
      if (err) return res.status(500).json(err);
      res.json(results);
    }
  );
});

// 3. API Tambah Transaksi
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

const PORT = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
}

// PENTING: Export app agar Vercel bisa menjalankannya
module.exports = app;
