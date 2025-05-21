<?php
require __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\Yaml\Yaml;

header('Content-Type: application/x-www-form-urlencoded');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$attendanceDir = __DIR__ . '/attendance';
$attendanceData = [];




if (!is_dir($attendanceDir)) {
    // create directory if it doesn't exist
    if (!mkdir($attendanceDir, 0777, true) && !is_dir($attendanceDir)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not create attendance directory.']);
        exit;
    }
}
    // Load the YAML file
    $yamlFile = $attendanceDir . '/attendance.yaml';
    if (file_exists($yamlFile)) {
        $attendanceData = Yaml::parseFile($yamlFile);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Could not read attendance file.']);
        exit;
    }

    // Convert the data to JSON
    $jsonOutput = json_encode($attendanceData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(['error' => 'JSON encoding error: ' . json_last_error_msg()]);
    } else {
        echo $jsonOutput;
    }
