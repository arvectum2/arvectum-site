<?php

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function load_env_file(string $path): array
{
    $envVars = [];

    if (!file_exists($path)) {
        return $envVars;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        return $envVars;
    }

    foreach ($lines as $line) {
        $trimmed = trim($line);
        if ($trimmed === '' || str_starts_with($trimmed, '#') || !str_contains($trimmed, '=')) {
            continue;
        }

        [$key, $value] = explode('=', $trimmed, 2);
        $envVars[trim($key)] = trim($value);
    }

    return $envVars;
}

function ensure_storage_dir(): string
{
    $storageDir = __DIR__ . '/storage';
    if (!is_dir($storageDir)) {
        @mkdir($storageDir, 0755, true);
    }

    return $storageDir;
}

function write_technical_log(string $fileName, array $payload): void
{
    $storageDir = ensure_storage_dir();
    $file = $storageDir . '/' . $fileName;
    $record = array_merge([
        'timestamp' => gmdate('c'),
    ], $payload);

    @file_put_contents(
        $file,
        json_encode($record, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

function normalize_string(mixed $value): string
{
    return trim((string) $value);
}

function encode_subject(string $subject): string
{
    return '=?UTF-8?B?' . base64_encode($subject) . '?=';
}

function request_prefers_json(): bool
{
    $contentType = strtolower((string) ($_SERVER['CONTENT_TYPE'] ?? ''));
    $accept = strtolower((string) ($_SERVER['HTTP_ACCEPT'] ?? ''));
    $requestedWith = strtolower((string) ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? ''));

    return str_contains($contentType, 'application/json')
        || str_contains($accept, 'application/json')
        || $requestedWith === 'xmlhttprequest';
}

function respond_json(int $status, array $payload): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function redirect_to(string $location, int $status = 303): void
{
    header('Location: ' . $location, true, $status);
    exit;
}

function respond_html_error(string $message, int $status = 502): void
{
    http_response_code($status);
    header('Content-Type: text/html; charset=UTF-8');
    ?>
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Не удалось отправить заявку — Arvectum</title>
    <style>
      body {
        margin: 0;
        background: #f5f7fb;
        color: #122033;
        font: 16px/1.5 Arial, sans-serif;
      }

      main {
        max-width: 720px;
        margin: 0 auto;
        padding: 40px 20px;
      }

      .panel {
        background: #fff;
        border: 1px solid #d8e2ef;
        border-radius: 16px;
        padding: 24px;
      }

      a {
        color: #0b7d6d;
      }
    </style>
  </head>
  <body>
    <main>
      <div class="panel">
        <h1>Не удалось отправить заявку</h1>
        <p><?= htmlspecialchars($message, ENT_QUOTES, 'UTF-8') ?></p>
        <p>
          Напишите напрямую:
          <a href="mailto:info@arvectum.com">info@arvectum.com</a>
          или
          <a href="https://t.me/arvectum" target="_blank" rel="noreferrer">t.me/arvectum</a>.
        </p>
        <p><a href="/contact.html">Вернуться к форме</a></p>
      </div>
    </main>
  </body>
</html>
    <?php
    exit;
}

$wantsJson = request_prefers_json();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    $payload = [
        'ok' => false,
        'error' => 'Method not allowed',
    ];

    if ($wantsJson) {
        respond_json(405, $payload);
    }

    respond_html_error('Используйте форму на странице контактов.', 405);
}

$raw = file_get_contents('php://input');
$data = json_decode((string) $raw, true);

if (!is_array($data)) {
    $data = $_POST;
}

$name = normalize_string($data['name'] ?? '');
$contactMethod = normalize_string($data['contactMethod'] ?? '');
$contactMethodOther = normalize_string($data['contactMethodOther'] ?? '');
$contactValue = normalize_string($data['contactValue'] ?? '');
$contact = normalize_string($data['contact'] ?? '');
$projectType = normalize_string($data['projectType'] ?? '');
$message = normalize_string($data['message'] ?? '');
$budget = normalize_string($data['budget'] ?? '');
$deadline = normalize_string($data['deadline'] ?? '');
$website = normalize_string($data['website'] ?? '');
$personalDataConsentRaw = $data['personalDataConsent'] ?? '';
$consentSource = normalize_string($data['consentSource'] ?? 'contact form');
$consentDocumentUrl = normalize_string($data['consentDocumentUrl'] ?? 'https://arvectum.com/personal-data-consent.html');
$consentPolicyUrl = normalize_string($data['consentPolicyUrl'] ?? 'https://arvectum.com/privacy');
$consentVersion = normalize_string($data['consentVersion'] ?? 'pdn-2026-06-24');
$consentTimestamp = gmdate('c');
$personalDataConsent = $personalDataConsentRaw === true
    || $personalDataConsentRaw === 1
    || $personalDataConsentRaw === '1'
    || $personalDataConsentRaw === 'true'
    || $personalDataConsentRaw === 'on'
    || $personalDataConsentRaw === 'yes';

if ($website !== '') {
    if ($wantsJson) {
        respond_json(200, [
            'ok' => true,
            'message' => 'Request accepted',
        ]);
    }

    redirect_to('/thank-you.html');
}

$isOtherMethod = in_array(mb_strtolower($contactMethod), ['other', 'другое'], true) || $contactMethodOther !== '';
$resolvedMethod = $contactMethodOther !== '' ? $contactMethodOther : $contactMethod;

if ($contact === '' && $resolvedMethod !== '' && $contactValue !== '') {
    $contact = $resolvedMethod . ': ' . $contactValue;
}

$validationErrors = [];

if ($name === '') {
    $validationErrors['name'] = 'Пожалуйста, введите имя.';
}
if ($resolvedMethod === '') {
    $validationErrors['contactMethod'] = 'Пожалуйста, выберите способ связи.';
}
if ($isOtherMethod && $contactMethodOther === '') {
    $validationErrors['contactMethodOther'] = 'Пожалуйста, уточните способ связи.';
}
if ($contactValue === '' && $contact === '') {
    $validationErrors['contactValue'] = 'Пожалуйста, укажите контакт для связи.';
}
if ($projectType === '') {
    $validationErrors['projectType'] = 'Пожалуйста, выберите тип процесса.';
}
if ($message === '') {
    $validationErrors['message'] = 'Пожалуйста, кратко опишите задачу.';
}
if (!$personalDataConsent) {
    $validationErrors['personalDataConsent'] = 'Пожалуйста, подтвердите согласие на обработку персональных данных.';
}

if ($validationErrors !== []) {
    if ($wantsJson) {
        respond_json(422, [
            'ok' => false,
            'error' => 'Заполните обязательные поля.',
            'fields' => $validationErrors,
        ]);
    }

    redirect_to('/contact.html?status=error');
}

$envVars = load_env_file(dirname(__DIR__) . '/.env');
$telegramToken = $envVars['TELEGRAM_BOT_TOKEN'] ?? '';
$telegramChatId = $envVars['TELEGRAM_CHAT_ID'] ?? '';
$telegramThreadId = $envVars['TELEGRAM_THREAD_ID'] ?? '';
$formToEmail = $envVars['FORM_TO_EMAIL'] ?? 'info@arvectum.com';

$telegramSent = false;
$mailSent = false;

if ($telegramToken !== '' && $telegramChatId !== '') {
    $telegramText = "Новая заявка с arvectum.com\n\n";
    $telegramText .= "Имя: {$name}\n";
    $telegramText .= "Способ связи: {$resolvedMethod}\n";
    $telegramText .= "Контакт: {$contact}\n";
    $telegramText .= "Тип запроса: {$projectType}\n";
    if ($deadline !== '') {
        $telegramText .= "Горизонт пилота: {$deadline}\n";
    }
    if ($budget !== '') {
        $telegramText .= "Бюджет: {$budget}\n";
    }
    $telegramText .= "Согласие на ПДн: да\n";
    $telegramText .= "Время согласия: {$consentTimestamp}\n";
    $telegramText .= "Источник согласия: {$consentSource}\n";
    $telegramText .= "Версия согласия: {$consentVersion}\n";
    $telegramText .= "URL согласия: {$consentDocumentUrl}\n";
    $telegramText .= "URL политики: {$consentPolicyUrl}\n";
    $telegramText .= "\nОписание:\n{$message}";

    $telegramData = [
        'chat_id' => $telegramChatId,
        'text' => $telegramText,
    ];

    if ($telegramThreadId !== '') {
        $telegramData['message_thread_id'] = (int) $telegramThreadId;
    }

    $telegramUrl = 'https://api.telegram.org/bot' . $telegramToken . '/sendMessage';
    $ch = curl_init($telegramUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($telegramData));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $telegramResult = curl_exec($ch);
    $telegramHttpCode = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $telegramCurlError = curl_error($ch);

    if ($telegramHttpCode === 200) {
        $telegramSent = true;
    } else {
        write_technical_log('submit-errors.log', [
            'channel' => 'telegram',
            'httpCode' => $telegramHttpCode,
            'curlError' => $telegramCurlError,
            'response' => $telegramResult,
        ]);
    }

    curl_close($ch);
}

$subject = encode_subject('Arvectum: новая заявка с сайта');
$host = $_SERVER['HTTP_HOST'] ?? 'arvectum.com';
$fromEmail = 'noreply@' . preg_replace('/[^a-z0-9.\-]/i', '', $host);
$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'From: Arvectum Site <' . $fromEmail . '>',
    'Reply-To: ' . $fromEmail,
];

$emailBody = "Новая заявка с arvectum.com\n";
$emailBody .= "=========================\n\n";
$emailBody .= "Имя: {$name}\n";
$emailBody .= "Способ связи: {$resolvedMethod}\n";
$emailBody .= "Контакт: {$contact}\n";
$emailBody .= "Тип запроса: {$projectType}\n";
$emailBody .= "Горизонт пилота: " . ($deadline !== '' ? $deadline : 'не указан') . "\n";
$emailBody .= "Бюджет: " . ($budget !== '' ? $budget : 'не указан') . "\n\n";
$emailBody .= "Согласие на ПДн: да\n";
$emailBody .= "Время согласия: {$consentTimestamp}\n";
$emailBody .= "Источник согласия: {$consentSource}\n";
$emailBody .= "Версия согласия: {$consentVersion}\n";
$emailBody .= "URL согласия: {$consentDocumentUrl}\n";
$emailBody .= "URL политики: {$consentPolicyUrl}\n\n";
$emailBody .= "Описание:\n{$message}\n";

if ($formToEmail !== '') {
    $mailSent = @mail($formToEmail, $subject, $emailBody, implode("\r\n", $headers));
    if (!$mailSent) {
        write_technical_log('submit-errors.log', [
            'channel' => 'email',
            'message' => 'mail() returned false',
            'recipient' => $formToEmail,
        ]);
    }
}

if ($telegramSent || $mailSent) {
    $channels = [];
    if ($telegramSent) {
        $channels[] = 'telegram';
    }
    if ($mailSent) {
        $channels[] = 'email';
    }

    if ($wantsJson) {
        respond_json(200, [
            'ok' => true,
            'message' => 'Заявка отправлена.',
            'channels' => $channels,
        ]);
    }

    redirect_to('/thank-you.html');
}

write_technical_log('submit-errors.log', [
    'channel' => 'all',
    'message' => 'No delivery channel succeeded',
    'telegramConfigured' => $telegramToken !== '' && $telegramChatId !== '',
    'emailConfigured' => $formToEmail !== '',
]);

if ($wantsJson) {
    respond_json(502, [
        'ok' => false,
        'error' => 'Не удалось отправить заявку. Напишите напрямую на info@arvectum.com или в Telegram.',
    ]);
}

respond_html_error('Напишите напрямую на info@arvectum.com или в Telegram.');
