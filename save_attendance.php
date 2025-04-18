<?php
require __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\Yaml\Yaml;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $yamlData = $_POST["yamlData"];

    function debug_to_console($data) {
        $output = $data;
        if (is_array($output))
            $output = implode(',', $output);

        echo "<script>console.log('Debug Objects: " . $output . "' );</script>";
    }

    // Set umask to 0000 to give all permissions by default
    umask(0000);

    $filename = 'attendance.yaml';

    // Set the file path
    $filepath = $_SERVER['DOCUMENT_ROOT'] . '/user/attendance/' . $filename;

    // Ensure the directory exists
    if (!is_dir(dirname($filepath))) {
        mkdir(dirname($filepath), 0755, true);
    }

    $existingData = [];
    if (file_exists($filepath)) {
        chmod($filepath, 0755);

        // Read the existing YAML data
        $existingData = Yaml::parseFile($filepath);
    }

    // Convert the new YAML data to an array
    $newData = Yaml::parse($yamlData);
    // Merge the existing and new data
    foreach ($newData as $key => $value) {
        if (isset($existingData[$key])) {
            // Merge the existing and new data
            $existingData[$key] = array_replace_recursive($existingData[$key], $value);
        } else {
            $existingData[$key] = $value;
        }
    }

        debug_to_console($yamlData);



    // Save the YAML data to the file
    if (file_put_contents($filepath, Yaml::dump($existingData)) !== false) {
        http_response_code(200); // Success
    } else {
        http_response_code(500); // Failure
    }
}
?>