<?php

// Fix REQUEST_URI for Vercel: strip /api/index.php if Vercel serverless function prepends it
if (isset($_SERVER['REQUEST_URI'])) {
    if (strpos($_SERVER['REQUEST_URI'], '/api/index.php') === 0) {
        $_SERVER['REQUEST_URI'] = substr($_SERVER['REQUEST_URI'], strlen('/api/index.php')) ?: '/';
    }
}

// Forward Vercel serverless requests to public/index.php
require __DIR__.'/../public/index.php';
