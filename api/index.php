<?php

// Buffer all output so that any stray whitespace or warnings before
// Laravel bootstraps cannot trigger "headers already sent" on Vercel.
ob_start();

// Fix REQUEST_URI for Vercel: strip /api/index.php if Vercel serverless function prepends it
if (isset($_SERVER['REQUEST_URI'])) {
    if (strpos($_SERVER['REQUEST_URI'], '/api/index.php') === 0) {
        $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], strlen('/api/index.php')) ?: '/';
    }
}

// Discard any buffered output before Laravel sends its own response
ob_end_clean();

// Catch the real root exception and surface it before Symfony masks it
// with "headers already sent". Remove this block once root cause is fixed.
set_exception_handler(function (Throwable $e) {
    if (! headers_sent()) {
        http_response_code(500);
        header('Content-Type: text/plain; charset=UTF-8');
    }
    // Log to Vercel stderr so it appears in Runtime Logs
    error_log('[VERCEL ROOT EXCEPTION] ' . get_class($e) . ': ' . $e->getMessage()
        . ' in ' . $e->getFile() . ':' . $e->getLine());
    exit(1);
});

// Forward Vercel serverless requests to public/index.php
require __DIR__.'/../public/index.php';
