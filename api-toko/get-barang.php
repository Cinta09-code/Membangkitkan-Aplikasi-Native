<?php
// Header CORS & JSON - WAJIB ada di baris paling atas!
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// 1. Panggil kunci gudang (koneksi)
include "koneksi.php";

// 2. Buat perintah SQL
$query = "SELECT * FROM barang ORDER BY id DESC";
$hasil = mysqli_query($koneksi, $query);

// 3. Cek kalau query gagal
if (!$hasil) {
    echo json_encode([
        "status"  => "error",
        "message" => "Query gagal: " . mysqli_error($koneksi)
    ]);
    exit();
}

// 4. Siapkan keranjang kosong
$data_barang = array();

// 5. Masukkan data ke keranjang satu per satu
while ($baris = mysqli_fetch_assoc($hasil)) {
    $data_barang[] = $baris;
}

// 6. Bungkus dan kirim sebagai JSON
echo json_encode([
    "status"  => "success",
    "message" => "Berhasil mengambil data",
    "data"    => $data_barang
]);

mysqli_close($koneksi);
?>