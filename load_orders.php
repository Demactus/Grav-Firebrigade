<?php
header('Content-Type: application/json');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$ordersDir = __DIR__ . '/orders';
$orderData = [];

if (is_dir($ordersDir)) {

    $files = scandir($ordersDir);
    foreach ($files as $file) {
        if (pathinfo($file, PATHINFO_EXTENSION) === 'csv') {
            $name = pathinfo($file, PATHINFO_FILENAME);
            $orders = [];
            $header = null;

            if (($handle = fopen($ordersDir . '/' . $file, "r")) !== FALSE) {
                while (($data = fgetcsv($handle)) !== FALSE) {
                    if (!$header) {
                        $header = $data;
                        continue;
                    }

                    // Handle missing data (add empty string for missing values)
                    $data = array_pad($data, count($header), "");

                    $orders[] = array_combine($header, $data);
                }
                fclose($handle);
            }

            $orderData[] = ['name' => $name, 'orders' => $orders];
        }
    }

    $jsonOutput = json_encode($orderData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(500);
        echo json_encode(['error' => 'JSON encoding error: ' . json_last_error_msg()]);
    } else {
        echo $jsonOutput;
    }

} else {
    http_response_code(500);
    echo json_encode(['error' => 'Could not read orders directory.']);
}
?>