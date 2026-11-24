<?php

ob_start();

// Fix REQUEST_URI for Vercel Serverless:
// When Vercel executes api/index.php, $_SERVER['REQUEST_URI'] might be passed as /api/index.php/api/rooms or /api/rooms.
// If it stripped /api, it becomes /rooms. Ensure any leading /api/index.php or /api.php is stripped,
// but keep the actual path intended for Laravel.
if (isset($_SERVER['REQUEST_URI'])) {
    $uri = $_SERVER['REQUEST_URI'];
    if (str_starts_with($uri, '/api/index.php')) {
        $uri = substr($uri, strlen('/api/index.php')) ?: '/';
    } elseif (str_starts_with($uri, '/api.php')) {
        $uri = substr($uri, strlen('/api.php')) ?: '/';
    }

    // If request was meant for API routes (e.g. rooms, login, me, etc.) but came in as /rooms:
    // we prefix /api so Laravel routes/api.php matches properly.
    $apiEndpoints = ['rooms', 'login', 'logout', 'me', 'tenants', 'bills', 'issues', 'announcements', 'my'];
    $pathParts = explode('/', ltrim($uri, '/'), 2);
    if (!empty($pathParts[0]) && in_array($pathParts[0], $apiEndpoints)) {
        $uri = '/api/' . ltrim($uri, '/');
    }

    $_SERVER['REQUEST_URI'] = $uri;
}

ob_end_clean();

// Wrap in try-catch to surface the real root exception before Symfony
// masks it with "headers already sent".
try {
    require __DIR__.'/../public/index.php';
} catch (Throwable $e) {
    error_log('[VERCEL ROOT EXCEPTION] ' . get_class($e) . ': ' . $e->getMessage()
        . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (! headers_sent()) {
        http_response_code(500);
    }
    exit(1);
}
