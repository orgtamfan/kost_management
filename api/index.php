<?php

ob_start();

if (isset($_SERVER['REQUEST_URI'])) {
    if (strpos($_SERVER['REQUEST_URI'], '/api/index.php') === 0) {
        $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], strlen('/api/index.php')) ?: '/';
    }
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
