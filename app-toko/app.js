// ============================================================
// AMBIL DATA BARANG (GET)
// ============================================================
async function ambilDataBarang() {
  const tabel = document.getElementById("tabel-barang");
  if (!tabel) return;

  tabel.innerHTML = `
    <tr>
      <td colspan="4" class="text-center p-6 text-slate-400 text-sm">
        ⏳ Memuat data...
      </td>
    </tr>
  `;

  try {
    const response = await fetch("https://pbp.test/api-toko/get-barang.php");

    if (!response.ok) {
      throw new Error("Response server: " + response.status);
    }

    const hasil = await response.json();

    if (hasil.status !== "success") {
      throw new Error(hasil.message || "Status bukan success");
    }

    if (hasil.data.length === 0) {
      tabel.innerHTML = `
        <tr>
          <td colspan="4" class="text-center p-8 text-slate-400 text-sm">
            <div class="text-3xl mb-2">📦</div>
            Belum ada data barang
          </td>
        </tr>
      `;
      return;
    }

    tabel.innerHTML = hasil.data.map(barang => `
      <tr class="border-b border-slate-100 hover:bg-teal-50/50 transition-colors duration-150">
        <td class="px-4 py-3 font-mono text-xs text-slate-400">${barang.id}</td>
        <td class="px-4 py-3 text-sm font-medium text-slate-800">${barang.nama_barang}</td>
        <td class="px-4 py-3 text-right font-mono text-sm font-semibold text-teal-700">
          Rp ${parseInt(barang.harga).toLocaleString("id-ID")}
        </td>
        <td class="px-4 py-3 text-center">
          <button
            onclick="hapusBarang(${barang.id})"
            class="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold
                   px-3 py-1.5 rounded-lg transition-all duration-150">
            Hapus
          </button>
        </td>
      </tr>
    `).join('');

    // Update badge jumlah barang
    const badge = document.getElementById("jumlah-barang");
    if (badge) badge.textContent = hasil.data.length + " barang";

  } catch (error) {
    tabel.innerHTML = `
      <tr>
        <td colspan="4" class="text-center p-6 text-rose-500 text-sm">
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

    const btnKirim    = document.getElementById("btnKirim");
    const notifikasi  = document.getElementById("notifikasi");
    const nama_barang = document.getElementById("nama_barang").value.trim();
    const harga       = parseInt(document.getElementById("harga").value);

    if (!nama_barang || isNaN(harga) || harga <= 0) {
      tampilNotifikasi(notifikasi, "error", "⚠️ Nama barang dan harga wajib diisi!");
      return;
    }

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
      tampilNotifikasi(notifikasi, "error", "❌ Tidak bisa terhubung ke server!");
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
  setTimeout(() => {
    el.className = "notifikasi";
    el.style.display = "none";
  }, 4000);
}


// ============================================================
// HAPUS BARANG (DELETE)
// ============================================================
async function hapusBarang(id_target) {
  const yakin = confirm(
    "Peringatan!\nApakah Anda yakin ingin menghapus barang dengan ID " + id_target + "?"
  );

  if (!yakin) return;

  try {
    const response = await fetch("https://pbp.test/api-toko/hapus_barang.php", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: id_target }),
    });

    const hasil = await response.json();

    if (hasil.status === "success") {
      ambilDataBarang();
    } else {
      alert("Gagal: " + hasil.pesan);
    }
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    alert("Gagal terhubung ke server untuk menghapus data.");
  }
}


// ============================================================
// REGISTRASI SERVICE WORKER (PWA)
// ============================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) => {
        console.log("✅ Service Worker Berhasil Didaftarkan! Scope:", reg.scope);
      })
      .catch((err) => {
        console.error("❌ Service Worker Gagal Didaftarkan:", err);
      });
  });
} else {
  console.warn("⚠️ Browser ini tidak mendukung Service Worker.");
}