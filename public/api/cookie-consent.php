<?php
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'ok' => false,
        'error' => 'Method not allowed',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$raw = file_get_contents('php://input');
if (strlen((string) $raw) > 16384) {
    http_response_code(413);
    echo json_encode([
        'ok' => false,
        'error' => 'Payload too large',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
$data = json_decode((string) $raw, true);

if (!is_array($data)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'error' => 'Invalid payload',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

$storageDir = __DIR__ . '/storage';
if (!is_dir($storageDir)) {
    @mkdir($storageDir, 0755, true);
}

$analytics = (bool) ($data['analytics'] ?? false);
$record = [
    'receivedAt' => gmdate('c'),
    'consentVersion' => (string) ($data['consentVersion'] ?? ''),
    'analytics' => $analytics,
    'updatedAt' => (string) ($data['updatedAt'] ?? ''),
    'path' => (string) ($data['path'] ?? ''),
];

if ($analytics) {
    $record['visitorId'] = (string) ($data['visitorId'] ?? '');
    $record['sessionId'] = (string) ($data['sessionId'] ?? '');
    $record['firstVisit'] = (string) ($data['firstVisit'] ?? '');
    $record['lastVisit'] = (string) ($data['lastVisit'] ?? '');
    $record['landingPath'] = (string) ($data['landingPath'] ?? '');
    $record['referrer'] = (string) ($data['referrer'] ?? '');
    $record['utm_source'] = (string) ($data['utm_source'] ?? '');
    $record['utm_medium'] = (string) ($data['utm_medium'] ?? '');
    $record['utm_campaign'] = (string) ($data['utm_campaign'] ?? '');
    $record['utm_term'] = (string) ($data['utm_term'] ?? '');
    $record['utm_content'] = (string) ($data['utm_content'] ?? '');
    $record['language'] = (string) ($data['language'] ?? '');
}

$logFile = $storageDir . '/cookie-consents.jsonl';
$result = @file_put_contents(
    $logFile,
    json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
    FILE_APPEND | LOCK_EX
);

if ($result === false) {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => 'Failed to store consent log',
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

http_response_code(200);
echo json_encode([
    'ok' => true,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
