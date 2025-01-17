import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (asset) => {
                    const name = asset.names[0];

                    if (name.endsWith('.avif')) {
                        const subdir = name.includes('mtr') ? 'mtr' : 'others';
                        return `assets/${subdir}/[name][extname]`;
                    }

                    return `assets/[name]-[hash][extname]`;
                }
            }
        }
    }
});