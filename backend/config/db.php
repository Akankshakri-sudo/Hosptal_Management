<?php
header('Content-Type: application/json'); 

$db_host = "localhost";
$db_user = "root"; 
$db_pass = "";
$db_name = "hospital_management";

try {
    $conn = new PDO("mysql:host=$db_host;dbname=$db_name", $db_user, $db_pass);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo json_encode(['error' => "Connection failed: " . $e->getMessage()]);
    exit();
}
?>