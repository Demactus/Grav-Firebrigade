<?php
date_default_timezone_set('Europe/Berlin');

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['finished_data'])) {
    $csvData = urldecode($_POST['finished_data']);

    $filename = date("Y-m-d_H-i-s") . ".csv";
    $filepath = $_SERVER['DOCUMENT_ROOT'] . '/user/orders/archive/' . $filename;

    if (!is_dir(dirname($filepath))) {
        mkdir(dirname($filepath), 0755, true);
    }

    if (file_put_contents($filepath, $csvData) !== false) {
        // Successfully saved, now delete old files
        $files = glob("orders/*.csv"); // Get all CSV files in the directory
        foreach ($files as $file) {
            if (is_file($file) && $file != $filename) { // Don't delete the new file
                unlink($file);
            }
        }
        echo "Orders finished and saved successfully!";
    } else {
        echo "Error saving orders.";
    }
} else {
    echo "Invalid request.";
}
?>