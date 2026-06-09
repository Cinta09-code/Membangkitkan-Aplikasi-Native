<?php

header("Content-Type: application/json");

include "koneksi.php";

$data = json_decode(file_get_contents("php://input"), true);

$username = trim($data['username'] ?? '');
$password = trim($data['password'] ?? '');

if (!$username || !$password) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "pesan" => "Username dan password wajib diisi"
    ]);
    exit;
}

// Ambil user berdasarkan username saja
$stmt = mysqli_prepare(
    $koneksi,
    "SELECT id, username, password FROM users WHERE username = ? LIMIT 1"
);

mysqli_stmt_bind_param($stmt, "s", $username);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);
$user = mysqli_fetch_assoc($result);

// Cek apakah user ditemukan
if (!$user) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "pesan" => "Username atau password salah"
    ]);
    exit;
}

// ============================================================
// DETEKSI FORMAT HASH OTOMATIS
// Coba semua kemungkinan format hash
// ============================================================
$passwordCocok = false;

if (password_verify($password, $user['password'])) {
    // Format bcrypt (password_hash)
    $passwordCocok = true;
} elseif ($user['password'] === hash('sha256', $password)) {
    // Format SHA-256
    $passwordCocok = true;
} elseif ($user['password'] === md5($password)) {
    // Format MD5
    $passwordCocok = true;
} elseif ($user['password'] === sha1($password)) {
    // Format SHA-1
    $passwordCocok = true;
} elseif ($user['password'] === $password) {
    // Plaintext (tidak disarankan, tapi dicek juga)
    $passwordCocok = true;
}

if (!$passwordCocok) {
    http_response_code(401);
    echo json_encode([
        "status" => "error",
        "pesan" => "Username atau password salah"
    ]);
    exit;
}

// Generate token baru
$token = bin2hex(random_bytes(32));

$update = mysqli_prepare(
    $koneksi,
    "UPDATE users SET token=? WHERE id=?"
);

mysqli_stmt_bind_param($update, "si", $token, $user['id']);
mysqli_stmt_execute($update);

echo json_encode([
    "status" => "success",
    "token" => $token,
    "username" => $user['username']
]);