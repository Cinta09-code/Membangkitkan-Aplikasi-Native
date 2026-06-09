<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include "koneksi.php";

// HAPUS BARIS INI
// include "auth.php";
// $userLogin = cekToken($koneksi);

$query = "SELECT * FROM barang ORDER BY id DESC";
$hasil = mysqli_query($koneksi, $query);

if (!$hasil) {
    echo json_encode([
        "status" => "error",
        "message" => mysqli_error($koneksi)
    ]);
    exit;
}

$data_barang = [];

while($row = mysqli_fetch_assoc($hasil)){
    $data_barang[] = $row;
}

echo json_encode([
    "status" => "success",
    "data" => $data_barang
]);