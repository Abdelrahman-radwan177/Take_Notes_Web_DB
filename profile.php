<?php
session_start();

require "db.php";

header("Content-Type: application/json");

// receive data from JavaScript
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// التحقق من وجود جلسة أو كوكي لتسجيل الدخول التلقائي
if (!isset($_SESSION["userId"]) && isset($_COOKIE["userToken"])) {
    $token = $_COOKIE["userToken"];
    $stmt = mysqli_prepare($conn, "SELECT id FROM users WHERE token = ? AND tokenExpires > NOW()");
    mysqli_stmt_bind_param($stmt, "s", $token);
    mysqli_stmt_execute($stmt);
    mysqli_stmt_store_result($stmt);

    if (mysqli_stmt_num_rows($stmt) > 0) {
        mysqli_stmt_bind_result($stmt, $userId);
        mysqli_stmt_fetch($stmt);
        $_SESSION["userId"] = $userId; // new session

        // تجديد معرف الجلسة بعد تسجيل الدخول
        session_regenerate_id(true);
    } else {
        // إذا كان الكوكي غير صالح، يتم حذفه وإرسال رسالة خطأ
        setcookie("userToken", "", time() - 3600, "/");
        echo json_encode(["error" => "register"]);
        exit;
    }
}

// معالجة الطلبات الواردة
if (isset($data["arr"])) {
    // تحديث الملاحظات في قاعدة البيانات
    $stmt = mysqli_prepare($conn, "UPDATE users SET notes = ? WHERE id = ?");
    mysqli_stmt_bind_param($stmt, "si", $data["arr"], $_SESSION["userId"]);
    mysqli_stmt_execute($stmt);
} elseif (isset($data["note"])) {
    // إضافة ملاحظة جديدة بعد تنظيفها
    $data['note'] = filter_var($data['note'], FILTER_SANITIZE_SPECIAL_CHARS);
    echo json_encode(["note" => $data["note"]]);
} elseif (isset($data["logOut"])) {
    // تسجيل الخروج وحذف الجلسة والكوكي
    setcookie("userToken", "", time() - 3600, "/");
    session_destroy();
    echo json_encode(["status" => "loggedOut"]);
} else {
    // إذا لم يكن هناك طلب محدد، يتم إرسال بيانات المستخدم
    if (!isset($_SESSION["userId"])) {
        echo json_encode(["error" => "register"]);
    } else {
        $stmt = mysqli_prepare($conn, "SELECT notes, firstName, lastName FROM users WHERE id = ?");
        mysqli_stmt_bind_param($stmt, "i", $_SESSION["userId"]);
        mysqli_stmt_execute($stmt);
        mysqli_stmt_store_result($stmt);

        if (mysqli_stmt_num_rows($stmt) > 0) {
            mysqli_stmt_bind_result($stmt, $note, $firstName, $lastName);
            mysqli_stmt_fetch($stmt);
            echo json_encode([
                "note" => $note,
                "firstName" => $firstName,
                "lastName" => $lastName
            ]);
        }
    }
}

// إغلاق الاتصال بقاعدة البيانات
mysqli_close($conn);
?>