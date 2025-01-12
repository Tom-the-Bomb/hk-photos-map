import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import * as path from 'path';

export default defineConfig({
    plugins: [
        ViteImageOptimizer({
            jpeg: { quality: 70 },
        })
    ],
    resolve: {
        alias: {
            '@assets': path.resolve(__dirname, 'src/assets'),
        },
    },
});