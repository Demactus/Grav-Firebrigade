<?php
header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize input data to prevent XSS and other attacks
    $name = htmlspecialchars(trim($_POST["name"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($_POST["message"]));

    // Validate email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format"]);
        exit;
    }

    // Set the recipient email address
    $to = "your-email@example.com";

    // Set the email subject
    $subject = "New Contact Form Submission from $name";

    // Set the email body
    $body = "Name: $name\nEmail: $email\n\nMessage:\n$message";

    // Set the email headers
    $headers = "From: $name <$email>";

    // Send the email
    if (mail($to, $subject, $body, $headers)) {
        echo json_encode(["success" => true, "message" => "Email successfully sent!"]);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to send email. Please try again later."]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>
