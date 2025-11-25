// Ganti URL ini nanti jika sudah upload ke Render
const API_URL = "http://localhost:3000/api";

// Format Uang ke Rupiah
const formatRupiah = (number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(number);
};

// Fungsi 1: Ambil Data Dashboard (Angka Total)
async function loadDashboard() {
  try {
    const res = await fetch(`${API_URL}/dashboard`);
    const data = await res.json();

    // Masukkan data ke HTML
    document.getElementById("savings-target").innerText = formatRupiah(
      data.target
    );
    document.getElementById("savings-progress").innerText = data.progress + "%";

    document.getElementById("main-acc-val").innerText = formatRupiah(
      data.main_acc
    );
    document.getElementById("sec-acc-val").innerText = formatRupiah(
      data.sec_acc
    );
    document.getElementById("total-assets").innerText = formatRupiah(
      data.total_assets
    );

    // Tanggal Update (Hari ini)
    const today = new Date().toLocaleDateString("id-ID");
    document.getElementById("last-update").innerText = today;
  } catch (error) {
    console.error("Gagal load dashboard:", error);
  }
}

// Fungsi 2: Ambil Data Tabel (Income & Expenditure)
async function loadTransactions(type) {
  try {
    const res = await fetch(`${API_URL}/transactions?type=${type}`);
    const data = await res.json();

    const tableBody = document.getElementById(
      type === "income" ? "income-list" : "expenditure-list"
    );
    tableBody.innerHTML = ""; // Kosongkan dulu

    data.forEach((trx) => {
      const date = new Date(trx.transaction_date).toLocaleDateString("id-ID");
      const row = `
                <tr>
                    <td>${trx.description} <br> <span class="badge cat-${
        trx.category
      }">${trx.category}</span></td>
                    <td>${date}</td>
                    <td>${formatRupiah(trx.amount)}</td>
                    <td>${trx.account_name}</td>
                </tr>
            `;
      tableBody.innerHTML += row;
    });
  } catch (error) {
    console.error(`Gagal load ${type}:`, error);
  }
}

// Fungsi 3: Handle Tambah Data Baru
document
  .getElementById("transactionForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault(); // Mencegah reload halaman

    const formData = {
      type: document.getElementById("type").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value,
      amount: document.getElementById("amount").value,
      account_name: document.getElementById("account_name").value,
      transaction_date: document.getElementById("transaction_date").value,
    };

    try {
      const res = await fetch(`${API_URL}/transactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert("Data berhasil disimpan!");
        closeModal();
        // Refresh Data
        loadDashboard();
        loadTransactions("income");
        loadTransactions("expenditure");
      }
    } catch (error) {
      alert("Gagal menyimpan data");
    }
  });

// Kontrol Modal (Buka/Tutup)
function openModal() {
  document.getElementById("transactionModal").style.display = "block";
}
function closeModal() {
  document.getElementById("transactionModal").style.display = "none";
}

// JALANKAN SAAT PERTAMA KALI BUKA
loadDashboard();
loadTransactions("income");
loadTransactions("expenditure");
