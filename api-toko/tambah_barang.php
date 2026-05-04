<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "pesan" => "Hanya metode POST!"]);
    exit();
}

// Pakai $koneksi (sesuai koneksi.php kamu)
require_once "koneksi.php";

$input        = json_decode(file_get_contents("php://input"), true);
$nama_barang  = isset($input['nama_barang']) ? trim($input['nama_barang']) : '';
$harga        = isset($input['harga'])       ? intval($input['harga'])     : 0;

if (empty($nama_barang) || $harga <= 0) {
    http_response_code(400);
    echo json_encode(["status" => "error", "pesan" => "Nama dan harga wajib diisi!"]);
    exit();
}

$stmt = mysqli_prepare($koneksi, "INSERT INTO barang (nama_barang, harga) VALUES (?, ?)");
mysqli_stmt_bind_param($stmt, "si", $nama_barang, $harga);

if (mysqli_stmt_execute($stmt)) {
    http_response_code(201);
    echo json_encode([
        "status" => "sukses",
        "pesan"  => "Barang berhasil ditambahkan!",
        "data"   => [
            "id"          => mysqli_insert_id($koneksi),
            "nama_barang" => $nama_barang,
            "harga"       => $harga
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "pesan" => "Gagal menyimpan ke database."]);
}

mysqli_stmt_close($stmt);
mysqli_close($koneksi);
?>