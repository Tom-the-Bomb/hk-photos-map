import { defineConfig } from 'vite';
import * as path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@assets': path.resolve(__dirname, 'src/assets'),
        },
    },
});