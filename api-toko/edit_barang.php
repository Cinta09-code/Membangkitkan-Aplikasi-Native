<?php
include "koneksi.php";

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$json_data = file_get_contents("php://input");
$data      = json_decode($json_data, true);

// Validasi semua field wajib ada
if (!isset($data['id'], $data['nama_barang'], $data['harga'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "ID, nama barang, dan harga wajib dikirim!"]);
    exit;
}

$id          = mysqli_real_escape_string($koneksi, trim($data['id']));
$nama_barang = mysqli_real_escape_string($koneksi, trim($data['nama_barang']));
$harga       = $data['harga'];

// Validasi ID
if (empty($id) || !is_numeric($id)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "ID tidak valid!"]);
    exit;
}

// Validasi nama
if (empty($nama_barang)) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Nama barang tidak boleh kosong!"]);
    exit;
}

// Validasi harga
if (!is_numeric($harga) || $harga <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Harga tidak valid!"]);
    exit;
}

$harga = mysqli_real_escape_string($koneksi, $harga);

// Cek apakah ID ada di database dulu
$cek = mysqli_query($koneksi, "SELECT id FROM barang WHERE id='$id'");
if (!$cek || mysqli_num_rows($cek) === 0) {
    http_response_code(404);
    echo json_encode(["status" => "error", "pesan" => "Barang dengan ID $id tidak ditemukan!"]);
    exit;
}

// Jalankan UPDATE
$query = "UPDATE barang SET nama_barang='$nama_barang', harga='$harga' WHERE id='$id'";

if (mysqli_query($koneksi, $query)) {

    echo json_encode([
        "status" => "success",
        "pesan"  => "Data barang berhasil diperbarui!"
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "pesan"  => "Gagal memperbarui data: " . mysqli_error($koneksi)
    ]);
}

mysqli_close($koneksi);
?>