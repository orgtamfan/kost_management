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

// Forward Vercel serverless requests to public/index.php
require __DIR__.'/../public/index.php';
