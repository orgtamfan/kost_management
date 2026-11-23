import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js',
                'resources/css/pages/calon-penghuni.css',
                'resources/js/pages/calon-penghuni.js',
                'resources/css/pages/area-penghuni.css',
                'resources/js/pages/area-penghuni.js',
                'resources/css/pages/panel-owner.css',
                'resources/js/pages/panel-owner.js',
            ],
            refresh: true,
        }),
        tailwindcss(),
    ],
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});
