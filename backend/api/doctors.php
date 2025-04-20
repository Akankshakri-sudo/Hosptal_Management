<?php
require_once __DIR__ . '/../config/db.php';

// Get search parameters from request
$specialization = isset($_GET['specialization']) ? $_GET['specialization'] : null;
$location = isset($_GET['location']) ? $_GET['location'] : null;
$sort = isset($_GET['sort']) ? $_GET['sort'] : 'name';

// Validate sort options
$allowed_sorts = ['name', 'experience', 'available'];
$sort = in_array($sort, $allowed_sorts) ? $sort : 'name';

// Build base query
$query = "SELECT id, name, specialization, location, experience, photo_url FROM doctors";
$conditions = [];
$params = [];

// Add filters
if ($specialization) {
    $conditions[] = "specialization = :specialization";
    $params[':specialization'] = $specialization;
}

if ($location) {
    $conditions[] = "location LIKE :location";
    $params[':location'] = "%$location%";
}

// Combine conditions
if (!empty($conditions)) {
    $query .= " WHERE " . implode(" AND ", $conditions);
}

// Add sorting
$query .= " ORDER BY $sort DESC";

try {
    $stmt = $conn->prepare($query);
    $stmt->execute($params);
    $doctors = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Convert photo URLs to absolute paths
    foreach ($doctors as &$doctor) {
        $doctor['photo_url'] = '/frontend' . $doctor['photo_url'];
    }
    
    echo json_encode(['success' => true, 'data' => $doctors]);
} catch(PDOException $e) {
    echo json_encode(['error' => "Database error: " . $e->getMessage()]);
}
?>