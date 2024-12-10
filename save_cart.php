<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $csvData = $_POST["csvData"];
    $filename = $_POST["filename"];

    $filename = preg_replace('/[^a-zA-Z0-9_\-\.]/', '_', $filename);

    // Set umask to 0000 to give all permissions by default
    umask(0000);

    $filepath = $_SERVER['DOCUMENT_ROOT'] . '/user/orders/' . $filename;

    if (file_exists($filepath)) {
        chmod($filepath, 0755); // Set permissions for existing file

        $existingCsv = array_map('str_getcsv', file($filepath));
        $header = array_shift($existingCsv); // Get the header row


        // Convert
        $existingData = [];
        foreach ($existingCsv as $row) {
            $key = $row[0] . ' - ' . $row[1];
            $existingData[$key] = $row;
        }

        $newCsv = explode("\n", $csvData);
        array_shift($newCsv); // Remove the header row
        $newCsv = array_map('str_getcsv', $newCsv);

        // Merge
        foreach ($newCsv as $newRow) {
            $key = $newRow[0] . ' - ' . $newRow[1];
            if (isset($existingData[$key])) {
                $existingData[$key][2] += $newRow[2];
            } else {
                $existingData[$key] = $newRow;
            }
        }

        $mergedCsv = implode(',', $header) . "\n";
        foreach ($existingData as $row) {
            $mergedCsv .= implode(',', $row) . "\n";
        }

        $csvData = $mergedCsv;
    }

    if (!is_dir(dirname($filepath))) {
        mkdir(dirname($filepath), 0755, true);
    }

    if (file_put_contents($filepath, $csvData) !== false) {
        http_response_code(200);
    } else {
        http_response_code(500);
    }
}
?>