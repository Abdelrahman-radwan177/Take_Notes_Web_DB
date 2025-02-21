<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);
session_start();
session_regenerate_id(true);

require "db.php";

header("Content-Type: application/json");
// receive data from JavaScript
$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (isset($data["enteredPassword"], $data["enteredEmail"])) {
    // التحقق من وجود البريد الإلكتروني في قاعدة البيانات
    $stmt = mysqli_prepare($conn, "SELECT id, password FROM users WHERE email = ?");
    mysqli_stmt_bind_param($stmt, "s", $data["enteredEmail"]);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_bind_result($stmt, $userId, $hashedPassword);
        mysqli_stmt_fetch($stmt);

        // التحقق من تطابق كلمة المرور
        if (password_verify($data["enteredPassword"], $hashedPassword)) {
            $_SESSION["userId"] = $userId;

            // إنشاء توكن عشوائي
            $token = bin2hex(random_bytes(32));
            $expires = time() + (7 * 24 * 60 * 60);

            // تخزين التوكن في قاعدة البيانات
            
            $stmt = mysqli_prepare($conn, "UPDATE users SET token = ?, tokenExpires = ? WHERE id = ?");
            $expiryDate = date("Y-m-d H:i:s", $expires);
            mysqli_stmt_bind_param($stmt, "ssi", $token, $expiryDate, $userId);

            if (!mysqli_stmt_execute($stmt)) {
                echo json_encode(["error" => "Failed to update token"]);
                exit;
            }
            // إرسال الكوكيز إلى المتصفح
            setcookie("userToken", $token, $expires, "/");
            
            echo json_encode([
                "test" => "true"
            ]);
        } else {
            echo json_encode(["test" => "false"]);
        }
    } else {
        echo json_encode(["test" => "false404"]);
    }
} else {
    echo json_encode(["error" => "Invalid data"]);
}

// إغلاق الاتصال بقاعدة البيانات
mysqli_close($conn);
?>