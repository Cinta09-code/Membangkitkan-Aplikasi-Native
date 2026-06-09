// ============================================================
// STATE — melacak apakah sedang mode edit atau tambah
// ============================================================
let modeEdit = false;
let idSedangDiedit = null;

const API_BASE = "http://pbp.test/api-toko";
const API_GET = `${API_BASE}/get-barang.php`;
const API_TAMBAH = `${API_BASE}/tambah_barang.php`;
const API_EDIT = `${API_BASE}/edit_barang.php`;
const API_HAPUS = `${API_BASE}/hapus_barang.php`;

// ============================================================
// HELPER — ambil headers dengan token otomatis
// ============================================================
function getAuthHeaders() {
  const token = localStorage.getItem("toko_auth_token");
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + (token ?? ""),
  };
}

// ============================================================
// HELPER — tangani respons 401 (token expired/tidak valid)
// ============================================================
function cekUnauthorized(response) {
  if (response.status === 401) {
    alert("Sesi habis atau tidak valid. Silakan login ulang.");
    localStorage.removeItem("toko_auth_token");
    localStorage.removeItem("toko_auth_username");
    window.location.replace("login.html");
    return true;
  }
  return false;
}

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
    const response = await fetch(API_GET, {
      cache: "no-store",
      headers: getAuthHeaders(), // ← token disertakan
    });

    if (cekUnauthorized(response)) return;

    const hasil = await response.json();
    if (hasil.status !== "success")
      throw new Error(hasil.message || "Status bukan success");

    if (hasil.data.length === 0) {
      tabel.innerHTML = `
        <tr>
          <td colspan="4" class="text-center p-8 text-slate-400 text-sm">
            <div class="text-3xl mb-2">📦</div>
            Belum ada data barang
          </td>
        </tr>
      `;
      const badge = document.getElementById("jumlah-barang");
      if (badge) badge.textContent = "0 barang";
      return;
    }

    tabel.innerHTML = hasil.data
      .map(
        (barang) => `
      <tr id="row-${barang.id}" class="border-b border-slate-100 hover:bg-teal-50/40 transition-colors duration-150">
        <td class="px-4 py-3 font-mono text-xs text-slate-400">${barang.id}</td>
        <td class="px-4 py-3 text-sm font-medium text-slate-800">${barang.nama_barang}</td>
        <td class="px-4 py-3 text-right font-mono text-sm font-semibold text-teal-700">
          Rp ${parseInt(barang.harga).toLocaleString("id-ID")}
        </td>
        <td class="px-4 py-3 text-center">
          <div class="flex items-center justify-center gap-1.5">
            <button
              onclick="mulaiEdit(${barang.id}, '${barang.nama_barang.replace(/'/g, "\\'")}', ${barang.harga})"
              class="bg-amber-400 hover:bg-amber-500 active:scale-95 text-white text-xs font-semibold
                     px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1">
               Edit
            </button>
            <button
              onclick="hapusBarang(${barang.id})"
              class="bg-rose-500 hover:bg-rose-600 active:scale-95 text-white text-xs font-semibold
                     px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1">
               Hapus
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

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
// MULAI EDIT — pindahkan data dari tabel ke form
// ============================================================
function mulaiEdit(id, nama, harga) {
  if (!sudahLogin()) {
    navigasi("barang");

    tampilNotifGlobal(
      "error",
      "❌ Gagal mengedit barang! Anda harus login terlebih dahulu.",
    );
    return;
  }

  modeEdit = true;
  idSedangDiedit = id;

  navigasi("barang");

  document.getElementById("edit_id").value = id;
  document.getElementById("nama_barang").value = nama;
  document.getElementById("harga").value = harga;

  document.getElementById("form-title-text").textContent = "Edit Barang";

  const title = document.getElementById("form-panel-title");
  title.className = "form-panel-title mode-edit";
  title.querySelector("i").className = "ti ti-edit";

  document.getElementById("edit-badge").classList.add("visible");
  document.getElementById("edit-id-label").textContent = id;

  document.getElementById("btnBatal").classList.add("visible");

  const btn = document.getElementById("btnKirim");
  btn.className = "btn-submit mode-edit";

  document.getElementById("btnKirim-text").textContent = "Simpan Perubahan";

  document
    .querySelectorAll("tr.editing")
    .forEach((tr) => tr.classList.remove("editing"));

  const row = document.getElementById("row-" + id);
  if (row) row.classList.add("editing");

  const existingFoto = ambilFotoLokal(id);
  fotoBase64Aktif = existingFoto;
  tampilFotoPreview(existingFoto);

  document.getElementById("nama_barang").focus();
}
function tampilNotifGlobal(tipe, pesan) {
  const notif = document.getElementById("notifikasi");

  if (!notif) {
    alert(pesan);
    return;
  }

  notif.textContent = pesan;
  notif.className = tipe;
  notif.style.display = "block";

  setTimeout(() => {
    notif.style.display = "none";
  }, 3000);
}
// ============================================================
// BATAL EDIT — kembalikan form ke mode tambah
// ============================================================
function batalEdit() {
  modeEdit = false;
  idSedangDiedit = null;

  document.getElementById("formTambah").reset();
  document.getElementById("edit_id").value = "";

  document.getElementById("form-title").textContent = "Tambah Barang";
  document.getElementById("form-subtitle").textContent =
    "Isi data lalu simpan ke database";

  const badge = document.getElementById("edit-badge");
  badge.classList.add("hidden");
  badge.classList.remove("flex");
  document.getElementById("btnBatal").classList.add("hidden");

  const btnKirim = document.getElementById("btnKirim");
  btnKirim.textContent = "Simpan Barang";
  btnKirim.classList.remove("bg-teal-500", "hover:bg-teal-600");
  btnKirim.classList.add("bg-amber-400", "hover:bg-amber-500");

  document
    .querySelectorAll("tr.editing")
    .forEach((tr) => tr.classList.remove("editing"));
}

// ============================================================
// SUBMIT FORM — cabang ke TAMBAH atau EDIT
// ============================================================
const formTambah = document.getElementById("formTambah");

if (formTambah) {
  formTambah.addEventListener("submit", async function (e) {
    e.preventDefault();

    const btnKirim = document.getElementById("btnKirim");
    const notifikasi = document.getElementById("notifikasi");
    const nama_barang = document.getElementById("nama_barang").value.trim();
    const harga = parseInt(document.getElementById("harga").value);

    if (!nama_barang || isNaN(harga) || harga <= 0) {
      tampilNotifikasi(
        notifikasi,
        "error",
        "⚠️ Nama barang dan harga wajib diisi!",
      );
      return;
    }

    const labelAwal = btnKirim.textContent;
    btnKirim.textContent = "⏳ Menyimpan...";
    btnKirim.disabled = true;

    try {
      if (modeEdit) {
        await simpanEdit(nama_barang, harga, notifikasi);
      } else {
        await simpanTambah(nama_barang, harga, notifikasi);
      }
    } catch (err) {
      tampilNotifikasi(
        notifikasi,
        "error",
        "❌ Tidak bisa terhubung ke server!",
      );
      console.error("Fetch error:", err);
    } finally {
      btnKirim.textContent = labelAwal;
      btnKirim.disabled = false;
    }
  });
}

// ── Sub-fungsi: Simpan Tambah ──
async function simpanTambah(nama_barang, harga, notifikasi) {
  const response = await fetch(API_TAMBAH, {
    method: "POST",
    cache: "no-store",
    headers: getAuthHeaders(), // ← token disertakan
    body: JSON.stringify({ nama_barang, harga }),
  });

  if (cekUnauthorized(response)) return;

  const rawText = await response.text();
  let hasil;
  try {
    hasil = JSON.parse(rawText);
  } catch {
    throw new Error(
      "Server tidak mengembalikan JSON: " + rawText.slice(0, 100),
    );
  }

  if (response.ok) {
    tampilNotifikasi(notifikasi, "sukses", "✅ " + hasil.pesan);
    document.getElementById("formTambah").reset();
    ambilDataBarang();
  } else {
    tampilNotifikasi(
      notifikasi,
      "error",
      "❌ " + (hasil.pesan || "Gagal menambah data."),
    );
  }
}

// ── Sub-fungsi: Simpan Edit ──
async function simpanEdit(nama_barang, harga, notifikasi) {
  const id = idSedangDiedit;

  const response = await fetch(API_EDIT, {
    method: "POST",
    cache: "no-store",
    headers: getAuthHeaders(), // ← token disertakan
    body: JSON.stringify({ id, nama_barang, harga }),
  });

  if (cekUnauthorized(response)) return;

  const rawText = await response.text();
  let hasil;
  try {
    hasil = JSON.parse(rawText);
  } catch {
    throw new Error(
      "Server tidak mengembalikan JSON: " + rawText.slice(0, 100),
    );
  }

  if (response.ok && hasil.status === "success") {
    tampilNotifikasi(
      notifikasi,
      "sukses",
      "✅ " + (hasil.pesan || "Data berhasil diperbarui!"),
    );
    batalEdit();
    ambilDataBarang();
  } else {
    tampilNotifikasi(
      notifikasi,
      "error",
      "❌ " + (hasil.pesan || "Gagal memperbarui data."),
    );
  }
}

// ============================================================
// HAPUS BARANG (DELETE)
// ============================================================
async function hapusBarang(id_target) {
  if (modeEdit && idSedangDiedit === id_target) batalEdit();

  const yakin = confirm(
    "Peringatan!\nApakah Anda yakin ingin menghapus barang dengan ID " +
      id_target +
      "?",
  );
  if (!yakin) return;

  try {
    const response = await fetch(API_HAPUS, {
      method: "DELETE",
      cache: "no-store",
      headers: getAuthHeaders(), // ← token disertakan
      body: JSON.stringify({ id: id_target }),
    });

    if (cekUnauthorized(response)) return;

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
// HELPER NOTIFIKASI
// ============================================================
function tampilNotifikasi(el, tipe, pesan) {
  if (!el) return;
  el.textContent = pesan;
  el.className = `notifikasi ${tipe}`;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => {
    el.className = "notifikasi";
    el.style.display = "none";
  }, 4000);
}

// ============================================================
// LOGOUT
// ============================================================
function logout() {
  localStorage.removeItem("toko_auth_token");
  localStorage.removeItem("toko_auth_username");
  window.location.replace("login.html");
}

// ============================================================
// REGISTRASI SERVICE WORKER (PWA)
// ============================================================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then((reg) =>
        console.log("✅ Service Worker Berhasil! Scope:", reg.scope),
      )
      .catch((err) => console.error("❌ Service Worker Gagal:", err));
  });
} else {
  console.warn("⚠️ Browser ini tidak mendukung Service Worker.");
}
