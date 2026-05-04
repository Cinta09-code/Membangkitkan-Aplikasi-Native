// ============================================================
// AMBIL DATA BARANG (GET)
// ============================================================
async function ambilDataBarang() {
  const tabel = document.getElementById("tabel-barang");
  if (!tabel) return;

  tabel.innerHTML = `
    <tr>
      <td colspan="3" class="text-center p-5 text-gray-500">
        ⏳ Memuat data...
      </td>
    </tr>
  `;

  try {
    const response = await fetch("https://pbp.test/api-toko/get-barang.php");
    
    // Cek kalau response tidak OK (404, 500, dll)
    if (!response.ok) {
      throw new Error("Response server: " + response.status);
    }

    const hasil = await response.json();

    // Cek status dari PHP
    if (hasil.status !== "success") {
      throw new Error(hasil.message || "Status bukan success");
    }

    if (hasil.data.length === 0) {
      tabel.innerHTML = `
        <tr>
          <td colspan="3" class="text-center p-5 text-gray-400">
            📦 Belum ada data barang
          </td>
        </tr>
      `;
      return;
    }

    // Tampilkan semua data
    tabel.innerHTML = hasil.data.map(barang => `
      <tr class="border-b hover:bg-gray-50 transition text-center">
        <td class="p-3 text-gray-500">${barang.id}</td>
        <td class="p-3 font-medium text-left">${barang.nama_barang}</td>
        <td class="p-3 text-emerald-600 font-semibold">
          Rp ${parseInt(barang.harga).toLocaleString("id-ID")}
        </td>
      </tr>
    `).join('');

  } catch (error) {
    tabel.innerHTML = `
      <tr>
        <td colspan="3" class="text-center p-5 text-red-500">
          ❌ Gagal mengambil data: ${error.message}
        </td>
      </tr>
    `;
    console.error("Detail error:", error);
  }
}

ambilDataBarang();

// ============================================================
// TAMBAH BARANG (POST)
// ============================================================
const API_TAMBAH = "https://pbp.test/api-toko/tambah_barang.php";

const formTambah = document.getElementById("formTambah");

if (formTambah) {
  formTambah.addEventListener("submit", async function (e) {
    e.preventDefault();

    const btnKirim = document.getElementById("btnKirim");
    const notifikasi = document.getElementById("notifikasi");
    const nama_barang = document.getElementById("nama_barang").value.trim();
    const harga = parseInt(document.getElementById("harga").value);

    // Validasi sisi klien
    if (!nama_barang || isNaN(harga) || harga <= 0) {
      tampilNotifikasi(
        notifikasi,
        "error",
        "⚠️ Nama barang dan harga wajib diisi!",
      );
      return;
    }

    // Loading state
    btnKirim.textContent = "⏳ Menyimpan...";
    btnKirim.disabled = true;

    try {
      const response = await fetch(API_TAMBAH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama_barang, harga }),
      });

      const hasil = await response.json();

      if (response.ok) {
        tampilNotifikasi(notifikasi, "sukses", "✅ " + hasil.pesan);
        formTambah.reset();
        ambilDataBarang();
      } else {
        tampilNotifikasi(notifikasi, "error", "❌ " + hasil.pesan);
      }
    } catch (err) {
      tampilNotifikasi(
        notifikasi,
        "error",
        "❌ Tidak bisa terhubung ke server!",
      );
      console.error("Fetch error:", err);
    }

    btnKirim.textContent = "Simpan Barang";
    btnKirim.disabled = false;
  });
}

// Helper notifikasi
function tampilNotifikasi(el, tipe, pesan) {
  if (!el) return;
  el.textContent = pesan;
  el.className = `notifikasi ${tipe}`;
  el.style.display = "block";

  setTimeout(() => {
    el.style.display = "none";
  }, 4000);
}

// ============================================================
// REGISTRASI SERVICE WORKER (PWA)
// ============================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log(
          "✅ Service Worker Berhasil Didaftarkan! Scope:",
          reg.scope,
        );
      })
      .catch((err) => {
        console.error("❌ Service Worker Gagal Didaftarkan:", err);
      });
  });
} else {
  console.warn("⚠️ Browser ini tidak mendukung Service Worker.");
}
