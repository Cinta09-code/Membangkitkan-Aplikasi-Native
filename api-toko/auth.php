<?php

function cekToken($koneksi) {
    // Ambil header Authorization
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

    // Cek format "Bearer <token>"
    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "pesan"  => "Akses Ditolak!"
        ]);
        exit;
    }

    $token = trim(substr($authHeader, 7));

    if (empty($token)) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "pesan"  => "Akses Ditolak!"
        ]);
        exit;
    }

    // Cek token di database
    $stmt = mysqli_prepare($koneksi, "SELECT id, username FROM users WHERE token = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $user   = mysqli_fetch_assoc($result);

    if (!$user) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "pesan"  => "Akses Ditolak!"
        ]);
        exit;
    }

    // Token valid, kembalikan data user
    return $user;
}