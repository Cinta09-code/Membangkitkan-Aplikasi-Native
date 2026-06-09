<?php
// =============================================
// koneksi.php
// Tidak set header di sini — biarkan file
// pemanggil yang set headernya sendiri
// =============================================

$host = "localhost";
$user = "root";
$pass = "";
$db   = "toko_db";

$koneksi = mysqli_connect($host, $user, $pass, $db);

if (!$koneksi) {
    http_response_code(500);
    header("Content-Type: application/json");
    die(json_encode(["status" => "error", "pesan" => "Koneksi database gagal!"]));
}

mysqli_set_charset($koneksi, "utf8mb4");

// =============================================
// Fungsi: Ambil Bearer Token dari header
// =============================================
function getBearerToken() {
    // Cara 1
    if (!empty($_SERVER['HTTP_AUTHORIZATION'])) {
        $h = $_SERVER['HTTP_AUTHORIZATION'];
    }
    // Cara 2 - Apache mod_rewrite
    elseif (!empty($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $h = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    }
    // Cara 3 - getallheaders()
    elseif (function_exists('getallheaders')) {
        $all = getallheaders();
        $h   = $all['Authorization'] ?? $all['authorization'] ?? '';
    } else {
        $h = '';
    }

    if (preg_match('/^Bearer\s+(\S+)$/i', trim($h), $m)) {
        return $m[1];
    }
    return null;
}

// =============================================
// Fungsi: Wajib Auth — stop + 401 jika gagal
// =============================================
function requireAuth($koneksi) {
    $token = getBearerToken();

    if (!$token) {
        http_response_code(401);
        echo json_encode(["status" => "error", "pesan" => "Akses Ditolak!"]);
        exit;
    }

    $stmt = mysqli_prepare($koneksi,
        "SELECT id, username FROM users WHERE token = ? LIMIT 1"
    );
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user   = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);

    if (!$user) {
        http_response_code(401);
        echo json_encode(["status" => "error", "pesan" => "Akses Ditolak!"]);
        exit;
    }

    return $user;
}
?>