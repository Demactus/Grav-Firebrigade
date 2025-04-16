<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $csvData = $_POST["csvData"];
    $filename = $_POST["filename"];

    // Set umask to 0000 to give all permissions by default
    umask(0000);

    // Set the file path
    $filepath = $_SERVER['DOCUMENT_ROOT'] . '/user/attendance/' . $filename;

    // Ensure the directory exists
    if (!is_dir(dirname($filepath))) {
        mkdir(dirname($filepath), 0755, true);
    }

    // Save the CSV data to the file
    if (file_put_contents($filepath, $csvData) !== false) {
        http_response_code(200); // Success
    } else {
        http_response_code(500); // Failure
    }
}
?>