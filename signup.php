<?php
require "db.php";

header("Content-Type: application/json");

// استقبال البيانات من JavaScript
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// التحقق من وجود البيانات
if (isset($data['password'], $data['email'], $data['firstName'], $data['lastName'])) {
    // تحقق من صحة البريد الإلكتروني
    $data["email"] = filter_var($data['email'], FILTER_VALIDATE_EMAIL);

    // التحقق من صحة البريد الإلكتروني
    if ($data["email"] === false) {
        echo json_encode(["error" => "Invalid email"]);
        exit;
    }

    // التحقق من وجود البريد الإلكتروني في قاعدة البيانات
    $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $data["email"]);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        echo json_encode(["error" => "Email Has Been Registered Before"]);
        exit;
    }

    // تنظيف البيانات
    $data['firstName'] = filter_var($data['firstName'], FILTER_SANITIZE_SPECIAL_CHARS);
    $data['lastName'] = filter_var($data['lastName'], FILTER_SANITIZE_SPECIAL_CHARS);

    // تشفير كلمة المرور
    $data['password'] = password_hash($data['password'], PASSWORD_BCRYPT);

    // إضافة المستخدم إلى قاعدة البيانات
    $stmt = mysqli_prepare($conn, "INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)");
    mysqli_stmt_bind_param($stmt, "ssss", $data['firstName'], $data['lastName'], $data["email"], $data['password']);
    mysqli_stmt_execute($stmt);

    echo json_encode([
        "modeOfCreate" => "ok",
    ]);
} else {
    echo json_encode(["error" => "Invalid data"]);
}

// إغلاق الاتصال بقاعدة البيانات
mysqli_close($conn);
?>