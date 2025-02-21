<?php
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);


// connect to database
$servername="localhost";
$username="root";
$password="";
$dbname="takemynotes";
// create connection
$conn = mysqli_connect($servername, $username, $password, $dbname);
if (!$conn) {
    die("connecction failed " . mysqli_connect_error());
}


?>