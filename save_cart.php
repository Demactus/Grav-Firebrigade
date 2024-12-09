<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $csvData = $_POST["csvData"];
    $filename = $_POST["filename"];

    // Sanitize the filename to prevent security issues (important!)
    $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);

    // Set umask to 0000 to give all permissions by default
    umask(0000);

    $filepath = $_SERVER['DOCUMENT_ROOT'] . '/user/orders/' . $filename;

    // Check and set file permissions
    if (file_exists($filepath)) {
        //chmod($filepath, 0755); // Set permissions for existing file

        // Read existing CSV data
        $existingCsv = array_map('str_getcsv', file($filepath));
        $header = array_shift($existingCsv); // Get the header row


        // Convert existing CSV data to associative array keyed by "Product Name - Size"
        $existingData = [];
        foreach ($existingCsv as $row) {
            $key = $row[0] . ' - ' . $row[1]; // Combine product name and size as key
            $existingData[$key] = $row;
        }

        // Convert new CSV data to array
        $newCsv = explode("\n", $csvData);
        array_shift($newCsv); // Remove the header row
        $newCsv = array_map('str_getcsv', $newCsv);

        // Merge new data into existing data, updating quantity if the item exists
        foreach ($newCsv as $newRow) {
            $key = $newRow[0] . ' - ' . $newRow[1];
            if (isset($existingData[$key])) {
                // Update quantity
                $existingData[$key][2] += $newRow[2];
            } else {
                // Add new item
                $existingData[$key] = $newRow;
            }
        }

        // Convert merged data back to CSV format
        $mergedCsv = implode(',', $header) . "\n";
        foreach ($existingData as $row) {
            $mergedCsv .= implode(',', $row) . "\n";
        }

        $csvData = $mergedCsv; // Update $csvData with the merged data
    }

    // Check if the 'orders' directory exists, and create it if it doesn't
    if (!is_dir(dirname($filepath))) {
        mkdir(dirname($filepath), 0755, true); // Create the directory with appropriate permissions
    }

    if (file_put_contents($filepath, $csvData) !== false) {
        // File saved successfully
        http_response_code(200); // OK
    } else {
        // Error saving file
        http_response_code(500); // Internal Server Error
    }
}
?>