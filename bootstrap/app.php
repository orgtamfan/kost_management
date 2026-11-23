<?php

use App\Http\Middleware\CheckRole;
use Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Http\Request;
use Illuminate\Session\Middleware\StartSession;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->booted(function (): void {
        if (isset($_ENV['VERCEL']) || app()->isProduction()) {
            $viewPath = config('view.compiled');
            if (! is_dir($viewPath)) {
                @mkdir($viewPath, 0755, true);
            }
        }
    })
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => CheckRole::class,
        ]);

        /*
         * Aktifkan middleware web (session, CSRF) untuk route API juga,
         * sehingga login via session cookie berjalan tanpa Sanctum.
         */
        $middleware->api(prepend: [
            EncryptCookies::class,
            AddQueuedCookiesToResponse::class,
            StartSession::class,
            ValidateCsrfToken::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson() || $request->header('X-Requested-With') === 'XMLHttpRequest',
        );
    })->create();
