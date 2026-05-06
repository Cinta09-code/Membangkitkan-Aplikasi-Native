<?php
include "koneksi.php";

// Menangkap kiriman JSON
$json_data = file_get_contents("php://input");
$data = json_decode($json_data, true);

// Validasi keberadaan parameter ID
if(isset($data['id'])) {
    
    // Amankan parameter ID
    $id_barang = mysqli_real_escape_string($koneksi, $data['id']);

    // Query untuk menghapus berdasarkan ID
    $query = "DELETE FROM barang WHERE id = '$id_barang'";
    
    if(mysqli_query($koneksi, $query)) {
        echo json_encode(["status" => "success", "pesan" => "Data barang terhapus!"]);
    } else {
        echo json_encode(["status" => "error", "pesan" => "Gagal menghapus data dari database"]);
    }

} else {
    echo json_encode(["status" => "error", "pesan" => "ID Barang wajib dikirim!"]);
}
?>